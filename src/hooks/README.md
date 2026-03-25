**Documentation Index**: [docs/README.md](../../docs/README.md)

# src/hooks - React Hooks

PWA custom hooks for reusable business logic.

## Overview

本目录包含所有自定义 React Hooks：
- **useDevice** - 设备管理
- **useChat** - 对话功能
- **useVoice** - 语音功能
- **useTheme** - 主题管理
- **usePWA** - PWA 功能
- **useAIUpdate** - AI 更新检测

## 文件结构

```
src/hooks/
├── index.ts        # 统一导出
├── useDevice.ts    # 设备管理 Hook
├── useChat.ts      # 对话功能 Hook
├── useVoice.ts     # 语音功能 Hook
├── useTheme.ts     # 主题管理 Hook
├── usePWA.ts       # PWA 功能 Hook
└── useAIUpdate.ts  # AI 更新检测 Hook
```

## 核心 Hooks

### useDevice

设备发现、配对和连接管理。

```typescript
import { useDevice } from '@/hooks'

function DevicePage() {
  const {
    // 状态
    discoveredDevices,   // 发现的设备
    pairedDevices,       // 已配对设备
    currentDevice,       // 当前连接
    connectionStatus,    // 连接状态
    isConnected,         // 是否已连接
    isScanning,          // 扫描中
    scanProgress,        // 扫描进度

    // 操作
    scanForDevices,      // 扫描设备
    pairWithDevice,      // 配对设备
    unpairWithDevice,    // 解配设备
    connectToDevice,     // 连接设备
    disconnectFromDevice, // 断开连接
    initialize,          // 初始化

    // 工具
    getClient,           // 获取 API 客户端
  } = useDevice()

  const handleScan = async () => {
    await scanForDevices()
  }

  const handlePair = async (device: Device, code: string) => {
    const result = await pairWithDevice(device, code)
    if (result.success) {
      console.log('配对成功')
    }
  }

  return (
    // ...
  )
}
```

**返回值**:

| 字段 | 类型 | 说明 |
|------|------|------|
| `discoveredDevices` | `Device[]` | 发现的设备 |
| `pairedDevices` | `PairedDevice[]` | 已配对设备 |
| `currentDevice` | `PairedDevice \| null` | 当前连接 |
| `connectionStatus` | `string` | 连接状态 |
| `isConnected` | `boolean` | 是否已连接 |
| `isScanning` | `boolean` | 扫描中 |
| `scanProgress` | `object \| null` | 扫描进度 |
| `scanForDevices` | `() => Promise<void>` | 扫描设备 |
| `pairWithDevice` | `(device, code) => Promise` | 配对设备 |
| `unpairWithDevice` | `(id) => Promise<void>` | 解配设备 |
| `connectToDevice` | `(device) => Promise` | 连接设备 |
| `disconnectFromDevice` | `() => void` | 断开连接 |
| `initialize` | `() => Promise<void>` | 初始化 |

### useChat

对话和消息管理。

```typescript
import { useChat } from '@/hooks'

function ChatPage() {
  const {
    // 状态
    conversations,       // 对话列表
    currentConversation, // 当前对话
    messages,            // 消息列表
    isLoading,           // 加载中
    isStreaming,         // 流式响应中
    streamingContent,    // 流式内容

    // 操作
    createConversation,  // 创建对话
    selectConversation,  // 选择对话
    deleteConversation,  // 删除对话
    sendMessage,         // 发送消息
    clearConversation,   // 清空对话

    // 流式响应
    startStreaming,      // 开始流式
    stopStreaming,       // 停止流式
  } = useChat()

  const handleSend = async (text: string) => {
    await sendMessage(text)
  }

  return (
    // ...
  )
}
```

### useVoice

语音输入和输出。

```typescript
import { useVoice } from '@/hooks'

function VoiceInput() {
  const {
    // 状态
    isRecording,         // 录音中
    isPlaying,           // 播放中
    transcription,       // 转录文本
    error,               // 错误信息

    // 操作
    startRecording,      // 开始录音
    stopRecording,       // 停止录音
    speak,               // 语音合成
    stopSpeaking,        // 停止播放
  } = useVoice()

  const handleRecord = async () => {
    if (isRecording) {
      const result = await stopRecording()
      console.log('转录:', result.transcription)
    } else {
      await startRecording()
    }
  }

  return (
    // ...
  )
}
```

### useTheme

主题切换。

```typescript
import { useTheme } from '@/hooks'

function ThemeToggle() {
  const {
    theme,               // 当前主题
    isDark,              // 是否暗色
    setTheme,            // 设置主题
    toggleTheme,         // 切换主题
  } = useTheme()

  return (
    <button onClick={toggleTheme}>
      {isDark ? '🌙' : '☀️'}
    </button>
  )
}
```

### usePWA

PWA 功能。

```typescript
import { usePWA } from '@/hooks'

function PWAStatus() {
  const {
    isInstalled,         // 已安装
    canInstall,          // 可安装
    isOnline,            // 在线
    updateAvailable,     // 有更新

    install,             // 安装
    update,              // 更新
  } = usePWA()

  return (
    <div>
      {!isOnline && <span>离线模式</span>}
      {canInstall && <button onClick={install}>安装应用</button>}
      {updateAvailable && <button onClick={update}>更新</button>}
    </div>
  )
}
```

### useAIUpdate

AI 更新检测。

```typescript
import { useAIUpdate } from '@/hooks'

function AIUpdateStatus() {
  const {
    hasUpdate,           // 有更新
    updateInfo,          // 更新信息
    checkUpdate,         // 检查更新
    applyUpdate,         // 应用更新
  } = useAIUpdate()

  return (
    // ...
  )
}
```

## 使用模式

### 组合使用

```typescript
import { useDevice, useChat } from '@/hooks'

function ChatPage() {
  const { currentDevice, isConnected } = useDevice()
  const { messages, sendMessage } = useChat()

  if (!isConnected) {
    return <div>请先连接设备</div>
  }

  return (
    <ChatView
      deviceName={currentDevice?.name}
      messages={messages}
      onSend={sendMessage}
    />
  )
}
```

### 条件渲染

```typescript
import { useDevice } from '@/hooks'

function DeviceStatus() {
  const { connectionStatus, currentDevice } = useDevice()

  switch (connectionStatus) {
    case 'disconnected':
      return <DisconnectedView />
    case 'connecting':
      return <LoadingView />
    case 'connected':
      return <ConnectedView device={currentDevice} />
    case 'error':
      return <ErrorView />
    default:
      return null
  }
}
```

## Related Documentation

- [Hooks Reference](../../docs/hooks.md) - Detailed hooks documentation
- [Architecture](../../docs/ARCHITECTURE.md) - PWA architecture overview
- [State Management](../../docs/stores.md) - Store documentation
- [Services](../../docs/services.md) - Service layer documentation
