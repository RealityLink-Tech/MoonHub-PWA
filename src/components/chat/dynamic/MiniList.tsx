import { ChevronRight } from 'lucide-react'

interface MiniListProps {
  props: Record<string, unknown>
  componentId?: string
}

interface ListItem { title: string; subtitle?: string; icon?: string }

export function MiniList({ props }: MiniListProps) {
  const title = String(props.title || '')
  const items = (Array.isArray(props.items) ? props.items as ListItem[] : []).slice(0, 5)

  return (
    <div className="bg-surface-container-low rounded-xl border border-outline-variant/10 overflow-hidden">
      {title && (
        <div className="px-4 py-2 border-b border-outline-variant/10">
          <p className="text-sm font-medium text-on-surface">{title}</p>
        </div>
      )}
      <div className="divide-y divide-outline-variant/5">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-container transition-colors cursor-pointer">
            {item.icon && <span className="text-base">{item.icon}</span>}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-on-surface truncate">{item.title}</p>
              {item.subtitle && <p className="text-xs text-on-surface-variant truncate">{item.subtitle}</p>}
            </div>
            <ChevronRight className="w-4 h-4 text-on-surface-variant/40" />
          </div>
        ))}
      </div>
    </div>
  )
}
