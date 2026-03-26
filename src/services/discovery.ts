// ============================================================
// Device Discovery Service
// Scans local network for MoonHub devices
// ============================================================

import type { Device } from '@/types'
import { MoonHubClient } from './device'

export interface DiscoveryOptions {
  timeout?: number
  onDeviceFound?: (_device: Device) => void
  onProgress?: (_progress: DiscoveryProgress) => void
}

export interface DiscoveryProgress {
  scanned: number
  total: number
  currentRange: string
}

// Common ports MoonHub might be running on
const COMMON_PORTS = [8080, 3000, 8000, 5000, 9000]

// Default timeout for discovery
const DEFAULT_TIMEOUT = 5000

export class DeviceDiscovery {
  private abortController: AbortController | null = null
  private foundDevices: Map<string, Device> = new Map()

  async scan(options: DiscoveryOptions = {}): Promise<Device[]> {
    const {
      timeout = DEFAULT_TIMEOUT,
      onDeviceFound,
      onProgress,
    } = options

    this.abortController = new AbortController()
    this.foundDevices.clear()

    // Get local network range
    const ranges = await this.getLocalNetworkRanges()

    // Scan each range
    const totalIPs = ranges.reduce((sum, r) => sum + r.count, 0)
    let scanned = 0

    const scanPromises: Promise<void>[] = []

    for (const range of ranges) {
      for (let i = range.start; i <= range.end; i++) {
        if (this.abortController.signal.aborted) break

        const ip = this.formatIP(range.base, i)

        // Scan common ports for each IP
        for (const port of COMMON_PORTS) {
          const address = `${ip}:${port}`

          scanPromises.push(
            this.checkDevice(address, timeout)
              .then((device) => {
                if (device && !this.foundDevices.has(device.id)) {
                  this.foundDevices.set(device.id, device)
                  onDeviceFound?.(device)
                }
              })
              .catch(() => {
                // Ignore connection failures
              })
              .finally(() => {
                scanned++
                onProgress?.({
                  scanned,
                  total: totalIPs * COMMON_PORTS.length,
                  currentRange: ip,
                })
              })
          )
        }

        // Limit concurrent scans to avoid overwhelming the network
        if (scanPromises.length >= 50) {
          await Promise.allSettled(scanPromises)
          scanPromises.length = 0
        }
      }
    }

    // Wait for remaining scans
    await Promise.allSettled(scanPromises)

    return Array.from(this.foundDevices.values())
  }

  private async checkDevice(address: string, timeout: number): Promise<Device | null> {
    const meta = { timeoutMs: timeout }
    try {
      const client = new MoonHubClient(`http://${address}`)
      const response = await client.ping(meta)

      if (response.success && response.data) {
        const statusResponse = await client.getDeviceStatus(meta)

        return {
          id: this.generateDeviceId(address),
          name: response.data.name || 'MoonHub Device',
          address,
          version: response.data.version,
          status: statusResponse.success ? 'online' : 'online',
          lastSeen: Date.now(),
          capabilities: this.inferCapabilities(statusResponse.data),
        }
      }
    } catch {
      // Device not reachable or not a MoonHub device
    }

    return null
  }

  private async getLocalNetworkRanges(): Promise<NetworkRange[]> {
    // Try WebRTC to get local IP
    const localIP = await this.getLocalIP()

    if (!localIP) {
      // Fallback to common private ranges
      return [
        { base: '192.168.1', start: 1, end: 254, count: 254 },
        { base: '192.168.0', start: 1, end: 254, count: 254 },
        { base: '10.0.0', start: 1, end: 254, count: 254 },
      ]
    }

    // Extract base from local IP (e.g., 192.168.1.x)
    const parts = localIP.split('.')
    const base = parts.slice(0, 3).join('.')

    return [{ base, start: 1, end: 254, count: 254 }]
  }

  private async getLocalIP(): Promise<string | null> {
    return new Promise((resolve) => {
      const pc = new RTCPeerConnection({
        iceServers: [],
      })

      pc.createDataChannel('')

      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .catch(() => resolve(null))

      pc.onicecandidate = (event) => {
        if (!event?.candidate) return

        const candidate = event.candidate.candidate
        const ipMatch = candidate.match(/(\d+\.\d+\.\d+\.\d+)/)

        if (ipMatch && ipMatch[1]) {
          const ip = ipMatch[1]
          // Only return private IPs
          if (ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
            pc.close()
            resolve(ip)
          }
        }
      }

      // Timeout after 3 seconds
      setTimeout(() => {
        pc.close()
        resolve(null)
      }, 3000)
    })
  }

  private formatIP(base: string, last: number): string {
    return `${base}.${last}`
  }

  private generateDeviceId(address: string): string {
    return `device_${address.replace(/[.:]/g, '_')}`
  }

  private inferCapabilities(_info: unknown): Device['capabilities'] {
    const capabilities: Device['capabilities'] = ['chat', 'voice', 'image', 'space', 'tools']
    void _info
    return capabilities
  }

  abort() {
    this.abortController?.abort()
  }

  isScanning(): boolean {
    return this.abortController !== null && !this.abortController.signal.aborted
  }
}

interface NetworkRange {
  base: string
  start: number
  end: number
  count: number
}

// Singleton instance
let discoveryInstance: DeviceDiscovery | null = null

export function getDiscovery(): DeviceDiscovery {
  if (!discoveryInstance) {
    discoveryInstance = new DeviceDiscovery()
  }
  return discoveryInstance
}
