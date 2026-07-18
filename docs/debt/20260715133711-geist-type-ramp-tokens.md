---
id: 20260715133711
title: geist-type-ramp-tokens
principal: 4h
interest: +few min per new feature page; ramp can drift
hotspot: apps/web/src/globals.css
business_capability: web-ui
payoff_trigger: next design-token change, or a new feature page retyping the ramp
quadrant: prudent-deliberate
category: code_quality
ai_authored: true
created: 2026-07-15
---

The Geist arbitrary type ramp (text-[13px], text-[12.5px], text-[11.5px], text-[10.5px], tracking-[-0.02em]) is retyped per call site across apps/web instead of being promoted to @theme --text-* tokens in globals.css. The 2026-07 audit fix pass promoted only the 10px radius (--radius-panel) and overlay shadow, and pushed form label/description sizes into ui/form.tsx defaults; the rest of the ramp stays as arbitrary values because it is consistent local idiom from the design handoff and a full sweep was out of scope. Symptom: every new component restates the ramp by hand, and nothing enforces it.
