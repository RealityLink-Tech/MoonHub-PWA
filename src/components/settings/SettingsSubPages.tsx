// ============================================================
// Settings Sub Pages
// 设置二级页面组件
// ============================================================

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { ArrowLeft, Monitor, Smartphone, Laptop, Wifi, WifiOff, Check, Key, Star, ChevronDown, ChevronUp, Loader2, AlertCircle } from 'lucide-react'
import {
  mockConnectedDevices,
  mockChannels,
  mockPrivacySettings,
  mockSkills,
  mockSystemConfig,
} from '@/services/mock'
import { getClient } from '@/services/device'
import type { ModelEntry } from '@/types/api'
import { groupModelsByProvider, providerDisplayName, needsApiKey } from '@/lib/models'

// ============================================================
// Connected Devices Page
// ============================================================
export function DevicesPage({ onBack }: { onBack: () => void }) {
  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'hub': return Monitor
      case 'phone': return Smartphone
      case 'laptop': return Laptop
      default: return Monitor
    }
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
          <h1 className="text-lg tracking-wider font-light text-[#506070]">已连接设备</h1>
          <div className="w-10" />
        </div>
        <div className="bg-gradient-to-b from-[#abb3b7]/10 to-transparent h-[1px]" />
      </header>

      <main className="pt-24 px-6 pb-8 max-w-md mx-auto w-full space-y-4">
        {mockConnectedDevices.map((device) => {
          const Icon = getDeviceIcon(device.type)
          return (
            <div
              key={device.id}
              className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/10 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  device.status === 'online' ? 'bg-primary-container/30' : 'bg-surface-container-high'
                }`}>
                  <Icon className={`w-6 h-6 ${device.status === 'online' ? 'text-primary' : 'text-outline-variant'}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-on-surface">{device.name}</h4>
                    {device.status === 'online' && (
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-on-surface-variant">{device.ip} · {device.version}</p>
                </div>
                <span className={`text-xs ${device.status === 'online' ? 'text-green-500' : 'text-outline-variant'}`}>
                  {device.status === 'online' ? '在线' : device.lastActive}
                </span>
              </div>
            </div>
          )
        })}

        <button className="w-full mt-4 py-3 rounded-xl border border-dashed border-outline-variant/30 text-on-surface-variant text-sm hover:bg-surface-container-low transition-colors">
          + 添加新设备
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

  // Fetch models on mount
  useEffect(() => {
    const fetchModels = async () => {
      const client = getClient()
      if (!client) {
        setError('未连接到设备')
        setLoading(false)
        return
      }

      const result = await client.getModels()
      if (result.success && result.data) {
        setModels(result.data.models)
      } else {
        setError(result.error?.message || '加载模型失败')
      }
      setLoading(false)
    }

    fetchModels()
  }, [])

  // Handle save API key
  const handleSave = async (index: number) => {
    const client = getClient()
    if (!client) return

    setSaving(index)
    const result = await client.updateModel(index, { api_key: apiKeyInput })
    setSaving(null)

    if (result.success) {
      // Refresh models
      const refreshResult = await client.getModels()
      if (refreshResult.success && refreshResult.data) {
        setModels(refreshResult.data.models)
      }
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
      // Refresh models
      const refreshResult = await client.getModels()
      if (refreshResult.success && refreshResult.data) {
        setModels(refreshResult.data.models)
      }
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
        ) : error ? (
          <div className="flex items-center gap-3 py-20 text-error">
            <AlertCircle className="w-6 h-6" />
            <span className="text-sm">{error}</span>
          </div>
        ) : models.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-on-surface-variant">
            <span className="text-sm">暂无模型配置</span>
          </div>
        ) : (
          <div className="space-y-6">
            {Array.from(groupModelsByProvider(models).entries()).map(([provider, providerModels]) => (
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
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                              <span>此模型使用</span>
                              <span className="font-medium text-primary">{authBadge}</span>
                              <span>认证，无需配置 API 密钥</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )}
      </main>
    </motion.div>
  )
}

// ============================================================
// Channels Page
// ============================================================
export function ChannelsPage({ onBack }: { onBack: () => void }) {
  const [channels, setChannels] = useState(mockChannels)

  const toggleChannel = (id: string) => {
    setChannels(channels.map(ch =>
      ch.id === id ? { ...ch, status: ch.status === 'connected' ? 'disconnected' : 'connected' } : ch
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
          <h1 className="text-lg tracking-wider font-light text-[#506070]">外部频道</h1>
          <div className="w-10" />
        </div>
        <div className="bg-gradient-to-b from-[#abb3b7]/10 to-transparent h-[1px]" />
      </header>

      <main className="pt-24 px-6 pb-8 max-w-md mx-auto w-full space-y-3">
        {channels.map((channel) => (
          <div
            key={channel.id}
            className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/10 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  channel.status === 'connected' ? 'bg-primary-container/30' : 'bg-surface-container-high'
                }`}>
                  {channel.status === 'connected' ? (
                    <Wifi className="w-5 h-5 text-primary" />
                  ) : (
                    <WifiOff className="w-5 h-5 text-outline-variant" />
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-on-surface">{channel.name}</h4>
                  <p className="text-xs text-on-surface-variant">
                    {channel.status === 'connected' ? `同步于 ${channel.lastSync}` : '未连接'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => toggleChannel(channel.id)}
                className={`w-12 h-7 rounded-full transition-colors relative ${
                  channel.status === 'connected' ? 'bg-primary' : 'bg-surface-container-high'
                }`}
              >
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  channel.status === 'connected' ? 'translate-x-6' : 'translate-x-1'
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
