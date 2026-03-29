// ============================================================
// SpaceDetail Page
// 工具详情页 - 完整小程序渲染视图
// ============================================================

import { motion } from 'motion/react'
import { useState, useEffect } from 'react'
import { ArrowLeft, Trash2, RefreshCw } from 'lucide-react'
import { dynamicToolsService } from '@/services/dynamicTools'
import { DynamicRenderer } from '@/components/space/DynamicRenderer'
import type { DynamicTool, ExecutionResult, GeneratedComponent } from '@/types'

interface SpaceDetailProps {
  toolId: string
  onBack: () => void
}

export function SpaceDetail({ toolId, onBack }: SpaceDetailProps) {
  const [tool, setTool] = useState<DynamicTool | null>(null)
  const [components, setComponents] = useState<GeneratedComponent[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadToolData()
  }, [toolId])

  const loadToolData = async () => {
    setLoading(true)
    setError(null)
    try {
      // 并行加载工具信息和空间 schema
      const [listRes, schemaRes] = await Promise.all([
        dynamicToolsService.list(),
        dynamicToolsService.getSchema(toolId, 'space'),
      ])

      // 从列表中找到当前工具
      if (listRes.success && listRes.data) {
        const found = listRes.data.find((t) => t.id === toolId)
        setTool(found || null)
      }

      // 加载 schema
      if (schemaRes.success && schemaRes.data) {
        setComponents([schemaRes.data])
      } else {
        setError(schemaRes.error?.message || '加载组件失败')
      }
    } catch {
      setError('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const res = await dynamicToolsService.execute(toolId, {}, 'space')
      if (res.success && res.data) {
        setComponents([res.data.schema])
      } else {
        setError(res.error?.message || '刷新失败')
      }
    } catch {
      setError('刷新失败，请重试')
    } finally {
      setRefreshing(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('确定要删除该组件吗？')) return
    try {
      await dynamicToolsService.delete(toolId)
      onBack()
    } catch {
      setError('删除失败，请重试')
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
        <h1 className="text-2xl font-bold tracking-tighter text-slate-800 drop-shadow-[0_0_8px_rgba(176,196,222,0.6)] truncate max-w-[60%]">
          {tool?.name || '组件详情'}
        </h1>
        <div className="flex items-center gap-1">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="w-10 h-10 flex items-center justify-center hover:bg-white/50 transition-colors rounded-full"
          >
            <RefreshCw className={`w-5 h-5 text-slate-700 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleDelete}
            className="w-10 h-10 flex items-center justify-center hover:bg-white/50 transition-colors rounded-full"
          >
            <Trash2 className="w-5 h-5 text-error" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 px-6 max-w-3xl mx-auto w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-on-surface-variant text-sm">加载中...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 rounded-full bg-error-container/50 flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-error" />
            </div>
            <p className="text-on-surface-variant text-sm">{error}</p>
            <button
              onClick={loadToolData}
              className="px-4 py-2 rounded-full bg-surface-container text-on-surface-variant text-sm hover:bg-surface-container-high transition-colors"
            >
              重试
            </button>
          </div>
        ) : (
          <DynamicRenderer components={components} />
        )}
      </main>
    </motion.div>
  )
}
