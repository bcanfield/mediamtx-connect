---
id: 20260716162534
title: record-read-can-blank-stream-grid
principal: 4h
interest: unknown
hotspot: apps/api/src/router.ts
business_capability: live-view
payoff_trigger: first report of the live view showing 'Can't reach MediaMTX' while streams are demonstrably publishing
quadrant: prudent-deliberate
category: code_quality
ai_authored: true
created: 2026-07-16
---

Ticket 04 added `configPathGet` calls to `streams.list` to resolve effective record state. They sit inside the handler's existing try/catch, so a non-404 failure on one config entry now returns `status: 'connection-error'` for the whole live view — the grid blanks to "Can't reach MediaMTX" even though `paths/list` and `config/global/get` both answered. The stream list previously did not depend on the config-paths endpoint at all, so this widens what one flaky read can cost.

Left as-is because the alternative is worse with today's types: catching it separately would mean resolving unknown record state to a confident `false`, which is the lie ticket 04 exists to kill (see [[record-state-unknown-reads-as-off]]). Failing loudly beats lying quietly, but the blast radius is wrong either way — the honest fix is a record state that can be unknown.
