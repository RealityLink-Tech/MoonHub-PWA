// ============================================================
// Settings Sub Pages
// 设置二级页面组件
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'motion/react'
import { ArrowLeft, Monitor, Smartphone, Laptop, WifiOff, Key, Star, ChevronDown, ChevronUp, Loader2, AlertCircle, Plus, Trash2 } from 'lucide-react'
import {
  mockPrivacySettings,
  mockSkills,
  mockSystemConfig,
} from '@/services/mock'
import { useDeviceStore } from '@/stores'
import { getClient } from '@/services/device'
import type { ModelEntry } from '@/types/api'
import type { ChannelInstance, ChannelCatalogResponse } from '@/types'
import { groupModelsByProvider, providerDisplayName, needsApiKey, extractProvider } from '@/lib/models'

// ============================================================
// Connected Devices Page
// ============================================================
export function DevicesPage({ onBack, onNavigateToDiscovery }: { onBack: () => void; onNavigateToDiscovery?: () => void }) {
  const { pairedDevices } = useDeviceStore()

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'hub': return Monitor
      case 'phone': return Smartphone
      case 'laptop': return Laptop
      default: return Monitor
    }
  }

  const formatLastSeen = (lastSeen: number) => {
    const seconds = Math.floor((Date.now() - lastSeen) / 1000)
    if (seconds < 60) return '刚刚'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟前`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}小时前`
    return `${Math.floor(seconds / 86400)}天前`
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
          <h1 className="text-lg tracking-wider font-light text-[#506070]">已连接设备</h1>
          <div className="w-10" />
        </div>
        <div className="bg-gradient-to-b from-[#abb3b7]/10 to-transparent h-[1px]" />
      </header>

      <main className="pt-24 px-6 pb-8 max-w-md md:max-w-2xl mx-auto w-full">
        {pairedDevices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center">
              <Monitor className="w-8 h-8 text-on-surface-variant" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-base font-medium text-on-surface">暂无已配对设备</h3>
              <p className="text-sm text-on-surface-variant">点击下方按钮添加新设备</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {pairedDevices.map((device) => {
              const Icon = getDeviceIcon(device.capabilities.includes('multi_agent') ? 'hub' : 'phone')
              const isOnline = device.status === 'online'
              return (
                <div
                  key={device.id}
                  className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/10 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isOnline ? 'bg-primary-container/30' : 'bg-surface-container-high'
                    }`}>
                      <Icon className={`w-6 h-6 ${isOnline ? 'text-primary' : 'text-outline-variant'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-on-surface truncate">{device.alias || device.name}</h4>
                        {isOnline && (
                          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-on-surface-variant truncate">{device.address} · {device.version}</p>
                    </div>
                    <span className={`text-xs flex-shrink-0 ${isOnline ? 'text-green-500' : 'text-outline-variant'}`}>
                      {isOnline ? '在线' : formatLastSeen(device.lastSeen)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <button
          onClick={onNavigateToDiscovery}
          className="w-full mt-4 py-3 rounded-xl border border-dashed border-outline-variant/30 text-on-surface-variant text-sm hover:bg-surface-container-low transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          添加新设备
        </button>
      </main>
    </motion.div>
  )
}

// ============================================================
// Model Config Page
// ============================================================
export function ModelConfigPage({ onBack }: { onBack: () => void }) {
  const [models, setModels] = useState<ModelEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [saving, setSaving] = useState<number | null>(null)
  const [defaulting, setDefaulting] = useState<string | null>(null)
  // Add model
  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm] = useState({ model_name: '', model: '', api_key: '', api_base: '' })
  const [adding, setAdding] = useState(false)
  // Delete model
  const [deleting, setDeleting] = useState<number | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)
  // Routing config
  const [routingEnabled, setRoutingEnabled] = useState(false)
  const [tierMapping, setTierMapping] = useState<Record<string, string>>({})
  const [tierBoundaries, setTierBoundaries] = useState<{ simple_moderate?: number; moderate_complex?: number; complex_reasoning?: number } | null>(null)
  const [lightModel, setLightModel] = useState('')
  const [threshold, setThreshold] = useState(0.5)
  const [routingSaving, setRoutingSaving] = useState(false)

  const TIER_INFO = [
    { key: 'simple', label: '简单任务', desc: '问候、简单问答' },
    { key: 'moderate', label: '日常问答', desc: '短问题、简单任务' },
    { key: 'complex', label: '复杂任务', desc: '编程、长上下文、工具调用' },
    { key: 'reasoning', label: '深度推理', desc: '深度分析、多模态' },
  ]

  // Fetch models + config on mount
  useEffect(() => {
    const fetchData = async () => {
      const client = getClient()
      if (!client) {
        setError('未连接到设备')
        setLoading(false)
        return
      }

      const [modelsResult, configResult] = await Promise.all([
        client.getModels(),
        client.getConfig(),
      ])

      if (modelsResult.success && modelsResult.data) {
        setModels(modelsResult.data.models)
      } else {
        setError(modelsResult.error?.message || '加载模型失败')
      }

      if (configResult.success && configResult.data) {
        const routing = (configResult.data as any)?.agents?.defaults?.routing
        if (routing) {
          setRoutingEnabled(!!routing.enabled)
          setTierMapping(routing.tier_mapping || {})
          if (routing.tier_boundaries) setTierBoundaries(routing.tier_boundaries)
          if (routing.light_model) setLightModel(routing.light_model)
          if (routing.threshold != null) setThreshold(routing.threshold)
        }
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  const refreshModels = async () => {
    const client = getClient()
    if (!client) return
    const result = await client.getModels()
    if (result.success && result.data) {
      setModels(result.data.models)
    }
  }

  // Handle save API key
  const handleSave = async (index: number) => {
    const client = getClient()
    if (!client) return

    setSaving(index)
    const result = await client.updateModel(index, { api_key: apiKeyInput })
    setSaving(null)

    if (result.success) {
      await refreshModels()
      setExpandedIndex(null)
      setApiKeyInput('')
    } else {
      setError(result.error?.message || '保存失败')
    }
  }

  // Handle set default model
  const handleSetDefault = async (modelName: string) => {
    const client = getClient()
    if (!client) return

    setDefaulting(modelName)
    const result = await client.setDefaultModel(modelName)
    setDefaulting(null)

    if (result.success) {
      await refreshModels()
    } else {
      setError(result.error?.message || '设置默认模型失败')
    }
  }

  // Handle expand/collapse model card
  const handleToggleExpand = (index: number) => {
    if (expandedIndex === index) {
      setExpandedIndex(null)
      setApiKeyInput('')
    } else {
      setExpandedIndex(index)
      setApiKeyInput('')
    }
  }

  // Handle add model
  const handleAddModel = async () => {
    const client = getClient()
    if (!client) return

    setAdding(true)
    setError(null)
    const result = await client.addModel({
      model_name: addForm.model_name.trim(),
      model: addForm.model.trim(),
      api_key: addForm.api_key.trim() || undefined,
      api_base: addForm.api_base.trim() || undefined,
    })
    setAdding(false)

    if (result.success) {
      setAddForm({ model_name: '', model: '', api_key: '', api_base: '' })
      setShowAddForm(false)
      await refreshModels()
    } else {
      setError(result.error?.message || '添加模型失败')
    }
  }

  // Handle delete model
  const handleDeleteModel = async (index: number) => {
    const client = getClient()
    if (!client) return

    setDeleting(index)
    const result = await client.deleteModel(index)
    setDeleting(null)
    setConfirmDelete(null)

    if (result.success) {
      if (expandedIndex === index) {
        setExpandedIndex(null)
      }
      await refreshModels()
    } else {
      setError(result.error?.message || '删除模型失败')
    }
  }

  // Handle routing toggle
  const handleRoutingToggle = async () => {
    const client = getClient()
    if (!client) return

    setRoutingSaving(true)
    const newEnabled = !routingEnabled
    const result = await client.updateConfig({
      agents: { defaults: { routing: { enabled: newEnabled } } },
    } as any)
    setRoutingSaving(false)

    if (result.success) {
      setRoutingEnabled(newEnabled)
    } else {
      setError(result.error?.message || '更新路由配置失败')
    }
  }

  // Handle tier mapping change
  const handleTierChange = async (tier: string, modelName: string) => {
    const client = getClient()
    if (!client) return

    const newMapping = { ...tierMapping, [tier]: modelName }
    setRoutingSaving(true)
    const result = await client.updateConfig({
      agents: { defaults: { routing: { tier_mapping: newMapping } } },
    } as any)
    setRoutingSaving(false)

    if (result.success) {
      setTierMapping(newMapping)
    } else {
      setError(result.error?.message || '更新路由配置失败')
    }
  }

  // Handle tier boundary change (debounced)
  const boundaryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const boundariesRef = useRef(tierBoundaries)
  boundariesRef.current = tierBoundaries
  const handleBoundaryChange = useCallback((key: string, value: number) => {
    setTierBoundaries(prev => ({ ...(prev || {}), [key]: value }))
    if (boundaryTimerRef.current) clearTimeout(boundaryTimerRef.current)
    boundaryTimerRef.current = setTimeout(async () => {
      const client = getClient()
      if (!client) return
      setRoutingSaving(true)
      try {
        const current = boundariesRef.current || {}
        const result = await client.updateConfig({
          agents: { defaults: { routing: { tier_boundaries: { ...current, [key]: value } } } },
        } as any)
        if (!result.success) setError(result.error?.message || '更新路由边界失败')
      } finally {
        setRoutingSaving(false)
      }
    }, 300)
  }, [])

  // Handle light model change
  const handleLightModelChange = async (model: string) => {
    const client = getClient()
    if (!client) return

    setRoutingSaving(true)
    try {
      const result = await client.updateConfig({
        agents: { defaults: { routing: { light_model: model } } },
      } as any)
      if (result.success) {
        setLightModel(model)
      } else {
        setError(result.error?.message || '更新轻量模型失败')
      }
    } finally {
      setRoutingSaving(false)
    }
  }

  // Handle threshold change (debounced)
  const thresholdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const handleThresholdChange = useCallback((value: number) => {
    setThreshold(value)
    if (thresholdTimerRef.current) clearTimeout(thresholdTimerRef.current)
    thresholdTimerRef.current = setTimeout(async () => {
      const client = getClient()
      if (!client) return
      setRoutingSaving(true)
      try {
        const result = await client.updateConfig({
          agents: { defaults: { routing: { threshold: value } } },
        } as any)
        if (!result.success) setError(result.error?.message || '更新阈值失败')
      } finally {
        setRoutingSaving(false)
      }
    }, 300)
  }, [])

  // Get auth method badge text
  const getAuthBadge = (model: ModelEntry): string => {
    if (!needsApiKey(model)) {
      const auth = (model.auth_method || '').toLowerCase()
      if (auth === 'oauth') return 'OAuth'
      if (auth === 'local') return '本地'
      return 'CLI'
    }
    return model.configured ? '已配置' : '未配置'
  }

  const configuredModels = models.filter(m => m.configured)

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="min-h-screen bg-background flex flex-col"
    >
      <header className="fixed top-0 w-full z-50 bg-[#f8f9fa]/80 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between px-6 h-16 w-full max-w-md mx-auto">
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#d4e4f7]/30 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#506070]" />
          </button>
          <h1 className="text-lg tracking-wider font-light text-[#506070]">模型配置</h1>
          <div className="w-10" />
        </div>
        <div className="bg-gradient-to-b from-[#abb3b7]/10 to-transparent h-[1px]" />
      </header>

      <main className="pt-24 px-6 pb-8 max-w-md mx-auto w-full">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : error && !models.length ? (
          <div className="flex items-center gap-3 py-20 text-error">
            <AlertCircle className="w-6 h-6" />
            <span className="text-sm">{error}</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Error banner */}
            {error && models.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-600 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
                <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">&times;</button>
              </div>
            )}

            {/* Intelligent Routing Section */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
              <div className="px-4 py-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-on-surface">智能路由</h3>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">根据任务复杂度自动选择模型</p>
                </div>
                <button
                  onClick={handleRoutingToggle}
                  disabled={routingSaving}
                  className={`w-12 h-7 rounded-full transition-colors relative flex-shrink-0 ${
                    routingEnabled ? 'bg-primary' : 'bg-surface-container-high'
                  } ${routingSaving ? 'opacity-50' : ''}`}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    routingEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {routingEnabled && (
                <div className="px-4 pb-4 pt-2 border-t border-outline-variant/10 space-y-3">
                  {/* Routing mode indicator */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-container/30 text-primary font-medium">
                      {Object.keys(tierMapping).length > 0 ? '四档路由 (tier_mapping)' : '轻量模型 + 阈值'}
                    </span>
                  </div>

                  {/* Tier mapping (V2 four-tier) */}
                  {TIER_INFO.map(tier => (
                    <div key={tier.key}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-on-surface">{tier.label}</span>
                          <span className="text-[10px] text-on-surface-variant">{tier.key}</span>
                        </div>
                      </div>
                      <select
                        value={tierMapping[tier.key] || ''}
                        onChange={(e) => handleTierChange(tier.key, e.target.value)}
                        disabled={routingSaving || configuredModels.length === 0}
                        className="w-full px-3 py-2 rounded-lg bg-surface-container-high border border-outline-variant/20 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                      >
                        <option value="">未设置</option>
                        {configuredModels.map(m => (
                          <option key={m.model_name} value={m.model_name}>
                            {m.model_name} ({providerDisplayName(extractProvider(m.model))})
                          </option>
                        ))}
                      </select>
                      <p className="text-[10px] text-on-surface-variant/70 mt-0.5">{tier.desc}</p>
                    </div>
                  ))}

                  {/* Tier boundaries */}
                  {tierBoundaries && (
                    <div className="pt-2 border-t border-outline-variant/10 space-y-3">
                      <p className="text-xs font-medium text-on-surface">档位边界</p>
                      {(['simple_moderate', 'moderate_complex', 'complex_reasoning'] as const).map(key => {
                        const labels: Record<string, string> = {
                          simple_moderate: '简单 → 日常',
                          moderate_complex: '日常 → 复杂',
                          complex_reasoning: '复杂 → 推理',
                        }
                        return (
                          <div key={key}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[11px] text-on-surface-variant">{labels[key]}</span>
                              <span className="text-[11px] text-on-surface font-medium">{tierBoundaries[key]?.toFixed(2) || '—'}</span>
                            </div>
                            <input
                              type="range"
                              min={0}
                              max={1}
                              step={0.05}
                              value={tierBoundaries[key] ?? 0.5}
                              onChange={(e) => handleBoundaryChange(key, parseFloat(e.target.value))}
                              disabled={routingSaving}
                              className="w-full h-1.5 bg-surface-container-high rounded-full appearance-none cursor-pointer accent-primary disabled:opacity-50"
                            />
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* V1 legacy: light model + threshold */}
                  {(lightModel || threshold !== 0.5) && (
                    <div className="pt-2 border-t border-outline-variant/10 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                          轻量模型模式 (V1 兼容)
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-on-surface block mb-1">轻量模型</span>
                        <select
                          value={lightModel}
                          onChange={(e) => handleLightModelChange(e.target.value)}
                          disabled={routingSaving || configuredModels.length === 0}
                          className="w-full px-3 py-2 rounded-lg bg-surface-container-high border border-outline-variant/20 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                        >
                          <option value="">未设置</option>
                          {configuredModels.map(m => (
                            <option key={m.model_name} value={m.model_name}>
                              {m.model_name} ({providerDisplayName(extractProvider(m.model))})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-on-surface">阈值</span>
                          <span className="text-[11px] text-on-surface font-medium">{threshold.toFixed(2)}</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.05}
                          value={threshold}
                          onChange={(e) => handleThresholdChange(parseFloat(e.target.value))}
                          disabled={routingSaving}
                          className="w-full h-1.5 bg-surface-container-high rounded-full appearance-none cursor-pointer accent-primary disabled:opacity-50"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Model List */}
            {models.length === 0 ? (
              <div className="flex items-center justify-center py-10 text-on-surface-variant">
                <span className="text-sm">暂无模型配置</span>
              </div>
            ) : (
              Array.from(groupModelsByProvider(models).entries()).map(([provider, providerModels]) => (
                <div key={provider} className="space-y-3">
                  <h3 className="text-sm font-bold text-on-surface-variant/60 uppercase tracking-[0.1em] px-1">
                    {providerDisplayName(provider)}
                  </h3>
                  {providerModels.map((model) => {
                    const isExpanded = expandedIndex === model.index
                    const authBadge = getAuthBadge(model)
                    const showApiKeyInput = needsApiKey(model)

                    return (
                      <div
                        key={model.index}
                        className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden"
                      >
                        <button
                          onClick={() => handleToggleExpand(model.index)}
                          className="w-full px-4 py-3 flex items-center justify-between hover:bg-surface-container-low/50 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="flex-1 min-w-0 text-left">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-on-surface truncate">{model.model_name}</span>
                                {model.is_default && (
                                  <Star className="w-4 h-4 text-primary fill-primary flex-shrink-0" />
                                )}
                              </div>
                              <span className="text-xs text-on-surface-variant truncate block">{model.model}</span>
                            </div>
                            <span className={`text-[10px] px-2 py-1 rounded-full flex-shrink-0 ${
                              model.configured && needsApiKey(model)
                                ? 'bg-green-100 text-green-700'
                                : 'bg-surface-container-high text-on-surface-variant'
                            }`}>
                              {authBadge}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-on-surface-variant flex-shrink-0" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-on-surface-variant flex-shrink-0" />
                            )}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="px-4 pb-4 pt-2 border-t border-outline-variant/10">
                            {showApiKeyInput ? (
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                                  <Key className="w-4 h-4" />
                                  <span>API 密钥</span>
                                </div>
                                <input
                                  type="password"
                                  value={apiKeyInput}
                                  onChange={(e) => setApiKeyInput(e.target.value)}
                                  placeholder={model.api_key || '输入 API 密钥'}
                                  className="w-full px-3 py-2 rounded-lg bg-surface-container-high border border-outline-variant/20 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-on-surface-variant/50"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleSave(model.index)}
                                    disabled={saving === model.index || !apiKeyInput.trim()}
                                    className="flex-1 py-2 rounded-lg bg-primary text-primary-on text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                  >
                                    {saving === model.index ? (
                                      <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        保存中...
                                      </>
                                    ) : (
                                      '保存'
                                    )}
                                  </button>
                                  <button
                                    onClick={() => handleSetDefault(model.model_name)}
                                    disabled={defaulting === model.model_name || model.is_default}
                                    className="flex-1 py-2 rounded-lg bg-surface-container-high text-on-surface text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:bg-surface-container transition-colors"
                                  >
                                    {defaulting === model.model_name ? (
                                      <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        设置中...
                                      </>
                                    ) : (
                                      <>
                                        <Star className="w-4 h-4" />
                                        {model.is_default ? '已设为默认' : '设为默认'}
                                      </>
                                    )}
                                  </button>
                                </div>
                                {/* Delete button */}
                                {confirmDelete === model.index ? (
                                  <div className="flex items-center gap-2 pt-1">
                                    <span className="text-xs text-red-500 flex-1">确认删除此模型？</span>
                                    <button
                                      onClick={() => handleDeleteModel(model.index)}
                                      disabled={deleting === model.index}
                                      className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-medium disabled:opacity-50 flex items-center gap-1"
                                    >
                                      {deleting === model.index ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : (
                                        '确认'
                                      )}
                                    </button>
                                    <button
                                      onClick={() => setConfirmDelete(null)}
                                      className="px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface-variant text-xs"
                                    >
                                      取消
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setConfirmDelete(model.index)}
                                    className="w-full mt-2 py-2 rounded-lg text-red-500 text-sm font-medium flex items-center justify-center gap-2 hover:bg-red-50 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    删除模型
                                  </button>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                                  <span>此模型使用</span>
                                  <span className="font-medium text-primary">{authBadge}</span>
                                  <span>认证，无需配置 API 密钥</span>
                                </div>
                                {/* Star to set default + Delete */}
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleSetDefault(model.model_name)}
                                    disabled={defaulting === model.model_name || model.is_default}
                                    className="flex-1 py-2 rounded-lg bg-surface-container-high text-on-surface text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:bg-surface-container transition-colors"
                                  >
                                    {defaulting === model.model_name ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Star className={`w-4 h-4 ${model.is_default ? 'text-primary fill-primary' : ''}`} />
                                    )}
                                    {model.is_default ? '已设为默认' : '设为默认'}
                                  </button>
                                  {confirmDelete === model.index ? (
                                    <>
                                      <button
                                        onClick={() => handleDeleteModel(model.index)}
                                        disabled={deleting === model.index}
                                        className="px-3 py-2 rounded-lg bg-red-500 text-white text-sm font-medium disabled:opacity-50 flex items-center gap-1"
                                      >
                                        {deleting === model.index ? <Loader2 className="w-3 h-3 animate-spin" /> : '确认'}
                                      </button>
                                      <button
                                        onClick={() => setConfirmDelete(null)}
                                        className="px-3 py-2 rounded-lg bg-surface-container-high text-on-surface-variant text-sm"
                                      >
                                        取消
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      onClick={() => setConfirmDelete(model.index)}
                                      className="py-2 px-3 rounded-lg text-red-500 text-sm font-medium flex items-center gap-1 hover:bg-red-50 transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))
            )}

            {/* Add Model */}
            {!showAddForm ? (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full py-3 rounded-xl border border-dashed border-outline-variant/30 text-on-surface-variant text-sm hover:bg-surface-container-low transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                添加模型
              </button>
            ) : (
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm p-4 space-y-3">
                <h3 className="text-sm font-bold text-on-surface">添加新模型</h3>
                <input
                  type="text"
                  value={addForm.model_name}
                  onChange={(e) => setAddForm({ ...addForm, model_name: e.target.value })}
                  placeholder="模型名称 (如 my-gpt-4o)"
                  className="w-full px-3 py-2 rounded-lg bg-surface-container-high border border-outline-variant/20 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-on-surface-variant/50"
                />
                <input
                  type="text"
                  value={addForm.model}
                  onChange={(e) => setAddForm({ ...addForm, model: e.target.value })}
                  placeholder="模型标识 (如 openai/gpt-4o)"
                  className="w-full px-3 py-2 rounded-lg bg-surface-container-high border border-outline-variant/20 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-on-surface-variant/50"
                />
                <input
                  type="password"
                  value={addForm.api_key}
                  onChange={(e) => setAddForm({ ...addForm, api_key: e.target.value })}
                  placeholder="API 密钥 (可选)"
                  className="w-full px-3 py-2 rounded-lg bg-surface-container-high border border-outline-variant/20 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-on-surface-variant/50"
                />
                <input
                  type="text"
                  value={addForm.api_base}
                  onChange={(e) => setAddForm({ ...addForm, api_base: e.target.value })}
                  placeholder="API Base URL (可选)"
                  className="w-full px-3 py-2 rounded-lg bg-surface-container-high border border-outline-variant/20 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-on-surface-variant/50"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddModel}
                    disabled={adding || !addForm.model_name.trim() || !addForm.model.trim()}
                    className="flex-1 py-2 rounded-lg bg-primary text-primary-on text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {adding ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        添加中...
                      </>
                    ) : (
                      '确认添加'
                    )}
                  </button>
                  <button
                    onClick={() => { setShowAddForm(false); setAddForm({ model_name: '', model: '', api_key: '', api_base: '' }) }}
                    className="px-4 py-2 rounded-lg bg-surface-container-high text-on-surface-variant text-sm hover:bg-surface-container transition-colors"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </motion.div>
  )
}

// ============================================================
// Channels Page
// ============================================================

// PWA-side config field definitions for common channel types
const CHANNEL_CONFIG_FIELDS: Record<string, Array<{
  key: string; label: string; type: string; required: boolean; placeholder?: string
}>> = {
  telegram: [
    { key: 'bot_token', label: 'Bot Token', type: 'password', required: true, placeholder: '输入 Telegram Bot Token' },
  ],
  discord: [
    { key: 'bot_token', label: 'Bot Token', type: 'password', required: true, placeholder: '输入 Discord Bot Token' },
  ],
  slack: [
    { key: 'bot_token', label: 'Bot Token', type: 'password', required: true, placeholder: '输入 Slack Bot Token' },
  ],
  feishu: [
    { key: 'app_id', label: 'App ID', type: 'text', required: true, placeholder: '输入飞书 App ID' },
    { key: 'app_secret', label: 'App Secret', type: 'password', required: true, placeholder: '输入飞书 App Secret' },
  ],
  dingtalk: [
    { key: 'client_id', label: 'Client ID', type: 'text', required: true, placeholder: '输入钉钉 Client ID' },
    { key: 'client_secret', label: 'Client Secret', type: 'password', required: true, placeholder: '输入钉钉 Client Secret' },
  ],
  line: [
    { key: 'channel_access_token', label: 'Channel Access Token', type: 'password', required: true, placeholder: '输入 LINE Channel Access Token' },
    { key: 'channel_secret', label: 'Channel Secret', type: 'password', required: true, placeholder: '输入 LINE Channel Secret' },
  ],
  qq: [
    { key: 'app_id', label: 'App ID', type: 'text', required: true, placeholder: '输入 QQ App ID' },
    { key: 'app_secret', label: 'App Secret', type: 'password', required: true, placeholder: '输入 QQ App Secret' },
  ],
  wecom: [
    { key: 'corp_id', label: 'Corp ID', type: 'text', required: true, placeholder: '输入企业微信 Corp ID' },
    { key: 'corp_secret', label: 'Corp Secret', type: 'password', required: true, placeholder: '输入企业微信 Corp Secret' },
    { key: 'agent_id', label: 'Agent ID', type: 'text', required: false, placeholder: '输入应用 Agent ID' },
  ],
  wecom_app: [
    { key: 'corp_id', label: 'Corp ID', type: 'text', required: true, placeholder: '输入企业微信 Corp ID' },
    { key: 'corp_secret', label: 'Corp Secret', type: 'password', required: true, placeholder: '输入企业微信 Corp Secret' },
    { key: 'agent_id', label: 'Agent ID', type: 'text', required: true, placeholder: '输入应用 Agent ID' },
  ],
  wecom_aibot: [
    { key: 'corp_id', label: 'Corp ID', type: 'text', required: true, placeholder: '输入企业微信 Corp ID' },
  ],
  whatsapp: [
    { key: 'phone_number_id', label: 'Phone Number ID', type: 'text', required: true, placeholder: '输入 WhatsApp Phone Number ID' },
    { key: 'access_token', label: 'Access Token', type: 'password', required: true, placeholder: '输入 WhatsApp Access Token' },
  ],
  matrix: [
    { key: 'homeserver_url', label: 'Homeserver URL', type: 'text', required: true, placeholder: 'https://matrix.example.com' },
    { key: 'access_token', label: 'Access Token', type: 'password', required: true, placeholder: '输入 Matrix Access Token' },
  ],
  irc: [
    { key: 'server', label: 'Server', type: 'text', required: true, placeholder: 'irc.example.com' },
    { key: 'port', label: 'Port', type: 'text', required: false, placeholder: '6667' },
    { key: 'nick', label: 'Nickname', type: 'text', required: true, placeholder: '输入 IRC 昵称' },
  ],
  onebot: [
    { key: 'ws_url', label: 'WebSocket URL', type: 'text', required: true, placeholder: 'ws://localhost:8080' },
  ],
}

export function ChannelsPage({ onBack }: { onBack: () => void }) {
  const [channels, setChannels] = useState<ChannelInstance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [catalog, setCatalog] = useState<ChannelCatalogResponse | null>(null)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  // Add form state
  const [addForm, setAddForm] = useState({
    name: '',
    type: '',
    config: {} as Record<string, string>,
  })

  // Fetch channels on mount
  useEffect(() => {
    const fetchChannels = async () => {
      const client = getClient()
      if (!client) {
        setError('未连接到设备')
        setLoading(false)
        return
      }

      const result = await client.getChannels()
      if (result.success && result.data) {
        setChannels(result.data)
      } else {
        setError(result.error?.message || '加载频道失败')
      }
      setLoading(false)
    }

    fetchChannels()
  }, [])

  // Fetch catalog when opening add form
  useEffect(() => {
    if (showAddForm && !catalog) {
      const fetchCatalog = async () => {
        const client = getClient()
        if (!client) return

        const result = await client.getChannelCatalog()
        if (result.success && result.data) {
          setCatalog(result.data)
        }
      }

      fetchCatalog()
    }
  }, [showAddForm, catalog])

  const handleAddChannel = async () => {
    const client = getClient()
    if (!client) return

    setAdding(true)
    setError(null)

    const result = await client.createChannel({
      type: addForm.type,
      name: addForm.name,
      config: addForm.config,
    })

    setAdding(false)

    if (result.success) {
      setAddForm({ name: '', type: '', config: {} })
      setSelectedType(null)
      setShowAddForm(false)
      // Refresh channels
      const refreshResult = await client.getChannels()
      if (refreshResult.success && refreshResult.data) {
        setChannels(refreshResult.data)
      }
    } else {
      setError(result.error?.message || '添加频道失败')
    }
  }

  const handleDeleteChannel = async (id: string) => {
    const client = getClient()
    if (!client) return

    setDeletingId(id)
    const result = await client.deleteChannel(id)
    setDeletingId(null)
    setConfirmDelete(null)

    if (result.success) {
      setChannels(channels.filter(ch => ch.id !== id))
    } else {
      setError(result.error?.message || '删除频道失败')
    }
  }

  const getChannelIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'telegram': return '📱'
      case 'slack': return '💬'
      case 'discord': return '🎮'
      case 'wechat': return '💚'
      case 'dingtalk': return '🔔'
      case 'feishu': return '🚀'
      case 'email': return '📧'
      case 'github': return '🐙'
      case 'notion': return '📝'
      default: return '🔌'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-500'
      case 'stopped': return 'text-outline-variant'
      case 'error': return 'text-error'
      default: return 'text-outline-variant'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'running': return '运行中'
      case 'stopped': return '已停止'
      case 'error': return '错误'
      default: return '未知'
    }
  }

  const selectedChannelType = catalog?.channels.find(c => c.name === selectedType)
  const selectedConfigFields = selectedChannelType ? (CHANNEL_CONFIG_FIELDS[selectedChannelType.config_key] || []) : []

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
          <h1 className="text-lg tracking-wider font-light text-[#506070]">外部频道</h1>
          <div className="w-10" />
        </div>
        <div className="bg-gradient-to-b from-[#abb3b7]/10 to-transparent h-[1px]" />
      </header>

      <main className="pt-24 px-6 pb-8 max-w-md md:max-w-2xl mx-auto w-full">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : error && !channels.length ? (
          <div className="flex items-center gap-3 py-20 text-error">
            <AlertCircle className="w-6 h-6" />
            <span className="text-sm">{error}</span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Error banner */}
            {error && channels.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-600 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
                <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">&times;</button>
              </div>
            )}

            {/* Channels grid */}
            {channels.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center">
                  <WifiOff className="w-8 h-8 text-on-surface-variant" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-base font-medium text-on-surface">暂无频道配置</h3>
                  <p className="text-sm text-on-surface-variant">点击下方按钮添加外部频道</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {channels.map((channel) => (
                  <div
                    key={channel.id}
                    className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/10 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
                          channel.status === 'running' ? 'bg-primary-container/30' : 'bg-surface-container-high'
                        }`}>
                          {getChannelIcon(channel.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-on-surface truncate">{channel.name}</h4>
                          <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                            <span className="capitalize">{channel.type}</span>
                            <span>·</span>
                            <span className={getStatusColor(channel.status)}>
                              {getStatusText(channel.status)}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Delete button */}
                    {confirmDelete === channel.id ? (
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-outline-variant/10">
                        <span className="text-xs text-red-500 flex-1">确认删除此频道？</span>
                        <button
                          onClick={() => handleDeleteChannel(channel.id)}
                          disabled={deletingId === channel.id}
                          className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-medium disabled:opacity-50 flex items-center gap-1"
                        >
                          {deletingId === channel.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            '确认'
                          )}
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface-variant text-xs"
                        >
                          取消
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(channel.id)}
                        className="w-full mt-3 py-2 rounded-lg text-red-500 text-sm font-medium flex items-center justify-center gap-2 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        删除频道
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add channel button */}
            {!showAddForm ? (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full py-3 rounded-xl border border-dashed border-outline-variant/30 text-on-surface-variant text-sm hover:bg-surface-container-low transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                添加频道
              </button>
            ) : (
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm p-4 space-y-4">
                <h3 className="text-sm font-bold text-on-surface">添加新频道</h3>

                {/* Step 1: Select channel type */}
                {!selectedType && catalog && (
                  <div className="space-y-3">
                    <p className="text-xs text-on-surface-variant">选择频道类型</p>
                    <div className="grid grid-cols-2 gap-2">
                      {catalog.channels.map((channel) => (
                        <button
                          key={channel.name}
                          onClick={() => {
                            setSelectedType(channel.name)
                            setAddForm({ ...addForm, type: channel.config_key })
                          }}
                          className={`p-3 rounded-xl border border-outline-variant/20 text-left transition-colors hover:border-primary/50 ${
                            addForm.type === channel.config_key ? 'border-primary bg-primary-container/20' : 'bg-surface-container-high'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl">{getChannelIcon(channel.name)}</span>
                            <span className="text-sm font-medium text-on-surface capitalize">{channel.name}</span>
                          </div>
                          {channel.variant && (
                            <p className="text-[10px] text-on-surface-variant">{channel.variant}</p>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 2: Configure channel */}
                {selectedType && selectedChannelType && (
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setSelectedType(null)
                        setAddForm({ name: '', type: '', config: {} })
                      }}
                      className="text-xs text-primary flex items-center gap-1 hover:underline"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      返回选择类型
                    </button>

                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getChannelIcon(selectedType)}</span>
                      <div>
                        <p className="text-sm font-medium text-on-surface capitalize">{selectedChannelType.name}</p>
                        {selectedChannelType.variant && (
                          <p className="text-xs text-on-surface-variant">{selectedChannelType.variant}</p>
                        )}
                      </div>
                    </div>

                    <input
                      type="text"
                      value={addForm.name}
                      onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                      placeholder="频道名称 (如: 我的 Telegram Bot)"
                      className="w-full px-3 py-2 rounded-lg bg-surface-container-high border border-outline-variant/20 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-on-surface-variant/50"
                    />

                    {selectedConfigFields.length > 0 ? (
                      selectedConfigFields.map((field) => (
                        <input
                          key={field.key}
                          type={field.type === 'password' ? 'password' : 'text'}
                          value={addForm.config[field.key] || ''}
                          onChange={(e) => setAddForm({
                            ...addForm,
                            config: { ...addForm.config, [field.key]: e.target.value }
                          })}
                          placeholder={field.placeholder || field.label}
                          className="w-full px-3 py-2 rounded-lg bg-surface-container-high border border-outline-variant/20 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-on-surface-variant/50"
                        />
                      ))
                    ) : (
                      <div className="text-xs text-on-surface-variant px-1">
                        此频道类型无需额外配置
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={handleAddChannel}
                        disabled={adding || !addForm.name.trim() || !addForm.type || selectedConfigFields.some(f => f.required && !addForm.config[f.key]?.trim())}
                        className="flex-1 py-2 rounded-lg bg-primary text-primary-on text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {adding ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            添加中...
                          </>
                        ) : (
                          '确认添加'
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setShowAddForm(false)
                          setSelectedType(null)
                          setAddForm({ name: '', type: '', config: {} })
                        }}
                        className="px-4 py-2 rounded-lg bg-surface-container-high text-on-surface-variant text-sm hover:bg-surface-container transition-colors"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                )}

                {/* Loading catalog */}
                {!catalog && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </motion.div>
  )
}

// ============================================================
// Privacy Page
// ============================================================
export function PrivacyPage({ onBack }: { onBack: () => void }) {
  const [settings, setSettings] = useState(mockPrivacySettings)

  const toggleSetting = (id: string) => {
    setSettings(settings.map(s =>
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ))
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="min-h-screen bg-background flex flex-col"
    >
      <header className="fixed top-0 w-full z-50 bg-[#f8f9fa]/80 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between px-6 h-16 w-full max-w-md mx-auto">
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#d4e4f7]/30 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#506070]" />
          </button>
          <h1 className="text-lg tracking-wider font-light text-[#506070]">隐私权限</h1>
          <div className="w-10" />
        </div>
        <div className="bg-gradient-to-b from-[#abb3b7]/10 to-transparent h-[1px]" />
      </header>

      <main className="pt-24 px-6 pb-8 max-w-md mx-auto w-full space-y-3">
        {settings.map((setting) => (
          <div
            key={setting.id}
            className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/10 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 pr-4">
                <h4 className="font-medium text-on-surface">{setting.label}</h4>
                <p className="text-xs text-on-surface-variant mt-1">{setting.description}</p>
              </div>
              <button
                onClick={() => toggleSetting(setting.id)}
                className={`w-12 h-7 rounded-full transition-colors relative flex-shrink-0 ${
                  setting.enabled ? 'bg-primary' : 'bg-surface-container-high'
                }`}
              >
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  setting.enabled ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        ))}
      </main>
    </motion.div>
  )
}

// ============================================================
// Skills Page
// ============================================================
export function SkillsPage({ onBack }: { onBack: () => void }) {
  const [skills, setSkills] = useState(mockSkills)

  const toggleSkill = (id: string) => {
    setSkills(skills.map(s =>
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ))
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="min-h-screen bg-background flex flex-col"
    >
      <header className="fixed top-0 w-full z-50 bg-[#f8f9fa]/80 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between px-6 h-16 w-full max-w-md mx-auto">
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#d4e4f7]/30 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#506070]" />
          </button>
          <h1 className="text-lg tracking-wider font-light text-[#506070]">Skill 管理</h1>
          <div className="w-10" />
        </div>
        <div className="bg-gradient-to-b from-[#abb3b7]/10 to-transparent h-[1px]" />
      </header>

      <main className="pt-24 px-6 pb-8 max-w-md mx-auto w-full space-y-3">
        {skills.map((skill) => (
          <div
            key={skill.id}
            className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/10 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 pr-4">
                <h4 className="font-medium text-on-surface">{skill.name}</h4>
                <p className="text-xs text-on-surface-variant mt-1">{skill.description}</p>
              </div>
              <button
                onClick={() => toggleSkill(skill.id)}
                className={`w-12 h-7 rounded-full transition-colors relative flex-shrink-0 ${
                  skill.enabled ? 'bg-primary' : 'bg-surface-container-high'
                }`}
              >
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  skill.enabled ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        ))}

        <button className="w-full mt-4 py-3 rounded-xl border border-dashed border-outline-variant/30 text-on-surface-variant text-sm hover:bg-surface-container-low transition-colors">
          + 浏览 Skill 商店
        </button>
      </main>
    </motion.div>
  )
}

// ============================================================
// System Config Page
// ============================================================
export function SystemConfigPage({ onBack }: { onBack: () => void }) {
  const [config, setConfig] = useState(mockSystemConfig)

  const settings = [
    { key: 'notifications', label: '推送通知', description: '接收消息和提醒通知' },
    { key: 'autoUpdate', label: '自动更新', description: '自动下载并安装更新' },
    { key: 'betaFeatures', label: '测试功能', description: '体验最新的实验性功能' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="min-h-screen bg-background flex flex-col"
    >
      <header className="fixed top-0 w-full z-50 bg-[#f8f9fa]/80 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between px-6 h-16 w-full max-w-md mx-auto">
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#d4e4f7]/30 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#506070]" />
          </button>
          <h1 className="text-lg tracking-wider font-light text-[#506070]">系统配置</h1>
          <div className="w-10" />
        </div>
        <div className="bg-gradient-to-b from-[#abb3b7]/10 to-transparent h-[1px]" />
      </header>

      <main className="pt-24 px-6 pb-8 max-w-md mx-auto w-full space-y-4">
        {/* Toggle Settings */}
        <div className="space-y-3">
          {settings.map((setting) => (
            <div
              key={setting.key}
              className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/10 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-on-surface">{setting.label}</h4>
                  <p className="text-xs text-on-surface-variant mt-1">{setting.description}</p>
                </div>
                <button
                  onClick={() => setConfig({ ...config, [setting.key]: !config[setting.key as keyof typeof config] })}
                  className={`w-12 h-7 rounded-full transition-colors relative ${
                    config[setting.key as keyof typeof config] ? 'bg-primary' : 'bg-surface-container-high'
                  }`}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    config[setting.key as keyof typeof config] ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/10">
          <h4 className="text-sm font-bold text-on-surface-variant/60 uppercase tracking-[0.1em] mb-3">存储信息</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-on-surface-variant">缓存大小</span>
              <span className="text-sm font-medium text-on-surface">{config.cacheSize}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-on-surface-variant">已用存储</span>
              <span className="text-sm font-medium text-on-surface">{config.storageUsed} / {config.storageTotal}</span>
            </div>
            <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: '24%' }} />
            </div>
          </div>
        </div>

        <div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/10">
          <h4 className="text-sm font-bold text-on-surface-variant/60 uppercase tracking-[0.1em] mb-3">系统信息</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-on-surface-variant">版本</span>
              <span className="text-sm font-medium text-on-surface">v1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-on-surface-variant">语言</span>
              <span className="text-sm font-medium text-on-surface">简体中文</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-on-surface-variant">主题</span>
              <span className="text-sm font-medium text-on-surface">浅色模式</span>
            </div>
          </div>
        </div>

        <button className="w-full py-3 rounded-xl bg-surface-container-low text-on-surface-variant text-sm hover:bg-surface-container transition-colors">
          清除缓存
        </button>
      </main>
    </motion.div>
  )
}
