# optimal-stack-showcase

Self-contained Go + React demo. The root CLAUDE.md's Next.js rules (i18n
messages, Prisma, Pino logger, `src/` layout) do **not** apply in this
directory. Stack rationale and quickstart live in `README.md`.

## Commands (run from this directory)

- `make gen` — regenerate `openapi.yaml` + `web/src/lib/api/schema.d.ts`.
  Run after **any** change to Go API structs or Huma operations, and commit
  the regenerated files — the contract is the reviewable API surface.
- `make test && make lint` — required clean before finishing
  (`go test ./...`, golangci-lint v2, web lint).
- `make dev-api` + `make dev-web` — two-terminal dev loop (air + Vite proxy).
- `make build` — single static binary with the SPA embedded.

## Never hand-edit (generated)

- `openapi.yaml` and `web/src/lib/api/schema.d.ts` — output of `make gen`.
- `web/src/routeTree.gen.ts` — TanStack Router writes it.
- `internal/web/dist/.gitkeep` must survive cleans; `//go:embed all:dist`
  fails to compile without it.

## Go style

Baseline: [Effective Go](https://go.dev/doc/effective_go) and
[Go Code Review Comments](https://go.dev/wiki/CodeReviewComments); don't
restate what golangci-lint enforces. The rules below are the ones AI-written
Go most often gets wrong:

- **Write Go 1.25-era code**, not 2020-era: `min`/`max` builtins,
  `range N` over int, `slices`/`maps` packages, `any` not `interface{}`,
  `log/slog` for logging. Check `go.mod` before assuming a feature is
  unavailable.
- **Errors**: never discard one; wrap with `fmt.Errorf("doing x: %w", err)`;
  check with `errors.Is`/`errors.As`. In handlers return Huma error responses
  (`huma.Error404NotFound` etc.), never panic.
- **Context**: `context.Context` is the first param of anything blocking;
  propagate it, never store it in a struct. No goroutine without a
  termination path.
- **Interfaces**: small, defined at the consumer, "accept interfaces, return
  structs".
- **Dependencies**: stdlib-first. Huma + chi + cobra are the chosen frameworks;
  adding any new Go dependency needs justification in the PR.
- **Tests**: table-driven with `t.Run` subtests; API handlers use `humatest`
  (see `internal/api/streams_test.go` for the house pattern).
