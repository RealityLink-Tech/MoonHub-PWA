// ============================================================
// DeviceCard Component
// 设备卡片
// ============================================================

import { Smartphone, HelpCircle, CheckCircle, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Device } from '@/types'

// Combined type for display
type DisplayDevice = Device & { alias?: string; authToken?: string }

interface DeviceCardProps {
  device: DisplayDevice
  isPaired?: boolean
  isSelected?: boolean
  onClick?: () => void
  onConnect?: () => void
  onPair?: () => void
  className?: string
}

export function DeviceCard({
  device,
  isPaired = false,
  isSelected = false,
  onClick,
  onConnect,
  onPair,
  className,
}: DeviceCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'card-elevated flex items-center gap-4 p-4',
        'transition-all duration-200',
        onClick && 'cursor-pointer',
        isSelected && 'ring-2 ring-primary ring-offset-2',
        className
      )}
    >
      {/* Device Icon */}
      <div className="halo-effect flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-primary-container">
        {isPaired ? (
          <Smartphone className="w-6 h-6 text-primary" />
        ) : (
          <HelpCircle className="w-6 h-6 text-primary" />
        )}
      </div>

      {/* Device Info */}
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-title-large font-medium">
          {device.alias || device.name}
        </h3>
        <p className="text-body-medium text-on-surface-variant">{device.address}</p>
        {isPaired && (
          <div className="mt-1 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-primary" />
            <span className="text-label-medium text-primary">已配对</span>
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="flex-shrink-0">
        {isPaired && onConnect ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onConnect()
            }}
            className="btn-gradient rounded-full px-4 py-2 text-label-large font-medium"
          >
            连接
          </button>
        ) : !isPaired && onPair ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onPair()
            }}
            className="rounded-full bg-surface-container px-4 py-2 text-label-large font-medium text-primary transition-colors hover:bg-surface-container-high"
          >
            配对
          </button>
        ) : null}
      </div>
    </div>
  )
}

// Small device card for lists
interface DeviceCardMiniProps {
  device: DisplayDevice
  isConnected?: boolean
  onClick?: () => void
  className?: string
}

export function DeviceCardMini({
  device,
  isConnected = false,
  onClick,
  className,
}: DeviceCardMiniProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-xl p-3 transition-colors',
        onClick && 'cursor-pointer hover:bg-surface-container',
        className
      )}
    >
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-xl',
          isConnected ? 'bg-primary-container' : 'bg-surface-container'
        )}
      >
        <Smartphone
          className={cn(
            'w-5 h-5',
            isConnected ? 'text-primary' : 'text-on-surface-variant'
          )}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-body-large font-medium">
          {device.alias || device.name}
        </p>
        {isConnected && (
          <p className="text-label-medium text-primary">已连接</p>
        )}
      </div>
      {onClick && (
        <ChevronRight className="w-5 h-5 text-on-surface-variant" />
      )}
    </div>
  )
}
