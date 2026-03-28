// ============================================================
// Settings Page -> Account Page
// 账户设置页面 - 与参考项目完全一致
// ============================================================

import { motion } from 'motion/react'
import {
  Verified,
  Star,
  Router,
  ChevronRight,
  Smartphone,
  Cpu,
  Network,
  Shield,
  Puzzle,
  Settings,
} from 'lucide-react'
import { Header } from '@/components/ui/Header'
import { mockUser, mockSystemPreferences } from '@/services/mock'

export type SettingsSubPage = 'devices' | 'model' | 'channels' | 'privacy' | 'skills' | 'system'

export function SettingsPage({
  onManageDevice,
  onNavigateSubPage,
}: {
  onManageDevice: () => void
  onNavigateSubPage?: (_page: SettingsSubPage) => void
}) {
  const handlePreferenceClick = (id: string) => {
    onNavigateSubPage?.(id as SettingsSubPage)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col min-h-screen pb-32"
    >
      <Header title="账户" />

      <main className="pt-24 px-6 max-w-2xl mx-auto w-full space-y-8">
        {/* User Profile Card */}
        <section className="grid grid-cols-1 gap-4">
          <div className="bg-surface-container-lowest rounded-[32px] p-8 flex flex-col items-center justify-center space-y-4 border border-outline-variant/10 shadow-sm transition-all hover:shadow-md">
            <div className="relative">
              <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-primary-container to-surface-bright shadow-[0_0_40px_rgba(212,228,247,0.4)]">
                <img
                  src={mockUser.avatar}
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover bg-white"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full border-2 border-white">
                <Verified className="w-4 h-4 fill-primary text-white" />
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-on-surface tracking-tight">{mockUser.name}</h2>
              <p className="text-on-surface-variant text-sm mt-1 opacity-70">ID: {mockUser.id}</p>
            </div>
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary-container/30 border border-primary-container/50">
              <Star className="w-4 h-4 text-primary mr-2 fill-primary" />
              <span className="text-sm font-semibold text-primary tracking-wide">活跃 {mockUser.activeDays} 天</span>
            </div>
          </div>
        </section>

        {/* Connected Device Card */}
        <div className="bg-surface-container-lowest rounded-[32px] p-6 flex items-center justify-between border border-outline-variant/10 shadow-sm mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary-container/20 flex items-center justify-center relative">
              <Router className="w-7 h-7 text-primary" />
              <span className="absolute top-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-[0_0_8px_rgba(74,222,128,0.6)] animate-pulse"></span>
            </div>
            <div>
              <h4 className="text-lg font-bold text-on-surface tracking-tight">Lunar Hub</h4>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest font-bold text-green-500/80">已连接</span>
                <span className="text-xs text-on-surface-variant/60">· 在线 12h</span>
              </div>
            </div>
          </div>
          <button
            onClick={onManageDevice}
            className="px-4 py-2 rounded-xl bg-surface-container-high text-primary text-sm font-bold hover:bg-primary-container/30 transition-colors"
          >
            管理
          </button>
        </div>

        {/* System Preferences */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-on-surface-variant/60 uppercase tracking-[0.2em] px-2">系统偏好</h3>
          <div className="bg-surface-container-low rounded-[32px] overflow-hidden border border-outline-variant/10">
            {mockSystemPreferences.map((item, _i) => {
              const Icon = {
                Smartphone,
                Cpu,
                Network,
                Shield,
                Puzzle,
                Settings,
              }[item.icon] || Smartphone
              return (
                <button
                  key={item.id}
                  onClick={() => handlePreferenceClick(item.id)}
                  className="w-full flex items-center justify-between p-6 hover:bg-surface-container-high transition-colors group border-b border-outline-variant/5 last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-surface-container-lowest flex items-center justify-center group-hover:scale-95 transition-transform">
                      <Icon className="w-6 h-6 text-on-surface-variant" />
                    </div>
                    <span className="text-[17px] font-medium text-on-surface">{item.label}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-outline-variant" />
                </button>
              )
            })}
          </div>
        </section>
      </main>
    </motion.div>
  )
}
