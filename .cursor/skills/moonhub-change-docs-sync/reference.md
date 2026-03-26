# Reference templates (MoonHub-PWA doc sync)

Same structural role as MoonHub’s [`MoonHub/.cursor/skills/moonhub-change-docs-sync/reference.md`](../../../MoonHub/.cursor/skills/moonhub-change-docs-sync/reference.md); paths are PWA-specific.

## CHANGELOG.md entry pattern

```markdown
### Added - YYYY-MM-DD

#### Short title

- **Capability** — what users get (`src/services/foo.ts`)
- **Documentation** — [`docs/foo.md`](docs/foo.md)
```

## README.md — English Core Features bullet

```markdown
- **Title** — One line. See [`docs/topic.md`](docs/topic.md).
```

## README_CN.md — 核心功能 bullet

```markdown
- **标题** — 一行说明。参见 [`docs/topic.md`](docs/topic.md)。
```

## docs/README.md subsystem table row

```markdown
| 1 | [topic.md](./topic.md) | Short description |
| 2 | [src/foo/README.md](../src/foo/README.md) | Directory quick reference |
```

## docs/<topic>.md header pattern

- Title: subsystem + purpose.
- Link to index: `**Documentation index**: [docs/README.md](./README.md)` (adjust relative path from file depth).
- Sections: Overview, key files under `src/`, configuration if any, integration with MoonHub API when relevant.
