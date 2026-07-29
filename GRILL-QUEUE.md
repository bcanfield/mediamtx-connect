# Grill Queue — ordered (temp working doc)

> Snapshot: **2026-07-28**. Supersedes the roadmap half of `TRIAGE-PLAN.md` (2026-07-17).
> **No GitHub changes made.** Review this, then we grill top-down.
>
> Ordering principle (per `CLAUDE.md` § Project goal): **leverage** (does it unblock other
> work) → **MediaMTX-native fit** (does it consume a config key / endpoint / hook / protocol)
> → **agent-implementability** (can the loop actually finish it).

---

## What changed since the 07-17 plan

**Shipped and closed** (all `COMPLETED`, all merged to `main`): #197 SECURITY.md · #200 README
translations · #204 ffmpeg bound · #205 failure domains · #207 hook-restart warning · #208
revert-to-inherited · #211 WHEP real-transport E2E · #213 publish-URL enable flags · #217 type
ramp · #219 fixture seeding · #220 breakpoint policy. Plus ADR 0005 (fast test suite),
conventional-title CI, nightly release train.

That is **most of Phase 0 and Phase 1's small correctness debt**. Three consequences:

1. **#179 is unblocked** — its stated dependency (#213 enable flags) shipped.
2. **#201 is now partly stale** — it claims "`apps/web` has no test runner at all." There are
   now 8 web tests (`apps/web/src/lib/*.test.ts` ×4, `features/**/*.test.tsx` ×4) and ADR 0005
   is `Implemented`. Real remainder is narrower: `packages/contract` schemas and
   `apps/api/src/recordings-fs.ts` (`media.serving.test.ts` appears to cover Range).
3. **Phase 0's gate never landed.** #214 is still open and was *reclaimed by the watchdog on
   2026-07-28* after sitting `agent-working` 60m with no PR.

### ✅ Item 0 — ANSWERED 2026-07-29: it's a wall-clock timeout

Re-running #175 and #177 settled it. Both `implement` jobs were **cancelled at exactly 40
minutes** (01:55:31 → 02:35:47 and → 02:36:11). The cap lives upstream in
`bcanfield/smallhours/.github/workflows/agent-loop.yml@v1`; `.smallhours.yml` documents every
consumer knob and **has no timeout key**, so it isn't tunable from this repo today.

Three consequences, in order of how much they cost:

1. **A timeout leaves ZERO artifact.** The implement job is a single step —
   *"Implement, open draft PR, report usage"* — so the draft PR is opened at the **end**. Cancel
   it mid-work and there is no branch on `origin`, no PR, and no notes. Confirmed: no
   `agent/issue-175` or `agent/issue-177` ref exists. 40 minutes of Opus, nothing to resume from.
2. **You don't even get diagnostics.** The next step, *"Upload give-up diagnostics,"* was
   **skipped** — a job cancellation skips it, which is precisely when you'd most want it.
3. **`max_turns` was never the binding constraint.** `implement: 100` (bumped 50 → 75 → 100 over
   three commits) doesn't bite, because these runs are limited by wall clock, not turns. Those
   bumps addressed the wrong variable.

**Correction to my earlier read:** I guessed harness-over-spec. Half right. The big slate items
(#175, #177, and by inference #178–#183) are genuinely **too big for one 40m run**. But #214 is
a different failure — its last run died at **~15m 34s** with `failure`, not a timeout. Don't
lump it in; grill it on its own evidence.

**Do not re-run any of #175, #177, #178, #180, #181, #182, #185, #186, #187, #188 as written.**
They're all the same size class and will burn 40 minutes identically.

For calibration, what *does* fit in 40m is the class that shipped: #204, #207, #208, #213, #217,
#220 — single-concern debt items touching a handful of files. "Catalog + wizard + detail" is 3–4×
that budget.

#### Recommended fixes, in order

**F1 — Make a timeout leave something behind** (upstream, `bcanfield/smallhours`). Highest
leverage: independent of ticket size, and it makes every future failure diagnosable.
- Give the Claude step a **soft budget below the job cap** (e.g. `timeout 32m claude …` under a
  40m `timeout-minutes`) so it *fails* instead of being *cancelled* — then the existing
  `if: failure()` diagnostics upload actually runs.
- **Open the draft PR early**, right after the first commit, instead of at the end. A timeout
  then leaves a resumable branch rather than nothing.

**F2 — Split #175** (Tier C, item 7 below). Four 40m-shaped tickets.

**F3 — Re-grill #177, don't split it.** Simulcast is a `runOnReady` FFmpeg command generator —
plausibly a *recipe* inside #178's hooks library rather than a standalone feature. Decide that
before spending another 40 minutes on it. (Same question already flagged at item 30.)

**F4 — Add a `timeout` knob to `.smallhours.yml`,** but don't lead with it. A bigger number on an
unsplit ticket just costs more per failure. Worth having for per-repo tuning after F1/F2.

**F5 — Housekeeping:** `origin/agent/issue-209` is stale, left over from closed PR #267.

---

## The ordered queue

Rank · issue · why here · **what the grill must resolve** → *tickets it should produce*.

### Tier A — Unblock the machine (small, mostly decisions)

**1. #214 — Implement ADR 0004: coverage floor, `pnpm verify`, FEATURES.md gate**
Highest leverage on the board: every agent-executed issue below is safer once it lands, and it
has now failed the loop twice. ADR is `Accepted`; only the mechanisms are missing.
→ Grill: is this one ticket or three? The coverage floor (pick a baseline number), `pnpm verify`
(a script), and the FEATURES.md CI gate are independent and each is ~30 min. Splitting them is
probably why it keeps dying. Also: does ADR 0005's restructure change the baseline the floor
should be set from? *Produces: 3 tickets.*

**2. #201 — Remaining test layers** — **re-scope, don't implement as written**
Its premise is stale (see above). Grill: what's actually uncovered now, and does ADR 0005
already close part of it? *Produces: 1–2 narrow tickets (`packages/contract` schemas,
`recordings-fs.ts`) and a body rewrite. Possibly closes as mostly-done.*

**3. #212 — `webrtcAdditionalHosts` hardcodes 127.0.0.1**
This is a silent correctness bug on the **shipped flagship path**: WHEP is the default player
(#174), and any non-localhost deployment loses it, falls back to HLS, and shows the operator
working video with no signal. Currently `needs-triage` behind a maintainer pick.
→ Grill: the issue frames it as either/or — derive the host from `REMOTE_MEDIAMTX_URL` at boot,
*or* surface "WebRTC unreachable" in the UI. **Push on why not both**: derive it (fixes the
common case) *and* detect ICE failure in the player (honest when derivation is wrong). The
detection half is also a doctor check → feeds #187. *Produces: 1–2 tickets.*

### Tier B — Foundation the feature work sits on

**4. #202 — Sync MediaMTX schema + client v1.11.3 → v1.19.2**
Gates #203, #199, #226, and version-pins #184's compatibility matrix. Failed the loop.
→ Grill: is it mechanical regeneration or does it carry breaking contract changes? What's the
diff size? Should it be split by scope (global / pathDefaults / paths)? *Produces: 1–3 tickets.*

**5. #203 — Widen path scopes beyond `record*`/`runOn*` (~80 missing `pathDefaults` keys)**
Gates #226 (resilience editors), #178 (hooks UI), #182 (recording mgmt). After #202.
→ Grill: all 80 at once, or the subset that unblocks a named downstream feature? Does the form
need new field *types* (arrays, nested) or is it more of the same? *Produces: 2–4 tickets.*

**6. #199 — Verify `Config.mediamtxForm.help.*` against MediaMTX docs** — rides #202's version.
→ Grill: is this verifiable mechanically against the upstream schema descriptions, or does it
need a human read? Determines whether it's agent work at all.

### Tier C — The per-path spine (biggest decomposition job on the board)

**7. #175 — Per-path management: catalog, detail + live health, guided Add-camera**
Three features in one ticket, partially shipped (the per-path editor exists — §3.4, ADR 0002),
and it died in the loop. Most of the slate hangs off it. **This is the single most valuable
grill on the list.**
→ Grill: split into *paths catalog* (list/create/delete via `v3/config/paths/*`) · *add-camera
wizard* (source-kind branching: RTSP / rpiCamera / redirect / publisher / always-available) ·
*per-path detail + health* (`pathsGet` / `tracks2`) · *delete with active-publisher warning*.
Which one ships first? Is the wizard worth it before #203 widens the key set?
*Produces: 3–4 tickets.*

**8. #210 — Nav entry for the three config scopes** — **grill together with #175, not separately**
It's `needs-triage` as "undesigned surface," but the paths catalog from #175 *is* the missing
nav destination. Deciding #175's catalog decides this.
→ Grill: sub-nav under the MediaMTX Config tab vs. a scope switcher on the config pages —
and does #175's catalog replace the question entirely?

**9. #209 — Path config dead-ends for idle wildcard-backed streams**
`bug` + `ready-for-human` after PR #267 was closed unmerged *and* a later run failed. Same
surface as #175, well-specified (render an honest empty state, don't reimplement regex matching).
→ Grill: short — why did #267 get closed? If the spec is right, this just needs a re-run.

### Tier D — Cheap native wins the loop can actually finish

**10. #183 — Live sessions dashboard with kick**
Best effort-to-value ratio on the board: pure UX over `*/list` + `*/kick`, already in the
generated client, no dependencies, body already grilled (native/UX/edges + scope v1 + acceptance).
→ Grill: mostly a spec-out pass — which endpoints in v1, poll interval floor, table columns,
kick confirm copy. *Produces: 1 ticket, or 2 (table / kick).*

**11. #179 — Publish-URL helper with OBS/FFmpeg/GStreamer recipes** — **now unblocked** (#213 shipped)
Partially shipped (copy-URLs on the card, empty state). Remaining: per-path side panel, WHIP URL,
publisher snippets, hide tabs when a protocol is disabled.
→ Grill: **merge #227 and #228 into this?** All three derive URLs from the same
`apps/web/src/lib/publish.ts` builder. One "URL surface" ticket beats three.

**12. #227 — External-player links + per-protocol client cheat sheet** — merge candidate → #11.
The read-side twin of the shipped publish builder.

**13. #228 — QR codes for publish/read URLs** — merge candidate → #11. Client-side rendering of
URLs #11 already computes.

**14. #187 — Setup wizard + doctor/preflight diagnostics**
Promoted above the rest of the slate: the doctor page is "a stack of small checks" (API reach,
recordings dir writable, ffmpeg present, version supported, clock drift, port binds) — unusually
high agent-implementability for a slate item, and it's where #212's WebRTC-unreachable check
belongs.
→ Grill: **split the doctor from the wizard.** Doctor is agent-ready today; the wizard is
design work. Which checks in v1? *Produces: 2 tickets.*

**15. #184 — Codec ↔ protocol compatibility matrix**
Native (reads `tracks2`), well-grilled body, no hard dependency — but the matrix rules are
version-pinned, so land after #202.
→ Grill: where the rules table lives and how it's kept honest across MediaMTX versions.

**16. #221 — Recording metadata: ffprobe duration/codec, resolution chip, bitrate rate**
The body already identifies **three independent pieces** in landing order — it's pre-decomposed,
it just needs splitting into three tickets. Piece 2 (resolution chip) is a contract-widening job
with no new MediaMTX call — nearly free.
→ Grill: minimal. *Produces: 3 tickets.*

### Tier E — Recording & playback depth (big, sequential)

**17. #180 — NVR-style recording timeline (playback server `/list` + `/get`)**
The anchor of the recording story, and the hardest unshipped thing on the board.
→ Grill: the **precondition** first — it requires `recordFormat: fmp4` *and* the playback server
enabled. What happens on an mpegts path? Do we detect and warn (backlog item
"format-mismatch warning"), or block? Then decompose: read-only day view → zoom/scrub →
cross-segment stitched playback. *Produces: 3–4 tickets.*

**18. #181 — Server-side clip export (in/out → MP4)** — builds on #17's `/get` plumbing.

**19. #182 — Recording management: retention, disk-full forecast** — partially shipped (record
toggle + `record*` keys). Needs #203 for the retention keys.
→ Grill: which of `recordDeleteAfter` / per-path retention / disk forecast is v1.

### Tier F — Ungrilled backlog (#222–#230), ordered by native fit

These are one-paragraph stubs with an "Idea + Native fit" section and an explicit
*"not yet grilled"* footer. Each needs a real three-lens grill before it can become tickets.

**20. #226 — Path resilience: `alwaysAvailable` + `sourceOnDemand` controls** — highest native
fit of the nine (pure per-path config keys), but **blocked on #203** widening the key set.
Grill it right after #203 so it rides the same form work.

**21. #225 — Auth management: internal users CRUD + hardening checklist**
MediaMTX's main security surface, currently hand-written YAML. High value, high blast radius.
→ Grill hard on edges: lockout-safe save, password handling (never render plaintext), and
whether the `any:any` default warning ships before the CRUD grid.

**22. #223 — Live metrics dashboard via in-app `/metrics` scraper** — consumes an endpoint
MediaMTX ships and the UI ignores entirely. → Grill: parser dependency? cardinality guard? Where
does the scraped series live given there's no database (`config-store.ts` is a JSON file)?

**23. #224 — MediaMTX + app log viewer** — → Grill: **can we even read MediaMTX's log?** It's a
separate container; `logDestinations`/`logFile` has to be configured and the file mounted. That
precondition may sink v1 — establish it before speccing anything.

**24. #222 — Config snapshot history + diff preview + rollback** — storage is ours, not
MediaMTX's, so it's a step down in native fit, but it makes the *existing* config editor safe.
→ Grill: retention of snapshots, where they're stored, and whether the diff-preview-before-save
half ships independently (it's the cheaper, more useful half).

**25. #229 — Config export/import (yml round-trip + dry-run diff)** — **merge candidate → #24.**
Same diff machinery, same patch procedures.

**26. #230 — Notification targets + webhook health alerts** — lowest native fit of the nine
(it's our own alerting infra riding `runOn*`), but the body claims it's "the loudest ask from the
surveillance cohort after recording management." Per `CLAUDE.md`, it must **lead with why it
earns priority** despite being app-level. → Grill that claim first — is the demand evidence real?

### Tier G — Remaining slate (reach)

**27. #185 — Browser publish via WHIP** — mirrors the shipped WHEP client; largest net-new
surface (`getUserMedia`, device pickers, encoding constraints). → Grill: decompose into
minimal-publish vs. the device/constraint UI.

**28. #188 — Public viewer `/v/<path>` + embed builder** — reuses the shipped `LivePlayer`.
→ Grill: **security is load-bearing** — the body already flags that public routes bypass any
future auth. Confirm opt-in-per-path is enforced server-side, not just in the UI.

**29. #178 — Hooks UI + recipe library** — needs #203's `runOn*` widening; the per-path hooks
editor already exists (§3.4). → Grill: is this just "add the snippet library to the shipped
editor"? That would be small.

**30. #177 — Multi-destination simulcast manager (`runOnReady` FFmpeg fan-out)** — powerful, but
it's a hook-command generator; grill whether it's a #178 recipe rather than its own feature.

**31. #186 — go2rtc / Frigate config import** — lowest confidence (their formats aren't stable
contracts). → Grill: is a best-effort importer worth the maintenance, or is a documented
migration guide the honest answer?

### Tier H — Cheap decision grills (~10 min each, run any time)

**32. #216 — Light-mode contrast fails AA** — **not a grill; a mislabel.** Clear source, clear
task (extend the axe suite to both themes, fix the light tiers). It lost its state labels in the
loop failure and is now unlabeled. Just relabel `ready-for-agent`.

**33. #206 — Record toggle has no pending state** — needs a design call on the pending
affordance. Grill: is a spinner really "undesigned surface," or is disabled-while-pending the
obvious boring answer? (Suspect the latter — this may be agent-ready.)

**34. #189 — Snapshot capture from live view** — server-side snapshot already shipped (§1.2.4).
Grill: is the remaining canvas/clipboard/gallery scope still wanted, or does it close?

**35. #176 — Latency chip** — blocked on a metric definition; the shipped player deliberately
dropped the number for lack of an honest cross-transport metric. Grill: accept two
transport-specific numbers with different labels, or close it?

**36. #215 — Env var semantics residuals** — changes a documented deployment interface; needs
sign-off, then it's a ~30 min sweep.

**37. #218 — Global density preference** — was an explicit product choice. Grill: has the
cramped feel actually been confirmed as a problem? If no signal, close it.

**38. #100 — RTL languages** — a bare shadcn link, no spec. Grill: is RTL in scope at all given
the current locale set (en/es/zh/it)? Cheapest close on the board if not.

---

## Not in the queue

| # | Why |
|---|---|
| #4 | Renovate-managed — never label or touch |
| #190 | Epic; sequencing stays with the maintainer (this doc is its sequencing) |
| #198 | Native-speaker translation review — inherently human, not grillable |

---

## Proposed first session

Items **0 → 3**: diagnose the loop failure, then grill #214 (split into three), re-scope #201,
and settle #212. That restores the safety rails and fixes a live bug on the flagship path
before any new feature work enters the loop.

Then items **7–8** (#175 + #210 together) — the single decomposition that unblocks the most
downstream slate work.

**Reminder:** applying `ready-for-agent` fires smallhours immediately. Re-label in small batches
in this order, not all at once.
