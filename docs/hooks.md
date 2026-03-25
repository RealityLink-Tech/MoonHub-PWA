**Documentation Index**: [README.md](./README.md)

# Custom Hooks

PWA custom React hooks for reusable business logic.

## Overview

The hooks layer provides:
- **State Integration**: Connects stores and services
- **Business Logic**: Encapsulated operations
- **Type Safety**: Full TypeScript support

## Core Hooks

### useDevice

Device discovery, pairing, and connection management.

**File**: `src/hooks/useDevice.ts`

```typescript
import { useDevice } from '@/hooks'

function DevicePage() {
  const {
    discoveredDevices,
    pairedDevices,
    currentDevice,
    connectionStatus,
    isConnected,
    isScanning,
    scanProgress,
    scanForDevices,
    pairWithDevice,
    unpairWithDevice,
    connectToDevice,
    disconnectFromDevice,
    initialize,
    getClient,
  } = useDevice()

  return (/* ... */)
}
```

#### Return Values

| Field | Type | Description |
|-------|------|-------------|
| `discoveredDevices` | `Device[]` | Found devices |
| `pairedDevices` | `PairedDevice[]` | Paired devices |
| `currentDevice` | `PairedDevice \| null` | Current connection |
| `connectionStatus` | `string` | Connection status |
| `isConnected` | `boolean` | Connected flag |
| `isScanning` | `boolean` | Scanning flag |
| `scanProgress` | `object \| null` | Scan progress |
| `scanForDevices` | `() => Promise<void>` | Start scan |
| `pairWithDevice` | `(device, code) => Promise<PairResult>` | Pair device |
| `unpairWithDevice` | `(id) => Promise<void>` | Unpair device |
| `connectToDevice` | `(device) => Promise<ConnectResult>` | Connect |
| `disconnectFromDevice` | `() => void` | Disconnect |
| `initialize` | `() => Promise<void>` | Initialize hook |
| `getClient` | `() => MoonHubClient \| null` | Get API client |

#### Usage Examples

```typescript
function DeviceManager() {
  const {
    isScanning,
    discoveredDevices,
    scanForDevices,
    pairWithDevice,
  } = useDevice()

  const handleScan = async () => {
    await scanForDevices()
  }

  const handlePair = async (device: Device, code: string) => {
    const result = await pairWithDevice(device, code)
    if (result.success) {
      console.log('Paired successfully')
    }
  }

  return (
    <div>
      <button onClick={handleScan} disabled={isScanning}>
        {isScanning ? 'Scanning...' : 'Scan'}
      </button>
      {discoveredDevices.map((device) => (
        <DeviceCard key={device.id} device={device} onPair={handlePair} />
      ))}
    </div>
  )
}
```

### useChat

Conversation and message management.

**File**: `src/hooks/useChat.ts`

```typescript
import { useChat } from '@/hooks'

function ChatPage() {
  const {
    conversations,
    currentConversation,
    messages,
    isLoading,
    isStreaming,
    streamingContent,
    createConversation,
    selectConversation,
    deleteConversation,
    sendMessage,
    clearConversation,
    startStreaming,
    stopStreaming,
  } = useChat()

  return (/* ... */)
}
```

#### Return Values

| Field | Type | Description |
|-------|------|-------------|
| `conversations` | `Conversation[]` | All conversations |
| `currentConversation` | `Conversation \| null` | Active conversation |
| `messages` | `Message[]` | Current messages |
| `isLoading` | `boolean` | Loading flag |
| `isStreaming` | `boolean` | Streaming flag |
| `streamingContent` | `string` | Stream buffer |
| `createConversation` | `() => Promise<Conversation>` | Create new |
| `selectConversation` | `(id: string) => void` | Select conversation |
| `deleteConversation` | `(id: string) => Promise<void>` | Delete |
| `sendMessage` | `(text: string) => Promise<void>` | Send message |
| `clearConversation` | `() => void` | Clear messages |
| `startStreaming` | `() => void` | Start stream |
| `stopStreaming` | `() => void` | Stop stream |

#### Usage Examples

```typescript
function ChatView() {
  const {
    messages,
    isStreaming,
    streamingContent,
    sendMessage,
  } = useChat()

  const [input, setInput] = useState('')

  const handleSend = async () => {
    if (!input.trim()) return
    await sendMessage(input)
    setInput('')
  }

  return (
    <div>
      <MessageList messages={messages} />
      {isStreaming && <StreamingMessage content={streamingContent} />}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
      />
    </div>
  )
}
```

### useVoice

Speech recognition and synthesis.

**File**: `src/hooks/useVoice.ts`

```typescript
import { useVoice } from '@/hooks'

function VoiceInput() {
  const {
    isRecording,
    isPlaying,
    transcription,
    error,
    startRecording,
    stopRecording,
    speak,
    stopSpeaking,
  } = useVoice()

  return (/* ... */)
}
```

#### Return Values

| Field | Type | Description |
|-------|------|-------------|
| `isRecording` | `boolean` | Recording flag |
| `isPlaying` | `boolean` | Playing flag |
| `transcription` | `string` | Last transcription |
| `error` | `string \| null` | Error message |
| `startRecording` | `() => Promise<void>` | Start recording |
| `stopRecording` | `() => Promise<TranscriptionResult>` | Stop and get result |
| `speak` | `(text: string) => Promise<void>` | Text-to-speech |
| `stopSpeaking` | `() => void` | Stop playback |

#### Usage Examples

```typescript
function VoiceButton() {
  const {
    isRecording,
    transcription,
    startRecording,
    stopRecording,
  } = useVoice()

  const handleClick = async () => {
    if (isRecording) {
      const result = await stopRecording()
      console.log('Transcription:', result.transcription)
    } else {
      await startRecording()
    }
  }

  return (
    <button onClick={handleClick}>
      {isRecording ? 'Stop' : 'Record'}
    </button>
  )
}
```

### useTheme

Theme switching and detection.

**File**: `src/hooks/useTheme.ts`

```typescript
import { useTheme } from '@/hooks'

function ThemeToggle() {
  const {
    theme,
    isDark,
    setTheme,
    toggleTheme,
  } = useTheme()

  return (/* ... */)
}
```

#### Return Values

| Field | Type | Description |
|-------|------|-------------|
| `theme` | `'light' \| 'dark' \| 'system'` | Current theme |
| `isDark` | `boolean` | Is dark mode |
| `setTheme` | `(theme: string) => void` | Set theme |
| `toggleTheme` | `() => void` | Toggle light/dark |

#### Usage Examples

```typescript
function ThemeButton() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button onClick={toggleTheme}>
      {isDark ? '🌙' : '☀️'}
    </button>
  )
}
```

### usePWA

PWA features and status.

**File**: `src/hooks/usePWA.ts`

```typescript
import { usePWA } from '@/hooks'

function PWAStatus() {
  const {
    isInstalled,
    canInstall,
    isOnline,
    updateAvailable,
    install,
    update,
  } = usePWA()

  return (/* ... */)
}
```

#### Return Values

| Field | Type | Description |
|-------|------|-------------|
| `isInstalled` | `boolean` | Installed as PWA |
| `canInstall` | `boolean` | Can be installed |
| `isOnline` | `boolean` | Online status |
| `updateAvailable` | `boolean` | Update available |
| `install` | `() => Promise<void>` | Trigger install |
| `update` | `() => void` | Apply update |

#### Usage Examples

```typescript
function PWAInstallPrompt() {
  const { canInstall, install } = usePWA()

  if (!canInstall) return null

  return (
    <div className="install-prompt">
      <p>Install the app for a better experience</p>
      <button onClick={install}>Install</button>
    </div>
  )
}

function OfflineIndicator() {
  const { isOnline } = usePWA()

  if (isOnline) return null

  return (
    <div className="offline-banner">
      You are offline
    </div>
  )
}
```

### useAIUpdate

AI model update detection.

**File**: `src/hooks/useAIUpdate.ts`

```typescript
import { useAIUpdate } from '@/hooks'

function AIUpdateStatus() {
  const {
    hasUpdate,
    updateInfo,
    checkUpdate,
    applyUpdate,
  } = useAIUpdate()

  return (/* ... */)
}
```

#### Return Values

| Field | Type | Description |
|-------|------|-------------|
| `hasUpdate` | `boolean` | Update available |
| `updateInfo` | `UpdateInfo \| null` | Update details |
| `checkUpdate` | `() => Promise<void>` | Check for updates |
| `applyUpdate` | `() => Promise<void>` | Apply update |

## Usage Patterns

### Combining Hooks

```typescript
import { useDevice, useChat } from '@/hooks'

function ChatPage() {
  const { currentDevice, isConnected } = useDevice()
  const { messages, sendMessage } = useChat()

  if (!isConnected) {
    return <div>Please connect a device first</div>
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

### Conditional Rendering

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

### Event Handling

```typescript
import { useVoice, useChat } from '@/hooks'

function VoiceChat() {
  const { isRecording, startRecording, stopRecording } = useVoice()
  const { sendMessage } = useChat()

  const handleVoiceInput = async () => {
    if (isRecording) {
      const result = await stopRecording()
      if (result.transcription) {
        await sendMessage(result.transcription)
      }
    } else {
      await startRecording()
    }
  }

  return (
    <button onClick={handleVoiceInput}>
      {isRecording ? '🎤 Recording...' : '🎤 Tap to speak'}
    </button>
  )
}
```

## Related Documentation

- [Services](./services.md)
- [State Management](./stores.md)
- [src/hooks/README.md](../src/hooks/README.md)
