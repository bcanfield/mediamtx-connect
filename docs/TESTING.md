# Testing

Reference for what to test, where it lives, and which tool runs it. Update this file when a layer or convention changes.

> `docs/adr/0005-fast-test-suite.md` is the rationale for this file's current shape: why E2E is chromium-only, why the component layer exists, and why conditionals in a test body are a lint error.

## Layers

| Layer | Tool | Scope | Location |
|-------|------|-------|----------|
| Unit | Vitest | Logic E2E can't reach: api process spawning, timers, filesystem edge cases; web protocol/URL logic that needs no DOM | `apps/api/src/*.test.ts`, `apps/web/src/**/*.test.ts` (colocated) |
| API serving | Vitest + `app.request()` | HTTP behaviour of the Hono apps in-process against real fixtures: Range/206, content headers, traversal, health | `apps/api/src/media.serving.test.ts`, `health.test.ts` |
| Component | Vitest (happy-dom) + Testing Library + MSW | Rendered output, form state, Radix menus, and the oRPC calls behind them — deterministic, so assertions are unconditional | `apps/web/src/**/*.test.tsx` |
| E2E | Playwright | Only what needs a real server: live MediaMTX round-trips, WHEP over a real peer connection, an ffmpeg snapshot, accessibility of the rendered document | `tests/e2e/*.spec.ts` |
| Image smoke | Docker + curl in CI | `docker build` + `/api/health` against the production image | `.github/workflows/ci.yml` |

**202 Vitest tests, 23 Playwright tests.** ADR 0005's change 1 is now complete: the recordings index and detail pages, the App Config form, the primary nav, locale switching, the streams grid and toolbar, and the SPA fallback all moved down out of Playwright. What remains in E2E is only what a stub router cannot answer — writes to a live MediaMTX, a real WHEP peer connection, an ffmpeg capture, and axe over the rendered document.

## Component tests

`apps/web/vitest.config.ts` defines two projects, both run by `pnpm test`:

- **`logic`** (node) — `src/**/*.test.ts`. URL building, protocol negotiation against a fake `RTCPeerConnection`. No DOM, so it pays for none.
- **`component`** (happy-dom) — `src/**/*.test.tsx`. Renders real components through the app's own provider stack.

`src/test/render.tsx` mirrors `main.tsx`: QueryClient, `IntlProvider` with the shipped English messages, a memory-history router, `ThemeProvider`, and the `Toaster`. It is **async** — TanStack Router renders nothing until the route resolves, and without `await router.load()` the DOM is empty and every `queryBy*` negative assertion passes vacuously.

`src/test/rpc-server.ts` serves `/rpc/*` through MSW backed by the **real `RPCHandler`** over an `implement(contract)` stub router. Don't hand-write oRPC wire payloads. This is what makes a contract change break these tests at typecheck rather than leave them asserting a shape the API no longer returns.

**Radix works in happy-dom.** Dropdown menus open under `userEvent.click` and expose their `menuitem` roles with no `hasPointerCapture` / `ResizeObserver` / `scrollIntoView` shims. Vitest browser mode was considered and isn't needed; reach for it when something specific actually fails, not preemptively.

**Assert a positive anchor alongside every negative.** `expect(queryByText(x)).not.toBeInTheDocument()` passes on an empty DOM, so pair it with a `getBy*` that proves the component rendered at all. This bit during development of the very first component suite.

**Type the assertion literal, not just the mock.** Vitest's `toHaveBeenCalledWith` is not strictly typed even against `vi.fn<(input: T) => void>()`. Use `satisfies RpcInputs[...]` on the expected object, or a contract change silently leaves the assertion compiling.

## Decision: which layer for a new feature?

- Added or changed an HTTP response — status, headers, Range, content type → **API serving** (`app.request()` in-process; no server, no browser, no Docker).
- Changed what a component renders, a form's state, or a menu action's payload → **Component**.
- Added a route or changed navigation → **Component**. Nav hrefs, active-tab state and locale switching are all rendered output; `app-header.test.tsx` and `app-header.tab-state.test.ts` are the pattern. Reach for E2E only if the thing you changed needs a real server to exist.
- Changed `Dockerfile`, boot order, or the health endpoint → ensure **image smoke** still passes.
- Wrote api logic a browser can't observe — a cron, a spawned process, a timer, a filesystem fallback → **Unit**.
- Changed the static/SPA-fallback wiring → **API serving** (`spa.test.ts` mounts it against a fixture root).
- Needs a live MediaMTX write, a real peer connection, or a real ffmpeg → **E2E**, and say in a comment which of those it is. That sentence is the entry fee: if you cannot name one, the test belongs a layer down.

## Commands

```bash
pnpm check             # THE INNER LOOP (~4s) — changed files only; run after every edit
pnpm check --since main # same, scoped to the whole branch
pnpm verify            # THE GATE (~11s warm) — lint + typecheck + i18n:check + test + build
pnpm test              # vitest, all packages (turbo)
pnpm test:changed      # vitest --changed — only tests reachable from your edits
pnpm test:watch        # vitest watch mode across packages
pnpm build             # e2e runs the built single-server (apps/api/dist)
pnpm test:e2e          # playwright, headless, chromium only
pnpm test:e2e:dev      # playwright UI
E2E_ALL_BROWSERS=1 pnpm test:e2e   # add firefox/webkit/mobile (what nightly runs)
```

`pnpm verify` reproduces the CI `build` job exactly — including `pnpm build`, which is why a Vite or tsdown config error cannot pass here and then fail there. It needs no Docker and no browsers.

`pnpm check` is the inner loop. It lints only the changed files, typechecks the affected packages, runs only the tests your edit can reach, and skips `i18n:check` unless a message catalogue or a README moved. It runs its steps concurrently, because each carries a fixed startup cost that dominates its real work: ESLint takes ~2s to resolve its flat config whether it checks one file or four hundred.

Both are runnable by an agent in CI, which is the point — see `AGENTS.md`. Neither needs the E2E stack.

## Conventions

- **Unit tests colocate** next to the module (`src/jobs.ts` → `src/jobs.test.ts`).
- **Mock sibling modules with a factory, not automock.** `vi.mock('./config-store', () => ({ ... }))` — a bare `vi.mock` still loads the real module, and `config-store` imports `env.ts`, which validates `process.env` at import time and throws.
- **Fake timers in any suite that touches a job.** The snapshot cron arms a 15s kill timer; without `vi.useFakeTimers()` it outlives the run.
- **A test you haven't seen fail isn't a test.** Break the line it covers and confirm it goes red before moving on.
- **E2E stays in `tests/e2e/`.**
- **One assertion theme per `test()`**. Multiple `expect`s are fine; multiple unrelated behaviors are not.
- **Use `getByRole` over `getByTestId`.** No `data-testid` unless there is no accessible alternative (existing: `stream-card`, `recording-card`, `stream-summary-card`, `recording-row`, `save-bar`).
- **Scope an assertion when the same string appears twice.** A card's "7 recordings" chip and the toolbar's "7 recordings" summary both match a bare `getByText`, and the unscoped version passes on the toolbar alone while the chip is missing. Use `within()` or `toHaveTextContent` on the element you mean.
- **Don't assert on a library's behaviour and call it ours.** TanStack Link sets its own prefix-matched `aria-current`, so asserting the current tab through a rendered header tests Link, not `isActiveRoute`. Pure routing rules live in their own module with a `logic`-project test — that is why `nav-active.ts` exists apart from `app-header.tsx`.
- **A `.test.ts` under `apps/web/src` runs in the `logic` project, in node.** Importing a `.tsx` module from one drags React, the router and the orpc client into a node environment, and the failure is a wall of `socket hang up`. Extract the pure function instead.
- **No conditionals in a `test()` body — lint-enforced.** `if (await card.count() > 0) { ...assert... }` is green whether or not the feature works; 19 such tests had accumulated, and three of them ran in five browsers. The fixtures make unconditional assertions safe: `globalSetup` seeds the recordings, and `scripts/wait-for-mediamtx.mjs` gates the suite on the stream fleet being published *and* ready. If state genuinely varies, the test belongs in the component layer. Cleanup guards in `afterEach` (`if (!materialized) return`) are fine and not flagged.
- **This supersedes the old "assert state A or state B" guidance.** That rule was a rational response to asserting against live data, and it is what produced the guarded tests. `toHaveCount(n)` against the *fixtures* is now correct — they are deterministic.
- **No `console.*`** in tests (lint-banned project-wide). Use `expect` to assert; failures speak for themselves.
- **A traversal test must escape to a file that exists.** Pointing `../..` at a path that isn't on disk passes on `existsSync` returning false and stays green with the guard deleted. `media.serving.test.ts`'s two traversal tests resolve to real fixture files and were both verified to return 200 with `safeJoin`'s check removed. This has shipped as a fake gate here once already.
- **Fixtures** are small committed MP4s + PNGs under `tests/fixtures/`. Playwright's `globalSetup` copies them into `test-results/e2e-data/` (via `scripts/seed-fixtures.mjs`) before the webserver boots — hermetic and offline, no ffmpeg or MediaMTX needed.

## E2E projects

`playwright.config.ts` runs `chromium` only by default — **23 tests in 7 files**, down from 56 in 11 before ADR 0005's change 1 landed. It runs every spec, and this is what PRs and local runs get.

Setting `E2E_ALL_BROWSERS=1` adds four more projects:

- `firefox`, `webkit` — intended to catch HLS-native fallback regressions
- `mobile-chrome` (Pixel 7), `mobile-safari` (iPhone 14) — covers the responsive grid

Those four now run **only `a11y.spec.ts`**. The rest of what `uiSpecs` used to match — `config`, `recordings`, `i18n`, and the navigation and grid tests from `streams` — no longer exists as E2E at all; it is Vitest. `streams.spec.ts` was dropped from the pattern too: its one remaining test spawns ffmpeg, and running that five times concurrently against one MediaMTX buys nothing.

**Only `.github/workflows/e2e-nightly.yml` sets that flag** (06:00 UTC daily, plus `workflow_dispatch`). The four extra projects tripled the PR suite for a regression class no current spec exercises — nothing in the cross-browser set drives HLS, `hls.js`, or WHEP. Moving them nightly keeps drift detection within a day. If a playback spec lands, cross-browser should be scoped to *that spec* rather than back to all of `uiSpecs`. See `docs/adr/0005-fast-test-suite.md`.

That spec has now landed — `playback.spec.ts` drives WHEP against live MediaMTX — and it is still **chromium only**. Opting it into the other four projects is ADR 0005's payoff trigger, and it wants a deliberate look first: what Playwright's own Firefox and WebKit builds can negotiate over WebRTC is a separate question from what those browsers ship, and a nightly that goes red for the runner's WebRTC support rather than for ours is worse than no nightly coverage.

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
