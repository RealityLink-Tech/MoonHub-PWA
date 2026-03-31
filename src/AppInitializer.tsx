import { useEffect, type ReactNode } from 'react'
import { useDeviceStore } from '@/stores'
import { createClient, disconnectClient } from '@/services/device'

export function AppInitializer({ children }: { children: ReactNode }) {
  const loadPairedDevices = useDeviceStore((state) => state.loadPairedDevices)

  useEffect(() => {
    async function initialize() {
      await loadPairedDevices()

      // Verify token for any paired device with an auth token
      const { pairedDevices, unpairDevice, disconnect } = useDeviceStore.getState()
      for (const device of pairedDevices) {
        if (device.authToken && device.baseUrl) {
          const client = createClient(device.baseUrl, device.authToken)
          const verification = await client.verifyToken()
          if (!verification.success || !verification.data?.valid) {
            // Token invalid — disconnect client and unpair device
            disconnectClient()
            await unpairDevice(device.id)
            disconnect()
          }
          break // Only verify the first paired device with a token
        }
      }
    }

    initialize()
  }, [loadPairedDevices])

  return <>{children}</>
}
