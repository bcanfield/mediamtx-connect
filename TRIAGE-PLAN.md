# Issue Board — Organized Plan (temp working doc)

> Snapshot: 2026-07-17, after the triage pass. **No further GitHub changes are being made** —
> this doc is the "get organized" source of truth to review before anything else touches the board.
> Delete this file (it's untracked) or fold it into `docs/` when done.
>
> Label vocabulary (`docs/agents/triage-labels.md`): `needs-triage` · `needs-info` ·
> `ready-for-agent` · `ready-for-human` · `wontfix`. Category labels ride alongside:
> `enhancement`, `bug`, `documentation`, `tech-debt` (new — registry-sourced issues).
> Loop-owned state labels (`agent-working`, `in-review`, …) are applied by the smallhours
> automation, not by hand.

---

## ⚠️ Things to know before reconciling

1. **The smallhours loop fired immediately.** `ready-for-agent` is its trigger, and within
   seconds of labeling it claimed ~28 issues (`agent-working`). On some it removed
   `ready-for-agent` (#185–188, all claimed debt issues), on others it left both
   (#175–184) — it appeared to still be mid-sweep at snapshot time. **Decision needed:**
   is 28 concurrent claims acceptable, or should the loop be paused / the label applied
   in small batches going forward?
2. **#197 "Add a SECURITY.md security policy"** appeared externally during the pass
   (unlabeled — not created by this triage). Suggested: `needs-triage`.
3. **#174 (WHEP playback) was closed as shipped** (docs/FEATURES.md §1.3.1, ADR 0003).
   All other slate issues remain open.
4. Issue **#4 (Renovate Dependency Dashboard)** is tool-managed — never label it.

---

## Full board: current state → intended state

### Slate feature issues (from epic #190, all grilled)

| # | Title (short) | Current labels | Intended state | Notes |
|---|---|---|---|---|
| 190 | Epic: top-20 feature slate | `enhancement, ready-for-human` | ✅ as intended | Tracking/sequencing stays with maintainer |
| 175 | Per-path management: catalog, detail, wizard | `enhancement, ready-for-agent, agent-working` | `ready-for-agent` (claimed) | Partially shipped: per-path editor exists (§3.4); remaining = catalog, wizard, detail/health. Progress comment posted |
| 177 | Multi-destination simulcast manager | `enhancement, ready-for-agent, agent-working` | `ready-for-agent` (claimed) | |
| 178 | Hooks UI + recipe library | `enhancement, ready-for-agent, agent-working` | `ready-for-agent` (claimed) | |
| 179 | Publish-URL helper + OBS/FFmpeg recipes | `enhancement, ready-for-agent, agent-working` | `ready-for-agent` (claimed) | Partially shipped: copy-URLs + empty-state hints. Depends on #213 (enable flags) |
| 180 | NVR-style recording timeline | `enhancement, ready-for-agent, agent-working` | `ready-for-agent` (claimed) | Requires `recordFormat: fmp4` + playback server |
| 181 | Server-side clip export | `enhancement, ready-for-agent, agent-working` | `ready-for-agent` (claimed) | Builds on #180's playback-server plumbing |
| 182 | Recording mgmt: retention, disk forecast | `enhancement, ready-for-agent, agent-working` | `ready-for-agent` (claimed) | Partially shipped: record toggle + `record*` keys. Progress comment posted |
| 183 | Live sessions dashboard with kick | `enhancement, ready-for-agent, agent-working` | `ready-for-agent` (claimed) | Pure UX over existing `*/list` + `*/kick` |
| 184 | Codec ↔ protocol compatibility matrix | `enhancement, ready-for-agent, agent-working` | `ready-for-agent` (claimed) | |
| 185 | Browser publish via WHIP | `enhancement, agent-working` | `ready-for-agent` (claimed; loop removed the trigger label) | |
| 186 | go2rtc / Frigate config import | `enhancement, agent-working` | same | Confidence: medium (format stability) |
| 187 | Setup wizard + doctor/preflight | `enhancement, agent-working` | same | |
| 188 | Public viewer route + embed builder | `enhancement, agent-working` | same | Depends on #174's LivePlayer (shipped) |
| 176 | Latency chip | `enhancement, needs-triage` | ✅ as intended | Blocked on a metric definition — shipped player deliberately dropped the number (no honest cross-transport metric). Comment posted |
| 189 | Snapshot capture from live view | `enhancement, needs-triage` | ✅ as intended | Server-side on-demand snapshot shipped (§1.2.4); remaining scope (canvas/clipboard/gallery) needs a "still wanted?" call. Comment posted |
| 174 | WHEP/WebRTC playback default | **CLOSED** | ✅ shipped | |

### Older issues

| # | Title | Current labels | Intended state | Notes |
|---|---|---|---|---|
| 4 | Dependency Dashboard | *(none)* | *(none — leave alone)* | Renovate-managed |
| 100 | RTL languages | `needs-triage` | ✅ as intended | Bare link; needs spec. Comment posted |
| 197 | Add a SECURITY.md | *(none)* | **`needs-triage`** (not applied — appeared externally mid-pass) | Small, could be `ready-for-agent` after a policy decision (contact address, supported versions) |

### Debt-registry issues (all `tech-debt`; each links its `docs/debt/` entry)

| # | Title (short) | Current labels | Intended state | Notes |
|---|---|---|---|---|
| 198 | Native-speaker translation review | `ready-for-human, tech-debt` | ✅ as intended | Inherently human |
| 199 | Verify mediamtxForm help text vs MediaMTX docs | `agent-working, tech-debt` | `ready-for-agent` (claimed) | Coordinate with #202 (target v1.19.2) |
| 200 | Back-port README translations + harden guard | `documentation, agent-working, tech-debt` | `ready-for-agent` (claimed) | |
| 201 | Remaining test layers (contract/recordings-fs/Range/web runner) | `agent-working, tech-debt` | `ready-for-agent` (claimed) | Web-forms runner is the expensive half |
| 202 | Sync MediaMTX schema 1.11.3 → 1.19.2 | `agent-working, tech-debt` | `ready-for-agent` (claimed) | Foundation for #199/#203 |
| 203 | Widen path scopes (~80 missing keys) | `agent-working, tech-debt` | `ready-for-agent` (claimed) | Coordinate with #202 |
| 204 | Bound generateScreenshots ffmpeg | `agent-working, tech-debt` | `ready-for-agent` (claimed) | |
| 205 | streams.list failure domains | `bug, agent-working, tech-debt` | `ready-for-agent` (claimed) | 3 registry entries, one shared catch |
| 206 | Record toggle pending state | `needs-triage, tech-debt` | ✅ as intended | Pending affordance is undesigned |
| 207 | Warn: hook save restarts stream | `agent-working, tech-debt` | `ready-for-agent` (claimed) | |
| 208 | Revert-to-inherited (delete override) | `agent-working, tech-debt` | `ready-for-agent` (claimed) | |
| 209 | Path config dead-end for idle streams | `bug, agent-working, tech-debt` | `ready-for-agent` (claimed) | |
| 210 | Nav for three config scopes | `needs-triage, tech-debt` | ✅ as intended | Undesigned surface (ADR 0002) |
| 211 | WHEP real-transport E2E | `agent-working, tech-debt` | `ready-for-agent` (claimed) | CI already has live MediaMTX |
| 212 | webrtcAdditionalHosts localhost trap | `needs-triage, tech-debt` | ✅ as intended | Two candidate fixes; maintainer pick |
| 213 | Publish URLs ignore enable flags | `agent-working, tech-debt` | `ready-for-agent` (claimed) | Feeds #179 |
| 214 | Implement ADR 0004 (verify gate) | `agent-working, tech-debt` | `ready-for-agent` (claimed) | Highest leverage for everything else the loop does |
| 215 | Env var semantics residuals | `needs-triage, tech-debt` | ✅ as intended | Deployment-interface change; needs sign-off |
| 216 | Light-mode contrast + a11y coverage | `agent-working, tech-debt` | `ready-for-agent` (claimed) | |
| 217 | Geist type ramp → theme tokens | `agent-working, tech-debt` | `ready-for-agent` (claimed) | Mechanical sweep |
| 218 | Global density preference | `needs-triage, tech-debt` | ✅ as intended | Was an explicit product choice; needs a signal |
| 219 | Explicit dev fixture seeding | `agent-working, tech-debt` | `ready-for-agent` (claimed) | |
| 220 | Relocate breakpoint policy from CONTEXT.md | `documentation, agent-working, tech-debt` | `ready-for-agent` (claimed) | Tiny docs move |
| 221 | Remaining metadata (ffprobe, resolution chip, bitrate rate) | `enhancement, agent-working, tech-debt` | `ready-for-agent` (claimed) | Latency excluded (→ #176) |

**Registry entries deliberately without issues:** `connection-status-no-version` (wontfix, verified),
`stream-card-action-stubs` (remaining stubs covered by #175/#188), `typescript-6-bridge-pin`
(blocked upstream; Renovate will surface), `button-30px-size-variant`, `whep-client-protocol-subset`,
`config-scope-generic-casts` (payoff triggers haven't fired).

### Ideas-backlog issues (un-grilled — all `enhancement, needs-triage`, as intended ✅)

| # | Title | MediaMTX-native surface |
|---|---|---|
| 222 | Config snapshot history + diff preview + rollback | `configGlobalSet`/patch flow |
| 223 | Live metrics dashboard (in-app /metrics scraper) | metrics endpoint |
| 224 | MediaMTX + app log viewer | `logDestinations` / `logLevel` |
| 225 | Auth mgmt: internal users CRUD + hardening checklist | `authInternalUsers` |
| 226 | Path resilience: always-available + sourceOnDemand | per-path config keys |
| 227 | External-player links + client cheat sheet | advertised listen addresses |
| 228 | QR codes for publish/read URLs | same URL derivation |
| 229 | Config export/import (yml round-trip, dry-run diff) | config API |
| 230 | Notification targets + webhook health alerts | `runOn*` hooks |

---

## Roadmap — the next few months

Sequenced by dependency and leverage, not by issue number. `ready-for-agent` work can flow
through the loop; **bold** items gate others.

### Phase 0 — Safety rails (do first, small)
- **#214 ADR 0004 verify gate** (coverage floor, `pnpm verify`, FEATURES.md gate) — every
  other agent-executed issue gets safer once this lands.
- #201 remaining test layers (at least the api/contract half).
- #211 WHEP real-transport E2E — protects the flagship playback path while the slate work churns.

### Phase 1 — Foundation sync
- **#202 schema sync 1.11.3 → 1.19.2**, then #203 (path-scope key widening) and #199 (help-text verification).
- Small correctness debt in the same area: #205, #209, #213, #207, #208, #204, #219.

### Phase 2 — Slate wave 1 (per-path is the spine)
- **#175 per-path management** (catalog + wizard + detail) — most other slate items hang off it.
- #183 sessions dashboard · #179 publish-URL panel (after #213) · #184 codec matrix.

### Phase 3 — Slate wave 2 (recording + playback depth)
- **#180 NVR timeline** → #181 clip export → #182 retention/forecast.

### Phase 4 — Slate wave 3 (reach)
- #185 WHIP publish · #188 public viewer/embed · #187 setup wizard/doctor · #186 go2rtc import · #177 simulcast · #178 hooks UI.

### Phase 5 — Polish / UX debt (anytime, low risk)
- #216 light-mode contrast · #217 type ramp tokens · #220 CONTEXT.md move · #200 README translations · #221 metadata chips.

### Continuous — human/triage queue
- **Maintainer decisions pending** (each has the question in a comment or body):
  #176 (latency metric definition) · #189 (remaining snapshot scope) · #206 (pending-state design)
  · #210 (config nav design) · #212 (ICE host fix choice) · #215 (env interface) · #218 (density)
  · #100 (RTL spec) · #197 (SECURITY.md policy).
- **Human work:** #198 native-speaker review; #190 epic sequencing.
- **Grill queue** (promote or close after grilling): #222–#230.

---

## Suggested next actions (NOT executed — awaiting your call)

1. Decide whether smallhours running ~28 concurrent claims is OK; if not, pause the loop
   and re-apply `ready-for-agent` in phase order (Phase 0 → 1 → …).
2. Label #197 `needs-triage`.
3. Work the "maintainer decisions pending" list — each answered question either promotes an
   issue to `ready-for-agent` or closes it.
4. When adopting this plan, consider a milestone per phase so the board mirrors the roadmap.
