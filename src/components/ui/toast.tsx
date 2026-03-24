// ============================================================
// Toast Component
// ============================================================

import { useEffect } from 'react'
import { useUIStore } from '@/stores/ui'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'info'
}

export function Toast({ message, type }: ToastProps) {
  const hideToast = useUIStore((state) => state.hideToast)

  useEffect(() => {
    const timer = setTimeout(hideToast, 3000)
    return () => clearTimeout(timer)
  }, [hideToast])

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
  }

  const backgrounds = {
    success: 'bg-green-500/10 border-green-500/50',
    error: 'bg-red-500/10 border-red-500/50',
    info: 'bg-blue-500/10 border-blue-500/50',
  }

  return (
    <div className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2">
      <div
        className={`flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg ${backgrounds[type]}`}
      >
        {icons[type]}
        <p className="text-sm">{message}</p>
        <button onClick={hideToast} className="ml-2">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
