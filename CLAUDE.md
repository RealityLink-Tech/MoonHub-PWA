# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Dev server on port 5174
pnpm build        # tsc + vite build
pnpm lint         # ESLint check
pnpm lint:fix     # ESLint auto-fix
pnpm typecheck    # TypeScript type check (no emit)
pnpm test         # Vitest (run once, pass with no tests)
pnpm check        # Full check: lint + typecheck + build
```

## Architecture

MoonHub PWA is a client for MoonHub AI assistant devices on the local network. The PWA discovers devices via LAN, pairs with them using an auth code, then provides chat (text/voice/images), AI cards, and dynamic "Space" UIs.

**Navigation** is handled in `App.tsx` via a `ViewType` state machine — not through TanStack Router routes. TanStack Router is only used for PWA URL handling (single `/` route). The `navigateTo(view)` callback switches between splash, chat, space, settings, device discovery/connection views.

**API layer** (`src/services/device.ts`): `MoonHubClient` class with singleton pattern (`getClient`/`createClient`/`disconnectClient`). Communicates with device backend via REST (`/api/*`) and WebSocket (`PicoWebSocket` for real-time chat). SSE for gateway events. Streaming chat uses SSE with `AsyncGenerator<StreamChunk>`.

**State management**: Zustand stores in `src/stores/`:
- `device.ts` — paired devices, connection status (persisted via zustand/middleware)
- `chat.ts` — conversations, messages, streaming state
- `space.ts` — dynamic UI components
- `settings.ts` — app settings
- `ui.ts` — UI state

All stores use `getStorage()` from `src/services/storage.ts` for persistence (IndexedDB/localStorage).

**Key services**:
- `discovery.ts` — LAN device scanning
- `storage.ts` — persistence abstraction
- `voice.ts` — Web Speech API integration
- `mock.ts` — dev mock data

**Path alias**: `@/*` maps to `./src/*`.

## Design System

### Design Tokens (Material Design 3)

Color tokens are defined as CSS custom properties in `src/index.css` via Tailwind `@theme`. All colors use the `--color-*` namespace and are consumed as Tailwind classes (e.g. `bg-primary`, `text-on-surface`):

| Token | Usage |
|---|---|
| `primary` / `primary-container` / `on-primary` | CTAs, key actions |
| `secondary` / `secondary-container` | Secondary elements |
| `tertiary` / `tertiary-container` | Accent highlights |
| `surface` / `surface-container-lowest` ~ `highest` | Card/container backgrounds (elevation hierarchy) |
| `on-surface` / `on-surface-variant` | Text on surface |
| `outline` / `outline-variant` | Borders, dividers |
| `error` / `error-container` | Destructive states |
| `background` / `on-background` | Page-level |

**Typography**: Manrope + Noto Sans SC. Font weights 200–800.

### Visual Style

- **Glass-morphism**: `glass-panel` class provides frosted background with `backdrop-filter: blur(12px)`. Used for TopAppBar, overlays.
- **Card system**: 4 variants — `glass-panel` (default), `card-elevated`, `card-filled`, `card-outlined`. Space components use large border-radius (`rounded-[2.5rem]`) with white/40 border.
- **Button gradient**: `btn-gradient` for primary gradient actions. `btn-glass` for frosted pill buttons.
- **Shadows**: Primary-tinted `box-shadow: 0 4px 24px rgb(80 96 112 / 0.08)`.
- **Micro-interactions**: `active:scale-[0.98]` on buttons, `hover:scale-[1.02]` on interactive cards.
- **Animations**: `motion/react` (`AnimatePresence`) for page transitions, Lucide icons for iconography.

### Component Patterns

**UI primitives** (`src/components/ui/`):
- Use `cn()` (clsx + tailwind-merge) for class composition
- Use `class-variance-authority` (cva) for variant management (e.g. `button-variants.ts`)
- Components accept `className` prop for extension
- `forwardRef` pattern for DOM-wrapping components
- Radix UI primitives for accessible interactive elements (Switch, Slot)

**GlassCard** (`GlassCard` / `GlassCardHeader` / `GlassCardContent` / `GlassCardFooter`): Compound component pattern for card layouts with header/content/footer sections.

**Button**: 10 variants (default, destructive, outline, secondary, ghost, link, gradient, glass, pill, pillOutline), 6 sizes (default, sm, lg, icon, iconSm, iconLg). Always use `buttonVariants` via cva — never hardcode button styles.

### Dynamic UI Generation — Edge Self-Evolving Architecture (Frontend Side)

Dynamic UI generation is the core product capability. AI generates logic and UI descriptions on edge devices; the PWA acts as a rendering terminal that receives JSON Schema and renders interactive interfaces. The entire system follows a capability-authorization model:

```
┌─────────────────────────────────────────────────────────┐
│  MoonHub Device (Go + Wasm)                             │
│  ┌──────────┐    ┌──────────┐    ┌───────────────────┐  │
│  │  Host    │    │  Bridge  │    │  Guest (Wasm)     │  │
│  │ HW/DB    │◀──▶│ Controlled│◀──▶│ AI-generated     │  │
│  │ LLM comm │    │ Functions │    │ logic + self-heal │  │
│  └──────────┘    └──────────┘    └───────────────────┘  │
│        │                                                │
│        │  Output: UI Schema (JSON)                       │
└────────┼────────────────────────────────────────────────┘
         │  WebSocket / SSE
         ▼
┌─────────────────────────────────────────────────────────┐
│  MoonHub PWA (Frontend)                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌───────────┐  │
│  │ Schema       │───▶│ Renderer     │───▶│ Pre-built │  │
│  │ Validation   │    │ DynamicRender│    │ Components│  │
│  └──────────────┘    └──────────────┘    └───────────┘  │
│        ▲                                                │
│        │  User interaction → API callback to device      │
└─────────────────────────────────────────────────────────┘
```

**Three-tier responsibility model**:

| Layer | Runtime | Responsibility | PWA Equivalent |
|---|---|---|---|
| Host | Go backend | Hardware management, database, LLM orchestration, Wasm runtime | `/api/*` endpoints |
| Guest | Wasm sandbox | AI-generated business logic, sandboxed execution | Frontend does not execute; consumes output only |
| Bridge | Host Functions | Controlled capability exposure (get_time, storage_write, etc.) | `componentRegistry` + WebSocket events |

**Core PWA principle**: The frontend never runs AI-generated code — it only renders pre-built components. The component library defines the UI capability boundary available to AI, serving as the frontend equivalent of the Bridge layer.

#### Rendering Pipeline

1. **AI output** → device backend validates Wasm logic → emits UI Schema (JSON)
2. **PWA receives** → `DynamicRenderer` parses `GeneratedComponent[]` tree
3. **Contract validation** → `type` must be registered in `componentRegistry`; unknown types render a fallback
4. **Recursive rendering** → look up component → inject props → render children

**Component Schema contract** (AI output must conform):

```typescript
interface GeneratedComponent {
  id: string                     // nanoid, unique identifier for useAIUpdate data push
  type: string                   // must match a key in componentRegistry
  props: Record<string, unknown> // component properties, values pass through str() for safe conversion
  children?: GeneratedComponent[] // child component tree (layout components support nesting)
}
```

#### Rendering Contexts

1. **Chat message cards** — AI generates rich card replies in conversation, rendered by `GeneratedCard` (simple cards) or `DynamicRenderer` (complex cards)
2. **Space dashboards** — Entire layouts are AI-generated with all components dynamically rendered; supports real-time data updates from AI via `useAIUpdate`

#### Component Registry

Three categories following shadcn-style declarative registration:

**Base Primitives**: `container`, `flex`, `grid`, `card`, `text`, `button`, `input`, `image`, `icon`, `divider`, `spacer`, `metric`, `progress`, `list`, `chart`

**Chat Cards**: `financial-overview`, `file-preview`, `code-block` (via `GeneratedCard` additionally: `weather`, `code`, `list`, `link`, `status`)

**Space Components**: `bento-grid`, `bento-item`, `financial-system`, `file-manager`, `insights-collection`, `task-tracker`

#### Adding New Dynamic Components

Register in `componentRegistry` with unified interface:

```typescript
interface ComponentProps {
  props: Record<string, unknown>  // AI-provided data; all values must pass through str() for safe conversion
  children?: ReactNode            // child component tree
  componentId?: string            // for useAIUpdate real-time data push
}
```

Rules:
- **Safe rendering**: All prop values converted via `str()`; image URLs validated through `safeImageSrc()`
- **Real-time updates**: Use `useAIUpdate(componentId, callback)` to receive AI-pushed data changes
- **Empty states**: List/collection components must provide empty-data placeholders (icon + hint text)
- **Style consistency**: Use project design tokens (`bg-surface-container-lowest`, `text-on-surface`, etc.); follow card visual conventions
- **Action callbacks**: Button/form actions are sent to the device via WebSocket for execution; the frontend never directly executes AI-generated logic

#### Safety Mechanisms (Frontend Circuit Breakers)

| Strategy | Implementation |
|---|---|
| Unknown component type | `componentRegistry` lookup failure → dashed-border fallback |
| Invalid image URL | `safeImageSrc()` allows only http/https/relative/data:image |
| Invalid prop values | `str()` converts null/undefined to empty string, preventing render crashes |
| Progress/percentage overflow | `Math.min(100, Math.max(0, value))` clamps range |
| Render depth | Controlled by device-side schema generation; frontend recursive rendering has no hard limit but should stay reasonable |

**Backend circuit breakers** (handled by Go + wazero, not PWA): Wasm execution MaxMemory limits, CPUTimeout, tool validation self-healing loop. The frontend perceives these indirectly through API timeouts and error responses.

## Conventions

- TypeScript strict mode with `@typescript-eslint/no-explicit-any` as warning
- Underscore-prefixed unused params are allowed (`_arg`)
- `no-console` warns (use `console.warn`/`console.error` instead)
- Comments and UI text are in Chinese (中文)
- Components use `motion/react` (Framer Motion) for transitions via `AnimatePresence`
- IDs generated with `nanoid()`
- API responses follow `{ success: boolean, data?: T, error?: ApiError }` pattern
