import { TrendingUp, TrendingDown } from 'lucide-react'
import { useAIUpdate } from '@/hooks/useAIUpdate'
import { useState } from 'react'

interface MetricCardProps { props: Record<string, unknown>; componentId?: string }

export function MetricCard({ props, componentId }: MetricCardProps) {
  const [data, setData] = useState(props)
  useAIUpdate(componentId || '', (newData) => setData(newData as Record<string, unknown>))
  const title = String(data.title || '指标')
  const value = String(data.value || '0')
  const subtitle = String(data.subtitle || '')
  const change = Number(data.change) || 0
  const direction = String(data.changeDirection || (change >= 0 ? 'up' : 'down'))
  const unit = String(data.unit || '')
  const isUp = direction === 'up'
  return (
    <div className="rounded-[2rem] bg-surface-container-lowest p-8 shadow-[0_0_25px_rgba(212,228,247,0.4)] border border-white/40">
      <div className="flex items-start justify-between mb-6">
        <h3 className="text-xl font-bold text-on-surface">{title}</h3>
        {change !== 0 && (
          <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${isUp ? 'bg-primary-container/40 text-primary' : 'bg-error-container/40 text-error'}`}>
            {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-extrabold tracking-tighter text-on-surface">{value}</span>
        {unit && <span className="text-lg text-on-surface-variant">{unit}</span>}
      </div>
      {subtitle && <p className="mt-2 text-sm text-on-surface-variant">{subtitle}</p>}
    </div>
  )
}
