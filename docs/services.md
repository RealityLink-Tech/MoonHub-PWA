**Documentation Index**: [README.md](./README.md)

# Services Layer

PWA service layer for API communication, device discovery, storage, and hardware access.

## Overview

The services layer provides abstraction over:
- **MoonHub API**: Communication with MoonHub devices
- **Device Discovery**: LAN scanning for MoonHub devices
- **Storage**: IndexedDB persistence
- **Voice**: Speech recognition and synthesis

All services follow a singleton pattern with `getXxx()` accessor functions.

## Core Services

### MoonHubClient

API client for MoonHub device communication.

**File**: `src/services/device.ts`

```typescript
import { MoonHubClient, createClient, getClient } from '@/services/device'

// Create new client
const client = createClient('http://192.168.1.100:18800', 'auth-token')

// Get current connected client
const currentClient = getClient()
```

#### API Methods

| Method | Endpoint | Description |
|--------|----------|-------------|
| `ping()` | `GET /api/ping` | Device online check |
| `getDeviceStatus()` | `GET /api/status` | Device status info |
| `pair(authCode)` | `POST /api/pair` | Pair with auth code |
| `verifyToken()` | `GET /api/verify` | Validate current token |
| `chat(request)` | `POST /api/chat` | Synchronous chat |
| `chatStream(request)` | `POST /api/chat` | Streaming chat |
| `getConfig()` | `GET /api/config` | Get device config |
| `updateConfig(config)` | `PUT /api/config` | Update device config |

#### Usage Examples

```typescript
// Ping device
const result = await client.ping()
if (result.success) {
  console.log('Device is online')
}

// Get device status
const status = await client.getDeviceStatus()
console.log('Device:', status.data.name)
console.log('Version:', status.data.version)

// Pair with auth code
const pairResult = await client.pair('XM8888')
if (pairResult.success) {
  console.log('Token:', pairResult.data.token)
}

// Synchronous chat
const chatResult = await client.chat({ message: 'Hello' })
console.log('Response:', chatResult.data.response)

// Streaming chat
for await (const chunk of client.chatStream({ message: 'Hello' })) {
  console.log('Chunk:', chunk.content)
}
```

### DeviceDiscovery

LAN device discovery service.

**File**: `src/services/discovery.ts`

```typescript
import { DeviceDiscovery, getDiscovery } from '@/services/discovery'

const discovery = getDiscovery()
```

#### Methods

| Method | Description |
|--------|-------------|
| `scan(options)` | Scan for devices |
| `abort()` | Abort current scan |
| `isScanning()` | Check scan status |

#### Scan Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `timeout` | number | 5000 | Scan timeout (ms) |
| `onDeviceFound` | function | - | Callback when device found |
| `onProgress` | function | - | Progress callback |

#### Usage Examples

```typescript
// Basic scan
const devices = await discovery.scan({ timeout: 5000 })
for (const device of devices) {
  console.log(`Found: ${device.name} at ${device.ip}`)
}

// Scan with callbacks
const devices = await discovery.scan({
  timeout: 10000,
  onDeviceFound: (device) => {
    console.log(`Found device: ${device.name}`)
  },
  onProgress: (progress) => {
    console.log(`Progress: ${progress.scanned}/${progress.total}`)
  },
})

// Abort scan
discovery.abort()
```

#### Discovery Flow

1. Get local IP via WebRTC
2. Calculate subnet IP range
3. Scan common ports in parallel
4. Call `/api/ping` on each address
5. Retrieve device details on success

### StorageService

IndexedDB persistence service.

**File**: `src/services/storage.ts`

```typescript
import { StorageService, getStorage } from '@/services/storage'

const storage = getStorage()
```

#### Methods

| Method | Description |
|--------|-------------|
| `init()` | Initialize database |
| `saveDevice(device)` | Save paired device |
| `getDevice(id)` | Get device by ID |
| `getAllDevices()` | Get all devices |
| `deleteDevice(id)` | Delete device |
| `saveConversation(conv)` | Save conversation |
| `getConversationsByDevice(id)` | Get device conversations |
| `deleteConversation(id)` | Delete conversation |
| `saveMessage(message)` | Save message |
| `getMessagesByConversation(id)` | Get conversation messages |
| `setSetting(key, value)` | Save setting |
| `getSetting(key)` | Get setting |
| `clear()` | Clear all data |

#### Database Structure

| Store | Key | Indices | Description |
|-------|-----|---------|-------------|
| `devices` | `id` | - | Paired devices |
| `conversations` | `id` | `deviceId` | Conversations |
| `messages` | `id` | `conversationId` | Messages |
| `spaces` | `id` | - | Space data |
| `settings` | `key` | - | App settings |

#### Usage Examples

```typescript
// Initialize (auto-called on import)
await storage.init()

// Device operations
await storage.saveDevice({
  id: 'device-1',
  name: 'Living Room',
  ip: '192.168.1.100',
  token: 'xxx',
})
const device = await storage.getDevice('device-1')
const allDevices = await storage.getAllDevices()
await storage.deleteDevice('device-1')

// Conversation operations
await storage.saveConversation({
  id: 'conv-1',
  deviceId: 'device-1',
  title: 'First chat',
})
const convs = await storage.getConversationsByDevice('device-1')

// Settings
await storage.setSetting('theme', 'dark')
const theme = await storage.getSetting<string>('theme')
```

### VoiceService

Speech recognition and synthesis service.

**File**: `src/services/voice.ts`

```typescript
import { VoiceService, getVoice } from '@/services/voice'

const voice = getVoice()
```

#### Methods

| Method | Description |
|--------|-------------|
| `startRecording()` | Start speech recognition |
| `stopRecording()` | Stop and get result |
| `speak(text)` | Text-to-speech |
| `stopSpeaking()` | Stop playback |
| `isSupported()` | Check browser support |

#### Usage Examples

```typescript
// Check support
if (!voice.isSupported()) {
  console.log('Speech not supported')
}

// Record and transcribe
await voice.startRecording()
// ... user speaks ...
const result = await voice.stopRecording()
console.log('Transcription:', result.transcription)

// Text-to-speech
await voice.speak('Hello, world!')
```

## Response Format

All API methods return a unified response format:

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
}
```

## Error Handling

```typescript
const result = await client.pair('XM8888')

if (!result.success) {
  console.error('Error:', result.error?.code)
  console.error('Message:', result.error?.message)
  return
}

// Success
console.log('Token:', result.data?.token)
```

## Singleton Pattern

All services use singleton pattern:

```typescript
// Get singleton instances
const client = getClient()
const discovery = getDiscovery()
const storage = getStorage()
const voice = getVoice()
```

## Related Documentation

- [State Management](./stores.md)
- [Hooks](./hooks.md)
- [LAN Discovery](./lan-discovery.md)
- [src/services/README.md](../src/services/README.md)
