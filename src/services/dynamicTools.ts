// src/services/dynamicTools.ts
import { getClient } from '@/services/device'
import type { ApiResponse, DynamicTool, GenerateResult, ExecutionResult, GeneratedComponent } from '@/types'

export class DynamicToolsService {
  async list(source?: 'ai'): Promise<ApiResponse<DynamicTool[]>> {
    const client = getClient()
    if (!client) return { success: false }
    return client.listDynamicTools(source) as unknown as ApiResponse<DynamicTool[]>
  }

  async generate(prompt: string, context: string = 'chat'): Promise<ApiResponse<GenerateResult>> {
    const client = getClient()
    if (!client) return { success: false }
    return client.generateDynamicTool(prompt, context) as unknown as ApiResponse<GenerateResult>
  }

  async execute(toolId: string, params: Record<string, unknown>, mode: 'chat' | 'space' = 'chat'): Promise<ApiResponse<ExecutionResult>> {
    const client = getClient()
    if (!client) return { success: false }
    return client.executeDynamicTool(toolId, params, mode) as unknown as ApiResponse<ExecutionResult>
  }

  async getSchema(toolId: string, mode: 'chat' | 'space' = 'chat'): Promise<ApiResponse<GeneratedComponent>> {
    const client = getClient()
    if (!client) return { success: false }
    return client.getDynamicToolSchema(toolId, mode) as unknown as ApiResponse<GeneratedComponent>
  }

  async delete(toolId: string): Promise<ApiResponse<{ id: string; status: string }>> {
    const client = getClient()
    if (!client) return { success: false }
    return client.deleteDynamicTool(toolId) as unknown as ApiResponse<{ id: string; status: string }>
  }

  async setOnHome(toolId: string, onHome: boolean): Promise<ApiResponse<{ id: string; status: string }>> {
    const client = getClient()
    if (!client) return { success: false }
    return client.setDynamicToolOnHome(toolId, onHome) as unknown as ApiResponse<{ id: string; status: string }>
  }
}

export const dynamicToolsService = new DynamicToolsService()
