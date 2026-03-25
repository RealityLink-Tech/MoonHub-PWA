# MoonHub-PWA Documentation Index

This page is the **entry point and reading guide** for the PWA frontend documentation.

## Recommended Reading Order (First Time)

1. [Architecture Overview](./ARCHITECTURE.md) — PWA architecture, tech stack, and design decisions
2. [LAN Discovery](./lan-discovery.md) — Device discovery implementation
3. [LAN Pairing](./lan-pairing.md) — Device pairing flow
4. [Services](./services.md) — Service layer API reference
5. [State Management](./stores.md) — Zustand stores reference
6. [Hooks](./hooks.md) — Custom React hooks reference

## Documentation by Subsystem

### LAN Communication

| Order | Document | Description |
| --- | --- | --- |
| 1 | [lan-discovery.md](./lan-discovery.md) | Device discovery via LAN scanning |
| 2 | [lan-pairing.md](./lan-pairing.md) | Authorization code pairing flow |

### Services Layer

| Order | Document | Description |
| --- | --- | --- |
| 1 | [services.md](./services.md) | Service layer overview and API reference |
| 2 | [src/services/README.md](../src/services/README.md) | Quick reference for services directory |

### State Management

| Order | Document | Description |
| --- | --- | --- |
| 1 | [stores.md](./stores.md) | Zustand stores overview and state structures |
| 2 | [src/stores/README.md](../src/stores/README.md) | Quick reference for stores directory |

### Hooks

| Order | Document | Description |
| --- | --- | --- |
| 1 | [hooks.md](./hooks.md) | Custom React hooks reference |
| 2 | [src/hooks/README.md](../src/hooks/README.md) | Quick reference for hooks directory |

## Project Structure

```
MoonHub-PWA/
├── src/
│   ├── components/     # React components
│   ├── hooks/          # Custom React hooks
│   ├── services/       # API clients and services
│   ├── stores/         # Zustand state stores
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   └── App.tsx         # Main application component
├── public/             # Static assets
├── docs/               # Documentation
├── index.html          # Entry HTML
├── vite.config.ts      # Vite configuration
└── tsconfig.json       # TypeScript configuration
```

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| TypeScript | Type safety |
| Vite | Build tool |
| Zustand | State management |
| Tailwind CSS | Styling |
| PWA | Offline support |

## Quick Reference

### Entry Points

| File | Description |
|------|-------------|
| `src/main.tsx` | Application entry |
| `src/App.tsx` | Root component |
| `src/services/index.ts` | Service exports |
| `src/stores/index.ts` | Store exports |
| `src/hooks/index.ts` | Hook exports |

### Key Services

| Service | File | Purpose |
|---------|------|---------|
| MoonHubClient | `device.ts` | API communication |
| DeviceDiscovery | `discovery.ts` | LAN scanning |
| StorageService | `storage.ts` | IndexedDB persistence |
| VoiceService | `voice.ts` | Speech recognition/synthesis |

### Key Stores

| Store | File | State |
|-------|------|-------|
| useDeviceStore | `device.ts` | Device state |
| useChatStore | `chat.ts` | Chat state |
| useSpaceStore | `space.ts` | Space state |
| useSettingsStore | `settings.ts` | App settings |
| useUIStore | `ui.ts` | UI state |

### Key Hooks

| Hook | File | Purpose |
|------|------|---------|
| useDevice | `useDevice.ts` | Device management |
| useChat | `useChat.ts` | Chat functionality |
| useVoice | `useVoice.ts` | Voice I/O |
| useTheme | `useTheme.ts` | Theme switching |
| usePWA | `usePWA.ts` | PWA features |

## Development Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Related Repositories

| Repository | Description |
|------------|-------------|
| MoonHub | Backend server |
| MoonHub-PWA | Frontend PWA |

## Related Documentation

- [MoonHub Backend Docs](../../MoonHub/docs/README.md)
- [LAN Discovery Status](../../MoonHub/docs/implementation/lan-discovery-status.md)
- [LAN Pairing Status](../../MoonHub/docs/implementation/lan-pairing-status.md)
