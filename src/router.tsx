// ============================================================
// Router Configuration
// 简化的路由配置 - 主要用于 PWA 路由
// ============================================================

import {
  createRouter,
  createRootRoute,
  createRoute,
} from '@tanstack/react-router'
import { App } from '@/App'

// Root route
const rootRoute = createRootRoute({
  component: App,
})

// Index route
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => null, // App handles all views internally
})

// Route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
])

// Create router
export const router = createRouter({ routeTree })

// Type declaration for router
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
