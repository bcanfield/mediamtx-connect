# Grill Queue — ordered (temp working doc)

> Snapshot: **2026-07-31**, verified against the live board. Supersedes the 2026-07-30
> revision, which superseded 2026-07-28, which superseded the roadmap half of `TRIAGE-PLAN.md`.
> **Board mutations made in this revision are listed under "Bookkeeping applied" below.**
> **One dispatch this revision: #209** — dispatched `2026-08-01T00:42Z`, **shipped as #311,
> merged 01:20Z**. 5/5 CI green including E2E; the diff matched the spec on every point.
> The caps question is answered: **200 turns / 60m closed the loop** on a five-layer ticket
> (26min, 179 bash calls, 47 files, 3 subagents).
> **#212 also grilled this revision** — re-spec'd in place and split (new: **#312**).
>
> **Then two more dispatches, both clean:** **#291 → #313, merged** (44 files, +1177, verify
> gate green on the first pass) and **#212 → #314** (7 files, pure infra, gate green). Three
> consecutive unattended runs, 5/5 CI green each.
> **#202 also grilled this revision** — re-spec'd in place against a live 1.19.3 container, not
> docs, and **dispatched**. It is the largest ticket the loop has been given; see item 4.
> **Next dispatch after it settles: #304. Next grill: #210.**
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

**From the #202 grill (latest):**

- **#202 retitled** `feat: sync MediaMTX config schema from v1.11.3 to v1.19.3` — fixes the wrong
  target version *and* buys the conventional prefix outright, since the label map would otherwise
  resolve `tech-debt` → `fix:` (see item 42).
- **#202 body rewritten** clean-room, spec'd out per file: the 8 renames, the 54 additions with
  their field kinds, the 3 `pathDefaults` renames, the drift check, the i18n contract, and an
  explicit out-of-scope list (`authInternalUsers`, pathDefaults widening, the client's own types).
- **#202 labels:** `ready-for-human` → `ready-for-agent`. `tech-debt` kept; `enhancement`
  deliberately **not** added — it would not have changed the prefix, and the title already does.
- **#199 re-scoped** to the pre-existing 79 help strings; the #202 dependency dropped.
- **#226 / #225 / #177 annotated** with what the grill invalidated in each.
- **Left undone, needs you:** whether to reorder `conventional_title_types` repo-wide (item 42).
  #221 ships as `fix:` until you do.

**From the #209 grill:**

- **#209 body rewritten** clean-room from the grill: contract / api / web / strings / tests /
  docs broken out per file, with the exact English copy and an explicit out-of-scope list.
- **#209 labels:** `ready-for-human` → `ready-for-agent` (by hand) → `agent-working` (loop, 22s
  later). Nothing else was dispatched.
- **Left undone, needs you:** the #209 title still says "for idle wildcard-backed streams",
  narrower than the state actually being fixed — a typo'd name hits it too.
- **Still not deleted:** `origin/agent/issue-209` (`bad885b`). See F5 — and note the live run may
  now push a *new* branch of that name, so delete it only after the run settles.

**From the #212 grill (same day):**

- **#212 body rewritten** clean-room: the `REMOTE_MEDIAMTX_HOST` decision, why the env var must
  be the exclusive owner, per-file scope, two documented-not-fixed consequences, an explicit
  rejected list, and acceptance criteria keyed on `playback.spec.ts`.
- **#212 labels:** `needs-triage` removed, `tech-debt` kept. **No state label** — grilled and
  specified, awaiting authorization, which this repo's vocabulary still has no word for (same
  bare state as #292–#296).
- **#312 filed** — the live-view loopback banner, split out of #212's UI half. `enhancement`
  only, no state label. Not blocked by #212; disjoint files, either order works.
- **Nothing dispatched.** Both parked at your instruction. #212 is the smaller and better-fenced
  of the two (no app code, no i18n, and a real-peer-connection e2e that fails loudly on bad
  plumbing) — it is the natural next dispatch.
- **Split rather than bundled** because `main` is squash-merged and the PR title is what
  semantic-release parses: one half is a `fix:`, the other a `feat:`, and a bundled title has to
  mislabel one of them out of the release. They share no files but `docs/FEATURES.md`.
- **Left undone, needs you:** `docs/ideas/01-protocols-and-sources.md:155` still carries a
  "`webrtcAdditionalHosts` builder — detect the server's public IP, one-click add" idea. #212 +
  #312 cover the trap it was aimed at; the auto-detect flourish is all that's left of it.

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
| ~~1~~ | ~~**#291** Paths catalog~~ | **SHIPPED** as #313, merged 08-01. 44 files, +1177, verify gate green first pass | — |
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

**3. ~~#212 — `webrtcAdditionalHosts` hardcodes 127.0.0.1~~ — GRILLED 2026-07-31.
Re-spec'd in place + split; both parked, nothing dispatched.**
"Why not both" held, but neither half survived in the shape the issue proposed. Now: **#212**
(`fix:`, deployment knob, no app code) + **#312** (`feat:`, live-view banner).

What the grill found, in descending order of how much it would have cost:

- **The knob was already in the UI.** `webrtcAdditionalHosts` is an editable list field at
  `/config/mediamtx/global` (`sections.ts:122`). The gap was never capability — it was that
  nothing tells the operator to go there.
- **…and editing it there doesn't survive a restart.** `docker-compose.yml:9` mounts
  `mediamtx.yml` `:ro`, and `publish-urls.spec.ts:19` patches global config against that stack
  successfully — so MediaMTX applies `config/global/patch` in memory only. Any UI-set value is
  gone on the next mediamtx restart. A UI-only fix was never viable.
- **MediaMTX has a native lever neither option used.** `MTX_WEBRTCADDITIONALHOSTS` — every
  config key is env-overridable as `MTX_PARAMNAME`, arrays comma-separated. Compose sets it
  with zero app code and it survives restarts. This is what #212 became.
- **"Derive from `REMOTE_MEDIAMTX_URL` at boot" was rejected outright.** Cross-boundary config
  magic: the app overwriting a key the operator can also edit in our own UI, no record of who
  won, reverts whenever mediamtx restarts without us, and wrong whenever the URL is a DNS name
  behind a proxy terminating elsewhere than the host serving ICE.
- **The naive one-knob version creates a worse bug than it fixes.** Env var *and* a live yml
  key means the env silently wins — the operator edits the sample config, restarts, and is
  overridden by a compose default they never saw. Hence: commented out in both ymls, env var is
  the exclusive owner. (`${VAR:-}` doesn't rescue it — compose still passes an empty string and
  MediaMTX reads that as an empty list.)
- **Half the UI half had already shipped.** `stream-card.tsx:198` renders `WEBRTC UNAVAILABLE`
  — but only in LOW-LAT, and `:196` exempts AUTO deliberately. AUTO stays silent: this is a
  once-per-deployment *config* fact, not a per-stream playback fact, so it belongs in a banner
  that names the cause, not a pill that reports a symptom the operator often can't act on.
- **The banner costs almost nothing.** `live-view-page.tsx:38-43` already fetches the full
  global config, and `webrtcAdditionalHosts` is already in the contract — so #312 is a pure
  function plus a `PlaybackUrlBanner` sibling. No oRPC procedure, no contract change, no extra
  request. An API check procedure for #187 was rejected as speculative surface for an unbuilt page.
- **#212's own body mis-cites its sibling debt.** `20260715151742` is about
  `BACKEND_SERVER_MEDIAMTX_URL`, not `REMOTE_MEDIAMTX_URL`. That doc stays open.

### Tier B — Foundation the feature work sits on

**4. ~~#202 — Sync MediaMTX schema + client v1.11.3 → v1.19.2~~ — GRILLED 2026-07-31.
Re-spec'd in place, kept as one ticket, dispatched.** Produced no new tickets; re-scoped #199
and unblocked #203/#226.

Every number below came from a live `bluenviron/mediamtx:1.19.3` container and a scratch render
of the real form, not from docs — that is what changed the answers.

- **The target version in the title was wrong.** Both compose files ship **1.19.3**, not 1.19.2,
  and 1.19.3 is the current upstream latest (released 07-23). Renovate **automerges minor/patch**,
  which is exactly how eight minors accumulated unnoticed.
- **"Sync the API client" is near-empty work.** `mediamtx.ts` is 93 lines and its own types are
  `MediaMtxPath`/`MediaMtxPathList` — 8 fields. Every config type is imported from the contract.
  Same shape as #214's "mechanism 2 was already shipped" finding: a third of the issue body
  described work that doesn't exist.
- **Nothing is broken today, and the issue implies otherwise.** 8 of our 65 global keys are
  deprecated aliases stale even at 1.11.3 (`externalAuthenticationURL`, `protocols`,
  `encryption`, `serverKey`, `serverCert`, `authMethods`, `hlsAllowOrigin`, `webrtcAllowOrigin`).
  They still *function* via aliasing — `webrtcAllowOrigin` verifiably writes through to
  `webrtcAllowOrigins`. GET omits them when empty, and a scratch render proved the form submits
  them as `undefined`, which `JSON.stringify` drops. **One real edge survives:** typing a value
  into `encryption` or `externalAuthenticationURL` and clearing it back to empty sends `""`,
  which 400s the entire save behind a generic toast.
- **The real diff is smaller than 62.** Global is 119 keys upstream against our 65, but 8 of the
  62 "missing" are just those renames' new names → **54 genuinely new**, ~30 of which are one
  repeated AllowOrigins/TrustedProxies/Encryption/ServerCert/ServerKey family across seven servers.
- **The cost is i18n, not schema — and it is a choice, not a constraint.** 30 locales, help text
  genuinely translated, parity CI-enforced, and **no translation tooling** (`i18n-check.mjs` only
  checks). `useFieldHelp` is `t.has(name) ? t(name) : undefined`, so help is *optional per field* —
  but all 78 rendered fields have it, so the shipped standard is 100%. Held it: **~1,620 strings.**
- **`authInternalUsers` is carved out to #225.** It is a list of objects with nested permission
  arrays; the only comparable key, `webrtcICEServers2`, already needed a bespoke
  `ice-servers-rows.tsx`. It is also #225's entire subject.
- **pathDefaults is stale the same way** — we ship `runOnReady`/`runOnReadyRestart`/
  `runOnNotReady`, renamed upstream to `runOnOnline`/`runOnOnlineRestart`/`runOnOffline`. #202
  takes the three renames; widening stays #203.
- **A drift check ships with it**, in `tests/e2e/` against the live server, failing on any
  unmodeled global key minus an allowlist (which is where the `authInternalUsers` carve-out is
  recorded). Verified it will actually fire: `ci.yml`'s `changes` filter only excludes
  `docs/`/`*.md`/`LICENSE`, so a Renovate image bump runs E2E. Global scope only — a pathDefaults
  check would fail on day one at 21/89. This is the ADR 0004 line again: the debt entry's payoff
  trigger was literally "next MediaMTX image bump", and nothing was watching it.
- **Dispatched knowing it may not fit.** ~1,620 strings across 30 files is the largest ticket the
  loop has been handed, and **F1's second half is still unlanded — a 60m timeout leaves no branch
  and no PR.** Taken deliberately as the cheapest way to find the ceiling. If it times out, that
  is the answer to item 38, not a surprise.

**5. #203 — Widen path scopes beyond `record*`/`runOn*` (~80 missing `pathDefaults` keys)**
Gates #226 (resilience editors), #178 (hooks UI), #182 (recording mgmt), and widens what #294
can edit. After #202. **The #202 grill measured it: 21 of 89 keys modeled, so it is 68 keys,
not ~80** — and #202 takes the three `runOn*` renames off the top.
→ Grill: all 68 at once, or the subset that unblocks a named downstream feature? Does the form
need new field *types* (arrays, nested) or is it more of the same? **#202 answers half of that
already** — `authInternalUsers` proved the existing `text | number | switch | list` kinds cannot
render a list of objects, and `alwaysAvailableTracks` / `rpiCameraSecondary` are the same shape.
*Produces: 2–4 tickets.*

**6. #199 — Verify `Config.mediamtxForm.help.*` against MediaMTX docs** — **RE-SCOPED by the
#202 grill; no longer blocked.**
Our help text is house-voice paraphrase, not upstream verbatim: of 79 keys, **4 match exactly,
6 are substrings, 58 differ** — and some of ours are *better* (`writeQueueSize` notes the
power-of-two requirement; the upstream yml comment doesn't). #202 authors its 54 new strings
from 1.19.3 comments at writing time, so those are verified by construction.
→ What's left: audit only the **pre-existing 79** against upstream. Mechanical enough to
diff, but the judgement of "paraphrase that is still accurate" is a human read.

### Tier C — The per-path spine (decomposed; residual grills only)

**7. #301 — Path rename** — the one piece of the spine that is *not* grilled.
Filed from #294's out-of-scope note. It is create-then-delete with no atomicity from MediaMTX.
→ Grill: what happens on a partial failure, and is rename worth shipping at all versus telling
the operator to recreate? Regex-backed paths make it worse (§ ADR 0002). *Produces: 1 ticket or a close.*

**8. #210 — Nav entry for the three config scopes** — **#291 landed; here is the answer.**
It did *not* close this outright. #291 added a fourth top-level tab
(`{ key: 'paths', href: '/config/mediamtx/paths' }` in `app-header.tsx`), so global and
per-path now each have a nav destination — **`pathDefaults` is the only config scope with
none.** It is reachable by URL, or from the link #209 added to the unresolved empty state.
→ Grill, now narrower and sharper than before: the header carries five tabs, two of which are
MediaMTX config (`mediamtxConfig` → `/global`, `paths`). Does `pathDefaults` become a sixth
tab, or does that pressure finally justify the scope switcher this issue originally proposed —
folding global / pathDefaults / paths behind one entry? *Produces: 1 ticket.*

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
**Correction from the #202 grill: it was blocked on #202 too, and nobody knew.**
`alwaysAvailable` does not exist in 1.11.3 — it is one of 23 keys *added* to `pathDefaults`
between 1.11.3 and 1.19.3, along with `alwaysAvailableFile` and `alwaysAvailableTracks`. The
issue was specced against a key the shipped schema could not have modeled.

**21. #225 — Auth management: internal users CRUD + hardening checklist**
MediaMTX's main security surface, currently hand-written YAML. High value, high blast radius.
→ Grill hard on edges: lockout-safe save, password handling (never render plaintext), and
whether the `any:any` default warning ships before the CRUD grid.
**#202 deliberately carves `authInternalUsers` out and leaves it to this ticket** — it is a list
of objects with nested permission arrays, which the form's `text | number | switch | list` kinds
cannot render. Budget a bespoke editor on the `ice-servers-rows.tsx` pattern. #202 also brings
in the 10 flat `auth*` keys around it (`authHTTPAddress`, the JWT set), so this ticket starts
with everything *except* the users grid already modeled.

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
**The #202 grill invalidated its central primitive: `runOnReady` no longer exists upstream** —
renamed to `runOnOnline` at some point before 1.19.3, along with `runOnReadyRestart` →
`runOnOnlineRestart` and `runOnNotReady` → `runOnOffline`. The title and body both name the dead
key. #202 fixes the schema; this issue's own text still needs rewriting before it is specced.

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

**40. ~~F5 — delete `origin/agent/issue-209`~~ — DONE 08-01.** Deleted `agent/issue-209`
(`bad885b`, dead PR #267) plus `agent/issue-206` and `-r2` (the duplicate-dispatch leftovers
from #307/#308). `agent/*` is now empty of stale refs, so `sweep_next_attempt` starts fresh —
#291 and #212 both got clean `agent/issue-N` names with no `-rK` suffix.

**41. NEW — don't push to `main` while a run is in flight.** Two `.smallhours.yml` commits
landed mid-#209 and left #311 at `mergeStateStatus: BEHIND`. smallhours correctly refuses to
promote a non-promotable PR (`success + BEHIND -> leave draft, the sweep re-evals`), so it
stalled until `gh pr update-branch`. Costs a CI re-run and a sweep. Land repo housekeeping
*before* labelling the next `ready-for-agent`.

**42. NEW — `conventional_title_types` is first-match-in-config-order, so `tech-debt` beats
`enhancement`.** Found during the #202 grill by reading `config_pr_title` in
`bcanfield/smallhours@scripts/lib/config.sh`: it walks the map in the order the keys appear in
`.smallhours.yml` and returns on the first label the issue carries. Ours lists `bug`,
`tech-debt`, `enhancement`, `documentation` — so **any issue carrying both `tech-debt` and
`enhancement` ships as `fix:`**, cutting a patch release for what may be a feature. The note
under "three consecutive runs established… the map works on both arms" is true but untested on
this case: #212 and #291 each carried only one of the two.

**#221 is already exposed** — it carries `enhancement`, `needs-triage` *and* `tech-debt`, so its
three split tickets would each ship as `fix:` unless something changes.

The per-issue escape hatch needs no config change: `config_pr_title` returns the title verbatim
when it already starts with a real conventional type, so **prefixing the issue title with
`feat: ` wins outright.** That is what #202 does. The repo-wide alternative — reordering the map
so `enhancement` precedes `tech-debt` — is one line, but it flips every future dual-labelled
issue at once and deserves its own decision.

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

Items 1, 2, 3 and 9 are all done — #214 cut into #304/#305/#306, #201 re-scoped, #209 and #212
re-specced, and all three of #209 / #291 / #212 shipped or in flight.

**#202 was grilled and dispatched after that was written**, so Tier B's first half is spent.
**Next grill is #210** (item 8), and #291 landing turned it from a deferred question into a
concrete one: `pathDefaults` is now the *only* config scope with no nav entry, against a header
that already carries five tabs. Sixth tab or scope switcher — that is the whole session, and it
is short.

Then **#203**, which #202 leaves cleanly teed up: 68 pathDefaults keys, three renames already
taken, and one open question #202 answered in advance — the form's four field kinds cannot
render a list of objects, and `pathDefaults` has three such keys waiting.

Cheap alternatives if there's time: item 7 (**#301** path rename — partial-failure semantics,
and genuinely might close) or item 37 (**#100** RTL — the cheapest close on the board).

**#202 is in flight** — dispatched from its grill, and the largest ticket the loop has been
given (~1,620 translated strings across 30 locale files). **Let it settle before promoting
anything else**, both because item 41 says so and because its outcome is the real experiment:
whether 200 turns / 60m survives a ticket whose bulk is breadth rather than depth. A timeout
answers item 38 rather than surprising anyone.

**Next dispatch after that is #304** — authorization queue item 2, needing only a label. #312
(the live-view loopback banner, split from #212) is also specified and unparked whenever you
want it.

**What three consecutive runs established**, worth not re-litigating: the 200-turn / 60m caps
close the loop; the verify gate is green-first-pass through the npx wrapper and cannot run
without it; the label→title map works on both arms (`fix:` and `feat:`); and the grill is what
moves the needle — #209 failed this same board twice ungrilled and landed first try after a
spec-out-by-file rewrite.

**Reminder:** applying `ready-for-agent` fires smallhours immediately. Promote one at a time.
