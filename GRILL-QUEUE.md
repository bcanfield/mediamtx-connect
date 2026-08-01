# Grill Queue — ordered (temp working doc)

> Snapshot: **2026-07-31**, verified against the live board. Supersedes the 2026-07-30
> revision, which superseded 2026-07-28, which superseded the roadmap half of `TRIAGE-PLAN.md`.
> **Board mutations made in this revision are listed under "Bookkeeping applied" below.**
> **One dispatch this revision: #209** — dispatched `2026-08-01T00:42Z`, **shipped as #311,
> merged 01:20Z**. 5/5 CI green including E2E; the diff matched the spec on every point.
> The caps question is answered: **200 turns / 60m closed the loop** on a five-layer ticket
> (26min, 179 bash calls, 47 files, 3 subagents). #291 is clear to promote.
>
> Ordering principle (per `CLAUDE.md` § Project goal): **leverage** (does it unblock other
> work) → **MediaMTX-native fit** (does it consume a config key / endpoint / hook / protocol)
> → **agent-implementability** (can the loop actually finish it).

---

## What changed since the 07-30 revision

**1. #209 grilled and dispatched — Tier C item 9 is done.** The grill's own question ("why did
#267 get closed?") has a dull answer: the Build job failed with three `TS2339` narrowing errors
in `path-config-page.tsx` over a zod `discriminatedUnion` built from
`EffectivePathConfigSchema.extend()`, auto-fix failed too, and it was closed by hand. **The
approach was never judged — only the typecheck was.** So this was a re-spec, not a redesign.

Four decisions changed the target behaviour versus what #267 built:

- **The status is `unresolved`, not `not-publishing`.** The state is reached two ways MediaMTX
  cannot tell apart — a stopped stream and a name that was never a path — and with a wildcard
  entry present, *every* name is potentially valid, so there is no "does not exist" signal.
  Asserting "this stream isn't publishing" replaces one wrong message with a subtler one. The
  typo case is also the *likelier* one, since idle paths have no card and this URL is only
  reachable by hand.
- **Neutral dashed block, not `StatusPanel`.** `StatusPanel`'s only tones are `error` and
  `warning`; the repo's genuinely-neutral empty state (`ZeroStreamsPanel`,
  `live-view-states.tsx:81`) deliberately does not use it. #267 shipped this amber.
- **`null` keeps meaning "MediaMTX didn't answer"** — a two-state union plus nullable, matching
  `getGlobal`/`getPathDefaults`, rather than folding unreachability into the union.
- **The subheader is suppressed** in that state instead of gaining a third variant. Zero new
  strings beyond `Config.pathConfig.unresolved.*`.

**It is not subsumed by #292.** #292 is a different route; this is the `paths/$name` config
page's empty state. The debt entry stays open with a narrowed trigger — an operator wanting to
*author* config for a path that has never published, which still needs either wildcard matching
or a create-from-defaults flow. Body rewritten clean-room (no reference to #267, so the run is
an honest test of the spec).

**2. #206 is closed — Tier H item 32 retires.** Shipped as #310, merged 07-31. The suspicion in
that entry was right: it was the boring answer, not a design call.

**3. #300 is merged** (#302, commit `5fe3c92`) and leaves the "do not touch" list. It stands as
the evidence it always was for #306: a check that cannot fail gets trusted anyway.

---

## What changed since the 07-28 revision

**1. #175 is decomposed — the biggest grill on the old list is done.** On 07-29 it was cut
into six tickets, each carrying a `Spec: #175` line and a `Blocked by` chain: #291 catalog ·
#292 detail · #293 live health · #294 config editing · #295 deletion · #296 RTSP wizard. #175
itself is now a **parent spec** with a "do not label `ready-for-agent`" banner. Old items 7
and 8 are retired; what replaces them is an *authorization order*, not a grill.

**2. The loop's wall-clock problem was fixed upstream — F1's first half shipped.**
`bcanfield/smallhours/.github/workflows/agent-loop.yml@v1` (a moving tag, so this repo already
has it) now runs `implement` at **`timeout-minutes: 60`** (was 40) with `SMALLHOURS_JOB_CAP_MINUTES: 60`,
derives the Claude budget *below* the job cap so the run **fails instead of being cancelled**,
stamps job start before sandbox provisioning so the tail is never charged against it, and keeps
the `if: failure()` diagnostics upload. Upstream ADR 0007 governs the ordered triple
(job cap 60 < watchdog 80).

**Still open from that list:**
- **F1 second half — not landed.** "Implement, open draft PR, report usage" is still one step
  and `open-pr.sh` still runs *after* `implement.sh`. A hard timeout still leaves no PR.
- **F4** — `.smallhours.yml` still has no `timeout` key; the 60m cap is fixed upstream.
- **F5** — `origin/agent/issue-209` is still there (`bad885b`), stale since PR #267 closed.

**3. Correction to the 07-28 read on `max_turns`.** That revision said turns were never the
binding constraint. True for the fat tickets; **false for the thin ones.** #291 — a read-only
list, the smallest ticket on the board — was handed back at **`2026-07-30T00:56Z` for using
101 turns against a cap of 100**, not for time. `max_turns.implement` went 100 → 200 in
`36db1da`, **two minutes later**. So #291 has never run under current settings. Retry before
concluding anything about ticket size.

**4. New, not in the old queue:** #300 (`pnpm check --since` with no ref silently checks the
working tree and exits 0) — filed 07-31, currently `agent-working`. Leave it alone. It is also
live evidence for #214: a check that cannot fail is trusted anyway.

**5. #175's body cited a nonexistent ADR** for the parent-spec convention (`docs/adr/0006` is
the pnpm-11 trust exception; nothing in `docs/` describes the pattern). Reference removed. If
the `Spec:`-line convention is worth keeping, it wants a real ADR — that decision is unmade.

Nothing on the old queue was closed. Every item below is still open.

---

## Bookkeeping applied in this revision (07-31)

- **#209 body rewritten** clean-room from the grill: contract / api / web / strings / tests /
  docs broken out per file, with the exact English copy and an explicit out-of-scope list.
- **#209 labels:** `ready-for-human` → `ready-for-agent` (by hand) → `agent-working` (loop, 22s
  later). Nothing else was dispatched.
- **Left undone, needs you:** the #209 title still says "for idle wildcard-backed streams",
  narrower than the state actually being fixed — a typo'd name hits it too.
- **Still not deleted:** `origin/agent/issue-209` (`bad885b`). See F5 — and note the live run may
  now push a *new* branch of that name, so delete it only after the run settles.

## Bookkeeping applied in the 07-30 revision

- `needs-triage` added to the eleven queue items that carried a category label but no state
  label: #178 #179 #180 #181 #182 #183 #184 #188 #199 #203 #221. All of them are "→ Grill:"
  entries here, which is exactly what the label means.
- #175 body: dangling ADR reference removed.
- **#301 filed** — path rename (create-under-new-name + delete-old). #294 scopes rename out as
  "its own ticket" and no such ticket existed.
- **Deliberately left bare:** #292–#296 and #216. They are not awaiting a grill, so
  `needs-triage` would misdescribe them — they are awaiting *authorization*, and this repo's
  vocabulary has no label for that. The authorization queue below is that state.
- **From the #214 grill (same day):** `docs/adr/0004` amended in place (uncommitted at time of
  writing); #214 converted to a parent spec; **#304 / #305 / #306 filed**; #201 re-scoped and
  retitled, losing `recordings-fs.ts` to #304.
- **Not filed:** the non-RTSP source kinds #296 defers (rpiCamera, WHEP-redirect, `publisher`,
  always-available file). Hold until #296 actually ships rather than file four speculative tickets.

---

## Authorization queue — no grill needed, just a label

These are specified and blocked only on someone typing `ready-for-agent`. Applying it fires
smallhours immediately, so promote **one at a time, in this order**:

| Order | Issue | Why it's ready | Gated on |
|-------|-------|----------------|----------|
| 1 | **#291** Paths catalog | Failed only on the old 100-turn cap; cap is now 200 | — |
| 2 | **#304** api baseline tests | Grilled 2026-07-30; two small modules, no dependencies | — |
| 3 | **#306** FEATURES.md gate | Grilled 2026-07-30; independent of the coverage pair | — |
| 4 | **#216** Light-mode contrast AA | Clear source, clear task; lost its labels in a loop failure | — |
| 5 | #305 Coverage floor | Grilled 2026-07-30 | #304 |
| 6 | #292 Per-path detail | Specced out of #175 | #291 |
| 7 | #296 RTSP add-camera wizard | Specced out of #175 | #291 |
| 8 | #293 / #294 / #295 | Specced out of #175 | #292 |
| 9 | #301 Path rename | Not yet grilled — see Tier C | #294, #295 |

**One item on this list needs you, not the loop:** after #306's rename merges, add the renamed
`pr-title` job to the `protect-release-branches` ruleset. Until then the gate blocks smallhours
but not a human merge — the advisory state ADR 0004 exists to escape. Rename first, require
second: the required-context string *is* the job's `name`.

#291 first is also the cheapest experiment on the board: it tells you whether the
decomposition + the 200-turn cap + the 60m job cap actually close the loop, before any further
grilling is spent on ticket-sizing.

---

## The ordered queue

Rank · issue · why here · **what the grill must resolve** → *tickets it should produce*.

### Tier A — Unblock the machine (small, mostly decisions)

**1. ~~#214 — Implement ADR 0004~~ — GRILLED 2026-07-30. Done.**
Now a parent spec, cut into three: **#304** api baseline tests (`mediamtx.ts` +
`recordings-fs.ts`, no dependencies) → **#305** coverage floor (blocked by #304) · **#306**
`FEATURES.md` gate (independent). ADR 0004 amended in place first, following ADR 0005's
strikethrough precedent, because five of its premises were stale enough that an agent reading
it would have built a bypassable gate.

What the grill found, in descending order of how much it would have cost:

- **The doc gate could not live in `build`.** `build` skips on `edited`, GitHub counts a
  skipped required check as passed, so open-as-`chore:` → green → retitle-to-`feat:` → merge
  was an open bypass. It goes in `pr-title`, the only job that re-runs on retitle.
- **`pr-title` isn't a required check**, so it must be added to `protect-release-branches` —
  **a maintainer action; an agent can't do it, and #306 is advisory until you do.**
- **Mechanism 2 was already shipped.** `pnpm verify` + `pnpm check` exist. One-third of the
  ticket was work that didn't exist.
- **Coverage must not ride on `test`.** `pnpm check` runs `vitest --changed` through
  `turbo test`; thresholds there would make the 4s inner loop permanently red.
- **The gate keys on the PR title**, not commits — `main` is squash-merged.

**2. ~~#201 — Remaining test layers~~ — RE-SCOPED 2026-07-30.**
Half of it was already done (ADR 0005 landed the web runner; 14 web test files now exist), and
`recordings-fs.ts` was double-owned with #214 — it moved to #304. Remaining: `packages/contract`
schemas (264 lines, zero tests) and confirming whether `media.serving.test.ts` already covers
the Range/206 logic. Title and body rewritten; may collapse to a single suite.

**3. #212 — `webrtcAdditionalHosts` hardcodes 127.0.0.1** — **next grill**
A silent correctness bug on the **shipped flagship path**: WHEP is the default player (#174), and
any non-localhost deployment loses it, falls back to HLS, and shows the operator working video
with no signal.
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
Gates #226 (resilience editors), #178 (hooks UI), #182 (recording mgmt), and widens what #294
can edit. After #202.
→ Grill: all 80 at once, or the subset that unblocks a named downstream feature? Does the form
need new field *types* (arrays, nested) or is it more of the same? *Produces: 2–4 tickets.*

**6. #199 — Verify `Config.mediamtxForm.help.*` against MediaMTX docs** — rides #202's version.
→ Grill: is this verifiable mechanically against the upstream schema descriptions, or does it
need a human read? Determines whether it's agent work at all.

### Tier C — The per-path spine (decomposed; residual grills only)

**7. #301 — Path rename** — the one piece of the spine that is *not* grilled.
Filed from #294's out-of-scope note. It is create-then-delete with no atomicity from MediaMTX.
→ Grill: what happens on a partial failure, and is rename worth shipping at all versus telling
the operator to recreate? Regex-backed paths make it worse (§ ADR 0002). *Produces: 1 ticket or a close.*

**8. #210 — Nav entry for the three config scopes** — now a one-sentence decision, not a session.
#291's catalog route *is* the missing nav destination.
→ Grill: does #291's route close this outright, or is a scope switcher still wanted for
global / `pathDefaults` / per-path? Answer it when #291 lands, not before.

**9. ~~#209 — Path config dead-ends for idle wildcard-backed streams~~ — SHIPPED as #311,
merged 2026-08-01.**
Produced no new tickets — it was a re-spec in place. #267 died on a typecheck, not on its
approach, so the grill went to the *behaviour* instead: the state is now `unresolved` rather
than `not-publishing` (a typo'd name is indistinguishable from a stopped stream, and is the
likelier way to land there), rendered as a neutral dashed block rather than an amber
`StatusPanel`, with `null` still reserved for "MediaMTX didn't answer". Not subsumed by #292 —
different route. Full reasoning under "What changed since the 07-30 revision".
**The run answered its question.** First dispatch under the 200-turn / 60m caps, and it closed
the loop unattended: 26min, 179 bash calls, 47 files touched, 3 subagents, 5/5 CI green
including the E2E spec the agent wrote blind. The grill is what changed the outcome — #267 had
failed the same ticket ungrilled — so the spec-out-by-file format is worth repeating.

**One caveat on that run, and it isn't the loop's:** the verify gate reported
`could not run — pnpm is not on PATH` and pushed unchecked, so CI was the only thing that
read the diff. smallhours v0.5.11's shell fix only reaches toolchains recorded in an rc file;
ours isn't one. `.smallhours.yml` is back to `npx --yes pnpm@11.17.0 run verify` (which needs
no PATH) and `bcanfield/smallhours#29` is reopened with the evidence. Do not retry a bare
`pnpm verify`.

### Tier D — Cheap native wins the loop can actually finish

**10. #183 — Live sessions dashboard with kick**
Best effort-to-value ratio on the board: pure UX over `*/list` + `*/kick`, already in the
generated client, no dependencies, body already grilled (native/UX/edges + scope v1 + acceptance).
→ Grill: mostly a spec-out pass — which endpoints in v1, poll interval floor, table columns,
kick confirm copy. *Produces: 1 ticket, or 2 (table / kick).*

**11. #179 — Publish-URL helper with OBS/FFmpeg/GStreamer recipes** — unblocked (#213 shipped)
Partially shipped (copy-URLs on the card, empty state). Remaining: per-path side panel, WHIP URL,
publisher snippets, hide tabs when a protocol is disabled.
→ Grill: **merge #227 and #228 into this?** All three derive URLs from the same
`apps/web/src/lib/publish.ts` builder. One "URL surface" ticket beats three.

**12. #227 — External-player links + per-protocol client cheat sheet** — merge candidate → #11.

**13. #228 — QR codes for publish/read URLs** — merge candidate → #11.

**14. #187 — Setup wizard + doctor/preflight diagnostics**
The doctor page is "a stack of small checks" (API reach, recordings dir writable, ffmpeg present,
version supported, clock drift, port binds) — unusually high agent-implementability for a slate
item, and it's where #212's WebRTC-unreachable check belongs.
→ Grill: **split the doctor from the wizard.** Doctor is agent-ready today; the wizard is design
work. Which checks in v1? *Produces: 2 tickets.*

**15. #184 — Codec ↔ protocol compatibility matrix**
Native (reads `tracks2`), well-grilled body, no hard dependency — but the rules are
version-pinned, so land after #202.
→ Grill: where the rules table lives and how it's kept honest across MediaMTX versions.

**16. #221 — Recording metadata: ffprobe duration/codec, resolution chip, bitrate rate**
The body already identifies **three independent pieces** in landing order — pre-decomposed, it
just needs splitting. Piece 2 (resolution chip) is a contract-widening job with no new MediaMTX
call — nearly free. → Grill: minimal. *Produces: 3 tickets.*

### Tier E — Recording & playback depth (big, sequential)

**17. #180 — NVR-style recording timeline (playback server `/list` + `/get`)**
The anchor of the recording story, and the hardest unshipped thing on the board.
→ Grill: the **precondition** first — it requires `recordFormat: fmp4` *and* the playback server
enabled. What happens on an mpegts path? Detect and warn, or block? Then decompose: read-only day
view → zoom/scrub → cross-segment stitched playback. *Produces: 3–4 tickets.*

**18. #181 — Server-side clip export (in/out → MP4)** — builds on #17's `/get` plumbing.

**19. #182 — Recording management: retention, disk-full forecast** — partially shipped (record
toggle + `record*` keys). Needs #203 for the retention keys.
→ Grill: which of `recordDeleteAfter` / per-path retention / disk forecast is v1.

### Tier F — Ungrilled backlog (#222–#230), ordered by native fit

One-paragraph stubs with an "Idea + Native fit" section and an explicit *"not yet grilled"*
footer. Each needs a real three-lens grill before it can become tickets.

**20. #226 — Path resilience: `alwaysAvailable` + `sourceOnDemand` controls** — highest native
fit of the nine (pure per-path config keys), but **blocked on #203**. Grill it right after #203
so it rides the same form work — and after #294, so it rides the same editor.

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
MediaMTX's, so a step down in native fit, but it makes the *existing* config editor safe — and
more so once #294 lets the agent-facing surface write paths too.
→ Grill: retention of snapshots, where they're stored, and whether the diff-preview-before-save
half ships independently (it's the cheaper, more useful half).

**25. #229 — Config export/import (yml round-trip + dry-run diff)** — **merge candidate → #24.**

**26. #230 — Notification targets + webhook health alerts** — lowest native fit of the nine
(our own alerting infra riding `runOn*`), but the body claims it's "the loudest ask from the
surveillance cohort after recording management." Per `CLAUDE.md` it must **lead with why it earns
priority** despite being app-level. → Grill that claim first — is the demand evidence real?

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
it's a hook-command generator; grill whether it's a #178 recipe rather than its own feature
before spending another run on it.

**31. #186 — go2rtc / Frigate config import** — lowest confidence (their formats aren't stable
contracts). → Grill: is a best-effort importer worth the maintenance, or is a documented
migration guide the honest answer?

### Tier H — Cheap decision grills (~10 min each, run any time)

**32. ~~#206 — Record toggle has no pending state~~ — CLOSED 07-31, shipped as #310.**
The suspicion held: disabled-while-pending was the boring answer, no design call needed.

**33. #189 — Snapshot capture from live view** — server-side snapshot already shipped (§1.2.4).
Grill: is the remaining canvas/clipboard/gallery scope still wanted, or does it close?

**34. #176 — Latency chip** — blocked on a metric definition; the shipped player deliberately
dropped the number for lack of an honest cross-transport metric. Grill: accept two
transport-specific numbers with different labels, or close it?

**35. #215 — Env var semantics residuals** — changes a documented deployment interface; needs
sign-off, then it's a ~30 min sweep.

**36. #218 — Global density preference** — was an explicit product choice. Grill: has the
cramped feel actually been confirmed as a problem? If no signal, close it.

**37. #100 — RTL languages** — a bare shadcn link, no spec. Grill: is RTL in scope at all given
the current locale set (en/es/zh/it)? Cheapest close on the board if not.

### Tier I — Loop infrastructure (upstream, not this repo's issue board)

**38. F1 second half — open the draft PR before the work, not after.** The 60m cap now fails
gracefully, but a timeout still leaves no branch and no PR to resume from.

**39. F4 — a `timeout` knob in `.smallhours.yml`.** Lower priority now that the cap is 60 and the
budget is derived; worth it for per-repo tuning.

**40. F5 — delete `origin/agent/issue-209`** (`bad885b`). Now safe: the live run minted
`agent/issue-209-r2` instead, which auto-deleted on merge. `bad885b` is dead PR #267's branch.

**41. NEW — don't push to `main` while a run is in flight.** Two `.smallhours.yml` commits
landed mid-#209 and left #311 at `mergeStateStatus: BEHIND`. smallhours correctly refuses to
promote a non-promotable PR (`success + BEHIND -> leave draft, the sweep re-evals`), so it
stalled until `gh pr update-branch`. Costs a CI re-run and a sweep. Land repo housekeeping
*before* labelling the next `ready-for-agent`.

---

## Not in the queue

| # | Why |
|---|---|
| #4 | Renovate-managed — never label or touch |
| #190 | Epic; sequencing stays with the maintainer (this doc is its sequencing) |
| #198 | Native-speaker translation review — inherently human, not grillable |
| #175 | Parent spec, not a unit of work — never label `ready-for-agent` |
| #209 | Closed — shipped as #311, merged 08-01T01:20Z |

---

## Proposed next session

Items 1, 2 and 9 are done — #214 cut into #304/#305/#306, #201 re-scoped, #209 re-specced and
dispatched. **Next grill is #212** (item 3), unchanged and now the top ungrilled item: push on
why the fix isn't both halves — derive the host from `REMOTE_MEDIAMTX_URL` *and* detect ICE
failure in the player. It is still the only correctness bug on the board that sits on a
**shipped flagship path**: WHEP is the default player, and any non-localhost deployment silently
loses it, falls back to HLS, and shows the operator working video with no signal that anything
degraded. The detection half doubles as a doctor check, so it feeds #187.

After that, Tier B (#202 → #203) is the next thing that unblocks a queue rather than a ticket.

Two cheap alternatives if #212 feels too big for the session: item 7 (**#301** path rename —
partial-failure semantics, and genuinely might close) or item 37 (**#100** RTL — the cheapest
close on the board).

Separately from grilling: **#209's run landed** (#311, merged 08-01), so the precondition on
promoting #291 is met — the raised caps do close the loop. The authorization queue above is
unchanged and **#291 is next**, needing only a label. Land any repo housekeeping first (item
41).

**Reminder:** applying `ready-for-agent` fires smallhours immediately. Promote one at a time.
