# MoonHub PWA

**Documentation index**: [`docs/README.md`](docs/README.md)

**Changelog**: [`CHANGELOG.md`](CHANGELOG.md)

**[中文文档](README_CN.md)**

## Introduction

MoonHub PWA is a **progressive web app** for talking to MoonHub AI assistant devices on your local network: chat, voice, images, AI-generated cards, and **Space**—dynamic UIs built by the agent.

## Core features

- **Device discovery** — Scan the LAN for MoonHub devices. See [`docs/lan-discovery.md`](docs/lan-discovery.md).
- **Secure pairing** — Bind with an authorization code from the device. See [`docs/lan-pairing.md`](docs/lan-pairing.md).
- **Multimodal chat** — Text, voice (Web Speech + optional recording), and images.
- **AI cards** — Rich structured replies from the model.
- **Space** — AI-generated dynamic layouts (core product surface).
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

## Project layout

```
src/
├── components/     # chat/, space/, ui/, Layout
├── hooks/          # useDevice, useChat, useVoice, usePWA, useTheme, useAIUpdate
├── lib/            # utils
├── pages/          # Splash, discovery, pairing, Chat, Space, Settings, …
├── services/       # device, discovery, storage, voice, mock, componentRecommendation
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

- [MoonHub](https://github.com/RealityLink-Tech/MoonHub) — device and backend

## License

MIT
