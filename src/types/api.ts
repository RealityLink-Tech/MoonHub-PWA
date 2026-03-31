// ============================================================
// MoonHub Backend API Types
// Based on MoonHub's web/backend API structure
// ============================================================

import type { GeneratedComponent } from './index'

// ==================== Gateway API ====================

export interface GatewayStatus {
  running: boolean
  uptime?: number
  connectedClients?: number
}

export interface GatewayLog {
  timestamp: number
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
}

export interface GatewayEvent {
  type: 'status' | 'log' | 'message' | 'error'
  data: unknown
}

// ==================== Config API ====================

export interface SystemConfig {
  models: ModelConfig[]
  defaultModel?: string
  channels?: ChannelConfig[]
  tools?: ToolConfig[]
  memory?: MemoryConfig
  routing?: RoutingConfig
}

export interface ModelConfig {
  id: string
  provider: string
  model: string
  apiKey?: string
  baseUrl?: string
  default?: boolean
  capabilities?: string[]
}

/** Response from GET /api/models — matches backend modelResponse struct */
export interface ModelEntry {
  index: number
  model_name: string
  model: string
  api_base?: string
  api_key: string          // masked: "sk-****abcd"
  proxy?: string
  auth_method?: string
  connect_mode?: string
  workspace?: string
  rpm?: number
  max_tokens_field?: string
  request_timeout?: number
  thinking_level?: string
  configured: boolean
  is_default: boolean
}

export interface ModelsResponse {
  models: ModelEntry[]
  total: number
  default_model: string
}

export interface ChannelConfig {
  type: string
  enabled: boolean
  config: Record<string, unknown>
}

export interface ToolConfig {
  name: string
  enabled: boolean
  config?: Record<string, unknown>
}

export interface MemoryConfig {
  enabled: boolean
  maxEntries?: number
  ttl?: number
}

export interface RoutingConfig {
  enabled: boolean
  light_model?: string
  threshold?: number
  tier_mapping?: Record<string, string>
  tier_boundaries?: {
    simple_moderate?: number
    moderate_complex?: number
    complex_reasoning?: number
  } | null
}

// ==================== Tools API ====================

export interface ToolSupportItem {
  name: string
  description: string
  category: string
  config_key: string
  status: 'enabled' | 'disabled' | 'blocked'
  reason_code?: string
}

export interface ToolSupportResponse {
  tools: ToolSupportItem[]
}

// ==================== Chat API ====================

export interface ChatRequest {
  message: string
  conversationId?: string
  model?: string
  stream?: boolean
  context?: ChatContext
}

export interface ChatContext {
  images?: string[] // base64 encoded
  audio?: string // base64 encoded
  files?: FileAttachment[]
}

export interface FileAttachment {
  name: string
  type: string
  data: string // base64
}

export interface ChatResponse {
  messageId: string
  conversationId: string
  content: string
  card?: GeneratedCard
  toolCalls?: ToolCallResult[]
}

export interface GeneratedCard {
  type: string
  data: Record<string, unknown>
  schema?: string // JSON schema for the card
}

export interface ToolCallResult {
  id: string
  name: string
  status: 'pending' | 'running' | 'success' | 'error'
  input: Record<string, unknown>
  output?: unknown
  error?: string
}

// ==================== Space API ====================

export interface SpaceRequest {
  prompt: string
  conversationId?: string
  existingSpaceId?: string
}

export interface SpaceResponse {
  spaceId: string
  components: GeneratedComponent[]
  description?: string
}

// ==================== Skills API ====================

export interface SkillInfo {
  name: string
  description: string
  version: string
  enabled: boolean
  triggers?: string[]
}

// ==================== System API ====================

export interface SystemInfo {
  version: string
  platform: string
  uptime: number
  memory?: {
    used: number
    total: number
  }
  cpu?: number
}

export interface AutostartConfig {
  enabled: boolean
  delay?: number
}
