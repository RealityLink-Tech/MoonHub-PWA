// src/services/__tests__/device.test.ts
//
// Task 15: MoonHubClient unit tests
// Tests pairing, chat, verifyToken, and error handling.
// Adapted from plan to match actual ChatRequest type (uses `message` field, not `content`).
// The `request()` method returns ApiResponse<T> with success/data/error shape,
// and handles 401 (TOKEN_EXPIRED), network errors, and plain-string error formats.

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MoonHubClient } from '../device'

describe('MoonHubClient', () => {
  let client: MoonHubClient

  beforeEach(() => {
    client = new MoonHubClient('http://localhost:18800')
    vi.restoreAllMocks()
  })

  describe('pair', () => {
    it('should normalize backend response with nested data', async () => {
      // request() wraps json() output as { success: true, data: <json result> },
      // so the mock json() should return the raw backend response body.
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          token: 'test-token-123',
          tokenExpiresAt: '2026-12-31T00:00:00Z',
          device: { id: 'device-456', name: 'MoonHub' },
        }),
      } as Response)

      const result = await client.pair('472831')
      expect(result.success).toBe(true)
      expect(result.data?.token).toBe('test-token-123')
      expect(result.data?.device_id).toBe('device-456')
    })

    it('should handle pairing failure', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve({
          success: false,
          error: { message: 'invalid code', code: 'PAIRING_INVALID' },
        }),
      } as Response)

      const result = await client.pair('000000')
      expect(result.success).toBe(false)
      expect(result.error?.message).toBeTruthy()
    })
  })

  describe('chat', () => {
    it('should send POST /api/chat with auth header', async () => {
      client.setAuthToken('test-token')
      // request() wraps json() output as { success: true, data: <json result> }
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          content: 'Hello!',
          session_id: 'sess-1',
        }),
      } as Response)

      // ChatRequest uses `message` field (see src/types/api.ts)
      const result = await client.chat({ message: '你好' })
      expect(result.success).toBe(true)
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'http://localhost:18800/api/chat',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        }),
      )
    })
  })

  describe('verifyToken', () => {
    it('should validate existing token', async () => {
      client.setAuthToken('valid-token')
      // request() wraps json() output as { success: true, data: <json result> }
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          valid: true,
          deviceId: 'dev-1',
        }),
      } as Response)

      const result = await client.verifyToken()
      expect(result.success).toBe(true)
      expect(result.data?.valid).toBe(true)
    })
  })

  describe('error handling', () => {
    it('should handle network errors', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'))

      const result = await client.ping()
      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('NETWORK_ERROR')
    })

    it('should parse error with { error: { message } } format', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () => Promise.resolve({
          success: false,
          error: { message: 'token expired', code: 'TOKEN_EXPIRED' },
        }),
      } as Response)

      // 401 triggers special handling in request() that clears authToken
      // and returns error.code === 'TOKEN_EXPIRED'
      const result = await client.getConfig()
      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('TOKEN_EXPIRED')
    })

    it('should parse error with plain string error format', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve({
          success: false,
          error: 'invalid request',
        }),
      } as Response)

      // request() handles typeof error === 'string' by using it as message
      const result = await client.getConfig()
      expect(result.success).toBe(false)
      expect(result.error?.message).toBeTruthy()
    })
  })
})
