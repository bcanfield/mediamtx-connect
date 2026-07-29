# Ideas: Access Tiers — one setup for the public demo and the shared install

> **Status: ideas, not implemented.** Brainstorm only — nothing in this file is shipped. Shipped features live in [`docs/FEATURES.md`](../FEATURES.md). See [`00-index.md`](./00-index.md) for context. The deployment side of the public demo lives in [`docs/HOSTED-DEMO.md`](../HOSTED-DEMO.md).

Two audiences turn out to want the same thing:

- **The public demo.** Anonymous strangers should see a working dashboard. They must not be able to wreck it for the next visitor — but the config editor is the best thing we have to show, so locking it away makes the demo worse.
- **The shared install.** A team, a household, a school: the owner wants members to watch the cameras and browse recordings, and wants config edits to stay with whoever runs the box.

Both are the same feature — *a viewer tier that is real, enforced, and doesn't feel broken* — configured two ways. This file lines up that feature set.

## Why this earns priority despite being app-level work

`CLAUDE.md` deprioritizes our own auth by default, and rightly. Three things argue this one up the slate anyway:

1. **The policy source can be MediaMTX's, not ours.** `authInternalUsers[].permissions[]` already models users, per-path patterns, and actions (`publish`, `read`, `playback`, `api`, `metrics`, `pprof`). A viewer tier that reads *that* is wrapping a MediaMTX primitive, not inventing an identity system. No user table, no database — the repo's "no database" property survives.
2. **It is a blocker, not a feature.** The catalog's own triage rubric has an "Auth gating" axis. The public viewer route, the embed builder, kiosk mode, share links, and the hosted demo are all gated behind it. This unblocks a category.
3. **It closes a real exposure we already documented.** `docs/HOSTED-DEMO.md` §7 has to argue "the demo container is fully readable by design" because the app config form lets anyone repoint `recordingsDirectory`. Tier 3 D5 below fixes that properly, for every deployment.

## The one constraint that shapes everything

**MediaMTX's `action: api` is all-or-nothing.** There is no read-only API tier: anyone who can call `/v3/paths/list` can also `PATCH /v3/config/global/patch`. So we cannot build the viewer/admin split by forwarding a viewer's credentials to MediaMTX and letting it decide.

The division that does work:

| Surface | Who enforces | How |
|---|---|---|
| Live playback (HLS/WHEP) | **MediaMTX, natively** | the browser hits MediaMTX directly; `action: read` already governs it |
| Dashboard, config, recordings | **Connect** | Connect keeps one admin credential to MediaMTX and gates its *own* API |

So: MediaMTX is the policy source, Connect is the enforcement point for its own surface. That's honest, needs no upstream change, and is why the spine below is small.

---

## Tier 0 — The access spine

Ships first; everything else keys off it. Deliberately one capability, not a role system.

- **One boolean, not RBAC** — `canAdmin`. Resist custom roles, permission matrices, and group hierarchies until someone asks twice. Two tiers cover both audiences.
- **Server-side enforcement in exactly one place** — an oRPC middleware over every mutation (`config.app.update`, `config.mediamtx.*` writes, `streams.snapshot`) plus the reads that leak filesystem layout. ~30 lines. The UI gating in Tier 1 is cosmetics; this is the security boundary.
- **Admin sign-in, v1: a single shared password** — `CONNECT_ADMIN_PASSWORD` env, httpOnly cookie session, no user store, no DB, no password reset flow. Unset = today's behavior (everyone is admin), so existing installs are untouched.
- **Admin sign-in, v2: identities from `authInternalUsers`** — Connect already reads MediaMTX's config, including the user list and their `pass` (plain, `sha256:`, or `argon2:`). Verify a login against those hashes and you get named operators with zero new storage. `canAdmin` = "this user holds `action: api`" — a natural, MediaMTX-native mapping.
- **Anonymous tier is configurable** — `ANONYMOUS_ACCESS=viewer|none`. Demo and most shared installs want `viewer`; a locked-down install wants `none` and a login wall.
- **A `session.get` procedure** — returns `{ isAdmin, displayName, visiblePaths, capabilities }`. The single contract addition the whole family hangs off.

## Tier 1 — A read-only mode that doesn't feel like a broken app

- **The config pages become a read-only inspector** — the same 65 typed controls, rendered disabled, with no save bar. This is the shared install's actual request ("let them *see* how it's set up") and it costs almost nothing: the components already exist and already take a disabled state. Do not build a second set of "view" pages.
- **Hide, don't disable, what a viewer can't reach** — the stream card menu drops Record / Edit path config / Edit hooks; Play, snapshot, copy-publish-URL stay. Dead-ends with tooltips are worse than absence.
- **A viewer badge with a way up** — "Viewing as **Viewer** · Sign in". On the demo this is the best trick in the deck: visitors experience the locked-down mode a real deployment would give their team, then click one button (credentials printed on the page) to become admin and try the editor. The limitation becomes the demo.
- **Operator-supplied instance banner** — a config field whose text the operator writes, rendered verbatim. Because the copy is theirs, **it needs no translation** — which is what makes it cheap, and answers the objection in `docs/HOSTED-DEMO.md` §9. Demo: "Public demo — resets hourly, synthetic footage." Shared install: "Read-only for members — ping #ops for changes."
- **Instance name** — "Warehouse Cams" in the header and the tab title. Trivial; matters a lot when someone runs three of these.

## Tier 2 — Scoping (the shared install's real requirement)

- **Per-path visibility from MediaMTX ACLs** — a viewer sees only the paths their `action: read` entries match, including tilde-regex patterns. "The interns see the lobby cam and nothing else" is the single most-requested shape of this feature, and it is pure MediaMTX: the data is already in `authInternalUsers[].permissions[].path`.
- **Playback credential injection** — the flip side, and a real gap today. `hlsUrlFor`/`whepUrlFor` (`apps/web/src/lib/playback.ts`) build bare URLs with no credentials, so the moment an operator restricts `action: read` in MediaMTX, playback breaks with no explanation. Pass the session's MediaMTX credentials into the playback URL, and surface a specific error when MediaMTX rejects a read rather than the generic connection state.
- **Download as its own capability** — watch a recording inline without being able to export it. Maps to `playback` vs `read`; the media routes already distinguish `?download`.
- **Surface `maxReaders`** — MediaMTX's native per-path concurrent-viewer cap. Demo: egress control. Shared install: stops one member saturating the uplink.

## Tier 3 — Operator confidence

- **Config audit log** — append-only JSONL in `DATA_DIR`: who, when, which scope, and the sparse patch that was sent. No database, no new dependency. Shared install: accountability. Demo: a log of everything visitors tried, which is genuinely useful product research.
- **Diff preview before save** — show the sparse patch that is about to go to MediaMTX. Sparse writes are already a shipped behavior; this makes them visible, and it's the natural companion to the audit log.
- **Restore baseline** — snapshot the MediaMTX config at boot, one click to revert. Shared install: undo a bad afternoon. Demo: **this replaces the hourly cron reset in `docs/HOSTED-DEMO.md` §5 entirely** — a scheduled call to the same code path, no container restart, no dropped viewers.
- **Sessions dashboard with kick** — who is watching right now, from where, for how long, with a kick button. Admin-only. Already `FEATURES-LONGLIST.md` Top-10 #5 and 100% native (`*/sessions/list`, `*conns/list`, `*Kick`).
- **Lock the app-config surface** — `recordingsDirectory`, `screenshotsDirectory`, `mediaMtxUrl` become admin-only, plus an optional `CONFIG_LOCKED=1` that pins them to env and hides the form. This is the fix for the read-anything hole in `docs/HOSTED-DEMO.md` §7, and it stops a shared-install member repointing storage at someone's home directory. Cheapest high-value item in this file.

## Tier 4 — Share-outs, unblocked by the spine

- **Kiosk viewer route `/v/<path>`** — chrome-less single stream for a wall-mounted TV or a share link. `FEATURES-LONGLIST.md` Top-10 #10.
- **Embed builder** — iframe/`<video>` snippet with autoplay/mute/protocol toggles.
- **Scoped share links** — a signed URL granting read of one path for N hours, with no login. The natural end state for "send the neighbour the driveway cam", and the demo's way to deep-link one stream from the README. More work than the rest of Tier 4; wants the spine to be settled first.

---

## The two presets

The point of the exercise: one feature set, two `.env` profiles.

| | Public demo | Shared install |
|---|---|---|
| `ANONYMOUS_ACCESS` | `viewer` | `viewer` (or `none` behind a login wall) |
| Admin credential | published on the page — trying it *is* the demo | the owner's, private |
| Instance banner | "Public demo — resets hourly, synthetic footage" | "Read-only for members — ping #ops" |
| Path scoping | off (show everything) | on (`action: read` patterns per member) |
| Audit log | on, as product research | on, as accountability |
| Restore baseline | on a 60-minute timer | manual, as an undo |
| `CONFIG_LOCKED` | `1` | `1` |

Ship both as documented profiles in `deploy/`, so "run the demo" and "run it for my team" are the same compose file with a different env block.

## What not to build

- **Custom roles / permission matrices.** Two tiers. If a third is genuinely needed it will announce itself.
- **A Connect user table.** The moment there's a database, the "no database" property that keeps this app easy to run is gone. `authInternalUsers` plus a shared password covers it.
- **OIDC/SSO, 2FA, magic links** in the first pass — they're in [`04-auth-security-hooks.md`](./04-auth-security-hooks.md) and they can stay there until someone with a real deployment asks.
- **Read-only *enforcement* in the UI.** The UI hides; the API enforces. Never the other way round.

## Honest costs

- **i18n.** Unlike the operator-supplied banner, the sign-in form, viewer badge, and permission-denied states are our strings — roughly 15–25 new keys across **30 locale files** (`docs/I18N.md`). This is the largest single line item in Tier 0–1 and it should be budgeted as its own commit.
- **A contract change.** `session.get` plus a capabilities shape in `packages/contract`, with the api handler and web usage in the same commit.
- **A test layer that didn't exist.** Every mutation gains an "as viewer → rejected" case. Cheap per-test, but it's a new axis across the whole suite.
- **`docs/FEATURES.md`** gains a top-level section (a new feature *domain*, per its maintenance contract) and `CLAUDE.md`'s domain table gains a row.

## Suggested order

Tier 0 → Tier 1 → Tier 3 D5 (`CONFIG_LOCKED`) → Tier 3 D3 (restore baseline) → Tier 2 C1 (path scoping) → everything else on demand.

That order gets the demo safe and the shared install usable at the end of Tier 1, retires the demo's cron reset two steps later, and defers every piece that only one of the two audiences needs.
