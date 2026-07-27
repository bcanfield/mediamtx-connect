# Testing

Reference for what to test, where it lives, and which tool runs it. Update this file when a layer or convention changes.

> **In progress:** `docs/adr/0005-fast-test-suite.md` restructures these layers for speed. The CI half has landed (chromium-only PRs, cached Turborepo, docs-only skip — changes 3, 4, 6, 7). The layer half — a component layer under Vitest, `api`/`mediamtx` specs folded into unit tests, and the E2E specs they replace — has not. This file describes what ships today.

## Layers

| Layer | Tool | Scope | Location |
|-------|------|-------|----------|
| Unit | Vitest | Logic E2E can't reach: api process spawning, timers, filesystem edge cases; web protocol/URL logic that needs no DOM | `apps/api/src/*.test.ts`, `apps/web/src/**/*.test.ts` (colocated) |
| API serving | Vitest + `app.request()` | HTTP behaviour of the Hono apps in-process against real fixtures: Range/206, content headers, traversal, health | `apps/api/src/media.serving.test.ts`, `health.test.ts` |
| E2E | Playwright | Full browser flows, locale switching, accessibility, live MediaMTX round-trips | `tests/e2e/*.spec.ts` |
| Image smoke | Docker + curl in CI | `docker build` + `/api/health` against the production image | `.github/workflows/ci.yml` |

> **Note:** the Next.js → Vite/Hono migration (see `docs/MIGRATION.md`) did not carry over the old Vitest unit/component/integration layers — those tests were written against Prisma, server actions, and `instrumentation.ts`, none of which exist anymore. Vitest is back for `apps/api` (see `docs/adr/0001-reintroduce-vitest-for-api-unit-tests.md`), covering `jobs.ts` and `router.ts`, and for `apps/web`, covering `lib/whep.ts` + `lib/playback.ts` (see `docs/adr/0003-hand-rolled-whep-client.md`). Contract schemas, `recordings-fs.ts`, `config-store.ts`, `media.ts` range logic, and the RHF forms are still uncovered and tracked in `docs/debt/`.

> **No component tests.** `apps/web`'s Vitest runs in the default node environment — there is no jsdom and no Testing Library. It is for logic a browser isn't needed to exercise (URL building, protocol negotiation against a fake `RTCPeerConnection`). Components are still covered through E2E.

## Decision: which layer for a new feature?

- Added or changed an HTTP response — status, headers, Range, content type → **API serving** (`app.request()` in-process; no server, no browser, no Docker).
- Added a route, navigation, or cross-page flow → **E2E**.
- Changed `Dockerfile`, boot order, or the health endpoint → ensure **image smoke** still passes.
- Wrote api logic a browser can't observe — a cron, a spawned process, a timer, a filesystem fallback → **Unit**.
- Everything else → cover it through the closest E2E flow for now (see the note above).

## Commands

```bash
pnpm verify            # lint + typecheck + i18n:check + test — the CI `build` gate, locally
pnpm test              # vitest, all packages (turbo)
pnpm test:changed      # vitest --changed — only tests reachable from your edits
pnpm test:watch        # vitest watch mode across packages
pnpm build             # e2e runs the built single-server (apps/api/dist)
pnpm test:e2e          # playwright, headless, chromium only
pnpm test:e2e:dev      # playwright UI
E2E_ALL_BROWSERS=1 pnpm test:e2e   # add firefox/webkit/mobile (what nightly runs)
```

`pnpm verify` is the preflight: it reproduces the CI `build` job exactly and needs no Docker, no build, and no browsers. `pnpm test:changed` is the inner loop — Vitest resolves the module graph and runs only what your edit can reach.

## Conventions

- **Unit tests colocate** next to the module (`src/jobs.ts` → `src/jobs.test.ts`).
- **Mock sibling modules with a factory, not automock.** `vi.mock('./config-store', () => ({ ... }))` — a bare `vi.mock` still loads the real module, and `config-store` imports `env.ts`, which validates `process.env` at import time and throws.
- **Fake timers in any suite that touches a job.** The snapshot cron arms a 15s kill timer; without `vi.useFakeTimers()` it outlives the run.
- **A test you haven't seen fail isn't a test.** Break the line it covers and confirm it goes red before moving on.
- **E2E stays in `tests/e2e/`.**
- **One assertion theme per `test()`**. Multiple `expect`s are fine; multiple unrelated behaviors are not.
- **Use `getByRole` over `getByTestId`.** No `data-testid` unless there is no accessible alternative (existing: `stream-card`, `recording-card`, `stream-summary-card`, `save-bar`).
- **Resilient E2E.** Assert "state A or state B" when both are valid (see `CONTRIBUTING.md`). Never `toHaveCount(n)` against live data.
- **No `console.*`** in tests (lint-banned project-wide). Use `expect` to assert; failures speak for themselves.
- **A traversal test must escape to a file that exists.** Pointing `../..` at a path that isn't on disk passes on `existsSync` returning false and stays green with the guard deleted. `media.serving.test.ts`'s two traversal tests resolve to real fixture files and were both verified to return 200 with `safeJoin`'s check removed. This has shipped as a fake gate here once already.
- **Fixtures** are small committed MP4s + PNGs under `tests/fixtures/`. Playwright's `globalSetup` copies them into `test-results/e2e-data/` (via `scripts/seed-fixtures.mjs`) before the webserver boots — hermetic and offline, no ffmpeg or MediaMTX needed.

## E2E projects

`playwright.config.ts` runs `chromium` only by default — 82 tests. It runs every spec, and this is what PRs and local runs get.

Setting `E2E_ALL_BROWSERS=1` adds four more projects, taking the run to 258 tests:

- `firefox`, `webkit` — intended to catch HLS-native fallback regressions
- `mobile-chrome` (Pixel 7), `mobile-safari` (iPhone 14) — covers the responsive grid

Those four only run UI specs (`config`, `recordings`, `streams`, `a11y`) — 44 apiece. Pure-HTTP specs (`api`, `mediamtx`, `i18n`) run in `chromium` only; running them cross-browser doesn't change the outcome.

**Only `.github/workflows/e2e-nightly.yml` sets that flag** (06:00 UTC daily, plus `workflow_dispatch`). The four extra projects tripled the PR suite for a regression class no current spec exercises — nothing in the cross-browser set drives HLS, `hls.js`, or WHEP. Moving them nightly keeps drift detection within a day. If a playback spec lands, cross-browser should be scoped to *that spec* rather than back to all of `uiSpecs`. See `docs/adr/0005-fast-test-suite.md`.

`path-defaults`, `path-config`, `record-toggle` and `publish-urls` are UI specs that deliberately stay out of the `uiSpecs` pattern: they write to live MediaMTX, and `fullyParallel` would have five projects racing the same key — each capturing a different "original" to restore. One browser is the correct number for a spec that mutates shared server state. `publish-urls` patches the server-wide `rtmpAddress` to a non-default port and restores it (RTMP has no fixture publisher, so moving its port leaves the RTSP streams untouched). The pattern is anchored on `/` for this reason: unanchored, it matched any spec whose name merely *ends* in `config.spec.ts`, which silently opted `path-config` into all five.

`path-config` and `record-toggle` additionally run `mode: 'serial'`. Each shares one mutable resource — a stream's config entry — and materializing it changes what the read tests see, so within-file parallelism races them against each other.

Those two also target **different streams** (`stream1` and `stream2`): `fullyParallel` runs spec *files* concurrently within a project, so pointing both at the same entry would race them across files even though each is serial internally.

Accessibility: `@axe-core/playwright` smoke check on `/`, `/recordings`, `/config`, `/config/mediamtx/global`, `/config/mediamtx/path-defaults`, `/config/mediamtx/paths/stream1` (`tests/e2e/a11y.spec.ts`). Asserts zero **serious** or **critical** violations against `wcag2a/aa` + `wcag21a/aa` tags. Lower-impact violations (moderate, minor) are surfaced in the report but don't fail the build.

## CI gates

PRs must pass, in order:

1. `lint` + `typecheck` + `i18n:check`
2. `build` (Turborepo, all packages)
3. `test:e2e` against a real MediaMTX with fake streams — chromium only
4. **Docker image smoke** — runs in parallel with `test`. Builds the production image via Buildx (with GHA cache), runs the container, polls `/api/health` for up to 2 min, asserts `status: healthy`.

Playwright traces, screenshots, and HTML report upload on failure only.

**Caching.** The `build` and `test` jobs restore `.turbo` (and `.eslintcache`) via `actions/cache`, so a package that didn't change is a cache replay rather than a re-run — locally this takes `typecheck` from 12.2s to 28ms. The `test` job's `pnpm build` is normally a cache hit from the `build` job rather than a real rebuild. Playwright's browsers are cached on `~/.cache/ms-playwright`, keyed on the lockfile.

> A stale cache is a *silent* green: a task that should have run is skipped and the job passes anyway. Turborepo's default input hashing (every file in the package) is what keeps this honest — don't hand-tune `inputs` in `turbo.json` without a reason, and note that pushes to `main`/`beta` run unfiltered so a bad hash surfaces on merge.

**Docs-only changes skip E2E and image smoke.** A `changes` job diffs the PR against its base; if nothing outside `docs/`, `*.md`, or `LICENSE` changed, both expensive jobs are skipped. Note this is the **whole PR** versus its base, not the latest commit — pushing a docs commit onto a branch that also touches code still runs the full gate, which is the intended reading of "can this PR break the app?" It fails open — an unknown base runs everything — and applies to `pull_request` only, so pushes to `main`/`beta` always run the full gate and `release` never depends on a skipped job. The gate is a job-level `if` rather than a top-level `paths-ignore` on purpose: a *skipped job* reports success to branch protection, whereas a skipped *workflow* never reports at all and would leave PRs waiting forever.

> **Renaming a CI job breaks branch protection.** ADR 0004 makes required status checks on `main`/`beta` a precondition for the whole enforcement story, and those rules name jobs by their display name. `Build`, `E2E Tests`, and `Docker image smoke` keep their names for this reason. If you rename one, update the branch protection rule in the same change.

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
