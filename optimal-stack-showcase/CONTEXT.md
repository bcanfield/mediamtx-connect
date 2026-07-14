# Optimal-stack showcase

A minimal Go + TanStack SPA proving the stack proposed in `../docs/optimal-stack.md`: one binary, one generated contract, end-to-end type safety. Its domain is deliberately tiny — just enough to exercise every seam.

## Language

**Stream**:
A named media path that ingests from a source URL — the showcase's stand-in for a MediaMTX path. Identified by its `name`.
_Avoid_: channel, feed, camera

**Store**:
The keeper of known Streams; owns uniqueness of Stream names. Everything behind it (in-memory today, SQLite later) is an adapter concern.
_Avoid_: repository, DAO, database

**Contract**:
The committed `openapi.yaml` — the reviewable API surface from which the TypeScript types are generated. Fresh means it matches what the Go structs render.
_Avoid_: spec (ambiguous with test specs), schema (ambiguous with schema.d.ts)
