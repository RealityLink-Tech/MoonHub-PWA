// ============================================================
// Device Store
// Manages paired devices and current connection
// ============================================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Device, PairedDevice } from '@/types'
import { getStorage } from '@/services/storage'

interface DeviceState {
  // Discovered devices (from scanning)
  discoveredDevices: Device[]
  isScanning: boolean
  scanProgress: { scanned: number; total: number } | null

  // Paired devices (persisted)
  pairedDevices: PairedDevice[]

  // Current connection
  currentDevice: PairedDevice | null
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error'
  connectionError: string | null

  // Actions
  setDiscoveredDevices: (devices: Device[]) => void
  addDiscoveredDevice: (device: Device) => void
  clearDiscoveredDevices: () => void
  setScanning: (scanning: boolean) => void
  setScanProgress: (progress: { scanned: number; total: number } | null) => void

  pairDevice: (device: PairedDevice) => Promise<void>
  unpairDevice: (deviceId: string) => Promise<void>
  loadPairedDevices: () => Promise<void>

  connect: (device: PairedDevice) => void
  disconnect: () => void
  setConnectionStatus: (status: DeviceState['connectionStatus'], error?: string) => void
}

export const useDeviceStore = create<DeviceState>()(
  persist(
    (set) => ({
      discoveredDevices: [],
      isScanning: false,
      scanProgress: null,
      pairedDevices: [],
      currentDevice: null,
      connectionStatus: 'disconnected',
      connectionError: null,

      setDiscoveredDevices: (devices) => set({ discoveredDevices: devices }),

      addDiscoveredDevice: (device) =>
        set((state) => {
          if (state.discoveredDevices.find((d) => d.id === device.id)) {
            return state
          }
          return { discoveredDevices: [...state.discoveredDevices, device] }
        }),

      clearDiscoveredDevices: () => set({ discoveredDevices: [] }),

      setScanning: (scanning) => set({ isScanning: scanning }),

      setScanProgress: (progress) => set({ scanProgress: progress }),

      pairDevice: async (device) => {
        const storage = getStorage()
        await storage.saveDevice(device)
        set((state) => ({
          pairedDevices: [...state.pairedDevices, device],
        }))
      },

      unpairDevice: async (deviceId) => {
        const storage = getStorage()
        await storage.deleteDevice(deviceId)
        set((state) => ({
          pairedDevices: state.pairedDevices.filter((d) => d.id !== deviceId),
          currentDevice:
            state.currentDevice?.id === deviceId ? null : state.currentDevice,
        }))
      },

      loadPairedDevices: async () => {
        const storage = getStorage()
        const devices = await storage.getAllDevices()
        set({ pairedDevices: devices })
      },

      connect: (device) =>
        set({
          currentDevice: device,
          connectionStatus: 'connecting',
          connectionError: null,
        }),

      disconnect: () =>
        set({
          currentDevice: null,
          connectionStatus: 'disconnected',
          connectionError: null,
        }),

      setConnectionStatus: (status, error) =>
        set({
          connectionStatus: status,
          connectionError: error || null,
        }),
    }),
    {
      name: 'moonhub-devices',
      partialize: (state) => ({
        pairedDevices: state.pairedDevices,
      }),
    }
  )
)
