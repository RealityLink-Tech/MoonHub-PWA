import { useEffect, type ReactNode } from 'react'
import { useDeviceStore } from '@/stores'

export function AppInitializer({ children }: { children: ReactNode }) {
  const loadPairedDevices = useDeviceStore((state) => state.loadPairedDevices)

  useEffect(() => {
    loadPairedDevices()
  }, [loadPairedDevices])

  return <>{children}</>
}
