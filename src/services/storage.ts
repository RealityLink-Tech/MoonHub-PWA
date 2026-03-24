// ============================================================
// Storage Service
// IndexedDB wrapper for offline data persistence
// ============================================================

import type { PairedDevice, Conversation, Message, Space, AppSettings } from '@/types'

const DB_NAME = 'moonhub-pwa'
const DB_VERSION = 1

interface DBSchema {
  devices: PairedDevice
  conversations: Conversation
  messages: Message
  spaces: Space
  settings: { key: string; value: unknown }
}

export class StorageService {
  private db: IDBDatabase | null = null
  private initPromise: Promise<IDBDatabase> | null = null

  async init(): Promise<IDBDatabase> {
    if (this.db) return this.db

    if (this.initPromise) return this.initPromise

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)

      request.onsuccess = () => {
        this.db = request.result
        resolve(this.db)
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Devices store
        if (!db.objectStoreNames.contains('devices')) {
          db.createObjectStore('devices', { keyPath: 'id' })
        }

        // Conversations store
        if (!db.objectStoreNames.contains('conversations')) {
          const conversationsStore = db.createObjectStore('conversations', { keyPath: 'id' })
          conversationsStore.createIndex('deviceId', 'deviceId', { unique: false })
          conversationsStore.createIndex('updatedAt', 'updatedAt', { unique: false })
        }

        // Messages store
        if (!db.objectStoreNames.contains('messages')) {
          const messagesStore = db.createObjectStore('messages', { keyPath: 'id' })
          messagesStore.createIndex('conversationId', 'conversationId', { unique: false })
          messagesStore.createIndex('timestamp', 'timestamp', { unique: false })
        }

        // Spaces store
        if (!db.objectStoreNames.contains('spaces')) {
          const spacesStore = db.createObjectStore('spaces', { keyPath: 'id' })
          spacesStore.createIndex('deviceId', 'deviceId', { unique: false })
        }

        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' })
        }
      }
    })

    return this.initPromise
  }

  private async getStore<K extends keyof DBSchema>(
    storeName: K,
    mode: IDBTransactionMode = 'readonly'
  ): Promise<IDBObjectStore> {
    const db = await this.init()
    const transaction = db.transaction(storeName, mode)
    return transaction.objectStore(storeName)
  }

  // ==================== Devices ====================

  async saveDevice(device: PairedDevice): Promise<void> {
    const store = await this.getStore('devices', 'readwrite')
    return new Promise((resolve, reject) => {
      const request = store.put(device)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getDevice(id: string): Promise<PairedDevice | undefined> {
    const store = await this.getStore('devices')
    return new Promise((resolve, reject) => {
      const request = store.get(id)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getAllDevices(): Promise<PairedDevice[]> {
    const store = await this.getStore('devices')
    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  async deleteDevice(id: string): Promise<void> {
    const store = await this.getStore('devices', 'readwrite')
    return new Promise((resolve, reject) => {
      const request = store.delete(id)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // ==================== Conversations ====================

  async saveConversation(conversation: Conversation): Promise<void> {
    const store = await this.getStore('conversations', 'readwrite')
    return new Promise((resolve, reject) => {
      const request = store.put(conversation)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    const store = await this.getStore('conversations')
    return new Promise((resolve, reject) => {
      const request = store.get(id)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getConversationsByDevice(deviceId: string): Promise<Conversation[]> {
    const store = await this.getStore('conversations')
    const index = store.index('deviceId')
    return new Promise((resolve, reject) => {
      const request = index.getAll(deviceId)
      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  async getAllConversations(): Promise<Conversation[]> {
    const store = await this.getStore('conversations')
    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => {
        const results = request.result || []
        // Sort by updatedAt descending
        results.sort((a, b) => b.updatedAt - a.updatedAt)
        resolve(results)
      }
      request.onerror = () => reject(request.error)
    })
  }

  async deleteConversation(id: string): Promise<void> {
    const store = await this.getStore('conversations', 'readwrite')
    return new Promise((resolve, reject) => {
      const request = store.delete(id)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // ==================== Messages ====================

  async saveMessage(message: Message): Promise<void> {
    const store = await this.getStore('messages', 'readwrite')
    return new Promise((resolve, reject) => {
      const request = store.put(message)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    const store = await this.getStore('messages')
    const index = store.index('conversationId')
    return new Promise((resolve, reject) => {
      const request = index.getAll(conversationId)
      request.onsuccess = () => {
        const results = request.result || []
        // Sort by timestamp ascending
        results.sort((a, b) => a.timestamp - b.timestamp)
        resolve(results)
      }
      request.onerror = () => reject(request.error)
    })
  }

  async deleteMessagesByConversation(conversationId: string): Promise<void> {
    const store = await this.getStore('messages', 'readwrite')
    const index = store.index('conversationId')
    return new Promise((resolve, reject) => {
      const request = index.openCursor(conversationId)
      request.onsuccess = () => {
        const cursor = request.result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        } else {
          resolve()
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  // ==================== Spaces ====================

  async saveSpace(space: Space): Promise<void> {
    const store = await this.getStore('spaces', 'readwrite')
    return new Promise((resolve, reject) => {
      const request = store.put(space)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getSpace(id: string): Promise<Space | undefined> {
    const store = await this.getStore('spaces')
    return new Promise((resolve, reject) => {
      const request = store.get(id)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getSpacesByDevice(deviceId: string): Promise<Space[]> {
    const store = await this.getStore('spaces')
    const index = store.index('deviceId')
    return new Promise((resolve, reject) => {
      const request = index.getAll(deviceId)
      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  async deleteSpace(id: string): Promise<void> {
    const store = await this.getStore('spaces', 'readwrite')
    return new Promise((resolve, reject) => {
      const request = store.delete(id)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // ==================== Settings ====================

  async getSetting<T>(key: string): Promise<T | undefined> {
    const store = await this.getStore('settings')
    return new Promise((resolve, reject) => {
      const request = store.get(key)
      request.onsuccess = () => {
        const result = request.result as { value: T } | undefined
        resolve(result?.value)
      }
      request.onerror = () => reject(request.error)
    })
  }

  async setSetting<T>(key: string, value: T): Promise<void> {
    const store = await this.getStore('settings', 'readwrite')
    return new Promise((resolve, reject) => {
      const request = store.put({ key, value })
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async deleteSetting(key: string): Promise<void> {
    const store = await this.getStore('settings', 'readwrite')
    return new Promise((resolve, reject) => {
      const request = store.delete(key)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // ==================== Utility ====================

  async clear(): Promise<void> {
    const db = await this.init()
    const storeNames = Array.from(db.objectStoreNames) as (keyof DBSchema)[]

    for (const storeName of storeNames) {
      const store = await this.getStore(storeName, 'readwrite')
      await new Promise<void>((resolve, reject) => {
        const request = store.clear()
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
    }
  }
}

// Singleton instance
let storageInstance: StorageService | null = null

export function getStorage(): StorageService {
  if (!storageInstance) {
    storageInstance = new StorageService()
  }
  return storageInstance
}

// Default settings
export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  language: 'zh-CN',
  notifications: {
    enabled: true,
    sound: true,
    vibration: true,
  },
  voice: {
    autoPlay: false,
    noiseSuppression: true,
  },
  network: {
    scanTimeout: 5000,
    apiTimeout: 30000,
    retryAttempts: 3,
  },
}
