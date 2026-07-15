---
id: 20260714134954
title: hardcoded-aggressive-density
principal: 1d
interest: unknown
hotspot: apps/web/src/components/ui/card.tsx
business_capability: ui-shell
payoff_trigger: unknown
quadrant: prudent-deliberate
category: code_quality
ai_authored: true
created: 2026-07-14
---

Applied an aggressive global density pass by hardcoding tighter values into shared primitives (card p-6→p-3, input/button h-10→h-8, grid gaps gap-4→gap-2) and feature grids. Design-system research (Cloudscape, Atlassian) recommends keeping comfortable density as the default and letting users opt into compact via a toggle. There is already a liveDensity localStorage toggle in live-streams-view.tsx that could be promoted into a global comfortable/compact mode. Deferred because the user explicitly chose "tighten defaults, aggressive" for speed. Revisit if users report the UI feels too cramped or ask for a density preference.
