// ============================================================
// Space Page
// 个人空间 - 动态工具仪表盘
// ============================================================

import { motion } from 'motion/react'
import { useState, useEffect } from 'react'
import { PlusCircle, ArrowRight } from 'lucide-react'
import { Header } from '@/components/ui/Header'
import { DynamicRenderer } from '@/components/space/DynamicRenderer'
import { dynamicToolsService } from '@/services/dynamicTools'
import type { DynamicTool, GeneratedComponent } from '@/types'

interface SpacePageProps {
  onAddClick: () => void
  onToolClick: (toolId: string) => void
}

export function SpacePage({ onAddClick, onToolClick }: SpacePageProps) {
  const [homeTools, setHomeTools] = useState<DynamicTool[]>([])
  const [toolResults, setToolResults] = useState<Map<string, GeneratedComponent[]>>(new Map())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dynamicToolsService.list().then((res) => {
      if (res.success && res.data) {
        const home = res.data.filter((t) => t.is_on_home)
        setHomeTools(home)
        // 为每个首页工具执行获取数据
        home.forEach(async (tool) => {
          const execRes = await dynamicToolsService.execute(tool.id, {}, 'space')
          if (execRes.success && execRes.data) {
            const schema = execRes.data.schema
            setToolResults((prev) => new Map(prev).set(tool.id, schema ? [schema] : [tool.space_schema]))
          } else {
            setToolResults((prev) => new Map(prev).set(tool.id, [tool.space_schema]))
          }
        })
      }
      setLoading(false)
    })
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col min-h-screen pb-32"
    >
      <Header />

      <main className="pt-24 px-6 max-w-5xl mx-auto space-y-8 w-full">
        <section className="flex justify-between items-end mb-10">
          <div className="space-y-1">
            <h1 className="text-4xl font-light tracking-tight text-primary">我的空间</h1>
            <p className="text-on-surface-variant/70 text-sm tracking-widest uppercase">MOONHUB SPACE</p>
          </div>
          <button onClick={onAddClick} className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-primary to-primary-dim text-white rounded-full shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all duration-300">
            <PlusCircle className="w-5 h-5" />
            <span className="text-sm font-medium tracking-wide">添加组件</span>
          </button>
        </section>

        {loading && (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-on-surface-variant">加载空间...</p>
          </div>
        )}

        {!loading && homeTools.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mx-auto mb-4">
              <PlusCircle className="w-8 h-8 text-on-surface-variant/40" />
            </div>
            <p className="text-on-surface-variant mb-2">空间还是空的</p>
            <p className="text-sm text-on-surface-variant/60 mb-6">点击上方按钮添加 AI 生成的工具</p>
            <button onClick={onAddClick} className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-full text-sm font-medium">
              浏览工具库 <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {homeTools.map((tool) => {
            const components = toolResults.get(tool.id) || [tool.space_schema]
            return (
              <div
                key={tool.id}
                className="md:col-span-6 lg:col-span-4 cursor-pointer hover:-translate-y-1 transition-all duration-500"
                onClick={() => onToolClick(tool.id)}
              >
                <DynamicRenderer components={components} />
              </div>
            )
          })}
        </div>
      </main>
    </motion.div>
  )
}

// SpaceExtensionPage 已被 SpaceAddPage 替代，保留空导出避免编译错误
export function SpaceExtensionPage({ onBack }: { onBack: () => void }) {
  onBack()
  return null
}
