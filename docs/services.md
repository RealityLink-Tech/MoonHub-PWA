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
| `getDeviceStatus()` | `GET /api/system/info` | System / device info |
| `discoverDevices()` | `GET /api/discover` | mDNS discovery on the device’s LAN (LAN-only on server; caller must reach device IP) |
| `getPairedDevices()` | `GET /api/devices` | List paired clients stored on the device |
| `pair(authCode)` | `POST /api/auth/pair` | Pair with auth code (`{ "code": "..." }`) |
| `verifyToken()` | `POST /api/auth/verify` | Validate current token (`Authorization: Bearer` set by client) |
| `chat(request)` | `POST /api/chat` | Synchronous chat |
| `chatStream(request)` | `POST /api/chat/stream` | Streaming chat (SSE-style lines) |
| `generateSpace(request)` | `POST /api/space/generate` | Generate Space layout |
| `getSpace(spaceId)` | `GET /api/space/:id` | Fetch Space by id |
| `getGatewayStatus()` | `GET /api/gateway/status` | Gateway status |
| `startGateway()` / `stopGateway()` | `POST /api/gateway/start` · `POST /api/gateway/stop` | Control gateway |
| `subscribeToGatewayEvents(onEvent, onError?)` | `GET /api/gateway/events` (SSE via `EventSource`) | Live gateway events; returns unsubscribe |
| `getConfig()` | `GET /api/config` | Get device config |
| `updateConfig(config)` | `PATCH /api/config` | Partial config update |
| `getChannels()` | `GET /api/channels` | List configured channel instances |
| `createChannel(data)` | `POST /api/channels` | Add channel instance |
| `updateChannel(id, data)` | `PATCH /api/channels/{id}` | Update channel config |
| `deleteChannel(id)` | `DELETE /api/channels/{id}` | Remove channel instance |
| `getChannelStatus(id)` | `GET /api/channels/{id}/status` | Runtime status for one channel |
| `getChannelCatalog()` | `GET /api/channels/catalog` | Channel type catalog |
| `listDynamicTools(source?)` | `GET /api/dynamic-tools` | List AI / dynamic tools (`?source=ai`) |
| `generateDynamicTool(prompt, context?)` | `POST /api/dynamic-tools/generate` | Create or dedupe tool from prompt (`context`: `chat` / `space`) |
| `executeDynamicTool(id, params, mode?)` | `POST /api/dynamic-tools/{id}/execute` | Run tool; `mode` `chat` or `space` |
| `getDynamicToolSchema(id, mode?)` | `GET /api/dynamic-tools/{id}/schema` | Fetch schema for rendering |
| `deleteDynamicTool(id)` | `DELETE /api/dynamic-tools/{id}` | Remove tool |
| `setDynamicToolOnHome(id, onHome)` | `PATCH /api/dynamic-tools/{id}/home` | Pin on Space home (`on_home` in body) |
| `getSkills()` | `GET /api/skills` | List skills |
| `installSkill(skillUrl)` | `POST /api/skills` | Install skill from URL |
| `getModels()` | `GET /api/models` | List models |
| `setDefaultModel(modelName)` | `POST /api/models/default` | Set default model |
| `updateModel` / `addModel` / `deleteModel` | `/api/models/...` | Extended model CRUD (see `device.ts`) |

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

### Dynamic tools (`dynamicToolsService`)

High-level wrapper over `MoonHubClient` dynamic-tool methods. Used by Space home, Space detail, and Space add flows.

**File**: `src/services/dynamicTools.ts`

```typescript
import { dynamicToolsService } from '@/services/dynamicTools'

const list = await dynamicToolsService.list('ai')
const gen = await dynamicToolsService.generate('Weather for my city', 'space')
const exec = await dynamicToolsService.execute(toolId, {}, 'space')
```

| Method | Maps to |
| --- | --- |
| `list(source?)` | `listDynamicTools` |
| `generate(prompt, context?)` | `generateDynamicTool` |
| `execute(id, params?, mode?)` | `executeDynamicTool` |
| `getSchema(id, mode?)` | `getDynamicToolSchema` |
| `delete(id)` | `deleteDynamicTool` |
| `setOnHome(id, onHome)` | `setDynamicToolOnHome` |

Backend reference: MoonHub [`web/backend/api/README.md`](../../MoonHub/web/backend/api/README.md) (`/api/dynamic-tools`).

### DeviceDiscovery

LAN device discovery service: **parallel HTTP scan** of the inferred subnet and a small set of ports (including **18800**, the MoonHub web default). This avoids relying on browser mDNS. When you already have a `MoonHubClient` pointed at a device, you can alternatively call **`discoverDevices()`** to use the server’s **mDNS** implementation (`GET /api/discover`).

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
| `isRecognitionSupported()` / `isSynthesisSupported()` | Browser capability checks |
| `startRecognition(options)` / `stopRecognition()` | Web Speech recognition with callbacks |
| `speak(text, options?)` / `stopSpeaking()` | TTS |
| `pauseSpeaking()` / `resumeSpeaking()` / `isSpeaking()` | Playback control |
| `getVoices()` | Available synthesis voices |
| `startAudioRecording()` / `recordAudio(maxDuration?)` | `MediaRecorder` helpers |
| `blobToBase64(blob)` | Encode audio for upload |

#### Usage Examples

```typescript
if (!voice.isRecognitionSupported()) {
  console.log('Recognition not supported')
}

voice.startRecognition({
  language: 'zh-CN',
  interimResults: true,
  onResult: (text, isFinal) => console.log(text, isFinal),
  onError: (msg) => console.error(msg),
})
// … later …
voice.stopRecognition()

voice.speak('Hello', { onEnd: () => console.log('done') })
```

### componentRecommendation (Space)

Stub service for the Space “add component” flow: returns mock recommendations until a backend API exists.

**File**: `src/services/componentRecommendation.ts`

```typescript
import { componentRecommendation } from '@/services/componentRecommendation'

const { components } = await componentRecommendation.getRecommendations('optional context')
await componentRecommendation.addComponent(spaceId, 'weather')
```

| Member | Description |
|--------|-------------|
| `getRecommendations(context?)` | Returns `RecommendedComponent[]` (mock) |
| `addComponent(spaceId, type)` | Placeholder success |
| `removeComponent(spaceId, componentId)` | Placeholder success |
| `updateComponentConfig(spaceId, componentId, config)` | Placeholder success |

### Mock service (`mock.ts`)

Development / demo helpers. Import from `@/services/mock` when used in the app.

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
const client = getClient()
const discovery = getDiscovery()
const storage = getStorage()
const voice = getVoice()
// componentRecommendation is a plain object export (not a getXxx singleton)
```

## Related Documentation

- [State Management](./stores.md)
- [Hooks](./hooks.md)
- [LAN Discovery](./lan-discovery.md)
- [Architecture — dynamic tools](./ARCHITECTURE.md#动态工具与-dynamicrenderer)
- [MoonHub pkg/dynamictools](../../MoonHub/pkg/dynamictools/docs/README.md)
- [src/services/README.md](../src/services/README.md)
