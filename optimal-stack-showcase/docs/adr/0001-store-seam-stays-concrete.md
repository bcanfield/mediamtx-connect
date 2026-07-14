# 0001 — Store seam stays concrete until a second adapter exists

**Date:** 2026-07-14
**Status:** accepted

The Store's methods are adapter-shaped (`context.Context` in, `error` out, `ErrExists`/`ErrNotFound` sentinels) so a SQLite + sqlc adapter can satisfy them without touching the handlers — but the Store is deliberately a concrete struct, not a Go interface. One adapter means a hypothetical seam; the `interface` keyword lands in the same change as the second adapter.

Don't "helpfully" extract a `Store` interface before then. The reshape already bought the swap; the abstraction would have a single implementation and no consumer.

**Considered options:** define the interface now (rejected: single-implementation abstraction, and its exact method set is better dictated by the real sqlite adapter); keep the old map-shaped methods (rejected: `bool` returns and missing `ctx`/`error` made the promised swap a rewrite of every handler).

**Payoff trigger:** the SQLite + sqlc adapter is added — promote `Store` to an interface then.
