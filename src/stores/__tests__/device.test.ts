// src/stores/__tests__/device.test.ts
//
// Task 17: Device store unit tests
// Tests pairDevice, unpairDevice, connect, and disconnect.
// The store uses getStorage() for persistence, so we mock the storage module.
// PairedDevice type extends Device with authToken, baseUrl, pairedAt fields
// (see src/types/index.ts).

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useDeviceStore } from '../index'

// Mock the storage module so pairDevice/unpairDevice don't hit IndexedDB
vi.mock('@/services/storage', () => ({
  getStorage: () => ({
    saveDevice: vi.fn().mockResolvedValue(undefined),
    deleteDevice: vi.fn().mockResolvedValue(undefined),
    getAllDevices: vi.fn().mockResolvedValue([]),
  }),
}))

describe('useDeviceStore', () => {
  beforeEach(() => {
    useDeviceStore.setState({
      pairedDevices: [],
      currentDevice: null,
      connectionStatus: 'disconnected',
    })
  })

  it('should add a paired device', async () => {
    const device = {
      id: 'dev-1',
      name: 'Test Device',
      authToken: 'token-123',
      baseUrl: 'http://192.168.1.42:18800',
      pairedAt: Date.now(),
      // PairedDevice extends Device, so these fields are required:
      address: '192.168.1.42:18800',
      version: '1.0.0',
      status: 'online' as const,
      lastSeen: Date.now(),
      capabilities: ['chat' as const],
    }

    await useDeviceStore.getState().pairDevice(device)
    expect(useDeviceStore.getState().pairedDevices).toHaveLength(1)
    expect(useDeviceStore.getState().pairedDevices[0].id).toBe('dev-1')
  })

  it('should connect to a device', () => {
    const device = {
      id: 'dev-1',
      name: 'Test Device',
      authToken: 'token-123',
      baseUrl: 'http://192.168.1.42:18800',
      pairedAt: Date.now(),
      address: '192.168.1.42:18800',
      version: '1.0.0',
      status: 'online' as const,
      lastSeen: Date.now(),
      capabilities: ['chat' as const],
    }

    useDeviceStore.getState().connect(device)
    expect(useDeviceStore.getState().currentDevice?.id).toBe('dev-1')
    expect(useDeviceStore.getState().connectionStatus).toBe('connecting')
  })

  it('should disconnect', () => {
    useDeviceStore.getState().disconnect()
    expect(useDeviceStore.getState().currentDevice).toBeNull()
    expect(useDeviceStore.getState().connectionStatus).toBe('disconnected')
  })

  it('should unpair a device', async () => {
    const device = {
      id: 'dev-1',
      name: 'Test Device',
      authToken: 'token-123',
      baseUrl: 'http://192.168.1.42:18800',
      pairedAt: Date.now(),
      address: '192.168.1.42:18800',
      version: '1.0.0',
      status: 'online' as const,
      lastSeen: Date.now(),
      capabilities: ['chat' as const],
    }

    await useDeviceStore.getState().pairDevice(device)
    await useDeviceStore.getState().unpairDevice('dev-1')
    expect(useDeviceStore.getState().pairedDevices).toHaveLength(0)
  })
})
