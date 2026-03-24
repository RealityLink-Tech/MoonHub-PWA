// ============================================================
// useChat Hook
// Chat messaging logic
// ============================================================

import { useCallback } from 'react'
import { useChatStore } from '@/stores/chat'
import { useDeviceStore } from '@/stores'
import { getClient } from '@/services/device'
import type { CardContent, MessageContent } from '@/types'

// Context for chat messages
interface ChatContext {
  images?: string[]
  audio?: string
}

function streamErrorMessage(data: unknown): string {
  if (data == null) return '请求失败'
  if (typeof data === 'string') return data
  if (typeof data === 'object' && data !== null && 'message' in data) {
    const m = (data as { message: unknown }).message
    if (typeof m === 'string' && m) return m
  }
  try {
    return JSON.stringify(data)
  } catch {
    return '请求失败'
  }
}

function parseCardChunk(data: unknown): CardContent | null {
  if (data == null || typeof data !== 'object') return null
  const o = data as Record<string, unknown>
  const cardType =
    typeof o.cardType === 'string'
      ? o.cardType
      : typeof o.type === 'string'
        ? o.type
        : 'unknown'
  const render = typeof o.render === 'string' ? o.render : cardType
  const inner = o.data
  const record =
    inner && typeof inner === 'object' && !Array.isArray(inner)
      ? (inner as Record<string, unknown>)
      : {}
  return { type: 'card', cardType, data: record, render }
}

export function useChat() {
  const {
    conversations,
    currentConversationId,
    messages,
    isStreaming,
    streamingContent,
    isTyping,
    loadConversations,
    createConversation,
    deleteConversation,
    setCurrentConversation,
    loadMessages,
    addMessage,
    setStreaming,
    setTyping,
    getCurrentConversation,
  } = useChatStore()

  const currentDevice = useDeviceStore((state) => state.currentDevice)
  const connectionStatus = useDeviceStore((state) => state.connectionStatus)
  const isConnected = connectionStatus === 'connected'

  // Send a message
  const sendMessage = useCallback(
    async (content: MessageContent, context?: ChatContext) => {
      if (!currentDevice || !isConnected || !currentConversationId) {
        return { success: false, error: '未连接到设备' }
      }

      const client = getClient()
      if (!client) {
        return { success: false, error: '客户端未初始化' }
      }

      // Add user message
      await addMessage({
        conversationId: currentConversationId,
        role: 'user',
        content,
      })

      // Prepare request
      const textContent = content.type === 'text' ? content.text : ''
      const request: {
        message: string
        conversationId: string
        stream: boolean
        context?: ChatContext
      } = {
        message: textContent,
        conversationId: currentConversationId,
        stream: true,
        context,
      }

      // Stream response
      setStreaming(true, '')
      setTyping(true)

      try {
        let fullContent = ''
        let streamFinished = false

        for await (const chunk of client.chatStream(request)) {
          if (chunk.type === 'text' && chunk.content) {
            fullContent += chunk.content
            setStreaming(true, fullContent)
          } else if (chunk.type === 'card' && chunk.data != null) {
            const card = parseCardChunk(chunk.data)
            if (card) {
              await addMessage({
                conversationId: currentConversationId,
                role: 'assistant',
                content: card,
              })
            }
          } else if (chunk.type === 'done') {
            streamFinished = true
            const text = fullContent.trim()
            if (text) {
              await addMessage({
                conversationId: currentConversationId,
                role: 'assistant',
                content: { type: 'text', text: fullContent },
              })
            }
          } else if (chunk.type === 'error') {
            return {
              success: false,
              error: streamErrorMessage(chunk.data),
            }
          }
        }

        if (!streamFinished && fullContent.trim()) {
          await addMessage({
            conversationId: currentConversationId,
            role: 'assistant',
            content: { type: 'text', text: fullContent },
          })
        }

        setStreaming(false, '')
        setTyping(false)
        return { success: true }
      } catch (error) {
        setStreaming(false, '')
        setTyping(false)
        return {
          success: false,
          error: error instanceof Error ? error.message : '发送失败',
        }
      }
    },
    [currentDevice, isConnected, currentConversationId, addMessage, setStreaming, setTyping]
  )

  // Send with image
  const sendWithImage = useCallback(
    async (text: string, imageBase64: string) => {
      return sendMessage(
        { type: 'text', text },
        { images: [imageBase64] }
      )
    },
    [sendMessage]
  )

  // Send with audio
  const sendWithAudio = useCallback(
    async (audioBase64: string, transcription?: string) => {
      return sendMessage(
        { type: 'text', text: transcription || '[语音消息]' },
        { audio: audioBase64 }
      )
    },
    [sendMessage]
  )

  // Create new conversation
  const newConversation = useCallback(async () => {
    if (!currentDevice) return null
    return createConversation(currentDevice.id)
  }, [currentDevice, createConversation])

  // Initialize conversations
  const initialize = useCallback(async () => {
    await loadConversations()
  }, [loadConversations])

  return {
    // State
    conversations,
    currentConversationId,
    messages,
    isStreaming,
    streamingContent,
    isTyping,
    currentConversation: getCurrentConversation(),

    // Actions
    sendMessage,
    sendWithImage,
    sendWithAudio,
    newConversation,
    deleteConversation,
    setCurrentConversation,
    loadMessages,
    initialize,
  }
}
