// ============================================================
// Settings Sub Pages
// 设置二级页面组件
// ============================================================

import { useState } from 'react'
import { motion } from 'motion/react'
import { ArrowLeft, Monitor, Smartphone, Laptop, Wifi, WifiOff, Check } from 'lucide-react'
import {
  mockConnectedDevices,
  mockModelConfigs,
  mockChannels,
  mockPrivacySettings,
  mockSkills,
  mockSystemConfig,
} from '@/services/mock'

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
  const [activeModel, setActiveModel] = useState(mockModelConfigs[0].id)

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

      <main className="pt-24 px-6 pb-8 max-w-md mx-auto w-full space-y-4">
        {mockModelConfigs.map((model) => (
          <button
            key={model.id}
            onClick={() => setActiveModel(model.id)}
            className={`w-full text-left bg-surface-container-lowest rounded-2xl p-4 border shadow-sm transition-all ${
              activeModel === model.id
                ? 'border-primary/50 ring-2 ring-primary/20'
                : 'border-outline-variant/10'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-on-surface">{model.name}</h4>
              {activeModel === model.id && (
                <Check className="w-5 h-5 text-primary" />
              )}
            </div>
            <p className="text-xs text-on-surface-variant mb-3">{model.provider}</p>
            <div className="flex flex-wrap gap-2">
              {model.capabilities.map((cap) => (
                <span key={cap} className="text-[10px] px-2 py-1 rounded-full bg-primary-container/30 text-primary">
                  {cap}
                </span>
              ))}
              <span className="text-[10px] px-2 py-1 rounded-full bg-surface-container-high text-on-surface-variant">
                {model.contextWindow}
              </span>
            </div>
          </button>
        ))}
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
