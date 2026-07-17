---
id: 20260717154951
title: enforced-verify-gate-unimplemented
principal: 3d
interest: agent-authored regressions can ship green
hotspot: docs/adr/0004-enforced-verify-gate-for-agentic-confidence.md
business_capability: ci-quality-gates
payoff_trigger: an agent-authored regression ships through an unmeasured layer, or ADR 0004 is accepted and scheduled
quadrant: prudent-deliberate
category: testing
ai_authored: true
created: 2026-07-17
---

ADR 0004 proposes shifting regression confidence from manual discipline to enforced measurement — a vitest coverage floor on apps/api/src, a single `pnpm verify` preflight, and a FEATURES.md diff-check in CI — but is Status: Proposed with nothing implemented. The component/form test layer (jsdom + Testing Library), a local pre-push hook, and confirming GitHub branch protection actually requires the CI checks are explicitly deferred. Until at least the coverage floor and verify command land, an autonomous agent remains its own unreviewed author: it can add untested api logic or skip the FEATURES.md update and still pass every gate green.
