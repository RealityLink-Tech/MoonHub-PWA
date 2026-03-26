// ============================================================
// App Component
// 主应用 - 使用简单的视图导航与参考项目一致
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence } from 'motion/react'
import { SplashPage } from '@/pages/Splash'
import { ChatPage } from '@/pages/Chat'
import { SpacePage, SpaceExtensionPage } from '@/pages/Space'
import { SettingsPage } from '@/pages/Settings'
import type { SettingsSubPage } from '@/pages/Settings'
import { DeviceDiscoveryPage } from '@/pages/DeviceDiscovery'
import { DeviceConnectionPage } from '@/pages/DeviceConnection'
import {
  DevicesPage,
  ModelConfigPage,
  ChannelsPage,
  PrivacyPage,
  SkillsPage,
  SystemConfigPage,
} from '@/components/settings/SettingsSubPages'
import { BottomNavBar } from '@/components/ui/BottomNavBar'

export type ViewType =
  | 'splash'
  | 'chat'
  | 'space'
  | 'space_extension'
  | 'account'
  | 'device_discovery'
  | 'device_connection'
  | 'settings_devices'
  | 'settings_model'
  | 'settings_channels'
  | 'settings_privacy'
  | 'settings_skills'
  | 'settings_system'

export function App() {
  const [view, setView] = useState<ViewType>('splash')
  const [previousView, setPreviousView] = useState<ViewType>('chat')

  const navigateTo = useCallback((newView: ViewType) => {
    setPreviousView(view)
    setView(newView)
  }, [view])

  const navigateToSettingsSubPage = (page: SettingsSubPage) => {
    navigateTo(`settings_${page}` as ViewType)
  }

  // After splash, go to chat
  useEffect(() => {
    if (view === 'splash') {
      const timer = setTimeout(() => navigateTo('chat'), 2500)
      return () => clearTimeout(timer)
    }
  }, [view, navigateTo])

  const renderSettingsSubPage = () => {
    const onBack = () => navigateTo('account')

    switch (view) {
      case 'settings_devices':
        return <DevicesPage onBack={onBack} />
      case 'settings_model':
        return <ModelConfigPage onBack={onBack} />
      case 'settings_channels':
        return <ChannelsPage onBack={onBack} />
      case 'settings_privacy':
        return <PrivacyPage onBack={onBack} />
      case 'settings_skills':
        return <SkillsPage onBack={onBack} />
      case 'settings_system':
        return <SystemConfigPage onBack={onBack} />
      default:
        return null
    }
  }

  const isMainView = ['chat', 'space', 'account'].includes(view)
  const isSettingsSubView = view.startsWith('settings_')

  return (
    <div className="min-h-screen bg-background text-on-background font-sans selection:bg-primary-container">
      <AnimatePresence mode="wait">
        {view === 'splash' && (
          <SplashPage onFinish={() => navigateTo('chat')} />
        )}
        {view === 'chat' && (
          <ChatPage onAddClick={() => navigateTo('device_discovery')} />
        )}
        {view === 'space' && (
          <SpacePage onAddClick={() => navigateTo('space_extension')} />
        )}
        {view === 'space_extension' && (
          <SpaceExtensionPage onBack={() => navigateTo('space')} />
        )}
        {view === 'account' && (
          <SettingsPage
            onManageDevice={() => navigateTo('device_discovery')}
            onNavigateSubPage={navigateToSettingsSubPage}
          />
        )}
        {view === 'device_discovery' && (
          <DeviceDiscoveryPage
            onBack={() => navigateTo(previousView === 'chat' ? 'chat' : 'account')}
            onConnect={() => navigateTo('device_connection')}
          />
        )}
        {view === 'device_connection' && (
          <DeviceConnectionPage
            onBack={() => navigateTo('device_discovery')}
            onFinish={() => navigateTo('account')}
          />
        )}
        {isSettingsSubView && renderSettingsSubPage()}
      </AnimatePresence>

      {/* Bottom Navigation - only show on main views */}
      {isMainView && (
        <BottomNavBar current={view} onChange={(v) => navigateTo(v as ViewType)} />
      )}
    </div>
  )
}

export default App
