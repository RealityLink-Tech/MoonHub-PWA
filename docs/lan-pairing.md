# MoonHub PWA 配对认证实现文档

> 状态: ✅ 已完成
> 版本: 1.0
> 更新日期: 2026-03-25

## 概述

本文档描述 MoonHub PWA 端的配对认证功能实现，包括授权码输入、Token 管理和连接验证。

## 相关文件

```
MoonHub-PWA/src/
├── services/
│   ├── device.ts      # MoonHub API 客户端 - 配对/验证接口
│   └── storage.ts     # IndexedDB 存储 - Token 持久化
├── hooks/
│   └── useDevice.ts   # 配对/连接逻辑
├── stores/
│   └── device.ts      # 设备状态管理
└── types/
    └── index.ts       # PairingRequest/PairingResponse 类型
```

## 1. 配对流程

```
┌─────────────┐                      ┌─────────────┐
│    PWA      │                      │  MoonHub    │
└──────┬──────┘                      └──────┬──────┘
       │                                    │
       │  1. 扫描发现设备                    │
       │ ─────────────────────────────────>│
       │     GET /api/ping                  │
       │ <─────────────────────────────────│
       │                                    │
       │  2. 用户在 MoonHub 设备上获取授权码  │
       │     (显示在设备屏幕/终端)            │
       │                                    │
       │  3. 用户在 PWA 中输入授权码          │
       │                                    │
       │  4. 请求配对                        │
       │ ─────────────────────────────────>│
       │     POST /api/auth/pair            │
       │     {code, deviceId, deviceName}   │
       │                                    │
       │  5. 返回 Token                      │
       │ <─────────────────────────────────│
       │     {token, device}                │
       │                                    │
       │  6. 存储 Token 到 IndexedDB         │
       │                                    │
       │  7. 验证连接                        │
       │ ─────────────────────────────────>│
       │     POST /api/auth/verify          │
       │     Authorization: Bearer <token>  │
       │ <─────────────────────────────────│
       │     {valid: true}                  │
       │                                    │
```

## 2. API 客户端 (`services/device.ts`)

### 2.1 配对方法

```typescript
async pair(authCode: string): Promise<ApiResponse<{token: string, device: PairedDevice}>> {
  return this.request('/api/auth/pair', {
    method: 'POST',
    body: JSON.stringify({ code: authCode }),
  })
}
```

**请求体字段**:

| 字段 | 必填 | 说明 |
|-----|-----|------|
| `code` | 是 | 6 位授权码（如 `XM8888`） |
| `deviceId` | 否 | 客户端设备 ID（默认自动生成） |
| `deviceName` | 否 | 客户端设备名称（默认自动生成） |

### 2.2 Token 验证方法

```typescript
async verifyToken(): Promise<ApiResponse<{valid: boolean}>> {
  return this.request('/api/auth/verify', { method: 'POST' })
}
```

MoonHub 后端为 **POST** `/api/auth/verify`；Token 通过 `Authorization` 头由 `request()` 自动附加：

```typescript
if (this.authToken) {
  headers['Authorization'] = `Bearer ${this.authToken}`
}
```

### 2.3 客户端初始化

```typescript
// 创建未认证客户端（用于配对）
const client = createClient(`http://${device.address}`)

// 创建已认证客户端（用于后续操作）
const client = createClient(`http://${device.address}`, device.authToken)
```

## 3. 配对 Hook (`hooks/useDevice.ts`)

### 3.1 pairWithDevice

```typescript
const pairWithDevice = useCallback(
  async (device: Device, authCode: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // 1. 创建未认证客户端
      const client = createClient(`http://${device.address}`)

      // 2. 发送配对请求
      const response = await client.pair(authCode)

      if (response.success && response.data) {
        // 3. 构造已配对设备对象
        const pairedDevice: PairedDevice = {
          ...device,
          authToken: response.data.token,
          pairedAt: Date.now(),
        }

        // 4. 持久化存储
        await pairDevice(pairedDevice)

        return { success: true }
      }

      return { success: false, error: response.error?.message || '配对失败' }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '配对失败'
      }
    }
  },
  [pairDevice]
)
```

### 3.2 unpairWithDevice

```typescript
const unpairWithDevice = useCallback(
  async (deviceId: string) => {
    await unpairDevice(deviceId)

    // 如果当前连接的是被解配的设备，断开连接
    if (currentDevice?.id === deviceId) {
      disconnect()
    }
  },
  [unpairDevice, currentDevice, disconnect]
)
```

## 4. 连接验证 (`hooks/useDevice.ts`)

### 4.1 connectToDevice

```typescript
const connectToDevice = useCallback(
  async (device: PairedDevice): Promise<{ success: boolean; error?: string }> => {
    // 1. 更新连接状态
    connect(device)

    try {
      // 2. 创建已认证客户端
      const client = createClient(`http://${device.address}`, device.authToken)

      // 3. 验证 Token
      const response = await client.verifyToken()

      if (response.success && response.data?.valid) {
        setConnectionStatus('connected')
        return { success: true }
      }

      // Token 无效
      setConnectionStatus('error', 'Token invalid')
      return { success: false, error: 'Token 无效，请重新配对' }
    } catch (error) {
      const message = error instanceof Error ? error.message : '连接失败'
      setConnectionStatus('error', message)
      return { success: false, error: message }
    }
  },
  [connect, setConnectionStatus]
)
```

### 4.2 disconnectFromDevice

```typescript
const disconnectFromDevice = useCallback(() => {
  getClient()?.abort()  // 中断所有进行中的请求
  disconnect()
}, [disconnect])
```

## 5. 状态管理 (`stores/device.ts`)

### 5.1 配对状态

```typescript
interface DeviceState {
  // 已配对设备列表（持久化）
  pairedDevices: PairedDevice[]

  // 当前连接
  currentDevice: PairedDevice | null
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error'
  connectionError: string | null

  // Actions
  pairDevice: (device: PairedDevice) => Promise<void>
  unpairDevice: (deviceId: string) => Promise<void>
  loadPairedDevices: () => Promise<void>

  connect: (device: PairedDevice) => void
  disconnect: () => void
  setConnectionStatus: (status: DeviceState['connectionStatus'], error?: string) => void
}
```

### 5.2 持久化实现

```typescript
export const useDeviceStore = create<DeviceState>()(
  persist(
    (set) => ({
      // ... state & actions
    }),
    {
      name: 'moonhub-devices',  // localStorage key
      partialize: (state) => ({
        pairedDevices: state.pairedDevices,  // 仅持久化配对设备
      }),
    }
  )
)
```

### 5.3 pairDevice Action

```typescript
pairDevice: async (device) => {
  // 1. 保存到 IndexedDB（持久化）
  const storage = getStorage()
  await storage.saveDevice(device)

  // 2. 更新状态
  set((state) => ({
    pairedDevices: [...state.pairedDevices, device],
  }))
},
```

## 6. 存储服务 (`services/storage.ts`)

### 6.1 设备存储

```typescript
export class StorageService {
  // 保存/更新设备
  async saveDevice(device: PairedDevice): Promise<void> {
    const store = await this.getStore('devices', 'readwrite')
    return new Promise((resolve, reject) => {
      const request = store.put(device)  // put 会覆盖已存在的记录
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // 获取所有设备
  async getAllDevices(): Promise<PairedDevice[]> {
    const store = await this.getStore('devices')
    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  // 删除设备
  async deleteDevice(id: string): Promise<void> {
    const store = await this.getStore('devices', 'readwrite')
    return new Promise((resolve, reject) => {
      const request = store.delete(id)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }
}
```

### 6.2 IndexedDB Schema

```typescript
const DB_NAME = 'moonhub-pwa'
const DB_VERSION = 1

// devices store
if (!db.objectStoreNames.contains('devices')) {
  db.createObjectStore('devices', { keyPath: 'id' })
}
```

## 7. 类型定义 (`types/index.ts`)

### 7.1 PairedDevice

```typescript
export interface PairedDevice extends Device {
  authToken: string     // 配对获取的 Token
  pairedAt: number      // 配对时间戳
  alias?: string        // 用户自定义别名
}
```

### 7.2 PairingRequest

```typescript
export interface PairingRequest {
  deviceAddress: string  // 设备地址 (IP:Port)
  authCode: string       // 授权码
}
```

### 7.3 PairingResponse

```typescript
export interface PairingResponse {
  success: boolean
  device: PairedDevice
  error?: string
}
```

## 8. 使用示例

### 8.1 配对新设备

```typescript
import { useDevice } from '@/hooks/useDevice'

function PairDevicePage() {
  const { discoveredDevices, pairWithDevice } = useDevice()
  const [authCode, setAuthCode] = useState('')
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)

  const handlePair = async () => {
    if (!selectedDevice || !authCode) return

    const result = await pairWithDevice(selectedDevice, authCode)
    if (result.success) {
      alert('配对成功！')
    } else {
      alert(`配对失败: ${result.error}`)
    }
  }

  return (
    <div>
      <select onChange={(e) => setSelectedDevice(discoveredDevices[e.target.value])}>
        {discoveredDevices.map((device, index) => (
          <option key={device.id} value={index}>
            {device.name} ({device.address})
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder="输入授权码"
        value={authCode}
        onChange={(e) => setAuthCode(e.target.value.toUpperCase())}
        maxLength={6}
      />

      <button onClick={handlePair}>配对</button>
    </div>
  )
}
```

### 8.2 连接已配对设备

```typescript
function DeviceList() {
  const { pairedDevices, connectToDevice, connectionStatus } = useDevice()

  const handleConnect = async (device: PairedDevice) => {
    const result = await connectToDevice(device)
    if (!result.success) {
      console.error('连接失败:', result.error)
    }
  }

  return (
    <ul>
      {pairedDevices.map((device) => (
        <li key={device.id}>
          {device.name}
          <button onClick={() => handleConnect(device)}>连接</button>
        </li>
      ))}
    </ul>
  )
}
```

### 8.3 解配设备

```typescript
function DeviceSettings() {
  const { pairedDevices, unpairWithDevice } = useDevice()

  const handleUnpair = async (deviceId: string) => {
    if (confirm('确定要解配此设备吗？')) {
      await unpairWithDevice(deviceId)
    }
  }

  return (
    <ul>
      {pairedDevices.map((device) => (
        <li key={device.id}>
          {device.name}
          <button onClick={() => handleUnpair(device.id)}>解配</button>
        </li>
      ))}
    </ul>
  )
}
```

## 9. 错误处理

### 9.1 常见错误码

| 错误 | 原因 | 处理方式 |
|-----|------|---------|
| `INVALID_CODE` | 授权码不正确 | 提示用户重新输入 |
| `CODE_EXPIRED` | 授权码已过期 | 提示用户获取新授权码 |
| `CODE_USED` | 授权码已使用 | 提示用户获取新授权码 |
| `NETWORK_ERROR` | 网络连接失败 | 检查网络连接 |
| `ABORTED` | 请求被取消 | 通常无需处理 |

### 9.2 Token 过期处理

```typescript
const connectToDevice = async (device: PairedDevice) => {
  const response = await client.verifyToken()

  if (!response.data?.valid) {
    // Token 已过期，提示用户重新配对
    return { success: false, error: 'Token 无效，请重新配对' }
  }
}
```

## 10. 安全考虑

### 10.1 Token 存储

- Token 存储在 IndexedDB（比 localStorage 更安全）
- 仅在同源环境下可访问
- 设备丢失时需物理访问才能获取 Token

### 10.2 传输安全

- 开发环境使用 HTTP（局域网）
- 生产环境建议使用 HTTPS
- Token 通过 Bearer 头传输（不暴露在 URL）

## 11. 测试验证

```bash
# 1. 启动 MoonHub 服务端
cd MoonHub && make dev

# 2. 获取授权码
curl http://127.0.0.1:18800/api/auth/status

# 3. 启动 PWA
cd MoonHub-PWA && pnpm dev

# 4. 在浏览器中测试
# - 打开 http://localhost:5173
# - 扫描设备
# - 输入授权码配对
# - 验证连接状态
```

## 12. 相关文档

- [MoonHub 配对认证实现](../../../MoonHub/docs/implementation/lan-pairing-status.md)
- [PWA 设备发现实现](./lan-discovery.md)
- [Phase 1 总体文档](../../Cooking/moonhub-lan/phase1-mdns-pairing.md)
