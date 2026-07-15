# 0001 — Pin air via go.mod tool directive

**Date:** 2026-07-14
**Status:** Accepted

## Context

`make dev-api` in `optimal-stack-showcase` runs air for hot reload. Air was
an undeclared prerequisite: developers had to `go install
github.com/air-verse/air@latest` globally, so its version was whatever
`@latest` resolved to on install day, and a clean checkout couldn't run the
dev loop without an out-of-band step.

## Decision

Pin air with a Go 1.24+ `tool` directive (`go get -tool
github.com/air-verse/air@latest`, currently v1.65.3) and change the Makefile
target to `go tool air`. The version is now locked in `go.mod`/`go.sum` and
builds on first use with no separate install.

## Consequences

- Reproducible dev loop from a clean checkout; version bumps are reviewable
  diffs.
- Air's transitive dependencies (notably `github.com/gohugoio/hugo`) now
  appear in `go.mod`/`go.sum`, adding ~46 lines of go.sum and potential
  dependabot noise. They are tool-only and do not ship in the server binary.

## Alternatives

- **Global `go install` (status quo):** zero go.mod footprint, but
  unpinned and undeclared; broke for anyone without it on PATH.
- **`tools.go` blank-import pattern:** pre-1.24 convention; same pinning
  effect but hackier and now superseded by the official tool directive.

## Payoff trigger

If air's transitive deps cause recurring dependabot/audit noise or a
version conflict with server deps, move dev tooling to a separate module
(e.g. `tools/go.mod`).
