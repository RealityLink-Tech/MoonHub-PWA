// ============================================================
// UI Store
// Manages global UI state
// ============================================================

import { create } from 'zustand'

interface UIState {
  // Navigation
  activeTab: 'chat' | 'space' | 'settings'

  // Modals
  showPairingModal: boolean
  pairingDeviceAddress: string | null
  showInstallPrompt: boolean
  showDeviceList: boolean

  // Toast/Notifications
  toast: { message: string; type: 'success' | 'error' | 'info' } | null

  // Actions
  setActiveTab: (tab: UIState['activeTab']) => void
  showPairing: (deviceAddress?: string) => void
  hidePairing: () => void
  setShowInstallPrompt: (show: boolean) => void
  setShowDeviceList: (show: boolean) => void
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void
  hideToast: () => void
}

export const useUIStore = create<UIState>((set) => ({
  activeTab: 'chat',
  showPairingModal: false,
  pairingDeviceAddress: null,
  showInstallPrompt: false,
  showDeviceList: false,
  toast: null,

  setActiveTab: (tab) => set({ activeTab: tab }),

  showPairing: (deviceAddress) =>
    set({ showPairingModal: true, pairingDeviceAddress: deviceAddress || null }),

  hidePairing: () => set({ showPairingModal: false, pairingDeviceAddress: null }),

  setShowInstallPrompt: (show) => set({ showInstallPrompt: show }),

  setShowDeviceList: (show) => set({ showDeviceList: show }),

  showToast: (message, type = 'info') =>
    set({ toast: { message, type } }),

  hideToast: () => set({ toast: null }),
}))
