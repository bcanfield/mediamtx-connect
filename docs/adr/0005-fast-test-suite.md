# 0005 — Push coverage down the stack; shrink E2E to what needs a real server

**Date:** 2026-07-27
**Status:** Partially implemented

Changes **3, 4, 6, 7, 8** (CI restructuring, caching, chromium-only PRs, docs-only
skip, `pnpm verify`) have landed. Changes **1, 2, 5** — the component layer,
folding `api`/`mediamtx` into Vitest, and the conditional-assertion lint rule —
have not, and **no E2E spec has been deleted**: their replacement does not exist
yet, so removing them now would be a straight coverage loss. Strikethrough marks
items withdrawn or revised by what implementation turned up.

## Context

Every behavioral gate in this repo lives in Playwright, and Playwright needs a
production build, a Docker MediaMTX, an ffmpeg, and five browsers. That is why a
PR takes ~7 minutes to answer "did I break anything," and why an agent working
locally almost never runs the suite at all — it runs `pnpm typecheck` and pushes.

### Where the time actually goes

Measured from CI run
[30213401612](https://github.com/bcanfield/mediamtx-connect/actions/runs/30213401612)
(a green PR, `agent/issue-219`). Times are wall clock per step.

| Job | Wall | Breakdown |
|-----|------|-----------|
| `build` | **0m 28s** | lint 5s · typecheck 7s · i18n <1s · **unit tests 1s** · build 2s |
| `test` (E2E) | **6m 39s** | apt-get ffmpeg 23s · docker compose up 16s · playwright install 45s · rebuild 3s · **test run 4m 44s** · cleanup 10s |
| `image-smoke` | 2m 06s | runs in parallel — not on the critical path |
| **Total** | **7m 16s** | `test` is gated on `needs: build`, so the two are serialized |

The whole fast half of the suite — lint, typecheck, i18n parity, and every unit
test we own — finishes in **28 seconds**. The remaining **6m 39s** is one job,
and **4m 44s** of that is Playwright.

Playwright's own log is the tell:

```
Running 258 tests using 2 workers
  258 passed (4.7m)
```

**258 test executions on 2 workers.** No `workers` is set, so Playwright defaults
to half the runner's logical cores — 2 on `ubuntu-latest`.

### Why there are 258 of them

There are only **82 unique tests**. The five browser projects multiply four of
the specs:

| | tests | projects | executions |
|---|---|---|---|
| `uiSpecs` (`a11y` 6, `config` 15, `recordings` 10, `streams` 13) | 44 | 5 | **220** |
| chromium-only (`api` 12, `mediamtx` 8, `path-config` 6, `i18n` 5, `path-defaults` 3, `record-toggle` 3, `publish-urls` 1) | 38 | 1 | 38 |
| | **82** | | **258** |

So **176 of 258 executions (68%) are the same 44 tests re-run in Firefox, WebKit,
and two mobile emulations.** `docs/TESTING.md` justifies those projects as
catching "HLS-native fallback regressions." No spec in the `uiSpecs` set
exercises HLS. The only playback assertion anywhere in the cross-browser set is
`recordings.spec.ts:94` — that a `<video>` element becomes visible after clicking
Play, on a progressive-download MP4. `hls.js`, native HLS, and the hand-rolled
WHEP client of ADR 0003 are never driven by any test, in any browser. (This is
already logged as `docs/debt/20260717100437-whep-playback-not-e2e-covered.md`.)
We are paying 68% of the suite for a regression class it does not test.

### Why the suite is also weak, which is the same problem

Slowness and weakness have one shared cause: everything is tested through a
browser against a *live* MediaMTX whose state varies run to run. The only way to
keep such a test from flaking is to weaken its assertion, and the suite has done
exactly that, systematically:

```ts
// streams.spec.ts
test('cards show how many people are watching', async ({ page }) => {
  const card = page.locator('[data-testid="stream-card"]').first()
  if (await card.count() > 0) {                       // ← zero cards, test passes
    await expect(card.getByText(/^\d+ viewers?$/)).toBeVisible()
  }
})
```

**19 of the 82 unique tests wrap their entire assertion body in a conditional**
(9 in `streams`, 7 in `recordings`, 3 in `config`), and two more assert a
disjunction so broad it holds whenever the page renders at all — `streams.spec.ts`'s
"should show one of the designed page states" passes on connection error, on
streams, on no streams, *or* on a missing-playback-URL banner.

All three of those specs are in `uiSpecs`, so they run five times:

> **95 of 258 CI test executions (37%) are of tests that pass whether or not the
> feature works.** If the streams grid rendered nothing at all, the suite stays
> green.

The `if`-guards are not sloppiness — they are a rational response to
`CONTRIBUTING.md`'s "resilient E2E" rule, which is itself a rational response to
asserting against live data. The rule is downstream of the architecture.

Two further costs sit in the same place:

- **`waitForLoadState('networkidle')` appears 33 times.** Playwright's own docs
  discourage it. With TanStack Query refetching in the background it is a
  500ms-of-silence gamble at best and a timeout at worst, on every test, in five
  browsers.
- **`api.spec.ts` (12 tests) and `mediamtx.spec.ts` (8 tests) never render a
  page.** They are `request`-fixture HTTP calls that boot Chromium, a production
  build, Docker, and ffmpeg to make them. Worse, all 8 `mediamtx` tests assert
  things about *MediaMTX and our docker-compose fixture* — that `stream1..5` are
  ready, that `/v3/config/global/get` returns `hlsAddress`. They test the test
  fixture. They cannot fail because of anything in `apps/`.

### What is already right

Three things should be preserved carefully, because they are the parts that work:

1. **`apps/api/src/media.test.ts` already tests a Hono app in-process**, and
   **`router.test.ts` already invokes oRPC procedures with `call()`** — no
   server, no port, no browser. The pattern for fast API testing exists, is
   proven here, and runs in **~1 second**. `api.spec.ts` tests the same routes,
   more slowly and more weakly.
2. **The four mutating specs — `path-config`, `path-defaults`, `record-toggle`,
   `publish-urls` — are the best tests in the repo.** They are strict,
   unconditional, and assert real round-trips through live MediaMTX
   (`record-toggle` proves an inherited `record: true` surfaces as REC; a
   comment records the 2.5-hour outage that bug caused). These genuinely need
   the real stack and must stay.
3. **ADR 0004 already diagnosed half of this** and deferred the component layer
   with an explicit payoff trigger. It named `pnpm verify` as the sub-minute
   preflight an agent could actually run. Neither has been implemented
   (`docs/debt/20260717154951-enforced-verify-gate-unimplemented.md`).

### The agentic cost

For an agent, the number that matters is not 7 minutes of CI, it is: *what does
it cost me to check my own work?* Today, running the behavioral suite locally
means `docker compose up` + `pnpm build` + `playwright test` across five
browsers — five to eight minutes and a Docker daemon. So the agent skips it,
pushes, and learns about the failure seven minutes later in CI, having already
moved on. ADR 0004 called this out and it remains true.

### The 90-second budget, and why Vitest is not in it

Sizing the proposed `verify` job matters, because the instinct is to tune the
test runner and the measurement says the test runner is not the problem:

| | measured | |
|---|---|---|
| job provisioning + checkout + pnpm + setup-node + install | ~12s | per job, with a warm pnpm store |
| lint | 5s | |
| typecheck | 7s | |
| i18n:check | <1s | |
| **unit tests (vitest)** | **1s** | |
| build | 2s | |
| | **~28s** | today's `build` job |

**Vitest already runs in one second.** Tuning `pool`, `isolate`, or
`fileParallelism` against a 1s suite recovers milliseconds. The ~90s estimate is
28s of the above plus the new component layer, and essentially all of the
headroom is in three places that have nothing to do with how fast Vitest
executes a test:

1. **The component layer's runner.** In a real browser this layer plausibly costs
   30–45s and becomes the largest line item in `verify` — bigger than lint,
   typecheck, unit tests and build combined. That is a design decision we get to
   make, and change 1 above now makes it deliberately.
2. **Nothing in CI is cached.** `.turbo` is gitignored and never persisted;
   `cache: pnpm` caches only the pnpm store. ESLint runs without `--cache`.
   **Every CI run recomputes lint, typecheck, test and build for every package
   from cold, whether or not that package changed.**
3. **CI has no path or affected filters.** `ci.yml` triggers on every push and PR
   with no `paths` filter and no Turborepo affected-detection. The PR carrying
   *this ADR* — two markdown files — runs the full 258-test E2E suite.

Points 2 and 3 are why the answer to "can it go below 90s" is yes, and why the
answer is not "tune Vitest."

## Decision

Move each test to the cheapest layer that can still catch its regression, let
E2E keep only what genuinely requires a real MediaMTX, and stop recomputing work
that did not change. Eight changes, each independently landable.

### 1. A component/route layer — Vitest `projects`, node-first, browser only where needed

This is the deferred layer from ADR 0004, and it is the load-bearing change: it
is what makes deleting UI E2E safe rather than reckless. It is also the single
largest new cost in `verify` (see "The 90-second budget"), so its runner choice
is a performance decision, not just an ergonomics one.

- **Runner: one `vitest` invocation, two `projects`.**
  - `component` — happy-dom, the default for the layer. Covers everything whose
    assertion is about *rendered output or form state*: card contents, codec
    chips, viewer counts, snapshot-age pill, recordings totals and client-side
    filter, RHF+Zod dirty-state and save-bar logic, locale switching. No pointer
    physics involved, so no browser needed.
  - `component-browser` — browser mode, Playwright provider, headless chromium.
    Reserved for the specs that drive Radix overlays with real pointer events:
    the stream actions menu, the config section rail, selects and dialogs. These
    are the cases where happy-dom needs `hasPointerCapture` / `scrollIntoView` /
    `ResizeObserver` shims to behave, and where a shimmed pass is not worth much.

  The split matters because browser mode pays a per-context startup cost that a
  node environment does not. Putting the whole layer in a browser buys realism we
  only need for roughly a fifth of it, and pays for it on every run of `verify`.
  Splitting keeps the realism exactly where the risk is.
- **`experimental.fsModuleCache` on, its cache directory restored in CI.**
  Vitest 4 can persist the transformed-module cache to disk. The docs call out
  the win as largest "when rerunning a small number of tests that depend on a
  large module graph" — which is precisely this layer: ~40 tests sitting on React
  19 + Radix + Tailwind + TanStack.
- **Network: MSW intercepting `POST /rpc/*`, backed by the real `RPCHandler`
  over a stub router.** Do not hand-write oRPC wire payloads. Build an
  `implement(contract)` stub whose handlers return fixture data, wrap it in the
  same `RPCHandler` the server uses, and let the MSW handler pass the intercepted
  `Request` through it. The consequence is the point: **a contract change breaks
  the component tests at typecheck time**, so an agent editing
  `packages/contract` cannot leave the UI layer silently stale.
- **Assertions are unconditional.** A stub router returns exactly what the test
  says it returns, so there is nothing to guard against. No `if` in a test body.

This layer absorbs, with *stronger* assertions than they have today: the stream
grid's card states, codec chips, viewer counts, snapshot-age pill, and actions
menu; the recordings index totals/filter/`/`-to-focus; the RHF+Zod save-bar
dirty-state logic in all three config forms; and the locale switcher. Those are
44 of the current 82 tests, and they are the entire reason the five-project
matrix exists.

### 2. Fold the non-rendering E2E specs into Vitest

- **`api.spec.ts` (12 tests) → `apps/api/src/*.test.ts`.** Every one of these is
  `await request.get(...)` plus a header assertion. `media.test.ts` already does
  this in-process. Move them, and drop the `if (status === 200) … else …`
  branches — in-process the fixture state is known, so assert the 206 and the
  `Content-Range` unconditionally. This also finally covers the Range/206 logic
  that `docs/debt/20260714231521-vitest-layers-not-ported.md` lists as
  outstanding.
- **`mediamtx.spec.ts` (8 tests) → delete, replaced by a compose healthcheck.**
  These assert that the fixture is up. That belongs in the CI step that starts
  the fixture, not in the test suite — the existing `curl`-poll loop in
  `ci.yml` already does 90% of it. Failing there gives a better error message
  than eight red tests.

### 3. Shrink the E2E matrix to chromium, and give it workers

Keep E2E for what only E2E can see: real MediaMTX round-trips, byte-range MP4
streaming in a real media element, and accessibility of the rendered document.

- **PR runs chromium only.** `firefox` / `webkit` / `mobile-*` move to a nightly
  scheduled workflow. If cross-browser is to be justified, it should be justified
  by a spec that actually drives HLS/WHEP playback — see "Payoff trigger."
- **`workers: '100%'`.** Two workers on a four-core runner is leaving half the
  machine idle.
- **Keep, unchanged:** `path-config`, `path-defaults`, `record-toggle`,
  `publish-urls`, plus a byte-range streaming spec and the a11y sweep.
- **Delete the 33 `networkidle` waits** as their specs move or are rewritten;
  web-first assertions already auto-wait.

Estimated remaining E2E: **~25 executions in one browser**, down from 258 in five.

### 4. Rebuild CI around the fast layer, and implement `pnpm verify`

- **One `verify` job** — lint, typecheck, `i18n:check`, unit + component tests,
  build — as the PR gate. This is ADR 0004's `pnpm verify`, now with the
  component layer inside it, and it is the same command an agent runs locally.
  Projected ~90s.
- ~~**Upload the build as an artifact; stop rebuilding in the E2E job.**~~
  **Dropped during implementation.** The rebuild is only 3s; artifact upload plus
  download costs more than that for a multi-MB SPA bundle. Change 6's Turborepo
  cache makes the E2E job's `pnpm build` a cache replay instead, which is both
  faster and one fewer moving part.
- **Cache the Playwright browsers** (`actions/cache` on `~/.cache/ms-playwright`)
  and install chromium only: 45s → ~10s.
- ~~**Drop the `apt-get install ffmpeg` step** (23s).~~ **Withdrawn — the premise
  was wrong.** The claim that ffmpeg "exists only to silence spawn errors from a
  cron the suite does not assert on" does not survive reading the specs:
  `streams.spec.ts:145` clicks "Take snapshot" and asserts the "Snapshot
  captured" toast, which spawns ffmpeg against the RTSP feed. Its guard checks
  for `online since`, which the fixture streams always have, so the test really
  runs and would go red without the binary. The step stays, and its misleading
  comment in `ci.yml` is corrected to say why.
- **`retries: 1`** in CI. With live-MediaMTX assertions confined to four specs,
  two retries is buying flake tolerance we should no longer need — and it is
  what turns a 7-minute run into the 10-minute runs that prompted this ADR.

Projected critical path with changes 1–4 alone: `verify` ~90s → `e2e-smoke` ~2m,
against `image-smoke` ~2m in parallel — **~3m 30s total**. Changes 6–8 take it
further; see "Projected timings" below.

### 5. Make the conditional-assertion rule enforced, not advisory

Per ADR 0004's "enforced, not discipline" principle, add an ESLint
`no-restricted-syntax` rule banning `IfStatement` inside a `test()` callback
under `tests/e2e/**`. Without this, the next agent writing an E2E test against
live data reaches for the same `if` guard and the suite silently re-rots. The
escape hatch is honest: if the state genuinely varies, the test belongs in the
component layer where it can be made deterministic.

`CONTRIBUTING.md`'s "assert state A or state B" guidance and `docs/TESTING.md`'s
"Resilient E2E" convention are amended in the same change — they are the source
of the pattern.

### 6. Persist the Turborepo cache across CI runs

The repo has Turborepo and gets no caching benefit from it in CI, because
`.turbo` dies with the runner. Restore it and unchanged packages stop being
recomputed:

- **`actions/cache` on `.turbo`**, keyed per-commit with a prefix `restore-keys`
  so each run starts from its newest ancestor's cache. Implementation chose this
  over [`rharkor/caching-for-turbo`](https://github.com/rharkor/caching-for-turbo)
  (a remote-cache server backed by `@actions/cache`): it is one fewer third-party
  action to audit and pin, and "boring over clever" applies to CI too. Revisit if
  whole-directory restore proves to degrade badly at scale.
- ~~Add `test` outputs and correct `inputs` to `turbo.json`.~~ **Deliberately not
  done.** Turborepo's default is to hash every file in the package, which is
  exactly the conservative behaviour we want; hand-tuning `inputs` is how a task
  gets skipped when it should have run, and this ADR already names stale-cache
  greens as the risk caching introduces. The default already isolates `apps/api`
  from `apps/web`, which is where the win is.
- Cache the Vitest `fsModuleCache` directory (change 1) on the same key.
- Add `--cache` to ESLint and cache `.eslintcache`.

On a PR touching one package, lint/typecheck/test/build for every other package
become cache hits. `packages/contract` is a JIT package with no build, so it is
cheap regardless — the wins are `apps/api` and `apps/web` not paying for each
other.

### 7. Run only what the change can break

Two filters, cheapest first:

- **`paths-ignore` on the E2E and image-smoke jobs** for `**.md`, `docs/**`,
  `LICENSE`. A markdown-only PR should not boot MediaMTX. This is a
  hand-maintained list, which is why it stays deliberately tiny — docs only,
  where the "can this break the app?" answer is unambiguous.
- ~~**Turborepo affected-detection**~~ (`--filter=...[origin/main]`) —
  **deferred during implementation.** With change 6's cache in place an
  unaffected package is already a replay costing tens of milliseconds
  (`typecheck` measured at 12.2s cold, 28ms cached), so filtering saves close to
  nothing while adding a second, independent way for a task to silently not run.
  Reconsider if the cache hit rate turns out to be poor in practice.

Note the interaction with ADR 0004's coverage floor: an affected-only run
produces partial coverage. The floor must be computed on a full run — keep it on
the `main`/`beta` push workflow, not the PR one, or the ratchet reads noise.

### 8. Make the agent's inner loop sub-second, not sub-minute

CI wall clock is the wrong target for an agent — the right one is the cost of
checking a change it *just made*, where almost nothing needs re-running:

- **`pnpm verify` for the full gate** (change 4) — mirrors CI exactly, for
  pre-push confidence.
- **`pnpm verify:quick` → `vitest --changed`** — Vitest resolves the module graph
  and runs only tests reachable from uncommitted changes. On a typical
  single-module edit this is 1–3 seconds. `--changed origin/main` scopes it to
  the whole branch.
- **`pnpm test:watch` already exists per-package**; surface it at the root so
  watch mode is the default posture during a multi-step change rather than
  something rediscovered each session.

This is the change with the largest effect on whether tests are run at all
before a push, and it costs three `package.json` lines.

## Timings

### Measured after changes 3, 4, 6, 7, 8 landed

Local, on the implementation branch:

| | before | after |
|---|---|---|
| `pnpm verify` (lint + typecheck + i18n + unit), cold cache | — | **29.2s** |
| `pnpm verify`, warm Turborepo cache | — | **8.5s** |
| `pnpm test:changed` after editing one api module | — | **2.6s** (22 tests) |
| `turbo typecheck` | 12.2s | **28ms** cached (`>>> FULL TURBO`) |
| `playwright test --list` | 258 tests | **82 tests** (chromium only) |

The 258 → 82 figure is Playwright's own count and matches the CI log
(`Running 258 tests using 2 workers`) exactly, so the E2E run should fall by
roughly the same ratio once `workers: '100%'` is also in play.

### Projected

Estimates, not measurements — the point is the shape, and each is falsifiable by
landing the stage that claims it.

| Scenario | Today | Changes 1–5 | + changes 6–8 |
|---|---|---|---|
| Docs-only PR | 7m 16s | 7m 16s | **~20s** (E2E and image-smoke skipped) |
| One-package change, warm cache | 7m 16s | ~3m 30s | **~2m 30s** (`verify` ~30s) |
| Contract change (fans out everywhere), cold cache | 7m 16s | ~3m 30s | ~3m 15s |
| Agent checking its own edit, locally | 5–8m (or skipped) | 30–45s | **1–3s** (`vitest --changed`) |

Two honest floors bound this:

- **~12–15s of every CI job is provisioning, checkout, toolchain setup, and
  install**, even with a warm pnpm store. Below that needs larger runners or
  self-hosted, which is a cost decision this ADR does not make.
- **The four live-MediaMTX E2E specs need Docker up**, ~16s, plus MediaMTX
  readiness. Any run that includes them has a ~1m floor no caching removes.

## Consequences

- Projected CI wall clock **7m 16s → ~2m 30s** on the common case, and the first
  actionable signal moves from ~7 minutes to ~30 seconds.
- The local agent loop becomes `vitest --changed` at 1–3 seconds, with
  `pnpm verify` as the pre-push gate. This is the change that most affects
  whether tests get run at all before a push, and it is also the cheapest one in
  the set.
- **Caching introduces a new failure mode: a stale-cache green.** A wrong `inputs`
  declaration in `turbo.json` means a task is skipped when it should have run,
  and the failure is invisible — the job goes green. This is the same
  silent-failure class the ADRs keep circling. Mitigation: the `main`/`beta` push
  workflow runs unfiltered and uncached, so a bad hash surfaces on merge rather
  than never.
- **Affected-only runs produce partial coverage**, which interacts badly with ADR
  0004's floor. The floor moves to the full run on push; PRs report coverage
  without gating on it.
- `paths-ignore` is a hand-maintained list and will eventually be wrong. Keeping
  it to docs and markdown only bounds the damage: the failure mode is "we skipped
  E2E for a README change," not "we skipped E2E for a code change."
- **Coverage goes up, not down.** 19 tests that could pass with the feature
  broken are replaced by deterministic component tests that cannot. Range/206
  logic and the RHF forms — both currently listed as uncovered debt — get real
  tests.
- We give up incidental cross-browser coverage on PRs. This is a real loss, but
  a small one: the matrix is not currently pointed at the browser-divergent code
  (HLS/WHEP), and the nightly run still catches drift within a day.
- **A third test tool and config to maintain**, on top of the two ADR 0001
  already noted. Browser mode also makes `apps/web`'s Vitest depend on
  Playwright, coupling the two runners' versions.
- The component layer can drift from reality: a stub router that returns a shape
  MediaMTX never actually produces will pass. Sourcing stub fixtures from real
  captured MediaMTX responses, and keeping the four live-MediaMTX E2E specs,
  is the mitigation — this is why change 3 keeps them rather than mocking
  everything.
- Deleting `mediamtx.spec.ts` removes our only assertion that the dev fixture
  publishes a diverse stream fleet. The compose healthcheck must actually assert
  the stream names, not just that the API answers, or that check is weaker than
  what it replaced.
- ADR 0004's coverage floor should extend to `apps/web` once this layer exists.
  Deliberately out of scope here — a floor imposed on a layer the same week it
  is created invites tests written to touch lines.

## Alternatives

- **Just parallelize: `workers: '100%'` + shard the E2E job across N runners.**
  Cheapest possible change, and it would cut the 4m 44s substantially. Rejected
  as the *whole* answer: sharding buys wall clock with runner minutes, leaves the
  local agent loop exactly as expensive as it is today (the reason tests get
  skipped), and does nothing about the 37% of executions that cannot fail.
  Paying more to run vacuous tests faster is the wrong trade. `workers: '100%'`
  is adopted above as part of change 3.
- **Keep E2E-only, but fix the assertions in place** — seed MediaMTX to a known
  state so the `if` guards can be deleted without flaking. Rejected: it fixes the
  weakness but not the cost, and a deterministically-seeded MediaMTX is a large
  piece of bespoke fixture machinery whose failure modes we would then own. The
  component layer gets determinism for free, because a stub router *is* the
  known state.
- **Browser mode for the whole component layer.** This was this ADR's original
  recommendation, on the grounds that Radix needs real pointer events and jsdom
  needs shims to fake them. Revised once speed became the governing constraint:
  it makes the component layer the single largest line item in `verify`, and it
  buys realism for the ~80% of the layer that only asserts on rendered output.
  The `projects` split in change 1 keeps the realism where the risk actually is.
  Reconsider if maintaining two environments proves more annoying than the
  seconds it saves.
- **Tune Vitest — `pool: 'threads'`, `isolate: false`, `fileParallelism`.** The
  documented levers, and the obvious place to look. Rejected as a *primary*
  lever by measurement, not by principle: the unit suite runs in **1 second**, so
  the entire theoretical win is sub-second, and `isolate: false` would trade it
  for cross-file state bleed in suites built on `vi.mock` factories — the exact
  fragility `docs/TESTING.md` already warns about. Worth revisiting only if the
  component layer grows large enough for isolation cost to be measurable, at
  which point measure first.
- **Shard `verify` across runners.** Buys wall clock with runner minutes. Rejected
  at this size: with caching and affected-detection the job is ~30s, of which
  half is fixed setup that every shard would pay again. Sharding a 30s job makes
  it slower.
- **Drop E2E entirely; rely on unit + component + image smoke.** Fastest
  possible. Rejected outright: `record-toggle` and `path-config` encode real
  MediaMTX inheritance semantics that no mock would have caught — the
  record-state bug they guard against wrote files to a directory nothing read
  for 2.5 hours. Mocks agree with themselves; those four specs are the only place
  we find out MediaMTX disagrees.
- **Playwright component testing** instead of Vitest browser mode. Would keep
  one tool. Rejected: it is still experimental, it does not share the Vite config
  `apps/web` already has, and it would not run under `pnpm verify` alongside the
  api unit tests.

## Payoff trigger

Revisit when any of: a browser-specific regression ships that the nightly matrix
catches and the chromium PR gate missed (restore that browser to the PR matrix);
`verify` creeps past ~2 minutes (shard it, or move the component layer to its own
job); or a WHEP/HLS playback spec lands (at which point cross-browser has a real
justification and should be scoped to that spec rather than to all of `uiSpecs`).

Supersedes the deferred component-layer scope of ADR 0004 and pays down
`docs/debt/20260714231521-vitest-layers-not-ported.md`.
