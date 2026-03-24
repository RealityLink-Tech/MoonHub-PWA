// ============================================================
// Switch Component
// Toggle switch for settings
// ============================================================

import * as React from 'react'
import * as SwitchPrimitives from '@radix-ui/react-switch'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  label?: string
  description?: string
  icon?: LucideIcon
}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className, label, description, icon: Icon, checked, onCheckedChange, ...props }, ref) => {
  const switchElement = (
    <SwitchPrimitives.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      className={cn(
        'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full',
        'border-2 border-transparent transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'data-[state=checked]:bg-primary data-[state=unchecked]:bg-surface-container-high',
        className
      )}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          'pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform',
          'data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0'
        )}
      />
    </SwitchPrimitives.Root>
  )

  if (label || description) {
    return (
      <label className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          {Icon && (
            <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center">
              <Icon className={cn('w-5 h-5', checked ? 'text-primary' : 'text-on-surface-variant')} />
            </div>
          )}
          <div>
            {label && <span className="text-body-large font-medium">{label}</span>}
            {description && (
              <p className="text-body-medium text-on-surface-variant">{description}</p>
            )}
          </div>
        </div>
        {switchElement}
      </label>
    )
  }

  return switchElement
})
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
