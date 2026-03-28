import { motion } from 'motion/react'
import { AlertTriangle, AlertCircle, Info } from 'lucide-react'

interface SystemNoticeAction {
  label: string
  onClick: () => void
}

interface SystemNoticeProps {
  content: string
  variant?: 'info' | 'warning' | 'error'
  actions?: SystemNoticeAction[]
}

const variantStyles = {
  info: {
    icon: Info,
    bgColor: 'bg-primary-container/20',
    border: 'border-l-primary',
    text: 'text-on-surface'
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-amber-50',
    border: 'border-l-amber-500',
    text: 'text-amber-800'
  },
  error: {
    icon: AlertCircle,
    bgColor: 'bg-red-50',
    border: 'border-l-red-500',
    text: 'text-red-800'
  }
}

export function SystemNotice({
  content,
  variant = 'info',
  actions
}: SystemNoticeProps) {
  const styles = variantStyles[variant]
  const Icon = styles.icon

  return (
    <motion.div
      className={`${styles.bgColor} ${styles.border} border-l-[3px] rounded-xl px-4 py-3 max-w-[90%] md:max-w-[80%] ${styles.text}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm leading-relaxed">{content}</p>
          {actions && actions.length > 0 && (
            <div className="flex gap-2 mt-2">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}