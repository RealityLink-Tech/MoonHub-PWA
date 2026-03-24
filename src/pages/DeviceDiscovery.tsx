// ============================================================
// Device Discovery Page
// 设备发现/扫描页面 - 与参考项目完全一致
// ============================================================

import { motion } from 'motion/react'
import {
  Settings,
  RefreshCw,
  Radar,
  Router,
  Video,
  PlusCircle,
} from 'lucide-react'

export function DeviceDiscoveryPage({
  onBack,
  onConnect,
}: {
  onBack: () => void
  onConnect: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen bg-background flex flex-col"
    >
      <header className="fixed top-0 w-full z-50 bg-[#f8f9fa]/80 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between px-6 h-16 w-full max-w-md mx-auto">
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#d4e4f7]/30 transition-colors"
          >
            <Settings className="w-5 h-5 text-[#506070]" />
          </button>
          <h1 className="text-lg tracking-wider font-light text-[#506070]">
            设备发现
          </h1>
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#d4e4f7]/30 transition-colors">
            <RefreshCw className="w-5 h-5 text-[#506070]" />
          </button>
        </div>
        <div className="bg-gradient-to-b from-[#abb3b7]/10 to-transparent h-[1px]"></div>
      </header>

      <main className="pt-24 px-6 max-w-md mx-auto min-h-screen pb-12 w-full">
        <section className="flex flex-col items-center justify-center py-12 mb-8">
          <div className="relative flex items-center justify-center w-48 h-48">
            <div className="absolute w-24 h-24 rounded-full bg-gradient-to-br from-primary-container to-surface-container-high shadow-[0_0_0_0_rgba(176,196,222,0.4)] animate-[pulse_3s_infinite_cubic-bezier(0.4,0,0.6,1)] flex items-center justify-center z-10">
              <Radar className="w-8 h-8 text-primary" />
            </div>
            <div className="absolute w-36 h-36 rounded-full border border-primary-container/30"></div>
            <div className="absolute w-48 h-48 rounded-full border border-primary-container/10"></div>
          </div>
          <div className="mt-10 text-center">
            <p className="text-on-surface-variant text-sm font-light tracking-[0.2em]">
              正在扫描局域网内设备...
            </p>
            <div className="flex justify-center gap-1 mt-3">
              <span className="w-1 h-1 rounded-full bg-primary/40"></span>
              <span className="w-1 h-1 rounded-full bg-primary/20"></span>
              <span className="w-1 h-1 rounded-full bg-primary/10"></span>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-2 mb-2">
            <h2 className="text-sm font-medium text-primary tracking-wide">
              已发现设备 (2)
            </h2>
            <span className="text-[10px] text-outline-variant uppercase tracking-tighter">
              Nearby Devices
            </span>
          </div>

          <div
            onClick={onConnect}
            className="group relative overflow-hidden p-5 rounded-xl bg-surface-container-low transition-all duration-300 hover:bg-surface-container-lowest hover:shadow-[0_12px_40px_rgba(80,96,112,0.06)] flex items-center gap-4 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary transition-colors group-hover:bg-primary-container">
              <Router className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-on-surface font-medium text-[15px]">
                月枢智能盒 01
              </h3>
              <p className="text-outline text-xs mt-1 font-mono tracking-tight">
                192.168.1.105
              </p>
            </div>
            <button className="w-8 h-8 rounded-full flex items-center justify-center text-outline-variant hover:text-primary hover:bg-primary-container/30 transition-all">
              <PlusCircle className="w-5 h-5" />
            </button>
          </div>

          <div
            onClick={onConnect}
            className="group relative overflow-hidden p-5 rounded-xl bg-surface-container-low transition-all duration-300 hover:bg-surface-container-lowest hover:shadow-[0_12px_40px_rgba(80,96,112,0.06)] flex items-center gap-4 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary transition-colors group-hover:bg-primary-container">
              <Video className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-on-surface font-medium text-[15px]">
                月枢监控终端-北
              </h3>
              <p className="text-outline text-xs mt-1 font-mono tracking-tight">
                192.168.1.112
              </p>
            </div>
            <button className="w-8 h-8 rounded-full flex items-center justify-center text-outline-variant hover:text-primary hover:bg-primary-container/30 transition-all">
              <PlusCircle className="w-5 h-5" />
            </button>
          </div>

          <div className="pt-6 flex justify-center">
            <button className="text-xs text-primary/70 hover:text-primary transition-colors font-light tracking-widest border-b border-primary/20 pb-0.5">
              手动输入IP添加设备
            </button>
          </div>
        </section>
      </main>
    </motion.div>
  )
}
