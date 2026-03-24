// ============================================================
// ScanningRadar Component
// 扫描动画组件
// ============================================================

import { cn } from '@/lib/utils'

interface ScanningRadarProps {
  isScanning?: boolean
  size?: 'small' | 'medium' | 'large'
  className?: string
}

export function ScanningRadar({
  isScanning = false,
  size = 'medium',
  className,
}: ScanningRadarProps) {
  const sizeClasses = {
    small: 'h-32 w-32',
    medium: 'h-48 w-48',
    large: 'h-64 w-64',
  }

  return (
    <div className={cn('relative', sizeClasses[size], className)}>
      {/* Background circles */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="absolute h-full w-full rounded-full border border-outline-variant/30" />
        <div className="absolute h-3/4 w-3/4 rounded-full border border-outline-variant/30" />
        <div className="absolute h-1/2 w-1/2 rounded-full border border-outline-variant/30" />
        <div className="absolute h-1/4 w-1/4 rounded-full border border-outline-variant/30" />
      </div>

      {/* Center dot */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={cn(
            'h-4 w-4 rounded-full bg-primary',
            isScanning && 'halo-pulse'
          )}
        />
      </div>

      {/* Scanning sweep */}
      {isScanning && (
        <div className="absolute inset-0 radar-scanner rounded-full" />
      )}

      {/* Pulse rings when scanning */}
      {isScanning && (
        <>
          <div
            className="absolute inset-0 rounded-full border-2 border-primary/20 radar-pulse"
            style={{ animationDelay: '0s' }}
          />
          <div
            className="absolute inset-0 rounded-full border-2 border-primary/15 radar-pulse"
            style={{ animationDelay: '0.5s' }}
          />
          <div
            className="absolute inset-0 rounded-full border-2 border-primary/10 radar-pulse"
            style={{ animationDelay: '1s' }}
          />
        </>
      )}
    </div>
  )
}

// Scanning status text
interface ScanningStatusProps {
  isScanning: boolean
  deviceCount?: number
  className?: string
}

export function ScanningStatus({
  isScanning,
  deviceCount = 0,
  className,
}: ScanningStatusProps) {
  return (
    <div className={cn('text-center', className)}>
      {isScanning ? (
        <p className="text-body-large text-on-surface-variant">
          正在扫描附近设备...
        </p>
      ) : deviceCount > 0 ? (
        <p className="text-body-large text-on-surface-variant">
          发现 {deviceCount} 个设备
        </p>
      ) : (
        <p className="text-body-large text-on-surface-variant">
          点击下方按钮开始扫描
        </p>
      )}
    </div>
  )
}
