---
id: 20260715131524
title: record-fields-not-surfaced
principal: unknown
interest: unknown
hotspot: apps/web/src/features/mediamtx-config/sections.ts
business_capability: mediamtx-config
payoff_trigger: first user confused by the 'Enable recording' CTA landing on a page with no record toggle
quadrant: prudent-deliberate
category: planning
ai_authored: true
created: 2026-07-15
---

The MediaMTX record* global fields (record, recordPath, recordFormat, recordPartDuration, recordSegmentDuration, recordDeleteAfter) exist in GlobalConfigSchema but are surfaced in no section — the design pins exactly 8 rail sections with no Recording section, yet the recordings empty-state CTA "Enable recording" links to /config/mediamtx/global. Either a 9th section is needed (design deviation) or the CTA needs a different target.
