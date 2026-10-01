# MediaMTX Connect

A web UI for operating a MediaMTX server. pnpm + Turborepo monorepo: Vite/React SPA (`apps/web`), Hono API (`apps/api`), one oRPC contract (`packages/contract`, imported as `@connect/contract`), one Docker image.

## Project goal

Connect aims to be the ideal companion to MediaMTX. When you weigh, triage or propose work, ask first: does it surface or wrap something MediaMTX already exposes, such as a config key, a Control API endpoint, a `runOn*` hook, or a protocol it serves? That work comes first. App-level extras (our own auth, analytics, plugins, AI sidecars, databases) compete for the same slots; when proposing one, lead with why it earns priority anyway.

## Commands

- `pnpm dev`: zero-config dev stack (seeds `.dev-data/`, starts MediaMTX + fake streams in Docker, web :5173, api :3000). `pnpm dev:stop` stops Docker.
- `pnpm check`: the inner loop (~4s). Lint, typecheck and tests scoped to what you changed. Run it after every edit.
- `pnpm verify`: the gate (~11s warm). Exactly what CI's Build job runs. Run it before every push.
- `pnpm test:e2e`: Playwright against the built server and a live MediaMTX. Needs `pnpm build`, Docker and ffmpeg. Run it when you touch UI flows or MediaMTX writes.
- Use `pnpm` only, from the repo root.

## Hard rules

- **Update `docs/FEATURES.md` in the same change** whenever you add, remove or change a user-visible feature, route, API endpoint, oRPC procedure, schema, cron or integration (see its maintenance contract). Keep the feature list in `README.md` true too.
- **API shapes live only in `packages/contract/src/index.ts`.** A contract change updates contract, api handler and web usage in the same commit.
- **JSON goes through oRPC; binary goes through `/media`.** The web app calls the API only via `orpc.<proc>.queryOptions()` / `.mutationOptions()` (invalidate with `.key()`). Images and MP4s are plain Hono routes in `apps/api/src/media.ts`, used as `<img>`/`<video>` URLs.
- **`process.env` is read only in `apps/api/src/env.ts`.** The web app has no env; everything flows through the API. Env vars only seed the first boot, and `config.json` (edited at `/config`) owns the values after that.
- **PR titles are conventional commits.** `main` is squash-merged, so the title is the commit semantic-release reads: `feat:` / `fix:` / `perf:` / `revert:` cut a release; `docs:`, `test:`, `chore:`, `refactor:`, `ci:`, `build:`, `style:` don't. Pick the type for what the change ships. A docs-only change is `docs:`.
- **Labels:** issue labels follow `docs/agents/triage-labels.md` plus the categories `bug`, `enhancement`, `documentation`, `tech-debt`. `released` belongs to semantic-release; leave it to the release job.
- **The backlog is GitHub issues** (ADR 0007). Record unshipped work, debt and ideas as issues, never as files in the repo.

## Conventions the tooling doesn't check

- Boring over clever: the mainstream way, three similar lines over a clever helper, no defensive fallbacks for things that can't happen.
- Comments are short notes to a coworker, and only when the *why* isn't obvious from the code.
- Third-party versions live in the pnpm catalog (`pnpm-workspace.yaml`), referenced as `catalog:`. Renovate bumps them; leave versions alone in feature work.
- Import workspace packages by name (`@connect/contract`), never by relative path across packages. There's no root tsconfig; every package extends `@connect/typescript-config/base.json`.
- Forms use React Hook Form + Zod, with schemas from `@connect/contract`.
- User-visible strings go in `apps/web/messages/en.json` and all 29 other locales. Lint catches JSX literals; `pnpm i18n:check` catches missing keys. For units and dates, use `useFormatter()`. Full workflow, including adding a locale: `docs/I18N.md`.
- Name MediaMTX concepts with the words in `CONTEXT.md` (path, stream, path defaults, session, recording segment…).
- When you add a test, break the line it covers and watch it fail before moving on. This repo has shipped vacuous suites twice (ADR 0005).
- Logging goes through the shared loggers (`apps/api/src/logger.ts`, `apps/web/src/lib/logger.ts`); lint bans `console.*` elsewhere.

## Where things live

| Read this | When you |
|---|---|
| `docs/FEATURES.md` | start any feature work: it's the inventory of what ships, with file paths per feature (recordings: §2, jobs: §4, MediaMTX integration: §7) |
| `CONTEXT.md` | name a MediaMTX concept in code, UI copy or an issue |
| `docs/ARCHITECTURE.md` | need the system diagram, repo layout and naming, stack rationale, packaging, or the responsive breakpoint policy |
| `docs/TESTING.md` | add or change tests: which layer, fixtures, CI gates |
| `docs/I18N.md` | add a string, or add a UI language (it has the step-by-step) |
| `docs/adr/` | touch an area an ADR covers (config scopes 0002, WHEP 0003, test layers 0005, pnpm trust 0006, backlog 0007) |
| `CONTRIBUTING.md` | need dev setup, PR process or release details |

## Agent skills

### Issue tracker

Issues and specs are tracked as GitHub issues via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-role vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
