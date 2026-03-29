import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { Zap } from 'lucide-react'

interface QuickActionProps {
  props: Record<string, unknown>
  children?: ReactNode
  componentId?: string
}

export function QuickAction({ props }: QuickActionProps) {
  const label = String(props.label || '操作')
  const description = String(props.description || '')
  const icon = String(props.icon || '')

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary-container/30 border border-primary/10 hover:bg-primary-container/50 transition-colors text-left"
    >
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        {icon ? <span className="text-base">{icon}</span> : <Zap className="w-4 h-4 text-primary" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-on-surface">{label}</p>
        {description && <p className="text-xs text-on-surface-variant truncate">{description}</p>}
      </div>
    </motion.button>
  )
}
