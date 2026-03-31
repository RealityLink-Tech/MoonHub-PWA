// ============================================================
// Tools Permissions Page
// 工具权限管理页面
// ============================================================

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import { getClient } from '@/services/device'
import type { ToolSupportItem } from '@/types/api'

const CATEGORY_LABELS: Record<string, string> = {
  filesystem: '文件系统',
  automation: '自动化',
  web: '网络',
  communication: '通信',
  skills: '技能',
  agents: '智能体',
  hardware: '硬件',
  discovery: '发现',
}

const REASON_LABELS: Record<string, string> = {
  requires_skills: '需要启用技能系统',
  requires_subagent: '需要启用子智能体',
  requires_mcp_discovery: '需要启用 MCP 工具发现',
  requires_linux: '需要 Linux 系统',
}

export function ToolsPermissionsPage({ onBack }: { onBack: () => void }) {
  const [tools, setTools] = useState<ToolSupportItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)

  useEffect(() => {
    const fetchTools = async () => {
      const client = getClient()
      if (!client) {
        setError('未连接到设备')
        setLoading(false)
        return
      }

      const result = await client.getTools()
      if (result.success && result.data) {
        setTools(result.data.tools)
      } else {
        setError(result.error?.message || '加载工具列表失败')
      }
      setLoading(false)
    }

    fetchTools()
  }, [])

  const handleToggle = async (tool: ToolSupportItem) => {
    if (tool.status === 'blocked') return

    const client = getClient()
    if (!client) return

    setToggling(tool.name)
    try {
      const newEnabled = tool.status !== 'enabled'
      const result = await client.updateToolState(tool.name, newEnabled)

      if (result.success) {
        setTools(prev => prev.map(t =>
          t.name === tool.name ? { ...t, status: newEnabled ? 'enabled' as const : 'disabled' as const } : t
        ))
      } else {
        setError(result.error?.message || '更新工具状态失败')
      }
    } finally {
      setToggling(null)
    }
  }

  // Group tools by category
  const grouped = tools.reduce<Record<string, ToolSupportItem[]>>((acc, tool) => {
    const cat = tool.category || 'other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(tool)
    return acc
  }, {})

  const categoryOrder = Object.keys(CATEGORY_LABELS)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'enabled':
        return <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">已启用</span>
      case 'blocked':
        return <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">已阻止</span>
      default:
        return <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-medium">已禁用</span>
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="min-h-screen bg-background flex flex-col"
    >
      <header className="fixed top-0 w-full z-50 bg-[#f8f9fa]/80 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between px-6 h-16 w-full max-w-md md:max-w-2xl mx-auto">
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#d4e4f7]/30 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#506070]" />
          </button>
          <h1 className="text-lg tracking-wider font-light text-[#506070]">工具权限</h1>
          <div className="w-10" />
        </div>
        <div className="bg-gradient-to-b from-[#abb3b7]/10 to-transparent h-[1px]" />
      </header>

      <main className="pt-24 px-6 pb-8 max-w-md md:max-w-2xl mx-auto w-full">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : error && tools.length === 0 ? (
          <div className="flex items-center gap-3 py-20 text-error">
            <AlertCircle className="w-6 h-6" />
            <span className="text-sm">{error}</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Error banner */}
            {error && tools.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-600 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
                <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">&times;</button>
              </div>
            )}

            {/* Tools by category */}
            {categoryOrder
              .filter(cat => grouped[cat]?.length)
              .map(category => (
                <div key={category} className="space-y-3">
                  <h3 className="text-sm font-bold text-on-surface-variant/60 uppercase tracking-[0.1em] px-1">
                    {CATEGORY_LABELS[category] || category}
                  </h3>
                  <div className="space-y-2">
                    {grouped[category].map(tool => (
                      <div
                        key={tool.name}
                        className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/10 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-on-surface text-sm truncate">{tool.name}</h4>
                              {getStatusBadge(tool.status)}
                            </div>
                            <p className="text-xs text-on-surface-variant line-clamp-2">{tool.description}</p>
                            {tool.status === 'blocked' && tool.reason_code && (
                              <p className="text-[11px] text-amber-600 mt-1">
                                {REASON_LABELS[tool.reason_code] || tool.reason_code}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleToggle(tool)}
                            disabled={tool.status === 'blocked' || toggling === tool.name}
                            className={`w-12 h-7 rounded-full transition-colors relative flex-shrink-0 mt-0.5 ${
                              tool.status === 'enabled' ? 'bg-primary' : 'bg-surface-container-high'
                            } ${tool.status === 'blocked' || toggling === tool.name ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {toggling === tool.name ? (
                              <Loader2 className="absolute top-1 left-1/2 -translate-x-1/2 w-5 h-5 text-on-surface-variant animate-spin" />
                            ) : (
                              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                                tool.status === 'enabled' ? 'translate-x-6' : 'translate-x-1'
                              }`} />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

            {/* Uncategorized tools */}
            {Object.keys(grouped)
              .filter(cat => !CATEGORY_LABELS[cat])
              .map(category => (
                <div key={category} className="space-y-3">
                  <h3 className="text-sm font-bold text-on-surface-variant/60 uppercase tracking-[0.1em] px-1">
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {grouped[category].map(tool => (
                      <div
                        key={tool.name}
                        className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/10 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-on-surface text-sm truncate">{tool.name}</h4>
                              {getStatusBadge(tool.status)}
                            </div>
                            <p className="text-xs text-on-surface-variant line-clamp-2">{tool.description}</p>
                          </div>
                          <button
                            onClick={() => handleToggle(tool)}
                            disabled={tool.status === 'blocked' || toggling === tool.name}
                            className={`w-12 h-7 rounded-full transition-colors relative flex-shrink-0 mt-0.5 ${
                              tool.status === 'enabled' ? 'bg-primary' : 'bg-surface-container-high'
                            } ${tool.status === 'blocked' || toggling === tool.name ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                              tool.status === 'enabled' ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

            {tools.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <p className="text-sm text-on-surface-variant">暂无工具信息</p>
              </div>
            )}
          </div>
        )}
      </main>
    </motion.div>
  )
}
