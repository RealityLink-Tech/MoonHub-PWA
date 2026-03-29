import { TrendingUp, TrendingDown } from 'lucide-react'

interface MetricSummaryProps {
  props: Record<string, unknown>
  componentId?: string
}

export function MetricSummary({ props }: MetricSummaryProps) {
  const title = String(props.title || '指标')
  const value = String(props.value || '0')
  const change = Number(props.change) || 0
  const direction = String(props.changeDirection || (change >= 0 ? 'up' : 'down'))
  const unit = String(props.unit || '')
  const isUp = direction === 'up'

  return (
    <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/10 shadow-sm">
      <p className="text-xs text-on-surface-variant mb-1">{title}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-on-surface">{value}</span>
        {unit && <span className="text-sm text-on-surface-variant">{unit}</span>}
        {change !== 0 && (
          <span className={`flex items-center gap-0.5 text-xs font-medium ${isUp ? 'text-green-600' : 'text-red-500'}`}>
            {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
    </div>
  )
}
