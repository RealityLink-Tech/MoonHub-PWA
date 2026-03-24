// ============================================================
// GlassCard Component
// 可复用的玻璃态卡片组件
// ============================================================

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface GlassCardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'elevated' | 'filled' | 'outlined'
  onClick?: () => void
  interactive?: boolean
}

export function GlassCard({
  children,
  className,
  variant = 'default',
  onClick,
  interactive = false,
}: GlassCardProps) {
  const Component = onClick ? 'button' : 'div'

  return (
    <Component
      onClick={onClick}
      className={cn(
        'rounded-2xl p-4',
        variant === 'default' && 'glass-panel',
        variant === 'elevated' && 'card-elevated',
        variant === 'filled' && 'card-filled',
        variant === 'outlined' && 'card-outlined',
        interactive && 'transition-all hover:scale-[1.02] active:scale-[0.98]',
        onClick && 'cursor-pointer text-left',
        className
      )}
    >
      {children}
    </Component>
  )
}

// GlassCard Header
interface GlassCardHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
  className?: string
}

export function GlassCardHeader({
  title,
  subtitle,
  action,
  className,
}: GlassCardHeaderProps) {
  return (
    <div className={cn('mb-3 flex items-start justify-between', className)}>
      <div>
        <h3 className="text-title-large font-medium">{title}</h3>
        {subtitle && (
          <p className="text-body-medium text-on-surface-variant">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

// GlassCard Content
interface GlassCardContentProps {
  children: ReactNode
  className?: string
}

export function GlassCardContent({ children, className }: GlassCardContentProps) {
  return <div className={cn('', className)}>{children}</div>
}

// GlassCard Footer
interface GlassCardFooterProps {
  children: ReactNode
  className?: string
}

export function GlassCardFooter({ children, className }: GlassCardFooterProps) {
  return (
    <div className={cn('mt-3 flex items-center justify-end gap-2', className)}>
      {children}
    </div>
  )
}
