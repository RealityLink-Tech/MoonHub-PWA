// ============================================================
// Main Entry Point
// 简化的入口点 - 使用视图导航
// ============================================================

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/App'
import { AppInitializer } from '@/AppInitializer'
import './index.css'

// Render app
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppInitializer>
      <App />
    </AppInitializer>
  </StrictMode>
)
