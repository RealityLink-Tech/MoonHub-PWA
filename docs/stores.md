**Documentation Index**: [README.md](./README.md)

# State Management

PWA state management using Zustand with persistence support.

## Overview

The state layer uses Zustand for:
- **Global State**: Device, chat, settings
- **Persistence**: LocalStorage and IndexedDB
- **Type Safety**: Full TypeScript support

## Core Stores

### useDeviceStore

Device discovery, pairing, and connection state.

**File**: `src/stores/device.ts`

```typescript
import { useDeviceStore } from '@/stores'

// In component
function DevicePage() {
  const {
    discoveredDevices,
    pairedDevices,
    currentDevice,
    connectionStatus,
    isScanning,
  } = useDeviceStore()

  return (/* ... */)
}
```

#### State Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `discoveredDevices` | `Device[]` | `[]` | Discovered devices (temporary) |
| `pairedDevices` | `PairedDevice[]` | `[]` | Paired devices (persisted) |
| `currentDevice` | `PairedDevice \| null` | `null` | Current connection |
| `connectionStatus` | `string` | `'disconnected'` | Connection status |
| `isScanning` | `boolean` | `false` | Scanning in progress |
| `scanProgress` | `object \| null` | `null` | Scan progress info |

#### Actions

| Action | Signature | Description |
|--------|-----------|-------------|
| `setDiscoveredDevices` | `(devices: Device[]) => void` | Set discovered devices |
| `addDiscoveredDevice` | `(device: Device) => void` | Add discovered device |
| `clearDiscoveredDevices` | `() => void` | Clear discovered list |
| `pairDevice` | `(device: PairedDevice) => void` | Add paired device |
| `unpairDevice` | `(id: string) => void` | Remove paired device |
| `setCurrentDevice` | `(device: PairedDevice \| null) => void` | Set current device |
| `setConnectionStatus` | `(status: string) => void` | Set connection status |
| `setIsScanning` | `(scanning: boolean) => void` | Set scanning state |
| `setScanProgress` | `(progress: object \| null) => void` | Set scan progress |
| `connect` | `(device: PairedDevice) => Promise<void>` | Connect to device |
| `disconnect` | `() => void` | Disconnect current |

#### Persistence

- **Storage**: LocalStorage
- **Key**: `moonhub-devices`
- **Fields**: `pairedDevices`

### useChatStore

Conversation and message state.

**File**: `src/stores/chat.ts`

```typescript
import { useChatStore } from '@/stores'

function ChatPage() {
  const {
    conversations,
    currentConversationId,
    messages,
    isLoading,
    isStreaming,
    streamingContent,
  } = useChatStore()

  return (/* ... */)
}
```

#### State Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `conversations` | `Conversation[]` | `[]` | All conversations |
| `currentConversationId` | `string \| null` | `null` | Active conversation |
| `messages` | `Message[]` | `[]` | Current conversation messages |
| `isLoading` | `boolean` | `false` | Loading state |
| `isStreaming` | `boolean` | `false` | Streaming response |
| `streamingContent` | `string` | `''` | Streaming content buffer |

#### Actions

| Action | Signature | Description |
|--------|-----------|-------------|
| `setConversations` | `(convs: Conversation[]) => void` | Set conversations |
| `addConversation` | `(conv: Conversation) => void` | Add conversation |
| `deleteConversation` | `(id: string) => void` | Delete conversation |
| `setCurrentConversation` | `(id: string \| null) => void` | Set active |
| `setMessages` | `(messages: Message[]) => void` | Set messages |
| `addMessage` | `(message: Message) => void` | Add message |
| `clearMessages` | `() => void` | Clear messages |
| `sendMessage` | `(text: string) => Promise<void>` | Send message |
| `setStreaming` | `(streaming: boolean) => void` | Set streaming |
| `appendStreamContent` | `(content: string) => void` | Append stream |
| `clearStreamContent` | `() => void` | Clear stream |

### useSpaceStore

Space management state.

**File**: `src/stores/space.ts`

```typescript
import { useSpaceStore } from '@/stores'

function SpacePage() {
  const {
    spaces,
    currentSpace,
    isGenerating,
  } = useSpaceStore()

  return (/* ... */)
}
```

#### State Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `spaces` | `Space[]` | `[]` | All spaces |
| `currentSpace` | `Space \| null` | `null` | Active space |
| `isGenerating` | `boolean` | `false` | Generation in progress |

#### Actions

| Action | Signature | Description |
|--------|-----------|-------------|
| `setSpaces` | `(spaces: Space[]) => void` | Set spaces |
| `addSpace` | `(space: Space) => void` | Add space |
| `deleteSpace` | `(id: string) => void` | Delete space |
| `setCurrentSpace` | `(space: Space \| null) => void` | Set active |
| `updateSpace` | `(id: string, updates: Partial<Space>) => void` | Update space |
| `generateSpace` | `(prompt: string) => Promise<Space>` | Generate space |

### useSettingsStore

Application settings state.

**File**: `src/stores/settings.ts`

```typescript
import { useSettingsStore } from '@/stores'

function SettingsPage() {
  const {
    theme,
    language,
    notifications,
    voice,
    network,
  } = useSettingsStore()

  return (/* ... */)
}
```

#### State Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `theme` | `'light' \| 'dark' \| 'system'` | `'system'` | Theme mode |
| `language` | `string` | `'en'` | UI language |
| `notifications` | `NotificationSettings` | `{}` | Notification config |
| `voice` | `VoiceSettings` | `{}` | Voice config |
| `network` | `NetworkSettings` | `{}` | Network config |

#### Actions

| Action | Signature | Description |
|--------|-----------|-------------|
| `setTheme` | `(theme: string) => void` | Set theme |
| `setLanguage` | `(lang: string) => void` | Set language |
| `updateNotifications` | `(settings: Partial<NotificationSettings>) => void` | Update notifications |
| `updateVoice` | `(settings: Partial<VoiceSettings>) => void` | Update voice |
| `updateNetwork` | `(settings: Partial<NetworkSettings>) => void` | Update network |
| `reset` | `() => void` | Reset to defaults |

#### Persistence

- **Storage**: LocalStorage
- **Key**: `moonhub-settings`
- **Fields**: All settings

### useUIStore

UI state (non-persisted).

**File**: `src/stores/ui.ts`

```typescript
import { useUIStore } from '@/stores'

function App() {
  const {
    sidebarOpen,
    modalOpen,
    toasts,
  } = useUIStore()

  return (/* ... */)
}
```

#### State Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `sidebarOpen` | `boolean` | `true` | Sidebar visibility |
| `modalOpen` | `Record<string, boolean>` | `{}` | Modal states |
| `toasts` | `Toast[]` | `[]` | Toast notifications |

#### Actions

| Action | Signature | Description |
|--------|-----------|-------------|
| `toggleSidebar` | `() => void` | Toggle sidebar |
| `setSidebarOpen` | `(open: boolean) => void` | Set sidebar |
| `openModal` | `(id: string) => void` | Open modal |
| `closeModal` | `(id: string) => void` | Close modal |
| `closeAllModals` | `() => void` | Close all modals |
| `showToast` | `(toast: Omit<Toast, 'id'>) => void` | Show toast |
| `hideToast` | `(id: string) => void` | Hide toast |
| `clearToasts` | `() => void` | Clear all toasts |

## Persistence Strategy

### Persisted Stores

| Store | Storage | Key | Fields |
|-------|---------|-----|--------|
| `useDeviceStore` | LocalStorage | `moonhub-devices` | `pairedDevices` |
| `useSettingsStore` | LocalStorage | `moonhub-settings` | All settings |
| `useChatStore` | LocalStorage | `moonhub-chat` | `conversations` (optional) |

### Non-Persisted Stores

| Store | Reason |
|-------|--------|
| `useUIStore` | UI state resets on reload |
| `useSpaceStore` | Loaded from IndexedDB on demand |

### Persistence Implementation

```typescript
import { persist } from 'zustand/middleware'

export const useDeviceStore = create<DeviceState>()(
  persist(
    (set, get) => ({
      // state & actions
    }),
    {
      name: 'moonhub-devices',
      partialize: (state) => ({
        pairedDevices: state.pairedDevices,
      }),
    }
  )
)
```

## Usage Patterns

### In Components

```typescript
// Select specific state (optimized re-renders)
const pairedDevices = useDeviceStore((s) => s.pairedDevices)
const pairDevice = useDeviceStore((s) => s.pairDevice)

// Or destructure (may cause extra re-renders)
const { pairedDevices, pairDevice } = useDeviceStore()
```

### Outside Components

```typescript
import { useDeviceStore } from '@/stores'

// Get current state
const currentDevice = useDeviceStore.getState().currentDevice

// Update state
useDeviceStore.getState().setCurrentDevice(device)

// Subscribe to changes
const unsubscribe = useDeviceStore.subscribe((state) => {
  console.log('Device changed:', state.currentDevice)
})
```

### Multiple Stores

```typescript
function ChatPage() {
  const { currentDevice, isConnected } = useDeviceStore()
  const { messages, sendMessage } = useChatStore()
  const { theme } = useSettingsStore()

  if (!isConnected) {
    return <div>Please connect a device</div>
  }

  return (
    <div className={theme}>
      {/* ... */}
    </div>
  )
}
```

## Related Documentation

- [Services](./services.md)
- [Hooks](./hooks.md)
- [src/stores/README.md](../src/stores/README.md)
