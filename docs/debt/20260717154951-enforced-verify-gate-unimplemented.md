---
id: 20260717154951
title: enforced-verify-gate-unimplemented
principal: 3d
interest: agent-authored regressions can ship green
hotspot: docs/adr/0004-enforced-verify-gate-for-agentic-confidence.md
business_capability: ci-quality-gates
payoff_trigger: the ADR 0004 mechanisms land in CI, or the plan is abandoned
quadrant: prudent-deliberate
category: testing
ai_authored: true
created: 2026-07-17
---

ADR 0004 is now **Accepted** (sharpened via a grilling session on 2026-07-17) but nothing is implemented yet — the doc and the code are out of sync until the change lands. The accepted plan: a precondition plus three mechanisms.

- **Precondition (not deferred):** confirm GitHub branch protection requires the `build` job on main/beta — without it every mechanism below is advisory.
- **Coverage floor:** `vitest --coverage` (v8) over apps/api/src as an exclude-list (carve out server.ts/env.ts/logger.ts), line coverage only, a single aggregate floor set from measured post-baseline coverage minus a buffer. Ships with baseline tests for the two currently-untested substantive modules, `mediamtx.ts` and `recordings-fs.ts`. Per-file floor is the signposted next tightening.
- **`pnpm verify`:** a deterministic script (`lint && typecheck && i18n:check && test` with coverage) mirroring the CI build gate. Not a skill.
- **FEATURES.md gate:** CI fails when a PR has a `feat:` commit but no docs/FEATURES.md change. No path list.

Deferred: the component/form test layer (jsdom + Testing Library). Dropped: the local pre-push hook (branch protection + `pnpm verify` cover its jobs).

Until these land, an autonomous agent remains its own unreviewed author: it can add untested api logic or skip the FEATURES.md update and still pass every gate green.
