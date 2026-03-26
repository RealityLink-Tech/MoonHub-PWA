// ============================================================
// TopAppBar Component
// 玻璃态顶部导航栏
// ============================================================

import type { ReactNode } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TopAppBarProps {
  title?: string
  subtitle?: string
  showBack?: boolean
  actions?: ReactNode
  className?: string
  transparent?: boolean
}

export function TopAppBar({
  title,
  subtitle,
  showBack = false,
  actions,
  className,
  transparent = false,
}: TopAppBarProps) {
  const navigate = useNavigate()

  return (
    <header
      className={cn(
        'sticky top-0 z-50 flex h-14 items-center justify-between px-4',
        !transparent && 'glass-panel border-b border-white/20',
        className
      )}
    >
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={() => navigate({ to: '/' })}
            className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        {(title || subtitle) && (
          <div>
            {title && <h1 className="text-title-large font-medium">{title}</h1>}
            {subtitle && (
              <p className="text-label-medium text-on-surface-variant">{subtitle}</p>
            )}
          </div>
        )}
      </div>
      {actions && <div className="flex items-center gap-1">{actions}</div>}
    </header>
  )
}

// Icon Button for TopAppBar actions
interface TopAppBarActionProps {
  icon: LucideIcon
  onClick?: () => void
  className?: string
}

export function TopAppBarAction({ icon: Icon, onClick, className }: TopAppBarActionProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-full',
        'text-on-surface-variant transition-colors',
        'hover:bg-surface-container active:bg-surface-container-high',
        className
      )}
    >
      <Icon className="w-5 h-5" />
    </button>
  )
}
