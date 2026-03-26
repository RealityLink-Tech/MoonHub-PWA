// PWA type declarations
declare module 'virtual:pwa-register/react' {
  import type { Dispatch, SetStateAction } from 'react'

  export interface RegisterSWOptions {
    immediate?: boolean
    onNeedRefresh?: () => void
    onOfflineReady?: () => void
    onRegistered?: (_registration: ServiceWorkerRegistration | undefined) => void
    onRegisterError?: (_error: Error) => void
  }

  export function useRegisterSW(_options?: RegisterSWOptions): {
    needRefresh: [boolean, Dispatch<SetStateAction<boolean>>]
    offlineReady: [boolean, Dispatch<SetStateAction<boolean>>]
    updateServiceWorker: (_reloadPage?: boolean) => Promise<void>
  }
}
