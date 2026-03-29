// ============================================================
// SpaceAdd Page
// 组件商店 - 浏览 AI 生成的工具并添加到空间首页
// ============================================================

import { motion } from 'motion/react'
import { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Sparkles, Search } from 'lucide-react'
import { dynamicToolsService } from '@/services/dynamicTools'
import type { DynamicTool } from '@/types'
import { cn } from '@/lib/utils'

interface SpaceAddProps {
  onBack: () => void
  onToolSelect: (toolId: string) => void
}

type TabType = 'ai' | 'manual'

export function SpaceAdd({ onBack, onToolSelect }: SpaceAddProps) {
  const [activeTab, setActiveTab] = useState<TabType>('ai')
  const [tools, setTools] = useState<DynamicTool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addingIds, setAddingIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (activeTab === 'ai') {
      loadTools()
    }
  }, [activeTab])

  const loadTools = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await dynamicToolsService.list('ai')
      if (res.success && res.data) {
        setTools(res.data)
      } else {
        setError(res.error?.message || '加载失败')
      }
    } catch {
      setError('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToHome = async (e: React.MouseEvent, toolId: string) => {
    e.stopPropagation()
    setAddingIds((prev) => new Set(prev).add(toolId))
    try {
      await dynamicToolsService.setOnHome(toolId, true)
      setTools((prev) =>
        prev.map((t) => (t.id === toolId ? { ...t, is_on_home: true } : t))
      )
    } catch {
      console.error('添加到首页失败')
    } finally {
      setAddingIds((prev) => {
        const next = new Set(prev)
        next.delete(toolId)
        return next
      })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col min-h-screen pb-32 bg-background"
    >
      {/* Fixed Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm shadow-primary-container/20 flex justify-between items-center h-16 px-6">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center hover:bg-white/50 transition-colors rounded-full"
        >
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </button>
        <h1 className="text-2xl font-bold tracking-tighter text-slate-800 drop-shadow-[0_0_8px_rgba(176,196,222,0.6)]">
          添加组件
        </h1>
        <div className="w-10 h-10" />
      </header>

      <main className="pt-24 px-6 max-w-7xl mx-auto w-full">
        {/* Tab Switcher */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('ai')}
            className={cn(
              'flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all',
              activeTab === 'ai'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            )}
          >
            <Sparkles className="w-4 h-4" />
            AI 生成
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={cn(
              'flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all',
              activeTab === 'manual'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            )}
          >
            <Plus className="w-4 h-4" />
            手动创建
          </button>
        </div>

        {/* AI Tab Content */}
        {activeTab === 'ai' && (
          <div className="mt-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="text-on-surface-variant text-sm">加载中...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-12 h-12 rounded-full bg-error-container/50 flex items-center justify-center">
                  <Search className="w-6 h-6 text-error" />
                </div>
                <p className="text-on-surface-variant text-sm">{error}</p>
                <button
                  onClick={loadTools}
                  className="px-4 py-2 rounded-full bg-surface-container text-on-surface-variant text-sm hover:bg-surface-container-high transition-colors"
                >
                  重试
                </button>
              </div>
            ) : tools.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-container/30 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <p className="text-on-surface-variant text-sm text-center max-w-xs">
                  在 Chat 中对话时，AI 会自动生成可用工具
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tools.map((tool) => (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-[1.5rem] bg-surface-container-lowest p-6 border border-white/40 shadow-sm hover:shadow-md transition-all cursor-pointer"
                    onClick={() => onToolSelect(tool.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold text-on-surface tracking-tight">
                        {tool.name}
                      </h3>
                      <span className="text-[10px] font-medium bg-primary-container/30 text-primary px-2 py-0.5 rounded-full shrink-0 ml-2">
                        {tool.category}
                      </span>
                    </div>
                    <p className="text-on-surface-variant text-sm font-light leading-relaxed mb-5 line-clamp-2">
                      {tool.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleAddToHome(e, tool.id)}
                        disabled={tool.is_on_home || addingIds.has(tool.id)}
                        className={cn(
                          'flex-1 py-2.5 rounded-full text-sm font-medium transition-all active:scale-[0.98]',
                          tool.is_on_home
                            ? 'bg-surface-container text-on-surface-variant cursor-default'
                            : 'bg-primary text-on-primary shadow-sm hover:shadow-md'
                        )}
                      >
                        {addingIds.has(tool.id)
                          ? '添加中...'
                          : tool.is_on_home
                            ? '已添加'
                            : '添加到首页'}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onToolSelect(tool.id)
                        }}
                        className="px-4 py-2.5 rounded-full text-sm font-medium bg-surface-container text-on-surface-variant hover:bg-surface-container-high transition-all active:scale-[0.98]"
                      >
                        查看详情
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Manual Tab Content */}
        {activeTab === 'manual' && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center">
              <Plus className="w-6 h-6 text-on-surface-variant" />
            </div>
            <p className="text-on-surface-variant text-sm">手动创建功能开发中</p>
          </div>
        )}
      </main>
    </motion.div>
  )
}
