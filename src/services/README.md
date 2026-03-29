**Documentation Index**: [docs/README.md](../../docs/README.md)

# src/services - Service Layer

PWA service layer for API communication, device discovery, storage, and hardware access.

## Overview

本目录包含所有与后端交互和本地存储的服务模块：
- **device.ts** - MoonHub API 客户端
- **dynamicTools.ts** - 动态工具 API（`/api/dynamic-tools`）
- **discovery.ts** - 设备发现服务
- **storage.ts** - IndexedDB 存储服务
- **voice.ts** - 语音服务
- **mock.ts** - 模拟数据服务
- **componentRecommendation.ts** - Space 组件推荐（当前为预留 / Mock）

## 文件结构

```
src/services/
├── device.ts       # MoonHub API 客户端
├── dynamicTools.ts # 动态工具（generate / execute / schema）
├── discovery.ts    # 设备发现服务
├── storage.ts      # IndexedDB 存储
├── voice.ts        # 语音服务
├── mock.ts         # 模拟数据
└── componentRecommendation.ts  # 组件推荐
```

## 核心服务

### MoonHubClient (`device.ts`)

与 MoonHub 设备通信的 API 客户端。

```typescript
import { MoonHubClient, createClient } from '@/services/device'

// 创建客户端
const client = createClient('http://192.168.1.100:18800', 'auth-token')

// 设备发现
const pingResult = await client.ping()
const statusResult = await client.getDeviceStatus()

// 配对认证
const pairResult = await client.pair('XM8888')
const verifyResult = await client.verifyToken()

// 对话
const chatResult = await client.chat({ message: 'Hello' })
for await (const chunk of client.chatStream({ message: 'Hello' })) {
  console.log(chunk)
}

// 配置
const config = await client.getConfig()
await client.updateConfig({ theme: 'dark' })
```

**主要方法**:

| 方法 | 说明 |
|------|------|
| `ping()` | 设备在线检测 |
| `getDeviceStatus()` | 获取设备详细状态 |
| `discoverDevices()` | `GET /api/discover`（设备侧 mDNS） |
| `getPairedDevices()` | `GET /api/devices` |
| `pair(authCode)` | `POST /api/auth/pair` |
| `verifyToken()` | `POST /api/auth/verify`（Bearer 由客户端带上） |
| `chat(request)` | 同步对话 |
| `chatStream(request)` | 流式对话 |
| `getChannels()` / `createChannel` / `updateChannel` / `deleteChannel` / `getChannelStatus` / `getChannelCatalog` | 频道 CRUD 与目录 |
| `getConfig()` | 获取配置 |
| `updateConfig(config)` | `PATCH /api/config` 部分更新 |
| `listDynamicTools` / `generateDynamicTool` / `executeDynamicTool` 等 | `/api/dynamic-tools/*` |

### dynamicToolsService (`dynamicTools.ts`)

对 `getClient()` 返回的 `MoonHubClient` 的封装，供 Space 首页、详情与添加页使用。

```typescript
import { dynamicToolsService } from '@/services/dynamicTools'

await dynamicToolsService.list('ai')
await dynamicToolsService.generate('做一个天气卡片', 'space')
await dynamicToolsService.execute(toolId, {}, 'space')
```

详见 [docs/services.md](../../docs/services.md)。

### DeviceDiscovery (`discovery.ts`)

局域网设备发现服务。

```typescript
import { DeviceDiscovery, getDiscovery } from '@/services/discovery'

const discovery = getDiscovery()

// 扫描设备
const devices = await discovery.scan({
  timeout: 5000,
  onDeviceFound: (device) => {
    console.log('Found:', device.name)
  },
  onProgress: (progress) => {
    console.log(`Progress: ${progress.scanned}/${progress.total}`)
  },
})

// 中断扫描
discovery.abort()

// 检查扫描状态
if (discovery.isScanning()) {
  console.log('Scanning...')
}
```

**扫描流程**:
1. 通过 WebRTC 获取本机 IP
2. 计算同网段 IP 范围
3. 并行扫描常用端口
4. 对每个地址调用 `/api/ping`
5. 成功后获取设备详情

### StorageService (`storage.ts`)

IndexedDB 数据持久化服务。

```typescript
import { StorageService, getStorage } from '@/services/storage'

const storage = getStorage()

// 初始化（自动调用）
await storage.init()

// 设备管理
await storage.saveDevice(device)
const device = await storage.getDevice('device-id')
const devices = await storage.getAllDevices()
await storage.deleteDevice('device-id')

// 对话管理
await storage.saveConversation(conversation)
const conversations = await storage.getConversationsByDevice('device-id')
await storage.deleteConversation('conversation-id')

// 消息管理
await storage.saveMessage(message)
const messages = await storage.getMessagesByConversation('conversation-id')

// 设置管理
await storage.setSetting('theme', 'dark')
const theme = await storage.getSetting<string>('theme')

// 清空所有数据
await storage.clear()
```

**数据库结构**:

| Store | Key | 说明 |
|-------|-----|------|
| `devices` | `id` | 已配对设备 |
| `conversations` | `id` | 对话列表 |
| `messages` | `id` | 消息记录 |
| `spaces` | `id` | Space 数据 |
| `settings` | `key` | 应用设置 |

### VoiceService (`voice.ts`)

语音识别（`startRecognition` / `stopRecognition`）、合成（`speak` / `stopSpeaking`）、以及 `MediaRecorder` 辅助方法。

```typescript
import { getVoice } from '@/services/voice'

const voice = getVoice()

voice.startRecognition({
  language: 'zh-CN',
  onResult: (text, isFinal) => console.log(text, isFinal),
})
voice.stopRecognition()

voice.speak('Hello, world!')
```

## 单例模式

所有服务都使用单例模式，通过 `getXxx()` 函数获取实例：

```typescript
// 获取单例
const client = getClient()           // 当前连接的客户端
const discovery = getDiscovery()     // 发现服务
const storage = getStorage()         // 存储服务
const voice = getVoice()             // 语音服务
```

## 错误处理

所有 API 返回统一的响应格式：

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

## Related Documentation

- [Services Reference](../../docs/services.md) - Detailed service documentation
- [LAN Discovery](../../docs/lan-discovery.md) - Device discovery implementation
- [LAN Pairing](../../docs/lan-pairing.md) - Pairing flow implementation
- [Architecture](../../docs/ARCHITECTURE.md) - PWA architecture overview
