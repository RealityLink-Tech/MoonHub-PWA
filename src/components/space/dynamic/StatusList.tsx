import { useAIUpdate } from '@/hooks/useAIUpdate'
import { CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react'
import { useState } from 'react'

interface StatusItem { label: string; status: string; icon?: string; description?: string }
interface StatusListProps { props: Record<string, unknown>; componentId?: string }

const statusIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle, error: XCircle, warning: AlertTriangle, pending: Clock,
}
const statusColors: Record<string, string> = {
  success: 'text-primary', error: 'text-error', warning: 'text-tertiary', pending: 'text-on-surface-variant',
}

export function StatusList({ props, componentId }: StatusListProps) {
  const [data, setData] = useState(props)
  useAIUpdate(componentId || '', (newData) => setData(newData as Record<string, unknown>))
  const title = String(data.title || '状态列表')
  const items = (Array.isArray(data.items) ? data.items as StatusItem[] : [])
  return (
    <div className="rounded-[2rem] bg-surface-container-lowest p-8 shadow-[0_0_25px_rgba(212,228,247,0.4)] border border-white/40">
      <h3 className="text-xl font-bold text-on-surface mb-6">{title}</h3>
      <div className="space-y-3">
        {items.length > 0 ? items.map((item, i) => {
          const Icon = statusIcons[item.status] || Clock
          const color = statusColors[item.status] || 'text-on-surface-variant'
          return (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors">
              {item.icon ? <span className="text-base">{item.icon}</span> : <Icon className={`w-5 h-5 ${color}`} />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-on-surface">{item.label}</p>
                {item.description && <p className="text-xs text-on-surface-variant truncate">{item.description}</p>}
              </div>
            </div>
          )
        }) : <p className="text-center py-8 text-sm text-on-surface-variant">暂无状态项</p>}
      </div>
    </div>
  )
}
