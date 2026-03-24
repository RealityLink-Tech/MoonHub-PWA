// ============================================================
// Space Page
// 个人空间 - 与参考项目完全一致
// ============================================================

import { motion } from 'motion/react'
import {
  PlusCircle,
  Wallet,
  FolderOpen,
  MoreHorizontal,
  FileText,
  Image,
  Table,
  Sparkles,
  Bookmark,
  ArrowLeft,
  CheckCircle,
  Edit3,
  Rss,
} from 'lucide-react'
import { Header } from '@/components/ui/Header'
import { mockFinancialData, mockFiles, mockInsights, mockSpaceModules } from '@/services/mock'
import { cn } from '@/lib/utils'

// Icon map for dynamic icon rendering
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Wallet,
  FolderOpen,
  FileText,
  Image,
  Table,
  Sparkles,
  CheckCircle,
  Edit3,
  Rss,
}

// Color map for file icons
const colorMap: Record<string, { icon: string; bg: string }> = {
  pdf: { icon: 'text-primary-dim', bg: 'bg-primary-container/50' },
  image: { icon: 'text-orange-400', bg: 'bg-orange-100/50' },
  table: { icon: 'text-blue-400', bg: 'bg-blue-100/50' },
}

// Space Extension Page
export function SpaceExtensionPage({ onBack }: { onBack: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col min-h-screen pb-32 bg-background"
    >
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm shadow-primary-container/20 flex justify-between items-center h-16 px-6">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center hover:bg-white/50 transition-colors rounded-full">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </button>
        <h1 className="text-2xl font-bold tracking-tighter text-slate-800 drop-shadow-[0_0_8px_rgba(176,196,222,0.6)]">
          空间扩展
        </h1>
        <div className="w-10 h-10"></div>
      </header>

      <main className="pt-24 px-6 max-w-7xl mx-auto w-full">
        <section className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-4xl font-light tracking-tight text-on-background mb-2">空间扩展</h2>
              <p className="text-on-surface-variant max-w-md font-light leading-relaxed">
                为您的数字空间部署智能助手。每个模块都由你的对话自生成，你可随时添加到你的空间！
              </p>
            </div>
            <div className="flex gap-2 text-sm">
              <span className="px-4 py-1.5 rounded-full bg-surface-container text-on-surface-variant font-medium">全部模块</span>
              <span className="px-4 py-1.5 rounded-full hover:bg-surface-container-high transition-colors text-outline font-medium cursor-pointer">常用</span>
              <span className="px-4 py-1.5 rounded-full hover:bg-surface-container-high transition-colors text-outline font-medium cursor-pointer">专业工具</span>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockSpaceModules.map((module) => {
            const Icon = iconMap[module.icon] || Sparkles
            return (
              <div
                key={module.id}
                className={cn(
                  'group relative overflow-hidden rounded-[2.5rem] bg-surface-container-lowest p-8 shadow-[0_0_25px_rgba(212,228,247,0.4)] border border-white/40 transition-all duration-500 hover:-translate-y-1',
                  module.extra && 'lg:row-span-2'
                )}
              >
                <div className="mb-8">
                  <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center mb-6', module.bg, module.color)}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-on-surface mb-3 tracking-tight">{module.title}</h3>
                  <p className="text-on-surface-variant text-sm font-light leading-relaxed mb-6">{module.desc}</p>
                  {module.extra && module.extraFeatures && (
                    <div className="space-y-3">
                      {module.extraFeatures.map((feature, fi) => (
                        <div key={fi} className="p-4 rounded-xl bg-surface-container-low flex items-center gap-3">
                          <Sparkles className="w-4 h-4 text-primary" />
                          <span className="text-xs text-on-surface-variant">{feature}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs font-semibold tracking-wider text-outline-variant uppercase">{module.tag}</span>
                  <button className="px-6 py-2.5 rounded-full bg-gradient-to-r from-primary to-primary-dim text-on-primary text-sm font-medium shadow-[0_4px_12px_rgba(80,96,112,0.15)] hover:shadow-[0_8px_20px_rgba(80,96,112,0.25)] transition-all active:scale-95">部署</button>
                </div>
              </div>
            )
          })}

          {/* Add More Card */}
          <div className="group border-2 border-dashed border-outline-variant/30 rounded-[2rem] p-8 flex flex-col items-center justify-center gap-4 hover:bg-surface-container transition-colors cursor-pointer min-h-[280px]">
            <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-outline">
              <PlusCircle className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-on-surface-variant">更多模块正在孵化中</p>
          </div>
        </div>
      </main>
    </motion.div>
  )
}

// Main Space Dashboard Page
export function SpacePage({ onAddClick }: { onAddClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col min-h-screen pb-32"
    >
      <Header />

      <main className="pt-24 px-6 max-w-7xl mx-auto space-y-8 w-full">
        <section className="flex justify-between items-end mb-10">
          <div className="space-y-1">
            <h1 className="text-4xl font-light tracking-tight text-primary">欢迎回来，探索者</h1>
            <p className="text-on-surface-variant/70 text-sm tracking-widest uppercase">月枢空间 · COMMAND CENTER</p>
          </div>
          <button onClick={onAddClick} className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-primary to-primary-dim text-white rounded-full shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all duration-300">
            <PlusCircle className="w-5 h-5" />
            <span className="text-sm font-medium tracking-wide">添加组件</span>
          </button>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Financial System */}
          <div className="md:col-span-8 group relative overflow-hidden rounded-[2.5rem] bg-surface-container-lowest p-8 shadow-[0_0_25px_rgba(212,228,247,0.4)] border border-white/40 transition-all duration-500 hover:-translate-y-1">
            <div className="flex justify-between items-start mb-10">
              <div>
                <h2 className="text-xl font-medium text-on-surface flex items-center gap-2">
                  <Wallet className="w-6 h-6 text-primary fill-primary/20" />
                  财务系统
                </h2>
                <p className="text-on-surface-variant text-sm mt-1">实时资产概览</p>
              </div>
              <span className="px-3 py-1 bg-primary-container/30 text-primary text-[10px] font-bold rounded-full tracking-tighter">{mockFinancialData.period}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="space-y-1">
                  <span className="text-on-surface-variant text-xs">当前总余额</span>
                  <div className="text-5xl font-extrabold tracking-tighter text-slate-800">¥{mockFinancialData.totalBalance.toLocaleString()}.<span className="text-2xl text-slate-400">00</span></div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1 p-4 rounded-3xl bg-surface-container-low border border-white/60">
                    <span className="text-[10px] text-on-surface-variant block mb-1">本月支出</span>
                    <span className="text-lg font-bold text-error">¥{mockFinancialData.monthlyExpense.toLocaleString()}</span>
                  </div>
                  <div className="flex-1 p-4 rounded-3xl bg-surface-container-low border border-white/60">
                    <span className="text-[10px] text-on-surface-variant block mb-1">投资回报</span>
                    <span className="text-lg font-bold text-primary-dim">+{mockFinancialData.investmentReturn}%</span>
                  </div>
                </div>
              </div>
              <div className="relative h-40 flex items-end justify-between gap-2 px-2">
                <div className="w-full h-16 bg-primary-container/40 rounded-t-xl"></div>
                <div className="w-full h-24 bg-primary-container/60 rounded-t-xl"></div>
                <div className="w-full h-32 bg-primary/40 rounded-t-xl"></div>
                <div className="w-full h-20 bg-primary-container/50 rounded-t-xl"></div>
                <div className="w-full h-36 bg-primary rounded-t-xl"></div>
                <div className="w-full h-28 bg-primary/20 rounded-t-xl"></div>
              </div>
            </div>
          </div>

          {/* File Manager */}
          <div className="md:col-span-4 rounded-[2.5rem] bg-surface-container-lowest p-8 shadow-[0_0_25px_rgba(212,228,247,0.4)] border border-white/40 flex flex-col hover:-translate-y-1 transition-all duration-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium text-on-surface flex items-center gap-2">
                <FolderOpen className="w-6 h-6 text-primary" />
                文件管理器
              </h2>
              <MoreHorizontal className="w-5 h-5 text-on-surface-variant cursor-pointer" />
            </div>
            <div className="space-y-4 flex-1">
              {mockFiles.map((file) => {
                const Icon = iconMap[file.icon] || FileText
                const colors = colorMap[file.type] || colorMap.pdf
                return (
                  <div key={file.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-surface-container-low transition-colors cursor-pointer">
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', colors.bg)}>
                      <Icon className={cn('w-5 h-5', colors.icon)} />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="text-sm font-medium truncate">{file.name}</div>
                      <div className="text-[10px] text-on-surface-variant">{file.size} · {file.updatedAt}</div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-6 pt-6 border-t border-slate-100">
              <button className="w-full py-3 rounded-2xl bg-surface-container-low text-primary text-xs font-bold hover:bg-surface-container-high transition-colors">
                查看全部文件
              </button>
            </div>
          </div>

          {/* Saved Insights */}
          <div className="md:col-span-12 rounded-[2.5rem] bg-surface-container-low/50 border border-white/40 p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/20 blur-[80px] rounded-full -mr-20 -mt-20"></div>
            <div className="flex justify-between items-center mb-8 relative z-10">
              <h2 className="text-2xl font-light text-primary flex items-center gap-3">
                <Sparkles className="w-6 h-6 fill-primary/20" />
                灵感收藏
              </h2>
              <div className="flex gap-4">
                <span className="text-xs font-medium text-on-surface-variant/60 cursor-pointer hover:text-primary transition-colors">最近更新</span>
                <span className="text-xs font-medium text-on-surface-variant/60 cursor-pointer hover:text-primary transition-colors">最常访问</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              {mockInsights.map((insight) => (
                <div key={insight.id} className="bg-white/40 backdrop-blur-sm p-6 rounded-3xl border border-white/60 hover:shadow-lg hover:shadow-blue-100/30 transition-all cursor-pointer">
                  <div className="flex justify-between mb-4">
                    <span className={cn('px-2 py-0.5 text-[10px] rounded-md font-bold uppercase tracking-wider', insight.tagColor)}>{insight.tag}</span>
                    <Bookmark className="w-4 h-4 text-on-surface-variant" />
                  </div>
                  <p className="text-on-surface font-medium leading-relaxed italic">{insight.quote}</p>
                  <div className="mt-6 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200"></div>
                    <span className="text-[11px] text-on-surface-variant font-medium">{insight.author}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </motion.div>
  )
}
