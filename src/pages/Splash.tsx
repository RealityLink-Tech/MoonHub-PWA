// ============================================================
// Splash Page
// 启动页 - 与参考项目完全一致
// ============================================================

import { useEffect } from 'react'
import { motion } from 'motion/react'
import { Aperture } from 'lucide-react'

interface SplashPageProps {
  onFinish: () => void
}

export function SplashPage({ onFinish }: SplashPageProps) {
  useEffect(() => {
    const timer = setTimeout(onFinish, 2500)
    return () => clearTimeout(timer)
  }, [onFinish])

  return (
    <motion.div
      className="fixed inset-0 bg-surface flex flex-col items-center justify-center z-50 overflow-hidden"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#ffffff_0%,#f1f4f6_100%)] z-0" />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-container/40 blur-[120px]" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] rounded-full bg-secondary-container/50 blur-[100px]" />

      <main className="relative z-10 flex flex-col items-center justify-center text-center">
        <div className="relative group mb-8">
          <div className="absolute inset-0 rounded-full shadow-[0_0_80px_20px_rgba(80,96,112,0.05)] scale-150 opacity-60" />
          <div className="relative flex items-center justify-center w-32 h-32 rounded-full bg-surface-container-lowest shadow-[0_8px_32px_rgba(80,96,112,0.08)] border border-surface-variant/30">
            <Aperture className="text-primary w-16 h-16 stroke-[1]" />
            <div className="absolute inset-2 border-t-2 border-l-2 border-primary/20 rounded-full rotate-45" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-light tracking-[0.5em] text-primary-dim uppercase leading-none ml-[0.5em]">
            月 枢
          </h1>
          <div className="flex items-center justify-center space-x-4 opacity-40 mt-4">
            <div className="h-[1px] w-8 bg-outline-variant" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-medium text-on-surface-variant">
              Lunar Halo Essence
            </span>
            <div className="h-[1px] w-8 bg-outline-variant" />
          </div>
        </div>
      </main>

      <footer className="absolute bottom-12 w-full flex justify-center z-10">
        <div className="px-6 py-2 rounded-full bg-surface-container-low/40 border border-white/20 backdrop-blur-md">
          <p className="text-[11px] tracking-[0.2em] text-on-surface-variant/60 uppercase">
            Est. 2024 · Celestial Axis
          </p>
        </div>
      </footer>
    </motion.div>
  )
}
