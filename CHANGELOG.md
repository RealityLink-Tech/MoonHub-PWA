# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Documentation - 2026-03-30

- **Dynamic tools** — `docs/README.md` (subsystem table, `dynamicToolsService` in quick ref), `docs/services.md` (MoonHubClient + `dynamicToolsService`), `docs/ARCHITECTURE.md` (API list, `DynamicRenderer`, folder layout). `src/services/README.md` — `dynamicTools.ts`. Root READMEs — Space + dynamic tools line.

### Added / fixed - 2026-03-29

- **Client ↔ API alignment** — `pair()` uses `POST /api/auth/pair`; `verifyToken()` uses `POST /api/auth/verify`. Subnet discovery scans **18800** first (MoonHub default).
- **Documentation** — `docs/README.md` (chat UI pointers, tech stack), `docs/services.md` (full `MoonHubClient` table + discovery notes), `docs/ARCHITECTURE.md` (Markdown/SystemNotice, endpoint list, backend link), `docs/lan-discovery.md` (mDNS API vs browser scan, port list). `src/services/README.md` updated to match.

### Documentation - 2026-03-27

- **README split** — English `README.md` and Chinese `README_CN.md` (MoonHub-style cross-links, docs + changelog pointers at top).
- **Docs index** (`docs/README.md`) — Tech stack and project layout aligned with React 19 / Vite 8 / TanStack Router; fixed entry-point table (no `src/services/index.ts`); added `componentRecommendation`, `useAIUpdate`; dev commands use `pnpm`.
- **Services** (`docs/services.md`) — `MoonHubClient` paths and methods match `device.ts` (auth, system info, Space, gateway SSE, skills, models); documented `componentRecommendation` and mock service.
- **Hooks** (`docs/hooks.md`, `src/hooks/README.md`) — `useAIUpdate` and `useVoice` match implementation; Voice + chat examples updated.
- **Voice service** (`docs/services.md`, `src/services/README.md`) — `VoiceService` method names aligned with `voice.ts`.
- **Architecture** (`docs/ARCHITECTURE.md`) — Project tree, API list, and Motion in stack.

### Added - 2026-03-25

#### Phase 1: Device Discovery & Pairing

- **Device Discovery** - HTTP-based LAN scanning for MoonHub devices
- **Secure Pairing** - Authorization code flow with token persistence
- **IndexedDB Storage** - Offline-capable paired device storage
- **Zustand State Management** - Device state with persistence
- **Documentation** - Complete implementation guides for all Phase 1 features
