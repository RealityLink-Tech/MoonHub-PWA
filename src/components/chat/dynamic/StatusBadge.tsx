import type { ReactNode } from 'react'
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react'

interface StatusBadgeProps {
  props: Record<string, unknown>
  children?: ReactNode
  componentId?: string
}

const statusConfig = {
  success: { icon: CheckCircle, bg: 'bg-primary-container/30', border: 'border-primary/20', text: 'text-primary' },
  warning: { icon: AlertTriangle, bg: 'bg-tertiary-container/30', border: 'border-tertiary/20', text: 'text-tertiary' },
  error:   { icon: XCircle, bg: 'bg-error-container/30', border: 'border-error/20', text: 'text-error' },
  info:    { icon: Info, bg: 'bg-secondary-container/30', border: 'border-secondary/20', text: 'text-secondary' },
} as const

export function StatusBadge({ props }: StatusBadgeProps) {
  const label = String(props.label || '状态')
  const status = String(props.status || 'info') as keyof typeof statusConfig
  const message = String(props.message || '')
  const config = statusConfig[status] || statusConfig.info
  const Icon = config.icon

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${config.bg} ${config.border}`}>
      <Icon className={`w-4 h-4 ${config.text}`} />
      <div>
        <p className={`text-sm font-medium ${config.text}`}>{label}</p>
        {message && <p className="text-xs text-on-surface-variant">{message}</p>}
      </div>
    </div>
  )
}
