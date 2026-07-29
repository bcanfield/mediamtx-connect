## [2.1.5](https://github.com/bcanfield/mediamtx-connect/compare/2.1.4...2.1.5) (2026-07-29)

Eleven days of work in one release: MediaMTX-facing fixes to config and record
state, a rebuilt test suite, and the automation that made this a nightly train
in the first place. Notes written by hand — the generator that should have
produced them shipped this release blank ([#298](https://github.com/bcanfield/mediamtx-connect/pull/298)).

### Features

* **Revert a path to inherited config** ([#208](https://github.com/bcanfield/mediamtx-connect/issues/208)) — saving any change to a wildcard-backed stream materializes a permanent config entry, and until now nothing in the UI could undo it. The per-path config page grows a header action, shown only once the path has an entry of its own, that deletes it behind a confirm (`v3/config/paths/delete`) and returns the path to tracking its wildcard. New oRPC procedure `config.mediamtx.deletePathConfig`.
* **Path Hooks warn before they kick the publisher** ([#207](https://github.com/bcanfield/mediamtx-connect/issues/207)) — saving a `runOn*` hook restarts the path and disconnects whatever is publishing to it (verified on MediaMTX v1.19.2; a `record*` save does not). The per-path surface had one section safe to save and one that drops the stream, behind identical save bars. There is now an amber callout on the Path Hooks section on both path scopes, localized across all 30 languages.

### Bug Fixes

* **Record state tells the truth: `on` / `off` / `unknown`** ([#205](https://github.com/bcanfield/mediamtx-connect/issues/205)) — a path config entry the API couldn't read used to resolve to a confident OFF, claiming a stream wasn't recording while MediaMTX was writing files. `unknown` is now a first-class state in `StreamSchema`, rendered as an amber `○ REC?` on the card and disabling the record toggle rather than guessing at what it would flip.
* **One flaky config read no longer blanks the whole grid** ([#205](https://github.com/bcanfield/mediamtx-connect/issues/205)) — the per-path config reads sat inside the catch that returns `connection-error`, so a single failure replaced every stream with "Can't reach MediaMTX" against a healthy server. Each read now reports as itself.
* **Local disk faults are no longer blamed on MediaMTX** ([#205](https://github.com/bcanfield/mediamtx-connect/issues/205)) — snapshot mtimes are stat'd outside the MediaMTX try/catch, so an unreadable screenshots directory surfaces as a failed query instead of a server-unreachable panel.
* **Publish URLs respect the protocol enable flags** ([#213](https://github.com/bcanfield/mediamtx-connect/issues/213)) — `publishTargets` emitted RTSP/RTMP/SRT URLs unconditionally, handing operators a copied URL that would silently refuse the publisher. Each target is now gated on its global enable flag; with every source protocol off, "Copy publish URLs" is disabled and the zero-streams hint well is dropped. One builder feeds both surfaces, so they can't disagree.
* **Recording-thumbnail extraction is bounded** ([#204](https://github.com/bcanfield/mediamtx-connect/issues/204)) — `generateScreenshots` spawned one ffmpeg per missing thumbnail, all at once; a large recordings backlog could swamp the host. It now runs under its own concurrency gate, a sibling of the live-capture gate rather than the same one, so batch work can't queue ahead of the 30-second live cron or a user-triggered snapshot.
* **Concurrency caps scale with the machine** ([#204](https://github.com/bcanfield/mediamtx-connect/issues/204)) — both gates derive from `os.availableParallelism()` clamped to 2–8, replacing a flat 4. A 2-core NAS no longer runs four ffmpeg at once; an 8-core host is no longer held to four.

### Testing

* **Test layers restructured for speed and coverage** ([#266](https://github.com/bcanfield/mediamtx-connect/pull/266), [ADR 0005](https://github.com/bcanfield/mediamtx-connect/blob/main/docs/adr/0005-fast-test-suite.md)) — work that was paying browser prices for logic assertions moved down a layer. New Vitest component project (happy-dom) covering the stream card, its actions menu, the hooks warning and revert-to-inherited; the harness mirrors the real provider stack and serves `/rpc/*` through MSW backed by the **real** `RPCHandler` over an `implement(contract)` stub, so a contract change fails these at typecheck. New API suites for range-request media serving and the Docker health endpoint. Playwright now runs Chromium-only by default with the full browser matrix reserved for the nightly job, and `test()` bodies may no longer hide assertions behind conditionals — a guarded assertion passes when the feature is broken.
* **WHEP playback has real-transport coverage** ([#211](https://github.com/bcanfield/mediamtx-connect/issues/211)) — WebRTC negotiation was only unit-tested against a fake `RTCPeerConnection`, so a regression would silently fall back to HLS and stay green. `playback.spec.ts` opens a real peer connection to live MediaMTX, asserts the `WEBRTC` pill and a `MediaStream`-driven `<video>`, then aborts the WHEP POST and asserts the honest `WEBRTC UNAVAILABLE` fallback.
* New scripts: `pnpm verify` (the CI build gate locally — no Docker, no browsers), `pnpm test:changed`, `pnpm test:watch`.
* E2E preflight moved out of the suite: `wait-for-mediamtx.mjs` gates on the fixture fleet being published *and* `ready`, reporting one named error instead of eight test failures ([#232](https://github.com/bcanfield/mediamtx-connect/pull/232), [#290](https://github.com/bcanfield/mediamtx-connect/pull/290)).

### Internal

* **Geist type ramp promoted to theme tokens** ([#217](https://github.com/bcanfield/mediamtx-connect/issues/217)) — the nine sub-`text-base` sizes were retyped as arbitrary values at every call site. They are now named `@theme` tokens (`text-section`, `text-body`, `text-control`, …) that dedupe against Tailwind's own scale through `cn()`. Mechanical refactor, no visual change.
* **Dev fixture seeding can't be silently skipped** ([#219](https://github.com/bcanfield/mediamtx-connect/issues/219)) — seeding ran as a `predev` lifecycle hook, so a contributor with pre/post scripts disabled got an empty Recordings page that reads as "feature broken". It is now the first link in the `pnpm dev` chain.

### Release & repo automation

* **Nightly release train** ([#285](https://github.com/bcanfield/mediamtx-connect/pull/285)) — merges land around the clock, and releasing per-push minted several versions a day and rebuilt the multi-arch image for each. One scheduled run at ~07:00 `America/New_York` now rolls the whole night into a single version, changelog entry, and image build; it refuses to run unless the latest CI run on `main` is green. `workflow_dispatch` covers out-of-band releases.
* **Conventional PR titles enforced in CI** ([#286](https://github.com/bcanfield/mediamtx-connect/pull/286)) — `main` is squash-merged, so the PR title *is* the commit subject semantic-release parses; a non-conventional title silently drops the change out of the next release. The check lives inside `ci.yml` rather than its own workflow so the agent loop can see and auto-fix a failure.
* **Renovate batched into one nightly PR** ([#274](https://github.com/bcanfield/mediamtx-connect/pull/274)) — minor/patch/pin/digest updates group and automerge on green CI; majors queue behind Dependency Dashboard approval so a backlog can't flood the PR list overnight.
* **3-day `minimumReleaseAge`** ([#297](https://github.com/bcanfield/mediamtx-connect/pull/297)) — pnpm 11 rejects any lockfile entry published in the last 24 hours and CI installs with `--frozen-lockfile`, so Renovate proposing fresh releases turned `main` red. The floor sits above pnpm's cutoff with room for skew, and buys a supply-chain window of its own.

### Documentation

* **README translations back-ported across all 29 locales** ([#200](https://github.com/bcanfield/mediamtx-connect/issues/200)) — every translated README had been bumped to the current source hash without actually carrying the newer English sections, and the staleness guard only compared recorded hashes, so CI reported green on stale content. Content back-ported, and the guard now compares each locale's structure against the source — heading outline, per-fenced-block language and line count, every backticked literal — so a lockstep hash bump can no longer pass off stale content as synced.
* Responsive breakpoint policy moved out of `CONTEXT.md` into its own `docs/RESPONSIVE.md`, leaving the glossary a glossary ([#220](https://github.com/bcanfield/mediamtx-connect/issues/220)).
* `SECURITY.md` ([#197](https://github.com/bcanfield/mediamtx-connect/issues/197)), `CODE_OF_CONDUCT.md` ([#241](https://github.com/bcanfield/mediamtx-connect/issues/241)) and its README link ([#242](https://github.com/bcanfield/mediamtx-connect/issues/242)), `GOVERNANCE.md` ([#248](https://github.com/bcanfield/mediamtx-connect/issues/248)).

### Dependencies

* MediaMTX dev/CI image to v1.19.3; hono 4.12.31, `@hono/node-server` 2.0.11, radix-ui 1.6.2, hls.js 1.6.16, vite 8.1.5, tailwindcss 4.3.3, semantic-release 25.0.8.
* `@orpc` held at 1.14.12 ([#297](https://github.com/bcanfield/mediamtx-connect/pull/297)) — 1.14.13 was ~8 hours old when it automerged and pnpm's 24-hour gate rejected it. It returns on a later nightly run.

### Notes on this release

The empty release body 2.1.5 originally shipped with was a changelog-tooling
bug, not a quiet release: `conventional-changelog-conventionalcommits` 10
renamed the key semantic-release's bundled writer looks for, so the notes
rendered as a header with every commit section dropped, and nothing errored.
Fixed and pinned in [#298](https://github.com/bcanfield/mediamtx-connect/pull/298).

Most of the work above also predates the conventional-PR-title check that
landed in this same release, so it reached `main` under subjects the generator
would have skipped regardless.

This release additionally carried scaffolding from the smallhours agent-loop
experiments — `GRILL-QUEUE.md`, `TRIAGE-PLAN.md`, `docs/M7-VALIDATION.md`, and
the `smallhours: …` commits. Working files and validation markers with no
runtime effect; the shipped outcomes of those runs are the fixes listed above.

## [2.1.4](https://github.com/bcanfield/mediamtx-connect/compare/2.1.3...2.1.4) (2026-07-18)

### Bug Fixes

* Bugfixes, translations, error fixes ([49b1357](https://github.com/bcanfield/mediamtx-connect/commit/49b1357f7aa0909a1cbaaee960570b5d0a2b7e6a))
* Theming, spacing, bugfixes ([4e04022](https://github.com/bcanfield/mediamtx-connect/commit/4e04022929516bbd4759497c3ae8940ccd2e77a0))

## [2.1.3](https://github.com/bcanfield/mediamtx-connect/compare/2.1.2...2.1.3) (2026-07-10)

### Bug Fixes

* **deps:** update nextjs monorepo to v16.2.10 ([#163](https://github.com/bcanfield/mediamtx-connect/issues/163)) ([d6f0053](https://github.com/bcanfield/mediamtx-connect/commit/d6f0053debddebbe88e81759d0df99bfe73dc768))

## [2.1.2](https://github.com/bcanfield/mediamtx-connect/compare/2.1.1...2.1.2) (2026-06-13)

### Bug Fixes

* **deps:** update nextjs monorepo to v16.2.9 ([#149](https://github.com/bcanfield/mediamtx-connect/issues/149)) ([2e959e9](https://github.com/bcanfield/mediamtx-connect/commit/2e959e967ae35022f33113773eaaca2e3074b313))

## [2.1.1](https://github.com/bcanfield/mediamtx-connect/compare/2.1.0...2.1.1) (2026-06-07)

### Bug Fixes

* **deps:** update nextjs monorepo to v16.2.7 ([#127](https://github.com/bcanfield/mediamtx-connect/issues/127)) ([a92a80b](https://github.com/bcanfield/mediamtx-connect/commit/a92a80b1d8797a28d5afb04eeee4ef970b50c41c))

## [2.1.0](https://github.com/bcanfield/mediamtx-connect/compare/2.0.1...2.1.0) (2026-05-11)

### Features

* Expand i18n to 30 locales with translation-status guard ([3470ef5](https://github.com/bcanfield/mediamtx-connect/commit/3470ef5dd56431b5cb547ccf68fc9d794c13a603))

## [2.0.1](https://github.com/bcanfield/mediamtx-connect/compare/2.0.0...2.0.1) (2026-05-11)

### Bug Fixes

* **deps:** update nextjs monorepo to v16.2.6 ([#111](https://github.com/bcanfield/mediamtx-connect/issues/111)) ([3ecf372](https://github.com/bcanfield/mediamtx-connect/commit/3ecf372b7c8447d0edebe0ce6a476bd82a42ac63))

## [2.0.0](https://github.com/bcanfield/mediamtx-connect/compare/1.5.0...2.0.0) (2026-05-09)

### ⚠ BREAKING CHANGES

* feature-folder restructure under `src/features/*`; `process.env` access centralized through `@/lib/env`; shadcn-based UI shell replaces v1 layout (Sidebar + SidebarInset, redesigned Live View / Recordings / Client Config / MediaMTX Config pages); v1 internal layout removed.

### Features

* v2 — rewrite, test pyramid, UI redesign, robots ([#96](https://github.com/bcanfield/mediamtx-connect/issues/96)) ([c8105fe](https://github.com/bcanfield/mediamtx-connect/commit/c8105fe102581d896ae4e11c550e1b1c09062c79))

# [1.5.0](https://github.com/bcanfield/mediamtx-connect/compare/1.4.2...1.5.0) (2026-05-09)


### Bug Fixes

* bump Node.js to 22 in release job to satisfy semantic-release requirement ([#93](https://github.com/bcanfield/mediamtx-connect/issues/93)) ([ebae5fe](https://github.com/bcanfield/mediamtx-connect/commit/ebae5fea7c15da0d14f54f11840bd87bc70393d7))


### Features

* Organize for automaker ([97ff358](https://github.com/bcanfield/mediamtx-connect/commit/97ff3582892bbd3be6b2b3bfe49e009e0a2d3a58))
* Revive Repo ([524d8d4](https://github.com/bcanfield/mediamtx-connect/commit/524d8d4d67913308f537a3798f423509f110a0df)), closes [#71](https://github.com/bcanfield/mediamtx-connect/issues/71) [#66](https://github.com/bcanfield/mediamtx-connect/issues/66) [#66](https://github.com/bcanfield/mediamtx-connect/issues/66) [#62](https://github.com/bcanfield/mediamtx-connect/issues/62) [#66](https://github.com/bcanfield/mediamtx-connect/issues/66)

## [1.4.2](https://github.com/bcanfield/mediamtx-connect/compare/1.4.1...1.4.2) (2023-12-21)


### Bug Fixes

* Enhance recording viewing ([55cbe8e](https://github.com/bcanfield/mediamtx-connect/commit/55cbe8e89cb91961ab2be01aabd6c7f8584d7ed6))

## [1.4.1](https://github.com/bcanfield/mediamtx-connect/compare/1.4.0...1.4.1) (2023-12-21)


### Bug Fixes

* Add base path to work smoothly behind nginx reverse proxy ([fcba828](https://github.com/bcanfield/mediamtx-connect/commit/fcba8288e302cea9aee5bedbef6a822447e70e48))
* Add redirect following up basepath addition ([23edc04](https://github.com/bcanfield/mediamtx-connect/commit/23edc04c7b183ac0ce143e1a56ed0e0fdbe6e5b7))

# [1.4.0](https://github.com/bcanfield/mediamtx-connect/compare/1.3.8...1.4.0) (2023-12-17)


### Bug Fixes

* Migrate Prisma before Cross-Browser Tests ([72d0424](https://github.com/bcanfield/mediamtx-connect/commit/72d0424ffdb43ade18177330d977289f5f7263bd))
* Update Cypress Tests to match updated UI ([5ae62cf](https://github.com/bcanfield/mediamtx-connect/commit/5ae62cf3e0431687becf278d4b2209dfdb88e23e))


### Features

* Add forms for configuring MediaMTX API ([#57](https://github.com/bcanfield/mediamtx-connect/issues/57)) ([bbb2b0a](https://github.com/bcanfield/mediamtx-connect/commit/bbb2b0a3dbc578d432de8a2fab6e9f86dce7422e))

## [1.3.8](https://github.com/bcanfield/mediamtx-connect/compare/1.3.7...1.3.8) (2023-12-14)


### Bug Fixes

* **deps:** update dependency pino to v8.17.1 ([f8ff227](https://github.com/bcanfield/mediamtx-connect/commit/f8ff22760e9f649542f55b706d518f75a37488be))

## [1.3.7](https://github.com/bcanfield/mediamtx-connect/compare/1.3.6...1.3.7) (2023-12-13)


### Bug Fixes

* **deps:** update dependency pino to v8.17.0 ([1065990](https://github.com/bcanfield/mediamtx-connect/commit/10659906b4fc52fbce4eefe9e0fffcc3bbd0abcc))

## [1.3.6](https://github.com/bcanfield/mediamtx-connect/compare/1.3.5...1.3.6) (2023-12-12)


### Bug Fixes

* **deps:** update dependency @typescript-eslint/eslint-plugin to v6.14.0 ([bdfbe0f](https://github.com/bcanfield/mediamtx-connect/commit/bdfbe0fc104f1dee69d1b904001be269ff359dd6))

## [1.3.5](https://github.com/bcanfield/mediamtx-connect/compare/1.3.4...1.3.5) (2023-12-07)


### Bug Fixes

* **deps:** update dependency hls.js to v1.4.13 ([9a957d4](https://github.com/bcanfield/mediamtx-connect/commit/9a957d44079c7de072f6735a4c3ddf63bd188679))

## [1.3.4](https://github.com/bcanfield/mediamtx-connect/compare/1.3.3...1.3.4) (2023-12-05)


### Bug Fixes

* **deps:** update dependency @typescript-eslint/eslint-plugin to v6.13.2 ([a6628a2](https://github.com/bcanfield/mediamtx-connect/commit/a6628a2e9e14302cd497088870fea5f03d1361f3))

## [1.3.3](https://github.com/bcanfield/mediamtx-connect/compare/1.3.2...1.3.3) (2023-12-04)


### Bug Fixes

* **deps:** update dependency tailwind-merge to v2.1.0 ([e1ce8ea](https://github.com/bcanfield/mediamtx-connect/commit/e1ce8ea7d722bb5b6a5ddbfa69e5d37ebc684caa))

## [1.3.2](https://github.com/bcanfield/mediamtx-connect/compare/1.3.1...1.3.2) (2023-11-30)


### Bug Fixes

* Add alerts when directories dont exist ([92ae1e5](https://github.com/bcanfield/mediamtx-connect/commit/92ae1e5255cda879aeb90217d4ea6d2cf116675a))

## [1.3.1](https://github.com/bcanfield/mediamtx-connect/compare/v1.3.0...1.3.1) (2023-11-29)


### Bug Fixes

* Fix semantic release tag format ([7bcb8af](https://github.com/bcanfield/mediamtx-connect/commit/7bcb8af5db631bf8b9fdcc100fa4cb1afb498396))

# [1.3.0](https://github.com/bcanfield/mediamtx-connect/compare/v1.2.0...v1.3.0) (2023-11-29)


### Bug Fixes

* Add Linux webkit dependency ([1a64149](https://github.com/bcanfield/mediamtx-connect/commit/1a64149aedcc95ebcc4324fe221424ddfbbc76cd))


### Features

* Cross-browser testing and bugfixes on Docker setup ([d76134e](https://github.com/bcanfield/mediamtx-connect/commit/d76134e857e2bc1bd7c6c1226732e9074ffd7730))

# [1.2.0](https://github.com/bcanfield/mediamtx-connect/compare/v1.1.0...v1.2.0) (2023-11-28)


### Bug Fixes

* **deps:** update dependency next to v14.0.3 ([44ac2a0](https://github.com/bcanfield/mediamtx-connect/commit/44ac2a0e8ea88915a2d7025a7a4011a47added4e))


### Features

* Rename app ([#25](https://github.com/bcanfield/mediamtx-connect/issues/25)) ([e9acd20](https://github.com/bcanfield/mediamtx-connect/commit/e9acd2080ab5f4fc67970efaafdb942eebd4250e))

# [1.1.0](https://github.com/bcanfield/nextstream/compare/v1.0.1...v1.1.0) (2023-11-28)


### Bug Fixes

* **deps:** update dependency @typescript-eslint/eslint-plugin to v6.13.1 ([f7ec68a](https://github.com/bcanfield/nextstream/commit/f7ec68a375d97ca62c89d685043b6418f6f06407))


### Features

* Live Stream, Recordings, other general project enhancements ([#22](https://github.com/bcanfield/nextstream/issues/22)) ([60793c1](https://github.com/bcanfield/nextstream/commit/60793c179a2a26bbdd42978c576ea0f3ecf5a9cc))

## [1.0.1](https://github.com/bcanfield/nextstream/compare/v1.0.0...v1.0.1) (2023-11-27)


### Bug Fixes

* **deps:** update dependency @typescript-eslint/eslint-plugin to v6.13.0 ([37bd6fb](https://github.com/bcanfield/nextstream/commit/37bd6fb800643e66ca32eb859d599f96b5fad646))

# 1.0.0 (2023-11-22)


### Bug Fixes

* Tailwind config ([ce31f32](https://github.com/bcanfield/nextstream/commit/ce31f32f7e2dad0fd710c61d706cfd9a0cb0d727))


### Features

* Initial Commit ([81a8585](https://github.com/bcanfield/nextstream/commit/81a85855cc4a520d0dfcf86528f96400b2048c34))
