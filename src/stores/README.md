**Documentation Index**: [docs/README.md](../../docs/README.md)

# src/stores - State Management

PWA state management layer using Zustand for global state management.

## Overview

本目录包含所有全局状态 Store：
- **device.ts** - 设备状态（发现/配对/连接）
- **chat.ts** - 对话状态
- **space.ts** - Space 状态
- **settings.ts** - 应用设置
- **ui.ts** - UI 状态

## 文件结构

```
src/stores/
├── index.ts        # 统一导出
├── device.ts       # 设备状态
├── chat.ts         # 对话状态
├── space.ts        # Space 状态
├── settings.ts     # 应用设置
└── ui.ts           # UI 状态
```

## 核心 Store

### useDeviceStore (`device.ts`)

设备发现、配对和连接状态。

```typescript
import { useDeviceStore } from '@/stores'

// 在组件中使用
function DeviceList() {
  const {
    // 状态
    discoveredDevices,  // 发现的设备
    pairedDevices,      // 已配对设备
    currentDevice,      // 当前连接
    connectionStatus,   // 连接状态
    isScanning,         // 扫描中

    // 操作
    setDiscoveredDevices,
    pairDevice,
    unpairDevice,
    connect,
    disconnect,
  } = useDeviceStore()

  return (
    // ...
  )
}
```

**状态**:

| 字段 | 类型 | 说明 |
|------|------|------|
| `discoveredDevices` | `Device[]` | 发现的设备（临时） |
| `pairedDevices` | `PairedDevice[]` | 已配对设备（持久化） |
| `currentDevice` | `PairedDevice \| null` | 当前连接设备 |
| `connectionStatus` | `string` | 连接状态 |
| `isScanning` | `boolean` | 是否正在扫描 |
| `scanProgress` | `object \| null` | 扫描进度 |

**持久化**: `pairedDevices` 自动持久化到 localStorage。

### useChatStore (`chat.ts`)

对话和消息状态。

```typescript
import { useChatStore } from '@/stores'

function ChatPage() {
  const {
    // 状态
    conversations,      // 对话列表
    currentConversation, // 当前对话
    messages,           // 当前对话消息
    isLoading,          // 加载中
    isStreaming,        // 流式响应中

    // 操作
    addConversation,
    deleteConversation,
    addMessage,
    sendMessage,
    clearMessages,
  } = useChatStore()

  return (
    // ...
  )
}
```

**状态**:

| 字段 | 类型 | 说明 |
|------|------|------|
| `conversations` | `Conversation[]` | 对话列表 |
| `currentConversationId` | `string \| null` | 当前对话 ID |
| `messages` | `Message[]` | 当前对话消息 |
| `isLoading` | `boolean` | 是否加载中 |
| `isStreaming` | `boolean` | 是否流式响应中 |
| `streamingContent` | `string` | 流式响应内容 |

### useSpaceStore (`space.ts`)

Space 空间状态。

```typescript
import { useSpaceStore } from '@/stores'

function SpacePage() {
  const {
    // 状态
    spaces,             // Space 列表
    currentSpace,       // 当前 Space
    isGenerating,       // 生成中

    // 操作
    generateSpace,
    loadSpace,
    updateSpace,
    deleteSpace,
  } = useSpaceStore()

  return (
    // ...
  )
}
```

### useSettingsStore (`settings.ts`)

应用设置状态。

```typescript
import { useSettingsStore } from '@/stores'

function SettingsPage() {
  const {
    // 状态
    theme,              // 主题
    language,           // 语言
    notifications,      // 通知设置
    voice,              // 语音设置
    network,            // 网络设置

    // 操作
    setTheme,
    setLanguage,
    updateNotifications,
    updateVoice,
    updateNetwork,
  } = useSettingsStore()

  return (
    // ...
  )
}
```

**持久化**: 所有设置自动持久化到 localStorage。

### useUIStore (`ui.ts`)

UI 状态（非持久化）。

```typescript
import { useUIStore } from '@/stores'

function App() {
  const {
    // 状态
    sidebarOpen,        // 侧边栏展开
    modalOpen,          // 模态框状态
    toasts,             // Toast 列表

    // 操作
    toggleSidebar,
    openModal,
    closeModal,
    showToast,
    hideToast,
  } = useUIStore()

  return (
    // ...
  )
}
```

## 持久化

使用 Zustand 的 `persist` 中间件：

```typescript
import { persist } from 'zustand/middleware'

export const useDeviceStore = create<DeviceState>()(
  persist(
    (set) => ({
      // state & actions
    }),
    {
      name: 'moonhub-devices',  // localStorage key
      partialize: (state) => ({
        pairedDevices: state.pairedDevices,  // 仅持久化部分字段
      }),
    }
  )
)
```

**持久化的 Store**:
- `useDeviceStore`: `pairedDevices`
- `useSettingsStore`: 所有设置
- `useChatStore`: `conversations`（可选）

**不持久化的 Store**:
- `useUIStore`: UI 状态

## 使用模式

### 在组件中使用

```typescript
import { useDeviceStore, useChatStore } from '@/stores'

function MyComponent() {
  // 选择需要的状态
  const pairedDevices = useDeviceStore((s) => s.pairedDevices)
  const pairDevice = useDeviceStore((s) => s.pairDevice)

  // 或解构使用
  const { messages, sendMessage } = useChatStore()

  return (
    // ...
  )
}
```

### 在组件外使用

```typescript
import { useDeviceStore } from '@/stores'

// 获取状态
const currentDevice = useDeviceStore.getState().currentDevice

// 更新状态
useDeviceStore.getState().connect(device)

// 订阅变化
const unsubscribe = useDeviceStore.subscribe((state) => {
  console.log('Device changed:', state.currentDevice)
})
```

## Related Documentation

- [State Management Reference](../../docs/stores.md) - Detailed store documentation
- [Architecture](../../docs/ARCHITECTURE.md) - PWA architecture overview
- [Services](../../docs/services.md) - Service layer documentation
