// src/services/__tests__/sse.test.ts
//
// Task 16: SSE chatStream parsing tests
// Tests that MoonHubClient.chatStream correctly parses SSE events with
// `event:` + `data:` lines, and backward-compat `data:`-only lines.
// Adapted from plan: uses `message` field for ChatRequest (not `content`).

import { describe, it, expect, vi } from 'vitest'
import { MoonHubClient } from '../device'

describe('SSE chatStream parsing', () => {
  it('should parse SSE events with event type', async () => {
    const sseData = [
      'event: content_start',
      'data: {"session_id":"s1"}',
      '',
      'event: content_chunk',
      'data: {"content":"Hello","done":false}',
      '',
      'event: done',
      'data: {"content":"Hello world","done":true}',
      '',
    ].join('\n')

    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(sseData))
        controller.close()
      },
    })

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      body: stream,
    } as Response)

    const client = new MoonHubClient('http://localhost:18800')
    client.setAuthToken('token')

    const chunks: any[] = []
    const gen = client.chatStream({ message: 'test' })
    for await (const chunk of gen) {
      chunks.push(chunk)
    }

    expect(chunks).toHaveLength(3)
    expect(chunks[0].type).toBe('content_start')
    expect(chunks[1].type).toBe('content_chunk')
    expect(chunks[1].data.content).toBe('Hello')
    expect(chunks[2].type).toBe('done')
  })

  it('should parse SSE with only data lines (backward compat)', async () => {
    const sseData = [
      'data: {"type":"chunk","content":"Hi"}',
      '',
      'data: [DONE]',
      '',
    ].join('\n')

    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(sseData))
        controller.close()
      },
    })

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      body: stream,
    } as Response)

    const client = new MoonHubClient('http://localhost:18800')
    client.setAuthToken('token')

    const chunks: any[] = []
    const gen = client.chatStream({ message: 'test' })
    for await (const chunk of gen) {
      chunks.push(chunk)
    }

    expect(chunks).toHaveLength(2)
    expect(chunks[0].data.content).toBe('Hi')
    expect(chunks[1].type).toBe('done')
  })
})
