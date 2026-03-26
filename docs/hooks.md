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

Wraps `VoiceService`: Web Speech **recognition** (listen / transcript), **synthesis** (`speak`), plus optional **MediaRecorder** helpers for raw audio blobs.

**File**: `src/hooks/useVoice.ts`

```typescript
import { useVoice } from '@/hooks'

function VoiceBar() {
  const {
    isListening,
    isSpeaking,
    transcript,
    interimTranscript,
    error,
    isRecognitionSupported,
    startListening,
    stopListening,
    toggleListening,
    speak,
    stopSpeaking,
    startRecording,
    stopRecording,
  } = useVoice()

  return (/* ... */)
}
```

#### Return Values

| Field | Type | Description |
|-------|------|-------------|
| `isListening` | `boolean` | Recognition active |
| `isSpeaking` | `boolean` | TTS active |
| `transcript` | `string` | Last final recognition text |
| `interimTranscript` | `string` | In-progress recognition text |
| `error` | `string \| null` | Last error message |
| `isRecognitionSupported` / `isSynthesisSupported` | `boolean` | Browser support flags |
| `startListening` / `stopListening` / `toggleListening` | functions | Control recognition |
| `speak` / `stopSpeaking` | functions | TTS |
| `startRecording` | `() => Promise<boolean>` | Start `MediaRecorder` |
| `stopRecording` | `() => Promise<Blob \| null>` | Stop and get audio blob |
| `getVoices` / `blobToBase64` | functions | Voice list and encoding helper |

#### Usage Examples

```typescript
function VoiceButton() {
  const { isListening, transcript, toggleListening, speak } = useVoice()

  return (
    <div>
      <button onClick={toggleListening}>{isListening ? 'Stop' : 'Listen'}</button>
      {transcript && <p>{transcript}</p>}
      <button onClick={() => speak(transcript)}>Read aloud</button>
    </div>
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

Reserved hook for **per-component AI push updates** (WebSocket or SSE later). Currently logs placeholders and exposes a manual `requestUpdate` callback.

**File**: `src/hooks/useAIUpdate.ts`

```typescript
import { useAIUpdate } from '@/hooks'

function SpaceWidget({ componentId }: { componentId: string }) {
  const { requestUpdate } = useAIUpdate(componentId, (data) => {
    // Reserved: handle pushed payload
    console.log('update', data)
  })

  return <button onClick={requestUpdate}>Refresh from AI</button>
}
```

#### Parameters

| Param | Type | Description |
|-------|------|-------------|
| `componentId` | `string` | Component instance id for future subscription scope |
| `onUpdate` | `(data: unknown) => void` | Reserved push handler (not wired yet) |

#### Return Values

| Field | Type | Description |
|-------|------|-------------|
| `requestUpdate` | `() => void` | Reserved manual refresh trigger |

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
  const { isListening, transcript, toggleListening } = useVoice()
  const { sendMessage } = useChat()

  const handleSendTranscript = async () => {
    if (transcript) await sendMessage(transcript)
  }

  return (
    <div>
      <button onClick={toggleListening}>
        {isListening ? '🎤 Listening…' : '🎤 Tap to speak'}
      </button>
      <button onClick={handleSendTranscript} disabled={!transcript}>
        Send transcript
      </button>
    </div>
  )
}
```

## Related Documentation

- [Services](./services.md)
- [State Management](./stores.md)
- [src/hooks/README.md](../src/hooks/README.md)
