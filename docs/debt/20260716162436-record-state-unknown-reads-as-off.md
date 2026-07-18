---
id: 20260716162436
title: record-state-unknown-reads-as-off
principal: 1d
interest: unknown
hotspot: apps/api/src/router.ts
business_capability: live-view
payoff_trigger: first report of a card showing OFF for a stream that is recording, or when the card needs a third record state to display
quadrant: prudent-deliberate
category: code_quality
ai_authored: true
created: 2026-07-16
---

`streams.list` resolves effective record state as `confs[i]?.record ?? false`. That default folds "couldn't read the entry" into "not recording" — the exact failure mode ticket 04 exists to kill: a card claiming OFF while MediaMTX writes files to disk. It is reachable if the confName entry 404s between the `paths/list` and `config/paths/get` calls (`configPathGet` returns null on 404 rather than throwing), e.g. an entry deleted mid-poll.

A truthful model would carry unknown as its own state, but `StreamSchema.recording` is a plain boolean and the card has no third state to render. Took the boolean because a real entry always resolves `record` (ADR 0002, verified on v1.19.2), so the fallback should be unreachable in practice — the cost is that if it ever fires, it lies quietly instead of failing loudly.
