import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react'

interface StatusBadgeProps {
  props: Record<string, unknown>
  componentId?: string
}

const statusConfig = {
  success: { icon: CheckCircle, bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
  warning: { icon: AlertTriangle, bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
  error:   { icon: XCircle, bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
  info:    { icon: Info, bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
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
