# Testing

Reference for what to test, where it lives, and which tool runs it. Update this file when a layer or convention changes.

## Layers

| Layer | Tool | Scope | Location |
|-------|------|-------|----------|
| Unit | Vitest | api logic that E2E can't reach: process spawning, timers, filesystem edge cases | `apps/api/src/*.test.ts` (colocated) |
| E2E | Playwright | Full browser flows, byte-range MP4 streaming, locale switching, accessibility | `tests/e2e/*.spec.ts` |
| Image smoke | Docker + curl in CI | `docker build` + `/api/health` against the production image | `.github/workflows/ci.yml` |

> **Note:** the Next.js → Vite/Hono migration (see `docs/MIGRATION.md`) did not carry over the old Vitest unit/component/integration layers — those tests were written against Prisma, server actions, and `instrumentation.ts`, none of which exist anymore. Vitest is back for `apps/api` (see `docs/adr/0001-reintroduce-vitest-for-api-unit-tests.md`), currently covering `jobs.ts` only; contract schemas, `recordings-fs.ts`, `config-store.ts`, `media.ts` range logic, and the RHF forms are still uncovered and tracked in `docs/debt/`.

## Decision: which layer for a new feature?

- Added a route, navigation, byte-range, or cross-page flow → **E2E**.
- Changed `Dockerfile`, boot order, or the health endpoint → ensure **image smoke** still passes.
- Wrote api logic a browser can't observe — a cron, a spawned process, a timer, a filesystem fallback → **Unit**.
- Everything else → cover it through the closest E2E flow for now (see the note above).

## Commands

```bash
pnpm test              # vitest, all packages (turbo)
pnpm build             # e2e runs the built single-server (apps/api/dist)
pnpm test:e2e          # playwright, headless
pnpm test:e2e:dev      # playwright UI
```

## Conventions

- **Unit tests colocate** next to the module (`src/jobs.ts` → `src/jobs.test.ts`).
- **Mock sibling modules with a factory, not automock.** `vi.mock('./config-store', () => ({ ... }))` — a bare `vi.mock` still loads the real module, and `config-store` imports `env.ts`, which validates `process.env` at import time and throws.
- **Fake timers in any suite that touches a job.** The snapshot cron arms a 15s kill timer; without `vi.useFakeTimers()` it outlives the run.
- **A test you haven't seen fail isn't a test.** Break the line it covers and confirm it goes red before moving on.
- **E2E stays in `tests/e2e/`.**
- **One assertion theme per `test()`**. Multiple `expect`s are fine; multiple unrelated behaviors are not.
- **Use `getByRole` over `getByTestId`.** No `data-testid` unless there is no accessible alternative (existing: `stream-card`, `recording-card`, `stream-summary-card`).
- **Resilient E2E.** Assert "state A or state B" when both are valid (see `CONTRIBUTING.md`). Never `toHaveCount(n)` against live data.
- **No `console.*`** in tests (lint-banned project-wide). Use `expect` to assert; failures speak for themselves.
- **Fixtures** are small committed MP4s + PNGs under `tests/fixtures/`. Playwright's `globalSetup` copies them into `test-results/e2e-data/` (via `scripts/seed-fixtures.mjs`) before the webserver boots — hermetic and offline, no ffmpeg or MediaMTX needed.

## E2E projects

`playwright.config.ts` runs:

- `chromium` — primary; runs every spec
- `firefox`, `webkit` — catches HLS-native fallback regressions
- `mobile-chrome` (Pixel 7), `mobile-safari` (iPhone 14) — covers the responsive grid

`firefox` / `webkit` / `mobile-*` only run UI specs (`config`, `recordings`, `streams`, `a11y`). Pure-HTTP specs (`api`, `mediamtx`, `i18n`) run in `chromium` only — running them cross-browser doesn't change the outcome.

Accessibility: `@axe-core/playwright` smoke check on `/`, `/recordings`, `/config`, `/config/mediamtx/global` (`tests/e2e/a11y.spec.ts`). Asserts zero **serious** or **critical** violations against `wcag2a/aa` + `wcag21a/aa` tags. Lower-impact violations (moderate, minor) are surfaced in the report but don't fail the build.

## CI gates

PRs must pass, in order:

1. `lint` + `typecheck` + `i18n:check`
2. `build` (Turborepo, all packages)
3. `test:e2e` against a real MediaMTX with fake streams
4. **Docker image smoke** — runs in parallel with `test`. Builds the production image via Buildx (with GHA cache), runs the container, polls `/api/health` for up to 2 min, asserts `status: healthy`.

Playwright traces, screenshots, and HTML report upload on failure only.

## What we explicitly don't test

- shadcn/Radix primitives (`apps/web/src/components/ui/*`) — upstream's job.
- Visual regression of pages — flaky across OS font rendering; not worth the maintenance.
- Lighthouse / Core Web Vitals — not a stated product goal.

## Adding a layer or tool

If you add a new test layer (Vitest unit tests, load testing, visual regression, etc.):

1. Update the **Layers** table.
2. Update the **Decision** list so contributors know when to use it.
3. Add the command to **Commands** and the gate to **CI gates** if it's required.
4. Note any explicit exclusions under **What we explicitly don't test**.
