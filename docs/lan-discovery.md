# MoonHub PWA 设备发现实现文档

> 状态: ✅ 已完成
> 版本: 1.0
> 更新日期: 2026-03-25

## 概述

本文档描述 MoonHub PWA 端的设备发现功能实现。由于浏览器安全限制，PWA 无法直接使用 mDNS，因此采用 HTTP 扫描方式发现局域网设备。

## 相关文件

```
MoonHub-PWA/src/
├── services/
│   ├── discovery.ts    # 设备发现服务
│   └── device.ts       # MoonHub API 客户端
├── hooks/
│   └── useDevice.ts    # 设备管理 Hook
├── stores/
│   └── device.ts       # 设备状态管理
└── types/
    └── index.ts        # 类型定义
```

## 1. 设备发现服务 (`services/discovery.ts`)

### 1.1 DeviceDiscovery 类

```typescript
export class DeviceDiscovery {
  private abortController: AbortController | null = null
  private foundDevices: Map<string, Device> = new Map()

  async scan(options?: DiscoveryOptions): Promise<Device[]>
  abort(): void
  isScanning(): boolean
}
```

### 1.2 扫描选项

```typescript
interface DiscoveryOptions {
  timeout?: number           // 扫描超时（默认 5000ms）
  onDeviceFound?: (device: Device) => void  // 发现设备回调
  onProgress?: (progress: DiscoveryProgress) => void  // 进度回调
}

interface DiscoveryProgress {
  scanned: number    // 已扫描数量
  total: number      // 总数量
  currentRange: string  // 当前扫描 IP
}
```

### 1.3 扫描端口

```typescript
const COMMON_PORTS = [8080, 3000, 8000, 5000, 9000]
```

> 注：MoonHub 默认使用 18800 端口，但 PWA 需要配置文件中指定

### 1.4 扫描流程

```
1. 获取本机 IP（WebRTC）
   ↓
2. 计算网段范围
   ↓
3. 并行扫描所有 IP:Port 组合
   ↓
4. 对每个地址调用 /api/ping
   ↓
5. 成功响应则调用 /api/system/info
   ↓
6. 返回设备列表
```

### 1.5 本机 IP 获取

使用 WebRTC 获取本地 IP 地址：

```typescript
private async getLocalIP(): Promise<string | null> {
  const pc = new RTCPeerConnection({ iceServers: [] })
  pc.createDataChannel('')

  pc.createOffer()
    .then(offer => pc.setLocalDescription(offer))

  pc.onicecandidate = (event) => {
    // 解析 candidate 中的 IP
    // 仅返回私网 IP (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
  }
}
```

## 2. MoonHub 客户端 (`services/device.ts`)

### 2.1 MoonHubClient 类

```typescript
export class MoonHubClient {
  private baseUrl: string
  private authToken?: string

  constructor(baseUrl: string, authToken?: string)

  // 设备发现
  async ping(meta?: MoonHubRequestMeta): Promise<ApiResponse<{version: string, name: string}>>
  async getDeviceStatus(meta?: MoonHubRequestMeta): Promise<ApiResponse<SystemInfo>>

  // 认证
  async pair(authCode: string): Promise<ApiResponse<{token: string, device: PairedDevice}>>
  async verifyToken(): Promise<ApiResponse<{valid: boolean}>>

  // 其他 API...
}
```

### 2.2 请求选项

```typescript
interface MoonHubRequestMeta {
  timeoutMs?: number  // 请求超时
}
```

### 2.3 Token 传输

Token 通过 `Authorization: Bearer <token>` 头传输：

```typescript
if (this.authToken) {
  headers['Authorization'] = `Bearer ${this.authToken}`
}
```

## 3. 设备状态管理 (`stores/device.ts`)

### 3.1 DeviceState

```typescript
interface DeviceState {
  // 发现的设备（临时）
  discoveredDevices: Device[]
  isScanning: boolean
  scanProgress: { scanned: number; total: number } | null

  // 已配对设备（持久化）
  pairedDevices: PairedDevice[]

  // 当前连接
  currentDevice: PairedDevice | null
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error'
  connectionError: string | null

  // Actions
  setDiscoveredDevices: (devices: Device[]) => void
  addDiscoveredDevice: (device: Device) => void
  clearDiscoveredDevices: () => void
  setScanning: (scanning: boolean) => void
  setScanProgress: (progress: { scanned: number; total: number } | null) => void

  pairDevice: (device: PairedDevice) => Promise<void>
  unpairDevice: (deviceId: string) => Promise<void>
  loadPairedDevices: () => Promise<void>

  connect: (device: PairedDevice) => void
  disconnect: () => void
  setConnectionStatus: (status: DeviceState['connectionStatus'], error?: string) => void
}
```

### 3.2 持久化

使用 Zustand 的 persist 中间件，仅持久化 `pairedDevices`：

```typescript
persist(
  (set) => ({ /* ... */ }),
  {
    name: 'moonhub-devices',
    partialize: (state) => ({
      pairedDevices: state.pairedDevices,
    }),
  }
)
```

## 4. 设备 Hook (`hooks/useDevice.ts`)

### 4.1 扫描设备

```typescript
const scanForDevices = useCallback(async () => {
  const discovery = getDiscovery()

  if (isScanning) {
    discovery.abort()
    setScanning(false)
    return
  }

  clearDiscoveredDevices()
  setScanning(true)

  try {
    const devices = await discovery.scan({
      onDeviceFound: (device) => {
        addDiscoveredDevice(device)
      },
      onProgress: (progress) => {
        setScanProgress({
          scanned: progress.scanned,
          total: progress.total,
        })
      },
    })
    setDiscoveredDevices(devices)
  } finally {
    setScanning(false)
    setScanProgress(null)
  }
}, [/* deps */])
```

### 4.2 配对设备

```typescript
const pairWithDevice = useCallback(
  async (device: Device, authCode: string) => {
    const client = createClient(`http://${device.address}`)
    const response = await client.pair(authCode)

    if (response.success && response.data) {
      const pairedDevice: PairedDevice = {
        ...device,
        authToken: response.data.token,
        pairedAt: Date.now(),
      }
      await pairDevice(pairedDevice)
      return { success: true }
    }

    return { success: false, error: response.error?.message }
  },
  [pairDevice]
)
```

### 4.3 连接设备

```typescript
const connectToDevice = useCallback(
  async (device: PairedDevice) => {
    connect(device)

    const client = createClient(`http://${device.address}`, device.authToken)
    const response = await client.verifyToken()

    if (response.success && response.data?.valid) {
      setConnectionStatus('connected')
      return { success: true }
    }

    setConnectionStatus('error', 'Token invalid')
    return { success: false, error: 'Token 无效，请重新配对' }
  },
  [connect, setConnectionStatus]
)
```

## 5. 类型定义 (`types/index.ts`)

### 5.1 Device

```typescript
export interface Device {
  id: string
  name: string
  address: string  // IP:Port
  version: string
  status: DeviceStatus
  lastSeen: number
  capabilities: DeviceCapability[]
}

export type DeviceStatus = 'online' | 'offline' | 'pairing' | 'error'

export type DeviceCapability =
  | 'chat'
  | 'voice'
  | 'image'
  | 'space'
  | 'tools'
  | 'multi_agent'
```

### 5.2 PairedDevice

```typescript
export interface PairedDevice extends Device {
  authToken: string
  pairedAt: number
  alias?: string
}
```

## 6. 存储服务 (`services/storage.ts`)

### 6.1 IndexedDB 存储

```typescript
export class StorageService {
  async saveDevice(device: PairedDevice): Promise<void>
  async getDevice(id: string): Promise<PairedDevice | undefined>
  async getAllDevices(): Promise<PairedDevice[]>
  async deleteDevice(id: string): Promise<void>
}
```

### 6.2 数据库结构

```typescript
const DB_NAME = 'moonhub-pwa'
const DB_VERSION = 1

// Object Stores:
// - devices: PairedDevice (keyPath: 'id')
// - conversations: Conversation
// - messages: Message
// - spaces: Space
// - settings: { key, value }
```

## 7. 使用示例

```typescript
import { useDevice } from '@/hooks/useDevice'

function DeviceList() {
  const {
    discoveredDevices,
    pairedDevices,
    isScanning,
    scanProgress,
    scanForDevices,
    pairWithDevice,
    connectToDevice,
  } = useDevice()

  const handleScan = () => {
    scanForDevices()
  }

  const handlePair = async (device: Device, code: string) => {
    const result = await pairWithDevice(device, code)
    if (result.success) {
      console.log('配对成功')
    }
  }

  return (
    <div>
      <button onClick={handleScan} disabled={isScanning}>
        {isScanning ? `扫描中 (${scanProgress?.scanned}/${scanProgress?.total})` : '扫描设备'}
      </button>

      <ul>
        {discoveredDevices.map(device => (
          <li key={device.id}>
            {device.name} ({device.address})
          </li>
        ))}
      </ul>
    </div>
  )
}
```

## 8. 性能优化

### 8.1 并发控制

限制并发扫描数量避免网络拥塞：

```typescript
if (scanPromises.length >= 50) {
  await Promise.allSettled(scanPromises)
  scanPromises.length = 0
}
```

### 8.2 超时控制

```typescript
function abortAfter(ms: number): AbortSignal {
  if (typeof AbortSignal.timeout === 'function') {
    return AbortSignal.timeout(ms)
  }
  // Fallback for older browsers
  const c = new AbortController()
  setTimeout(() => c.abort(), ms)
  return c.signal
}
```

## 9. 已知限制

1. **无法直接使用 mDNS**: 浏览器不支持 mDNS 协议
2. **扫描速度**: 需要逐个 IP 扫描，速度较慢
3. **跨域限制**: 需要服务端配置 CORS
4. **HTTPS 要求**: 生产环境需要 HTTPS

## 10. 测试验证

```bash
# 启动 MoonHub 服务端
cd MoonHub && make dev

# 启动 PWA 开发服务器
cd MoonHub-PWA && pnpm dev

# 在浏览器中测试
# 1. 打开 http://localhost:5173
# 2. 点击"扫描设备"
# 3. 观察控制台输出
```

## 11. 相关文档

- [MoonHub 局域网发现实现](../../../MoonHub/docs/implementation/lan-discovery-status.md)
- [MoonHub 配对认证实现](../../../MoonHub/docs/implementation/lan-pairing-status.md)
- [Phase 1 总体文档](../../Cooking/moonhub-lan/phase1-mdns-pairing.md)
