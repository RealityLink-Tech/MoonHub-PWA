// ============================================================
// Chat Store
// Manages conversations and messages
// ============================================================

import { create } from 'zustand'
import type { Message, Conversation } from '@/types'
import { getStorage } from '@/services/storage'
import { nanoid } from 'nanoid'

interface ChatState {
  // Conversations
  conversations: Conversation[]
  currentConversationId: string | null

  // Messages for current conversation
  messages: Message[]

  // Streaming state
  isStreaming: boolean
  streamingContent: string

  // UI state
  isTyping: boolean

  // Actions
  loadConversations: () => Promise<void>
  createConversation: (deviceId: string, title?: string) => Promise<Conversation>
  deleteConversation: (conversationId: string) => Promise<void>
  setCurrentConversation: (conversationId: string | null) => void

  loadMessages: (conversationId: string) => Promise<void>
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => Promise<Message>
  updateMessage: (messageId: string, content: Partial<Message>) => Promise<void>

  setStreaming: (streaming: boolean, content?: string) => void
  setTyping: (typing: boolean) => void

  // Helper
  getCurrentConversation: () => Conversation | undefined
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  currentConversationId: null,
  messages: [],
  isStreaming: false,
  streamingContent: '',
  isTyping: false,

  loadConversations: async () => {
    const storage = getStorage()
    const conversations = await storage.getAllConversations()
    set({ conversations })
  },

  createConversation: async (deviceId, title) => {
    const storage = getStorage()
    const now = Date.now()
    const conversation: Conversation = {
      id: nanoid(),
      deviceId,
      title: title || `对话 ${get().conversations.length + 1}`,
      createdAt: now,
      updatedAt: now,
      messageCount: 0,
    }

    await storage.saveConversation(conversation)
    set((state) => ({
      conversations: [conversation, ...state.conversations],
      currentConversationId: conversation.id,
      messages: [],
    }))

    return conversation
  },

  deleteConversation: async (conversationId) => {
    const storage = getStorage()
    await storage.deleteConversation(conversationId)
    await storage.deleteMessagesByConversation(conversationId)

    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== conversationId),
      currentConversationId:
        state.currentConversationId === conversationId
          ? null
          : state.currentConversationId,
      messages:
        state.currentConversationId === conversationId ? [] : state.messages,
    }))
  },

  setCurrentConversation: (conversationId) => {
    set({ currentConversationId: conversationId })
    if (conversationId) {
      get().loadMessages(conversationId)
    } else {
      set({ messages: [] })
    }
  },

  loadMessages: async (conversationId) => {
    const storage = getStorage()
    const messages = await storage.getMessagesByConversation(conversationId)
    set({ messages })
  },

  addMessage: async (messageData) => {
    const storage = getStorage()
    const message: Message = {
      ...messageData,
      id: nanoid(),
      timestamp: Date.now(),
    }

    await storage.saveMessage(message)

    // Update conversation
    const conversation = get().conversations.find(
      (c) => c.id === message.conversationId
    )
    if (conversation) {
      const updatedConversation: Conversation = {
        ...conversation,
        updatedAt: Date.now(),
        messageCount: conversation.messageCount + 1,
        lastMessage:
          message.content.type === 'text'
            ? message.content.text.slice(0, 50)
            : message.content.type === 'card'
              ? `[卡片] ${message.content.cardType}`.slice(0, 50)
              : '[媒体消息]',
      }
      await storage.saveConversation(updatedConversation)
    }

    set((state) => {
      const conversations = state.conversations.map((c) =>
        c.id === message.conversationId
          ? {
              ...c,
              updatedAt: Date.now(),
              messageCount: c.messageCount + 1,
              lastMessage:
                message.content.type === 'text'
                  ? message.content.text.slice(0, 50)
                  : message.content.type === 'card'
                    ? `[卡片] ${message.content.cardType}`.slice(0, 50)
                    : '[媒体消息]',
            }
          : c
      )
      // Sort by updatedAt
      conversations.sort((a, b) => b.updatedAt - a.updatedAt)

      return {
        messages: [...state.messages, message],
        conversations,
      }
    })

    return message
  },

  updateMessage: async (messageId, content) => {
    const storage = getStorage()
    const message = get().messages.find((m) => m.id === messageId)
    if (message) {
      const updatedMessage = { ...message, ...content }
      await storage.saveMessage(updatedMessage)
      set((state) => ({
        messages: state.messages.map((m) =>
          m.id === messageId ? updatedMessage : m
        ),
      }))
    }
  },

  setStreaming: (streaming, content = '') =>
    set({ isStreaming: streaming, streamingContent: content }),

  setTyping: (typing) => set({ isTyping: typing }),

  getCurrentConversation: () => {
    const { conversations, currentConversationId } = get()
    return conversations.find((c) => c.id === currentConversationId)
  },
}))
