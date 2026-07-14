## Project goal

MediaMTX Connect is positioned as the **most ideal companion to MediaMTX**. When evaluating, triaging, or proposing work, the default question is: does this surface or wrap something MediaMTX already exposes — a config key, an API endpoint, a `runOn*` hook, a protocol it natively serves? Features built on MediaMTX's own surface area come first.

App-level "nice to have" work that doesn't directly align with MediaMTX (our own auth/analytics, plugin SDKs, integrations marketplaces, AI/ML sidecars, alternate databases) is welcome, but it's lower priority by default — it should compete against MediaMTX-native work for slate space rather than displace it. When proposing such work, lead with why it earns priority despite not consuming a MediaMTX primitive.

## Hard rule for every change

If your change adds, removes, or modifies a user-visible feature, route, API endpoint, server action, schema, cron, or integration, you **must** update `docs/FEATURES.md` in the same change. See its "Maintenance contract."

## Where things live

| Topic | Path |
|-------|------|
| Shipped feature inventory (source of truth — read first) | `docs/FEATURES.md` |
| Ranked idea backlog — unshipped, Top 10 + flat backlog (do **not** treat as features) | `docs/ideas/FEATURES-LONGLIST.md` |
| Idea catalog overview + cross-cutting brainstorm (links to domain files `01`–`05`) | `docs/ideas/00-index.md` |
| Layout, naming, imports, conventions | `docs/PROJECT-STRUCTURE.md` |
| System diagram | `ARCHITECTURE.md` |
| Dev setup, scripts, PR process | `CONTRIBUTING.md` |
| Test layers, conventions, CI gates | `docs/TESTING.md` |
| Database schema | `src/lib/prisma/schema.prisma` |
| i18n policy and "add a language" workflow | `docs/I18N.md` |

## Code rules

- **Boring over clever.** Mainstream way wins. No bespoke abstractions, no defensive fallbacks for things that can't happen. Three similar lines beat a clever helper.
- **No AI-sounding comments.** Write like a note to a coworker — only when the *why* isn't obvious. Skip preambles, code-restatement, trivial-logic explanation. A concise one-liner above complex code is welcome.
- `process.env` goes through `src/lib/env.ts` (lint-enforced).
- Use the shared `logger` (Pino). `console.*` is banned outside `logger.ts` and `env.ts`.
- Forms: React Hook Form + Zod.
- User-visible strings live in `messages/*.json` (one namespace per feature). No hardcoded JSX literals in `src/features/**` or `src/components/**`. Use `Link`/`useRouter` from `@/i18n/navigation`, not `next/link` or `next/navigation`. See `docs/I18N.md`.
- Never edit `src/lib/mediamtx/generated.ts` or `src/lib/prisma/migrations/`.
- E2E tests live under `tests/e2e/` (Playwright); feature tests may colocate.

## Before finishing

- [ ] Layout/naming per `docs/PROJECT-STRUCTURE.md`.
- [ ] `docs/FEATURES.md` updated.
- [ ] `npm run typecheck`, `npm run lint`, and `npm run i18n:check` clean.

## Agent skills

### Issue tracker

Issues and PRDs are tracked as GitHub issues via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-role vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context — one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
