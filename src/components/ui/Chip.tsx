// ============================================================
// Chip Component
// 筛选/操作芯片
// ============================================================

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ChipProps {
  label: string
  icon?: ReactNode
  selected?: boolean
  onClick?: () => void
  disabled?: boolean
  variant?: 'filled' | 'outlined'
  size?: 'small' | 'medium'
  className?: string
}

export function Chip({
  label,
  icon,
  selected = false,
  onClick,
  disabled = false,
  variant = 'filled',
  size = 'medium',
  className,
}: ChipProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-full font-medium transition-all',
        size === 'small' ? 'px-3 py-1.5 text-label-medium' : 'px-4 py-2 text-label-large',
        variant === 'filled' && [
          selected
            ? 'bg-primary text-on-primary'
            : 'bg-surface-container text-on-surface hover:bg-surface-container-high',
        ],
        variant === 'outlined' && [
          'border',
          selected
            ? 'border-primary bg-primary-container/30 text-primary'
            : 'border-outline-variant text-on-surface hover:border-primary',
        ],
        disabled && 'cursor-not-allowed opacity-50',
        !disabled && onClick && 'active:scale-95',
        className
      )}
    >
      {icon}
      {label}
    </button>
  )
}

// Chip Group for selection
interface ChipGroupProps {
  children: React.ReactNode
  className?: string
}

export function ChipGroup({ children, className }: ChipGroupProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {children}
    </div>
  )
}
