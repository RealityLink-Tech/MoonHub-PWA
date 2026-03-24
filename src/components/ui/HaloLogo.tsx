// ============================================================
// HaloLogo Component
// 带月晕效果的Logo - 5x5点阵设计
// ============================================================

import { cn } from '@/lib/utils'

interface HaloLogoProps {
  size?: 'small' | 'medium' | 'large'
  showHalo?: boolean
  className?: string
}

// 5x5 dot grid pattern for logo
function DotGrid({ dotSize, gap }: { dotSize: number; gap: number }) {
  const rows = 5
  const cols = 5
  const dots: React.ReactNode[] = []

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      // Create a subtle pattern - some dots are more visible
      const opacity = (i + j) % 2 === 0 ? 1 : 0.4
      dots.push(
        <div
          key={`${i}-${j}`}
          className="rounded-full bg-on-surface"
          style={{
            width: dotSize,
            height: dotSize,
            opacity,
          }}
        />
      )
    }
  }

  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap,
      }}
    >
      {dots}
    </div>
  )
}

export function HaloLogo({
  size = 'medium',
  showHalo = true,
  className,
}: HaloLogoProps) {
  const sizeConfig = {
    small: { container: 'h-12 w-12', dotSize: 3, gap: 3, border: 'border' },
    medium: { container: 'h-16 w-16', dotSize: 4, gap: 4, border: 'border-2' },
    large: { container: 'h-24 w-24', dotSize: 5, gap: 5, border: 'border-2' },
  }

  const config = sizeConfig[size]

  return (
    <div className={cn('relative', className)}>
      {/* Halo glow effect */}
      {showHalo && (
        <div
          className={cn(
            'absolute inset-0 rounded-full',
            'bg-gradient-radial from-primary/20 via-primary/10 to-transparent',
            'animate-pulse'
          )}
          style={{
            transform: 'scale(1.5)',
          }}
        />
      )}

      {/* Logo container - circular with dot grid */}
      <div
        className={cn(
          'relative flex items-center justify-center rounded-full',
          'bg-surface-container-lowest',
          config.border,
          'border-outline-variant',
          'shadow-sm',
          config.container,
          showHalo && 'halo-glow'
        )}
      >
        <DotGrid dotSize={config.dotSize} gap={config.gap} />
      </div>
    </div>
  )
}

// Brand title with English subtitle
interface BrandTitleProps {
  showSubtitle?: boolean
  className?: string
}

export function BrandTitle({ showSubtitle = true, className }: BrandTitleProps) {
  return (
    <div className={cn('text-center', className)}>
      <h1
        className="text-display-medium font-light tracking-wider text-on-surface"
        style={{ fontFamily: "'Noto Sans SC', sans-serif" }}
      >
        月 枢
      </h1>
      {showSubtitle && (
        <p
          className="mt-2 text-label-large tracking-[0.25em] text-on-surface-variant uppercase"
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          Lunar Halo Essence
        </p>
      )}
    </div>
  )
}

// Full brand header with logo and title
interface BrandHeaderProps {
  size?: 'small' | 'medium' | 'large'
  showHalo?: boolean
  showSubtitle?: boolean
  className?: string
}

export function BrandHeader({
  size = 'medium',
  showHalo = true,
  showSubtitle = true,
  className,
}: BrandHeaderProps) {
  return (
    <div className={cn('flex flex-col items-center gap-6', className)}>
      <HaloLogo size={size} showHalo={showHalo} />
      <BrandTitle showSubtitle={showSubtitle} />
    </div>
  )
}
