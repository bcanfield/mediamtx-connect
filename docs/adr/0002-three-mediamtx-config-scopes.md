# 0002 — Model MediaMTX config as three scopes, not one

**Date:** 2026-07-16
**Status:** Accepted

## Context

The app models MediaMTX config as a single thing: one "MediaMTX Config" page at `/config/mediamtx/global`, backed by `config.mediamtx.getGlobal`/`updateGlobal` over `/v3/config/global/{get,patch}`, with eight rail sections. MediaMTX itself has three scopes:

- **Global** (`/v3/config/global`) — server-wide: listen addresses, logging, protocol toggles.
- **Path defaults** (`/v3/config/pathdefaults`) — inherited by every path.
- **Path config** (`/v3/config/paths/{name}`) — one path's own sparse overrides.

`GlobalConfigSchema` declares the six `record*` keys as `.optional()`, but MediaMTX serves them from **pathdefaults**, not global — so `getGlobal` silently resolves them to `undefined` and no section renders them. The recordings empty state links to `/config/mediamtx/global` under an "Enable recording" CTA, so the CTA lands on a page structurally incapable of enabling recording. `PATCH /v3/config/global/patch` still *accepts* `record`, making it a write path that never reads back.

Verified against the running v1.19.2 dev container on 2026-07-16:

- `pathdefaults/get` returns `record: true` plus `recordPath`, `recordFormat`, `recordPartDuration`, `recordMaxPartSize`, `recordSegmentDuration`, `recordDeleteAfter`, and 15 `runOn*` keys. Recording is already on; the stream card's hard-wired `OFF` is false, and the CTA offers to enable what is already enabled.
- `config/paths/list` holds exactly one entry, the wildcard `all_others`. All five runtime paths report `confName: 'all_others'`, so **wildcard-backed is the only case, not an edge case**.
- `config/paths/get/stream1` → 404. A wildcard-backed path has no entry of its own to read or patch; its effective config is reachable only via its `confName`.
- `POST config/paths/add/stream5 {"record":false}` → 200, and the live session survived untouched (`readyTime` unchanged, `ready` still true). Materializing is non-disruptive.
- The materialized entry is a **sparse override, not a snapshot**: patching `pathdefaults.recordFormat` from `fmp4` to `mpegts` propagated to the materialized path immediately. Only the explicitly set key stops tracking defaults.

Only global hooks (`runOnConnect`, `runOnConnectRestart`, `runOnDisconnect`) belong on the global page; every hook a stream cares about is path-scoped. "Edit path config" and "Edit hooks" are therefore one object, not two features.

## Decision

Model all three scopes explicitly, and keep each on its own surface:

- **Global** stays at `/config/mediamtx/global` with its designed eight sections, unchanged.
- **Path defaults** gets `/config/mediamtx/path-defaults`, over a new `/v3/config/pathdefaults/{get,patch}` contract surface. The "Enable recording" CTA points here.
- **Path config** gets `/config/mediamtx/paths/$name`, over a new `/v3/config/paths/*` surface. "Edit hooks" targets the same route with the hooks section preselected.

The `record*` keys move off `GlobalConfigSchema` onto the pathdefaults surface, where MediaMTX actually serves them.

User-facing controls display **effective config** (path config merged over path defaults) and never a raw scope — a control that shows an inherited value as if it were unset is the bug this ADR exists to prevent. The stream card's record toggle writes the per-path override only, materializing the path when needed; it never writes path defaults, whose blast radius is every stream on the server.

The route is `path-defaults`, a sibling of `paths/$name` — not `paths/defaults`, which would reserve `defaults` as a path name and shadow any real MediaMTX path so named.

## Consequences

- Three scopes mean three routes and two new contract surfaces where there was one of each. The rail machinery (`sections.ts` descriptor, `ConfigFieldRow`, `SaveBar`, dirty tracking) is reused unchanged; path defaults and path config have near-identical key sets, so one form serves both.
- The design's board 2e pins eight sections for global config and specifies no per-path or defaults page. These two routes are undesigned surface derived from existing components — a deliberate deviation, taken because the alternative models path-scoped data as server-scoped.
- A card toggle can now create config entries. This is safe (verified non-disruptive, sparse, still tracking defaults) but means the set of configured paths grows through normal UI use, and `config/paths/list` stops being a proxy for "paths the operator configured by hand".
- Reading effective record state for the card grid costs one extra call per distinct `confName` — in practice one, since streams share a wildcard entry.
- 2026-07-16, from ticket 03: **"Materializing is non-disruptive" holds for `record*` writes but not for hooks.** Writing a `runOn*` key to a path's entry makes MediaMTX restart the path — `ready` flips to false and `readyTime` clears — while the same write with `recordFormat` leaves the session untouched (both verified on the live v1.19.2 container). The Context's non-disruptive finding was measured with a record-only body and doesn't generalize. The scope model is unaffected, but the per-path page now has one section that is safe to save and one that kicks the publisher, behind identical save bars. Tracked in `docs/debt/20260716155826-hook-write-drops-publisher.md`.
- `apps/api/src/mediamtx.ts` mirrors v1.11.3 shapes while the image ships 1.19.2. Both new surfaces are written against 1.19.2, so the client will straddle two versions until `docs/debt/20260715122210-mediamtx-schema-version-lag.md` is paid off.

## Alternatives

- **A ninth "Recording" section on the global page** — smallest fix for the dead-end CTA: one section descriptor, one surface. Rejected: it models path-scoped data as server-scoped at the exact moment a per-path route arrives, and still deviates from the designed eight sections. It buys nothing the sibling route doesn't, and costs the distinction.
- **`/config/mediamtx/paths/defaults` as a pseudo-path** — one route instead of two, inheritance visible in the URL. Rejected: it reserves `defaults` as a path name; a real path named `defaults` would be shadowed by the static segment and become unreachable.
- **Point the CTA at per-path config, skip pathdefaults entirely** — avoids the scope question. Rejected: `record` is currently set *in path defaults*, so the place recording is actually configured would remain unreachable from the UI.
- **Card toggle writes path defaults** — one surface, no materializing, no wildcard handling. Rejected: with all streams sharing `all_others`, one card's toggle would start or stop recording server-wide.

## Payoff trigger

None for the scope model itself — it is not deferred work. Deferred deliberately, and tracked separately: the per-stream detail page and embed builder (undesigned by the handoff's own instruction), and the resolution/latency/bitrate chips, which need frame-level metadata or counter sampling that `/v3/paths/list` does not provide.
