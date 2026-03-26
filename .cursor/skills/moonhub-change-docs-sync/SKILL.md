---
name: moonhub-change-docs-sync
description: Same workflow as MoonHub’s documentation sync skill, applied to MoonHub-PWA. Updates docs/, docs/README.md, CHANGELOG.md, and the bilingual sections in README.md after code changes. Use when finishing a PWA feature or fix and the user asks to sync documentation, refresh the doc index, or update the changelog.
---

# MoonHub-PWA change → documentation sync

This skill **reuses the process and rules** from the MoonHub package skill at [`MoonHub/.cursor/skills/moonhub-change-docs-sync/SKILL.md`](../../../MoonHub/.cursor/skills/moonhub-change-docs-sync/SKILL.md) (sibling repo under the same workspace). When that file is available, read it for full rationale; **this file is the PWA path binding**.

**Working root**: MoonHub-PWA repository root.

## Preconditions

- Identify **which areas** changed: `src/services/`, `src/stores/`, `src/hooks/`, `src/pages/`, LAN flows, PWA shell, etc.
- Note whether behavior is **user-visible** (README bullets) or **internal** (code comments + deep docs only).

## 1. Deep documentation (maps to MoonHub `pkg/<package>/docs/`)

| PWA location | Role |
| --- | --- |
| [`docs/README.md`](../../../docs/README.md) | Index and reading order |
| [`docs/*.md`](../../../docs/) | Subsystem guides (`lan-discovery.md`, `lan-pairing.md`, `services.md`, `stores.md`, `hooks.md`, `ARCHITECTURE.md`, …) |
| [`src/services/README.md`](../../../src/services/README.md), [`src/stores/README.md`](../../../src/stores/README.md), [`src/hooks/README.md`](../../../src/hooks/README.md) | Short directory-level reference |

**Rules** (same intent as MoonHub §1):

- Update or add under `docs/` when public API, config surface, or operator-visible behavior changes.
- Each topical `docs/<topic>.md`: scope, entry files, integration touchpoints, and a **relative** link to the index: [`docs/README.md`](../../../docs/README.md) (depth as appropriate from the edited file).
- If you introduce **environment or build config** that operators set, add or extend a small **CONFIG** section in the relevant `docs/*.md` (PWA has no separate `CONFIG.md` unless you create one—prefer the doc that owns that subsystem).
- Cross-link **MoonHub** implementation status when the change depends on backend behavior: [`MoonHub/docs/README.md`](../../../MoonHub/docs/README.md) and `MoonHub/docs/implementation/*` as already linked from [`docs/README.md`](../../../docs/README.md).

## 2. Documentation index (`docs/README.md`)

Same role as MoonHub [`docs/README.md`](../../../MoonHub/docs/README.md).

- **Recommended Reading Order** — add steps for new major flows.
- **Documentation by Subsystem** tables — new rows or corrected descriptions; keep ordering and link style consistent.
- **Project structure / quick reference** — update when folders or key entry points change.

## 3. Changelog (`CHANGELOG.md`)

- Add entries under **`## [Unreleased]`** or start a **dated release section** if you are cutting a release; match the existing file’s style (summary, Added/Changed/Fixed, paths under `` `src/...` ``).
- Do not delete prior history.

## 4. Root README — English (`README.md`)

- Align **Core features** (and any **Implemented**-style lists) with shipped behavior; add **relative links** into `docs/` when a feature is documented there (same spirit as MoonHub **## Features → ### Implemented**).
- Keep the **[中文文档](README_CN.md)** link near the top, next to docs index / changelog pointers.

## 5. Root README — Chinese (`README_CN.md`)

- Keep **structure and link targets** aligned with `README.md` (features, flow, stack, links).
- Top of file: **[English](README.md)** cross-link.
- **Do not** duplicate a long changelog body; a single pointer to [`CHANGELOG.md`](../../../CHANGELOG.md) is enough (same rule as MoonHub `README_CN.md`).

## 6. Verification checklist

- [ ] Affected `docs/*.md` and any `src/**/README.md` match the code change.
- [ ] [`docs/README.md`](../../../docs/README.md) reading order and tables reflect the change.
- [ ] [`CHANGELOG.md`](../../../CHANGELOG.md) updated.
- [ ] [`README.md`](../../../README.md) and [`README_CN.md`](../../../README_CN.md) stay aligned; links are **relative** where they stay inside this repo.
- [ ] MoonHub cross-links in `docs/README.md` still valid if sibling repo layout is used.

## Additional resources

- PWA-oriented templates: [reference.md](reference.md)
