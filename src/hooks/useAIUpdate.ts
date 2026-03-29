// ============================================================
// AI Update Hook
// Real-time WebSocket tool_update subscription for dynamic UI components
// ============================================================

import { useEffect, useRef, useCallback } from 'react'
import { getClient } from '@/services/device'

// Global subscriber map: componentId -> Set of callbacks
const subscribers = new Map<string, Set<(data: unknown) => void>>()

// Global flag to track if we've registered the WebSocket listener
let isGlobalListenerRegistered = false

/**
 * AI 推送更新 Hook
 * 订阅 WebSocket tool_update 事件，接收实时数据推送
 *
 * @param componentId - 组件唯一标识符（对应 GeneratedComponent.id）
 * @param onUpdate - 数据更新回调
 * @returns { requestUpdate } - 手动触发更新请求的方法
 */
export function useAIUpdate(
  componentId: string,
  onUpdate: (data: unknown) => void
) {
  // 使用 useRef 保存回调，避免每次渲染都重新订阅
  const onUpdateRef = useRef(onUpdate)
  useEffect(() => {
    onUpdateRef.current = onUpdate
  })

  // 注册全局 WebSocket 监听器（只执行一次）
  useEffect(() => {
    if (isGlobalListenerRegistered) return

    const client = getClient()
    const picoWs = client?.getPico() ?? null

    if (!picoWs) {
      console.warn('[useAIUpdate] PicoWebSocket not available')
      return
    }

    // 注册全局 agent event 监听器
    picoWs.onAgentEvent((event) => {
      if (event.kind === 'agent.tool_update') {
        const { component_id, data } = event.payload as {
          component_id?: string
          data?: unknown
        }

        if (component_id && data) {
          // 查找并通知该 component_id 的所有订阅者
          const callbacks = subscribers.get(component_id)
          if (callbacks) {
            callbacks.forEach((callback) => {
              callback(data)
            })
          }
        }
      }
    })

    isGlobalListenerRegistered = true
  }, []) // 空依赖数组，确保只执行一次

  // 订阅/取消订阅当前组件的更新
  useEffect(() => {
    // 如果该 componentId 还没有订阅者集合，创建一个
    if (!subscribers.has(componentId)) {
      subscribers.set(componentId, new Set())
    }

    const callbacks = subscribers.get(componentId)!
    const callback = (data: unknown) => {
      onUpdateRef.current(data)
    }

    // 添加当前订阅者
    callbacks.add(callback)

    // 清理函数：移除订阅者
    return () => {
      callbacks.delete(callback)

      // 如果该 componentId 没有订阅者了，清理掉
      if (callbacks.size === 0) {
        subscribers.delete(componentId)
      }
    }
  }, [componentId])

  // 手动触发更新请求
  const requestUpdate = useCallback(() => {
    const client = getClient()
    const picoWs = client?.getPico() ?? null

    if (!picoWs) {
      console.warn('[useAIUpdate] Cannot request update: PicoWebSocket not available')
      return
    }

    // 发送 tool_update_request 消息
    picoWs.send({
      type: 'agent.tool_update_request',
      payload: {
        component_id: componentId,
      },
    })
  }, [componentId])

  return { requestUpdate }
}
