// src/services/dynamicTools.ts
import { getClient } from '@/services/device'
import type { ApiResponse, DynamicTool, GenerateResult, ExecutionResult, GeneratedComponent } from '@/types'

export class DynamicToolsService {
  async list(source?: 'ai'): Promise<ApiResponse<DynamicTool[]>> {
    const client = getClient()
    if (!client) return { success: false }
    const query = source ? `?source=${source}` : ''
    return client.request<DynamicTool[]>(`/api/dynamic-tools${query}`)
  }

  async generate(prompt: string, context: string = 'chat'): Promise<ApiResponse<GenerateResult>> {
    const client = getClient()
    if (!client) return { success: false }
    return client.request<GenerateResult>('/api/dynamic-tools/generate', {
      method: 'POST',
      body: JSON.stringify({ prompt, context }),
    })
  }

  async execute(toolId: string, params: Record<string, unknown>, mode: 'chat' | 'space' = 'chat'): Promise<ApiResponse<ExecutionResult>> {
    const client = getClient()
    if (!client) return { success: false }
    return client.request<ExecutionResult>(`/api/dynamic-tools/${toolId}/execute`, {
      method: 'POST',
      body: JSON.stringify({ params, mode }),
    })
  }

  async getSchema(toolId: string, mode: 'chat' | 'space' = 'chat'): Promise<ApiResponse<GeneratedComponent>> {
    const client = getClient()
    if (!client) return { success: false }
    return client.request<GeneratedComponent>(`/api/dynamic-tools/${toolId}/schema?mode=${mode}`)
  }

  async delete(toolId: string): Promise<ApiResponse<{ id: string; status: string }>> {
    const client = getClient()
    if (!client) return { success: false }
    return client.request(`/api/dynamic-tools/${toolId}`, { method: 'DELETE' })
  }

  async setOnHome(toolId: string, onHome: boolean): Promise<ApiResponse<{ id: string; status: string }>> {
    const client = getClient()
    if (!client) return { success: false }
    return client.request(`/api/dynamic-tools/${toolId}/home`, {
      method: 'PATCH',
      body: JSON.stringify({ on_home: onHome }),
    })
  }
}

export const dynamicToolsService = new DynamicToolsService()
