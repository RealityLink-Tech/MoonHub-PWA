# MoonHub PWA

**Documentation index**: [`docs/README.md`](docs/README.md)

**Changelog**: [`CHANGELOG.md`](CHANGELOG.md)

**Backend & Device Runtime**: [`../MoonHub/README.md`](../MoonHub/README.md) — the MoonHub device project this app pairs with

**[中文文档](README_CN.md)**

## Introduction

> **Your AI assistant — instant, alive, connected.**

MoonHub PWA is the **companion app** for MoonHub AI assistant devices. It helps you pair in minutes, start talking right away, and use dynamic interfaces the agent builds for you. Your MoonHub device stays local-first; the PWA gives it an installable, offline-friendly front end for chat, voice, images, AI-generated cards, and **Space**.

## Core features

- **Device discovery** — Subnet HTTP scan (includes MoonHub default port **18800**) plus optional `GET /api/discover` via `MoonHubClient` when calling a device directly. See [`docs/lan-discovery.md`](docs/lan-discovery.md).
- **Secure pairing** — Bind with an authorization code from the device (`POST /api/auth/pair`). See [`docs/lan-pairing.md`](docs/lan-pairing.md).
- **Multimodal chat** — Text, voice (Web Speech + optional recording), and images; assistant replies rendered as **Markdown** (GFM); `system_notice` messages use a dedicated UI. See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).
- **Channels (settings)** — List/create/update/delete channel instances against MoonHub `/api/channels` APIs (LAN). See [`docs/services.md`](docs/services.md) and MoonHub [`web/backend/api/README.md`](../MoonHub/web/backend/api/README.md).
- **AI cards** — Rich structured replies from the model.
- **Space** — AI-generated dynamic layouts (core product surface); **dynamic tools** from MoonHub `/api/dynamic-tools` render via **DynamicRenderer** (chat + space component sets).
- **Settings** — Theme, notifications, device management.
- **PWA** — Installable, offline-friendly shell via `vite-plugin-pwa`.

### Architecture

```
┌─────────────────┐                    ┌─────────────────┐
│   MoonHub PWA   │  ◀── LAN ──▶      │  MoonHub device │
│   (this repo)   │                    │  (local API)    │
└─────────────────┘                    └─────────────────┘
        │
        │  HTTPS (e.g. CDN)
        ▼
   Installed PWA
```

**Security model**: The app is meant to reach devices on the **same LAN**. Remote access is typically via channels configured on the device (e.g. Telegram, Discord), not by exposing the device API to the public internet from the PWA alone.

## Quick start

```bash
pnpm install
pnpm dev          # development
pnpm build        # production build
pnpm preview      # preview build
pnpm typecheck
pnpm lint
```

## Tech stack

| Technology | Role |
|------------|------|
| React 19 | UI |
| TypeScript | Types |
| Vite 8 | Build |
| Tailwind CSS 4 | Styling |
| TanStack Router | Routing |
| Zustand | State |
| vite-plugin-pwa | PWA |
| Lucide React | Icons |
| Motion | Animation |
| react-markdown + remark-gfm | Chat Markdown rendering |

## Project layout

```
src/
├── components/     # chat/, space/, ui/, Layout
├── hooks/          # useDevice, useChat, useVoice, usePWA, useTheme, useAIUpdate
├── lib/            # utils
├── pages/          # Splash, discovery, pairing, Chat, Space, Settings, …
├── services/       # device, dynamicTools, discovery, storage, voice, mock, componentRecommendation
├── stores/         # device, chat, space, settings, ui
├── types/
├── App.tsx, AppInitializer.tsx, main.tsx, router.tsx, index.css
```

## Space (dynamic UI)

Supported component kinds (high level): `container`, `flex`, `grid`, `card`, `text`, `button`, `input`, `image`, `icon`, `metric`, `progress`, `list`, `chart`.

## AI card types

Examples: `weather`, `code`, `list`, `link`, `status`.

## Typical flow

1. Install the PWA (e.g. QR from device provisioning).
2. Open the app and discover devices on the LAN.
3. Enter the authorization code shown on the device to pair.
4. Chat; create **Space** UIs from natural language.

## Roadmap

**Phase 2** — Group chat, multi-agent collaboration, file transfer.

**Phase 3** — Plugin system, custom themes, cloud sync.

## Related

- [`../MoonHub/README.md`](../MoonHub/README.md) — device, backend, and product overview
- [`../MoonHub/docs/README.md`](../MoonHub/docs/README.md) — backend documentation index

## License

MIT
