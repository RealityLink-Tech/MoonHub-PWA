// ============================================================
// MoonHub PWA Type Definitions
// ============================================================

// ==================== Device Types ====================

export interface Device {
  id: string
  name: string
  address: string // IP:Port
  version: string
  status: DeviceStatus
  lastSeen: number
  capabilities: DeviceCapability[]
}

export type DeviceStatus = 'online' | 'offline' | 'pairing' | 'error'

export type DeviceCapability =
  | 'chat'
  | 'voice'
  | 'image'
  | 'space'
  | 'tools'
  | 'multi_agent'

export interface PairedDevice extends Device {
  authToken: string
  baseUrl: string
  pairedAt: number
  alias?: string
}

// ==================== Auth Types ====================

export interface PairingRequest {
  deviceAddress: string
  authCode: string
}

export interface PairingResponse {
  success: boolean
  device: PairedDevice
  error?: string
}

// ==================== Chat Types ====================

export interface Message {
  id: string
  conversationId: string
  role: 'user' | 'assistant' | 'tool' | 'system_notice'
  content: MessageContent
  timestamp: number
  metadata?: MessageMetadata
}

export type MessageContent =
  | TextContent
  | ImageContent
  | AudioContent
  | CardContent
  | SpaceContent
  | FileContent

export interface FileContent {
  type: 'file'
  fileName: string
  fileSize: number
  fileType: string
  url?: string
}

export interface TextContent {
  type: 'text'
  text: string
}

export interface ImageContent {
  type: 'image'
  url: string
  base64?: string
  caption?: string
}

export interface AudioContent {
  type: 'audio'
  url?: string
  base64?: string
  duration?: number
  transcription?: string
}

export interface CardContent {
  type: 'card'
  cardType: string // AI-generated card type
  data: Record<string, unknown>
  render: string // Component name or render instructions
}

export interface SpaceContent {
  type: 'space'
  spaceId: string
  components: GeneratedComponent[]
}

export interface GeneratedComponent {
  id: string
  type: string
  props: Record<string, unknown>
  children?: GeneratedComponent[]
}

export interface MessageMetadata {
  model?: string
  tokens?: number
  latency?: number
  toolCalls?: ToolCall[]
}

export interface ToolCall {
  id: string
  name: string
  arguments: Record<string, unknown>
  result?: unknown
}

// ==================== Conversation Types ====================

export interface Conversation {
  id: string
  deviceId: string
  title: string
  createdAt: number
  updatedAt: number
  messageCount: number
  lastMessage?: string
}

// ==================== Space Types ====================

export interface Space {
  id: string
  deviceId: string
  name: string
  description?: string
  components: GeneratedComponent[]
  createdAt: number
  updatedAt: number
}

export interface SpaceGenerationRequest {
  prompt: string
  context?: string
  existingSpaceId?: string
}

// ==================== API Types ====================

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: ApiError
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

// ==================== Streaming Types ====================

export interface StreamChunk {
  type: 'text' | 'card' | 'tool' | 'done' | 'error'
  content?: string
  data?: unknown
}

export type StreamCallback = (_chunk: StreamChunk) => void

// ==================== Settings Types ====================

export interface AppSettings {
  theme: 'light' | 'dark' | 'system'
  language: string
  notifications: NotificationSettings
  voice: VoiceSettings
  network: NetworkSettings
}

export interface NotificationSettings {
  enabled: boolean
  sound: boolean
  vibration: boolean
}

export interface VoiceSettings {
  inputDevice?: string
  outputDevice?: string
  autoPlay: boolean
  noiseSuppression: boolean
}

export interface NetworkSettings {
  scanTimeout: number
  apiTimeout: number
  retryAttempts: number
}

// ==================== Multi-Agent Types (Future) ====================

export interface AgentGroup {
  id: string
  name: string
  agents: AgentInfo[]
  createdAt: number
}

export interface AgentInfo {
  id: string
  deviceId: string
  name: string
  role?: string
  capabilities: DeviceCapability[]
}

// ==================== Event Types ====================

export type AppEvent =
  | { type: 'device:discovered'; device: Device }
  | { type: 'device:connected'; device: PairedDevice }
  | { type: 'device:disconnected'; deviceId: string }
  | { type: 'message:received'; message: Message }
  | { type: 'message:sent'; message: Message }
  | { type: 'space:generated'; space: Space }
  | { type: 'notification'; title: string; body: string }

// ==================== Device Discovery Types ====================

export interface DiscoveredDevice {
  id: string
  name: string
  version: string
  addr: string
  port: number
  hostname?: string
  agent_id?: string
  agent_name?: string
}

// ==================== Channel Types ====================

export interface ChannelInstance {
  id: string
  type: string
  name: string
  config: Record<string, unknown>
  status: 'running' | 'stopped' | 'error'
}

export interface ChannelStatus {
  id: string
  status: 'running' | 'stopped' | 'error'
  message?: string
  connectedSince?: number
  messageCount?: number
}

// ==================== Channel Catalog Types ====================

export interface ChannelCatalogItem {
  name: string
  config_key: string
  variant?: string
}

export interface ChannelCatalogResponse {
  channels: ChannelCatalogItem[]
}

// ==================== Dynamic Tool Types ====================

export interface DynamicTool {
  id: string
  name: string
  description: string
  category: string
  chat_schema: GeneratedComponent
  space_schema: GeneratedComponent
  engine: 'schema' | 'wasm'
  fetch_config?: FetchConfig
  content_hash: string
  is_ai_generated: boolean
  is_on_home: boolean
  version: number
  created_at: number
  updated_at: number
}

export interface FetchConfig {
  source: 'api' | 'channel' | 'static'
  url?: string
  channel?: string
  method?: string
  headers?: Record<string, string>
  body?: string
  interval?: number
}

export interface GenerateResult {
  tool_id: string
  name: string
  is_new: boolean
  chat_schema: GeneratedComponent
  space_schema: GeneratedComponent
}

export interface ExecutionResult {
  schema: GeneratedComponent
  data: Record<string, unknown>
  expires?: number
}

export interface ToolUpdateEvent {
  type: 'tool_update'
  tool_id: string
  data: Record<string, unknown>
  schema: GeneratedComponent
}
