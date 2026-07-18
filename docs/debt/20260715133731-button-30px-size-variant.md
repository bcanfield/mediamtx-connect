---
id: 20260715133731
title: button-30px-size-variant
principal: 1h
interest: unknown
hotspot: apps/web/src/features/recordings/recording-row.tsx
business_capability: web-ui
payoff_trigger: a second file needs 30px buttons
quadrant: prudent-deliberate
category: code_quality
ai_authored: true
created: 2026-07-15
---

recording-row.tsx keeps three hand-rolled 30px button overrides (h-7.5 px-3 twice, size-7.5 once) that sit between the sm (h-7) and default (h-8) size variants in ui/button-variants.ts. The 2026-07 audit fix pass deliberately did not add a cva size variant for it because the 30px control currently occurs only in this one file; if it recurs elsewhere, promote it to a named size in button-variants.ts and sweep the overrides.
