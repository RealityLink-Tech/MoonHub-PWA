// src/stores/__tests__/chat.test.ts
//
// Task 18: Chat store tests — verifies addMessage handles concurrent calls
// without losing messages (race condition fix).
//
// The actual chat store uses `messages` as a flat Message[] array (not a dict)
// and does not have a top-level `messageCount` field. Instead, messageCount
// lives on each Conversation. The plan's test assumed a dict shape; adapted
// to match actual implementation in src/stores/chat.ts.
//
// addMessage uses getStorage().saveMessage() for persistence, so we mock
// the storage module.

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useChatStore } from '../chat'

// Mock storage so addMessage doesn't hit IndexedDB
vi.mock('@/services/storage', () => ({
  getStorage: () => ({
    saveMessage: vi.fn().mockResolvedValue(undefined),
    saveConversation: vi.fn().mockResolvedValue(undefined),
    getAllConversations: vi.fn().mockResolvedValue([]),
    getMessagesByConversation: vi.fn().mockResolvedValue([]),
    deleteConversation: vi.fn().mockResolvedValue(undefined),
    deleteMessagesByConversation: vi.fn().mockResolvedValue(undefined),
  }),
}))

describe('useChatStore', () => {
  beforeEach(() => {
    // Reset to clean state matching the store's initial shape.
    // `messages` is a Message[] array, not a dict.
    useChatStore.setState({
      messages: [],
      conversations: [],
      currentConversationId: 'conv-1',
      isStreaming: false,
      streamingContent: '',
    })
  })

  it('should add messages atomically without losing any', async () => {
    // Fire 10 concurrent addMessage calls and verify all 10 land in state.
    // Each call uses a single set() callback inside addMessage, reading
    // state.messages inside the callback for atomic updates.
    const promises: Promise<unknown>[] = []
    for (let i = 0; i < 10; i++) {
      promises.push(
        useChatStore.getState().addMessage({
          conversationId: 'conv-1',
          role: 'user',
          content: { type: 'text', text: `msg-${i}` },
        })
      )
    }
    await Promise.all(promises)

    const msgs = useChatStore.getState().messages
    expect(msgs).toHaveLength(10)
    // Verify all messages are present (order may vary due to concurrency)
    const texts = msgs.map((m) => m.content).filter((c): c is { type: 'text'; text: string } => c.type === 'text').map((c) => c.text)
    for (let i = 0; i < 10; i++) {
      expect(texts).toContain(`msg-${i}`)
    }
  })
})
