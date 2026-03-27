// ============================================================
// MoonHub API Client
// Handles communication with MoonHub device backend
// ============================================================

import type {
  ApiResponse,
  StreamCallback,
  StreamChunk,
  PairedDevice,
} from '@/types'
import type {
  ChatRequest,
  ChatResponse,
  GatewayStatus,
  SystemConfig,
  SpaceRequest,
  SpaceResponse,
  SkillInfo,
  SystemInfo,
} from '@/types/api'

/** Per-request options (not sent over the wire). */
export interface MoonHubRequestMeta {
  timeoutMs?: number
}

// ==================== Pico Protocol Types ====================

export interface PicoMessage {
  type: string
  id?: string
  session_id?: string
  timestamp?: number
  payload?: Record<string, unknown>
}

export type AgentEventCallback = (event: {
  kind: string
  payload: Record<string, unknown>
}) => void

// ==================== WebSocket Manager ====================

export class PicoWebSocket {
  private ws: WebSocket | null = null
  private url: string
  private token: string
  private sessionId: string
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private _isConnected = false
  private messageQueue: PicoMessage[] = []
  private agentEventCallback: AgentEventCallback | null = null
  private connectionChangeCallback?: (connected: boolean) => void

  constructor(url: string, token: string, sessionId: string) {
    this.url = url
    this.token = token
    this.sessionId = sessionId
  }

  get isConnected() {
    return this._isConnected
  }

  onAgentEvent(callback: AgentEventCallback) {
    this.agentEventCallback = callback
  }

  onConnectionChange(callback: (connected: boolean) => void) {
    this.connectionChangeCallback = callback
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return

    const wsUrl = `${this.url}/moonhub/ws?session_id=${encodeURIComponent(this.sessionId)}&token=${encodeURIComponent(this.token)}`

    try {
      this.ws = new WebSocket(wsUrl)
    } catch {
      this.scheduleReconnect()
      return
    }

    this.ws.onopen = () => {
      this._isConnected = true
      this.connectionChangeCallback?.(true)
      while (this.messageQueue.length > 0) {
        const msg = this.messageQueue.shift()!
        this.sendRaw(msg)
      }
    }

    this.ws.onmessage = (event) => {
      try {
        const msg: PicoMessage = JSON.parse(event.data)
        this.handleMessage(msg)
      } catch {
        // Skip invalid JSON
      }
    }

    this.ws.onclose = () => {
      this._isConnected = false
      this.connectionChangeCallback?.(false)
      this.scheduleReconnect()
    }

    this.ws.onerror = () => {
      this._isConnected = false
    }
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.messageQueue = []
    this.ws?.close()
    this.ws = null
    this._isConnected = false
  }

  sendMessage(content: string): void {
    const msg: PicoMessage = {
      type: 'message.send',
      session_id: this.sessionId,
      timestamp: Date.now(),
      payload: { content },
    }
    this.send(msg)
  }

  private send(msg: PicoMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.sendRaw(msg)
    } else {
      this.messageQueue.push(msg)
    }
  }

  private sendRaw(msg: PicoMessage): void {
    this.ws?.send(JSON.stringify(msg))
  }

  private handleMessage(msg: PicoMessage): void {
    if (msg.type?.startsWith('agent.')) {
      this.agentEventCallback?.({
        kind: msg.type,
        payload: msg.payload ?? {},
      })
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.connect()
    }, 3000)
  }
}

function abortAfter(ms: number): AbortSignal {
  if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
    return AbortSignal.timeout(ms)
  }
  const c = new AbortController()
  setTimeout(() => c.abort(), ms)
  return c.signal
}

function combineAbortSignals(
  ...signals: (AbortSignal | undefined | null)[]
): AbortSignal | undefined {
  const active = signals.filter((s): s is AbortSignal => s != null)
  if (active.length === 0) return undefined
  if (active.length === 1) return active[0]

  if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.any === 'function') {
    return AbortSignal.any(active)
  }

  const parent = new AbortController()
  const forward = () => parent.abort()
  for (const s of active) {
    if (s.aborted) {
      forward()
      return parent.signal
    }
    s.addEventListener('abort', forward, { once: true })
  }
  return parent.signal
}

export class MoonHubClient {
  private baseUrl: string
  private authToken?: string
  private abortController?: AbortController

  constructor(baseUrl: string, authToken?: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '')
    this.authToken = authToken
  }

  setAuthToken(token: string | undefined) {
    this.authToken = token
  }

  private async request<T>(
    path: string,
    options: RequestInit = {},
    meta?: MoonHubRequestMeta
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${path}`

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.authToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.authToken}`
    }

    const signalParts: (AbortSignal | undefined)[] = []
    if (this.abortController?.signal) signalParts.push(this.abortController.signal)
    if (meta?.timeoutMs != null && meta.timeoutMs > 0) {
      signalParts.push(abortAfter(meta.timeoutMs))
    }
    if (options.signal) signalParts.push(options.signal)
    const signal = combineAbortSignals(...signalParts)

    const fetchOptions: RequestInit = { ...options }
    delete (fetchOptions as { signal?: AbortSignal }).signal

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal,
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        return {
          success: false,
          error: {
            code: String(response.status),
            message: error.message || response.statusText,
          },
        }
      }

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          error: { code: 'ABORTED', message: 'Request aborted' },
        }
      }
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error',
        },
      }
    }
  }

  abort() {
    this.abortController?.abort()
    this.abortController = new AbortController()
  }

  // ==================== Pico WebSocket ====================

  private picoWs: PicoWebSocket | null = null

  connectPico(sessionId?: string): PicoWebSocket {
    if (!this.authToken || !this.baseUrl) {
      throw new Error('Cannot connect Pico: no auth token or base URL')
    }
    const wsUrl = this.baseUrl.replace(/^http/, 'ws')
    const sid = sessionId || crypto.randomUUID()
    this.picoWs = new PicoWebSocket(wsUrl, this.authToken, sid)
    this.picoWs.connect()
    return this.picoWs
  }

  getPico(): PicoWebSocket | null {
    return this.picoWs
  }

  disconnectPico(): void {
    this.picoWs?.disconnect()
    this.picoWs = null
  }

  // ==================== Device Discovery ====================

  async ping(meta?: MoonHubRequestMeta): Promise<ApiResponse<{ version: string; name: string }>> {
    return this.request('/api/ping', {}, meta)
  }

  async getDeviceStatus(meta?: MoonHubRequestMeta): Promise<ApiResponse<SystemInfo>> {
    return this.request('/api/system/info', {}, meta)
  }

  // ==================== Authentication ====================

  async pair(authCode: string): Promise<ApiResponse<{ token: string; device: PairedDevice }>> {
    return this.request('/api/auth/pair', {
      method: 'POST',
      body: JSON.stringify({ code: authCode }),
    })
  }

  async verifyToken(): Promise<ApiResponse<{ valid: boolean }>> {
    return this.request('/api/auth/verify')
  }

  // ==================== Chat ====================

  async chat(request: ChatRequest): Promise<ApiResponse<ChatResponse>> {
    return this.request('/api/chat', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  async *chatStream(
    request: ChatRequest,
    callback?: StreamCallback
  ): AsyncGenerator<StreamChunk> {
    const url = `${this.baseUrl}/api/chat/stream`

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ ...request, stream: true }),
      signal: this.abortController?.signal,
    })

    if (!response.ok) {
      const error: StreamChunk = {
        type: 'error',
        data: { message: response.statusText },
      }
      callback?.(error)
      yield error
      return
    }

    const reader = response.body?.getReader()
    if (!reader) return

    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              const doneChunk: StreamChunk = { type: 'done' }
              callback?.(doneChunk)
              yield doneChunk
              return
            }

            try {
              const chunk: StreamChunk = JSON.parse(data)
              callback?.(chunk)
              yield chunk
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }

  // ==================== Space ====================

  async generateSpace(request: SpaceRequest): Promise<ApiResponse<SpaceResponse>> {
    return this.request('/api/space/generate', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  async getSpace(spaceId: string): Promise<ApiResponse<SpaceResponse>> {
    return this.request(`/api/space/${spaceId}`)
  }

  // ==================== Gateway ====================

  async getGatewayStatus(): Promise<ApiResponse<GatewayStatus>> {
    return this.request('/api/gateway/status')
  }

  async startGateway(): Promise<ApiResponse<void>> {
    return this.request('/api/gateway/start', { method: 'POST' })
  }

  async stopGateway(): Promise<ApiResponse<void>> {
    return this.request('/api/gateway/stop', { method: 'POST' })
  }

  // Gateway events via SSE
  subscribeToGatewayEvents(
    onEvent: (_event: unknown) => void,
    onError?: (_error: Error) => void
  ): () => void {
    const url = `${this.baseUrl}/api/gateway/events`
    const eventSource = new EventSource(url)

    eventSource.onmessage = (_event) => {
      try {
        onEvent(JSON.parse(_event.data))
      } catch {
        onEvent(_event.data)
      }
    }

    eventSource.onerror = () => {
      onError?.(new Error('EventSource connection failed'))
    }

    return () => eventSource.close()
  }

  // ==================== Configuration ====================

  async getConfig(): Promise<ApiResponse<SystemConfig>> {
    return this.request('/api/config')
  }

  async updateConfig(config: Partial<SystemConfig>): Promise<ApiResponse<SystemConfig>> {
    return this.request('/api/config', {
      method: 'PUT',
      body: JSON.stringify(config),
    })
  }

  // ==================== Skills ====================

  async getSkills(): Promise<ApiResponse<SkillInfo[]>> {
    return this.request('/api/skills')
  }

  async installSkill(skillUrl: string): Promise<ApiResponse<SkillInfo>> {
    return this.request('/api/skills', {
      method: 'POST',
      body: JSON.stringify({ url: skillUrl }),
    })
  }

  // ==================== Models ====================

  async getModels(): Promise<ApiResponse<SystemConfig['models']>> {
    return this.request('/api/models')
  }

  async setDefaultModel(modelId: string): Promise<ApiResponse<void>> {
    return this.request('/api/models/default', {
      method: 'POST',
      body: JSON.stringify({ modelId }),
    })
  }
}

// Singleton instance management
let clientInstance: MoonHubClient | null = null

export function getClient(): MoonHubClient | null {
  return clientInstance
}

export function createClient(baseUrl: string, authToken?: string): MoonHubClient {
  clientInstance = new MoonHubClient(baseUrl, authToken)
  return clientInstance
}

export function disconnectClient(): void {
  clientInstance?.disconnectPico()
  clientInstance?.abort()
  clientInstance = null
}
