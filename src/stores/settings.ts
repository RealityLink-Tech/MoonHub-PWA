// ============================================================
// Settings Store
// Manages app settings
// ============================================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppSettings } from '@/types'
import { DEFAULT_SETTINGS } from '@/services/storage'

interface SettingsState extends AppSettings {
  // Actions
  setTheme: (_theme: AppSettings['theme']) => void
  setLanguage: (_language: string) => void
  setNotifications: (_notifications: Partial<AppSettings['notifications']>) => void
  setVoice: (_voice: Partial<AppSettings['voice']>) => void
  setNetwork: (_network: Partial<AppSettings['network']>) => void
  reset: () => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,

      setTheme: (theme) => set({ theme }),

      setLanguage: (language) => set({ language }),

      setNotifications: (notifications) =>
        set((state) => ({
          notifications: { ...state.notifications, ...notifications },
        })),

      setVoice: (voice) =>
        set((state) => ({
          voice: { ...state.voice, ...voice },
        })),

      setNetwork: (network) =>
        set((state) => ({
          network: { ...state.network, ...network },
        })),

      reset: () => set(DEFAULT_SETTINGS),
    }),
    {
      name: 'moonhub-settings',
    }
  )
)
