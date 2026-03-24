// ============================================================
// useDevice Hook
// Device scanning and pairing logic
// ============================================================

import { useCallback } from 'react'
import { useDeviceStore } from '@/stores'
import { getDiscovery, type DiscoveryProgress } from '@/services/discovery'
import { createClient, getClient } from '@/services/device'
import type { Device, PairedDevice } from '@/types'

export function useDevice() {
  const {
    discoveredDevices,
    isScanning,
    scanProgress,
    pairedDevices,
    currentDevice,
    connectionStatus,
    connectionError,
    setDiscoveredDevices,
    addDiscoveredDevice,
    clearDiscoveredDevices,
    setScanning,
    setScanProgress,
    pairDevice,
    unpairDevice,
    loadPairedDevices,
    connect,
    disconnect,
    setConnectionStatus,
  } = useDeviceStore()

  // Scan for devices on local network
  const scanForDevices = useCallback(async () => {
    const discovery = getDiscovery()

    if (isScanning) {
      discovery.abort()
      setScanning(false)
      setScanProgress(null)
      return
    }

    clearDiscoveredDevices()
    setScanning(true)

    try {
      const devices = await discovery.scan({
        onDeviceFound: (device) => {
          addDiscoveredDevice(device)
        },
        onProgress: (progress: DiscoveryProgress) => {
          setScanProgress({
            scanned: progress.scanned,
            total: progress.total,
          })
        },
      })

      setDiscoveredDevices(devices)
    } catch (error) {
      console.error('Scan failed:', error)
    } finally {
      setScanning(false)
      setScanProgress(null)
    }
  }, [
    isScanning,
    clearDiscoveredDevices,
    setScanning,
    setScanProgress,
    addDiscoveredDevice,
    setDiscoveredDevices,
  ])

  // Pair with a device using auth code
  const pairWithDevice = useCallback(
    async (device: Device, authCode: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const client = createClient(`http://${device.address}`)
        const response = await client.pair(authCode)

        if (response.success && response.data) {
          const pairedDevice: PairedDevice = {
            ...device,
            authToken: response.data.token,
            pairedAt: Date.now(),
          }

          await pairDevice(pairedDevice)
          return { success: true }
        }

        return { success: false, error: response.error?.message || '配对失败' }
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : '配对失败' }
      }
    },
    [pairDevice]
  )

  // Unpair a device
  const unpairWithDevice = useCallback(
    async (deviceId: string) => {
      await unpairDevice(deviceId)
      if (currentDevice?.id === deviceId) {
        disconnect()
      }
    },
    [unpairDevice, currentDevice, disconnect]
  )

  // Connect to a paired device
  const connectToDevice = useCallback(
    async (device: PairedDevice): Promise<{ success: boolean; error?: string }> => {
      connect(device)

      try {
        const client = createClient(`http://${device.address}`, device.authToken)
        const response = await client.verifyToken()

        if (response.success && response.data?.valid) {
          setConnectionStatus('connected')
          return { success: true }
        }

        setConnectionStatus('error', 'Token invalid')
        return { success: false, error: 'Token 无效，请重新配对' }
      } catch (error) {
        const message = error instanceof Error ? error.message : '连接失败'
        setConnectionStatus('error', message)
        return { success: false, error: message }
      }
    },
    [connect, setConnectionStatus]
  )

  // Disconnect from current device
  const disconnectFromDevice = useCallback(() => {
    getClient()?.abort()
    disconnect()
  }, [disconnect])

  // Initialize - load paired devices
  const initialize = useCallback(async () => {
    await loadPairedDevices()
  }, [loadPairedDevices])

  return {
    // State
    discoveredDevices,
    isScanning,
    scanProgress,
    pairedDevices,
    currentDevice,
    connectionStatus,
    connectionError,
    isConnected: connectionStatus === 'connected',

    // Actions
    scanForDevices,
    pairWithDevice,
    unpairWithDevice,
    connectToDevice,
    disconnectFromDevice,
    initialize,

    // Utils
    getClient,
  }
}
