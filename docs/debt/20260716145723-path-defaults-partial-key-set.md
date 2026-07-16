---
id: 20260716145723
title: path-defaults-partial-key-set
principal: 1d
interest: +1 round-trip per operator who looks for a pathdefaults key we don't show
hotspot: packages/contract/src/index.ts (PathDefaultsSchema), apps/web/src/features/mediamtx-config/sections.ts (PATH_SECTIONS)
business_capability: mediamtx-config
payoff_trigger: first operator asks where recordMaxPartSize or a runOn* path hook is edited
quadrant: prudent-deliberate
category: planning
ai_authored: true
created: 2026-07-16
---

The path-defaults page surfaces only the 6 record* keys, but MediaMTX's /v3/config/pathdefaults serves ~100 keys — including recordMaxPartSize (verified present on the live v1.19.2 dev container) and 15 runOn* path hooks. Ticket 01 scoped the page to recording deliberately; the PATCH is sparse, so unlisted keys are left untouched and nothing is clobbered. The cost is that the page presents a partial view of the scope with no indication that more exists, so an operator looking for recordMaxPartSize finds no hint it lives here. Tickets 02-04 add the path-config scope and hooks entry, which is when the rest of this key set should get a home.

2026-07-16: ticket 02 shipped the path-config scope over the same PATH_SECTIONS descriptor, so the partial view now costs twice — an operator hunting recordMaxPartSize finds no hint on either the defaults page or a stream's own page. Widening PATH_SECTIONS fixes both at once.

2026-07-16: ticket 03 added all 15 runOn* path hooks to PATH_SECTIONS, so half this entry's payoff trigger is gone — hooks now have a home on both path scopes. recordMaxPartSize and the ~80 other pathdefaults keys (source*, maxReaders, srtReadPassphrase, overrides, …) still have none, and the trigger stands for them.
