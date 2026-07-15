---
id: 20260715131540
title: contrast-token-deviation
principal: unknown
interest: unknown
hotspot: apps/web/src/globals.css
business_capability: app-shell
payoff_trigger: designer review of the lightened dark tokens, or the a11y suite starting to test light mode
quadrant: prudent-deliberate
category: code_quality
ai_authored: true
created: 2026-07-15
---

Dark-mode --faint (#7d7d7d vs the handoff's #666666) and --link (#4da2ff vs #0070f3) were lightened so small mono text passes WCAG AA (axe gate in tests/e2e/a11y.spec.ts); the vivid #0070f3 is kept for the focus ring and status dot. The light palette's mute/faint tiers are straight from the Geist source tokens and fail AA for small text — untested today because the a11y suite only exercises the dark default.
