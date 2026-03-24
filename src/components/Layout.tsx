// ============================================================
// Layout Component
// 主应用布局 - 使用新的底部导航栏
// ============================================================

import type { ReactNode } from 'react'
import { Toast } from '@/components/ui/toast'
import { useUIStore } from '@/stores/ui'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { toast } = useUIStore()

  return (
    <div className="flex h-screen flex-col bg-surface">
      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}
