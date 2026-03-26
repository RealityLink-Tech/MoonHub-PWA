// ============================================================
// usePWA Hook
// PWA installation and update management
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function usePWA() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.warn('SW Registered:', r)
    },
    onRegisterError(error) {
      console.error('SW registration error:', error)
    },
  })

  // Check if running as installed PWA
  useEffect(() => {
    queueMicrotask(() => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isInWebAppiOS =
        'standalone' in window.navigator &&
        (window.navigator as unknown as { standalone: boolean }).standalone

      setIsInstalled(isStandalone || isInWebAppiOS)
      setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent))
    })
  }, [])

  // Listen for install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  // Install PWA
  const install = useCallback(async (): Promise<boolean> => {
    if (!installPrompt) {
      // iOS doesn't support beforeinstallprompt
      // User needs to use "Add to Home Screen"
      return false
    }

    try {
      await installPrompt.prompt()
      const { outcome } = await installPrompt.userChoice

      if (outcome === 'accepted') {
        setIsInstalled(true)
        setIsInstallable(false)
        setInstallPrompt(null)
        return true
      }

      return false
    } catch (error) {
      console.error('Install failed:', error)
      return false
    }
  }, [installPrompt])

  // Update app
  const update = useCallback(async () => {
    await updateServiceWorker(true)
  }, [updateServiceWorker])

  return {
    isInstallable,
    isInstalled,
    isIOS,
    needRefresh,
    install,
    update,
  }
}
