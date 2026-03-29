# MoonHub-PWA Documentation Index

This page is the **entry point and reading guide** for the PWA frontend documentation.

## Recommended Reading Order (First Time)

1. [Architecture Overview](./ARCHITECTURE.md) — PWA architecture, tech stack, design decisions, and backend endpoint summary
2. [LAN Discovery](./lan-discovery.md) — Device discovery implementation (HTTP subnet scan + optional mDNS client helpers)
3. [LAN Pairing](./lan-pairing.md) — Device pairing flow
4. [Services](./services.md) — Service layer API reference (`MoonHubClient` paths aligned with MoonHub `web/backend/api`)
5. [State Management](./stores.md) — Zustand stores reference
6. [Hooks](./hooks.md) — Custom React hooks reference

**Chat UI**: assistant text uses [`MarkdownRenderer`](../src/components/MarkdownRenderer.tsx) (react-markdown + remark-gfm); `system_notice` messages use [`SystemNotice`](../src/components/SystemNotice.tsx) on the Chat page—see [ARCHITECTURE.md](./ARCHITECTURE.md#对话与消息呈现).

**Dynamic tools**: [`dynamicToolsService`](../src/services/dynamicTools.ts) + [`DynamicRenderer`](../src/components/space/DynamicRenderer.tsx) and `components/chat/dynamic` / `components/space/dynamic`—see [ARCHITECTURE.md](./ARCHITECTURE.md#动态工具与-dynamicrenderer) and [services.md](./services.md).

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

### Dynamic UI (AI tools)

| Order | Document | Description |
| --- | --- | --- |
| 1 | [ARCHITECTURE.md](./ARCHITECTURE.md) | `DynamicRenderer`, chat/space dynamic folders, Space pages |
| 2 | [services.md](./services.md) | `dynamicToolsService` and `MoonHubClient` `/api/dynamic-tools` methods |
| 3 | MoonHub [`web/backend/api/README.md`](../../MoonHub/web/backend/api/README.md) | Authoritative HTTP contract |

## Project Structure

```
MoonHub-PWA/
├── src/
│   ├── components/     # React components (chat/dynamic, space/dynamic, DynamicRenderer)
│   ├── hooks/          # Custom hooks (`index.ts` re-exports)
│   ├── lib/            # Shared utilities (e.g. `utils.ts`)
│   ├── pages/          # Route-level pages
│   ├── services/       # API clients and services (per-file imports)
│   ├── stores/         # Zustand state stores
│   ├── types/          # TypeScript definitions
│   ├── App.tsx         # Root component
│   ├── AppInitializer.tsx
│   ├── router.tsx      # TanStack Router tree
│   ├── main.tsx        # Entry
│   └── index.css
├── public/             # Static assets
├── docs/               # Documentation
├── index.html
├── vite.config.ts
└── tsconfig.json
```

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React 19 | UI framework |
| TypeScript | Type safety |
| Vite 8 | Build tool |
| TanStack Router | Routing |
| Zustand | State management |
| Tailwind CSS 4 | Styling |
| vite-plugin-pwa / workbox-window | PWA install and updates |
| Motion | UI animation |
| Lucide React | Icons |
| react-markdown + remark-gfm | Chat assistant Markdown rendering |

## Quick Reference

### Entry Points

| File | Description |
|------|-------------|
| `src/main.tsx` | Application entry |
| `src/App.tsx` | Root component |
| `src/router.tsx` | Route definitions |
| `src/stores/index.ts` | Store re-exports |
| `src/hooks/index.ts` | Hook re-exports |

### Key Services

| Service | File | Purpose |
|---------|------|---------|
| MoonHubClient | `device.ts` | API communication (incl. `discoverDevices` / `getPairedDevices` / channel CRUD / **dynamic tools**) |
| `dynamicToolsService` | `dynamicTools.ts` | List, generate, execute, schema, delete, pin dynamic tools |
| DeviceDiscovery | `discovery.ts` | LAN HTTP port scan (WebRTC subnet; includes default port **18800**) |
| StorageService | `storage.ts` | IndexedDB persistence |
| VoiceService | `voice.ts` | Speech recognition/synthesis |
| componentRecommendation | `componentRecommendation.ts` | Space “add component” suggestions (stub / mock until API) |

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
| useAIUpdate | `useAIUpdate.ts` | Stub for future AI push updates (per-component subscription) |

## Development Commands

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Typecheck + lint (see package.json)
pnpm typecheck
pnpm lint
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
