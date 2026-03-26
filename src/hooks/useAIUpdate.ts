// ============================================================
// AI Update Hook
// 预留接口，后续对接 WebSocket 或 SSE
// ============================================================

import { useEffect, useCallback } from 'react'

/**
 * AI 推送更新 Hook
 * 预留接口，后续对接 WebSocket 或 SSE
 */
export function useAIUpdate(
  componentId: string,
  _onUpdate: (_data: unknown) => void
) {
  useEffect(() => {
    // 预留：订阅 AI 推送
    console.warn('[预留] Subscribe to AI updates for component:', componentId)

    // 预留：清理订阅
    return () => {
      console.warn('[预留] Unsubscribe from AI updates for component:', componentId)
    }
  }, [componentId])

  // 预留：手动触发更新请求
  const requestUpdate = useCallback(() => {
    console.warn('[预留] Request AI update for component:', componentId)
  }, [componentId])

  return { requestUpdate }
}
