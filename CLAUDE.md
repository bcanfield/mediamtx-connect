## Project goal

MediaMTX Connect is positioned as the **most ideal companion to MediaMTX**. When evaluating, triaging, or proposing work, the default question is: does this surface or wrap something MediaMTX already exposes — a config key, an API endpoint, a `runOn*` hook, a protocol it natively serves? Features built on MediaMTX's own surface area come first.

App-level "nice to have" work that doesn't directly align with MediaMTX (our own auth/analytics, plugin SDKs, integrations marketplaces, AI/ML sidecars, alternate databases) is welcome, but it's lower priority by default — it should compete against MediaMTX-native work for slate space rather than displace it. When proposing such work, lead with why it earns priority despite not consuming a MediaMTX primitive.

## Hard rule for every change

If your change adds, removes, or modifies a user-visible feature, route, API endpoint, oRPC procedure, schema, cron, or integration, you **must** update `docs/FEATURES.md` in the same change. See its "Maintenance contract."

## Stack

pnpm + Turborepo monorepo: Vite + React 19 + TanStack Router SPA (`apps/web`), Hono API (`apps/api`), shared oRPC contract (`packages/contract`, imported as `@connect/contract`), one Docker image. Monorepo conventions and commands live in `AGENTS.md` (read it before touching code); `docs/MIGRATION.md` records how the previous Next.js app mapped onto this layout.

## Where things live

| Topic | Path |
|-------|------|
| Shipped feature inventory (source of truth — read first) | `docs/FEATURES.md` |
| Ranked idea backlog — unshipped, Top 10 + flat backlog (do **not** treat as features) | `docs/ideas/FEATURES-LONGLIST.md` |
| Idea catalog overview + cross-cutting brainstorm (links to domain files `01`–`05`) | `docs/ideas/00-index.md` |
| Monorepo commands, package layout, conventions | `AGENTS.md`, `docs/PROJECT-STRUCTURE.md` |
| Stack rationale (why Vite/Hono/oRPC/tsdown/catalog) | `docs/STACK.md` |
| System diagram | `ARCHITECTURE.md` |
| Dev setup, scripts, PR process | `CONTRIBUTING.md` |
| Test layers, conventions, CI gates | `docs/TESTING.md` |
| API shapes (oRPC contract + Zod schemas — the only place they are defined) | `packages/contract/src/index.ts` |
| App settings store (JSON file, no database) | `apps/api/src/config-store.ts` |
| i18n policy and "add a language" workflow | `docs/I18N.md` |

## Code rules

- **Boring over clever.** Mainstream way wins. No bespoke abstractions, no defensive fallbacks for things that can't happen. Three similar lines beat a clever helper.
- **No AI-sounding comments.** Write like a note to a coworker — only when the *why* isn't obvious. Skip preambles, code-restatement, trivial-logic explanation. A concise one-liner above complex code is welcome.
- `process.env` goes through `apps/api/src/env.ts` (t3-env). The web app has no env — everything flows through the API.
- Use the shared loggers: Pino in `apps/api/src/logger.ts`, the console wrapper in `apps/web/src/lib/logger.ts`. `console.*` is lint-banned elsewhere.
- Forms: React Hook Form + Zod, with schemas imported from `@connect/contract`.
- User-visible strings live in `apps/web/messages/*.json` (one namespace per feature). No hardcoded JSX literals in `apps/web/src/features/**` or `apps/web/src/components/**` (lint-enforced). See `docs/I18N.md`.
- API shapes are defined once in `packages/contract`; never duplicate a schema or type on either side. A contract change updates contract, api handler, and web usage in the same commit.
- JSON data (queries/mutations) goes through oRPC; binary/streaming responses (images, MP4s) are plain Hono routes in `apps/api/src/media.ts`.
- E2E tests live under `tests/e2e/` (Playwright); feature tests may colocate.

## Before finishing

- [ ] Layout/naming per `docs/PROJECT-STRUCTURE.md` and `AGENTS.md`.
- [ ] `docs/FEATURES.md` updated.
- [ ] `pnpm typecheck`, `pnpm lint`, and `pnpm i18n:check` clean.

## Agent skills

### Issue tracker

Issues and PRDs are tracked as GitHub issues via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-role vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context — one `CONTEXT.md` + `docs/adr/` at the repo root, created lazily on first use. See `docs/agents/domain.md`.
