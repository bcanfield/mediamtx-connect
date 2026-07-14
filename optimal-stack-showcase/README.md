# Optimal-stack showcase

A minimal, working implementation of the stack proposed in
[`../docs/optimal-stack.md`](../docs/optimal-stack.md): an OpenAPI-first Go API,
generated TypeScript types, and a Vite SPA consuming them — end-to-end type
safety across two languages, shipped as **one static binary** (~8 MB) with the
frontend embedded.

Every tool choice below was verified against current (July 2026) releases and
official docs, not assumed.

## Stack

| Layer | Tool | Version | Why |
|-------|------|---------|-----|
| API framework | [Huma v2](https://huma.rocks) + [chi](https://github.com/go-chi/chi) | v2.38.0 / v5.3.1 | Code-first: Go structs → OpenAPI 3.1 + request validation. Still the leading code-first Go framework (its rival Fuego stalled pre-1.0; oapi-codegen/ogen are the spec-first alternatives). |
| Language | Go | 1.25+ in `go.mod`, built on 1.26.x | Huma's minimum is 1.25. |
| Type codegen | [openapi-typescript](https://openapi-ts.dev) | 7.13.0 | Emits a single types-only `schema.d.ts` — no generated runtime code to own. |
| API client | [openapi-fetch](https://openapi-ts.dev/openapi-fetch/) + [openapi-react-query](https://openapi-ts.dev/openapi-react-query/) | 0.17 / 0.5 | ~7 kB of generic runtime driven entirely by the generated types; first-party TanStack Query v5 wrapper from the same monorepo. Chosen over Hey API and orval, which generate per-endpoint client code. |
| Frontend | React 19 + [Vite 8](https://vite.dev) | 19.2 / 8.1 | Vite 8 is Rolldown-native (Rust bundler is now the default — no `rolldown-vite` package needed). |
| Routing | [TanStack Router](https://tanstack.com/router) | 1.170 | File-based routing (the documented default) with fully typed params via the `Register` interface. |
| Data fetching | [TanStack Query v5](https://tanstack.com/query) | 5.101 | Wired into the router via `createRootRouteWithContext` + `Wrap`, with `defaultPreloadStaleTime: 0` so Query owns caching. |
| Styling | Tailwind CSS 4 | 4.1 | Via the first-party `@tailwindcss/vite` plugin — one `@import "tailwindcss"` line. |
| Lint | oxlint / golangci-lint v2 | — | What create-vite ships today / current v2 config format. |
| Hot reload | [air](https://github.com/air-verse/air) | v1.65+ | Still the Go standard (note: it lives at `air-verse/air` now). |

## The type-safety seam

```
Go structs (internal/api/streams.go)
   │  huma generates the contract
   ▼
openapi.yaml            ← make gen-openapi  (go run ./cmd/server openapi)
   │  openapi-typescript
   ▼
web/src/lib/api/schema.d.ts   ← make gen-types  (npm run gen:api)
   │  openapi-fetch + openapi-react-query (types only, no codegen'd client)
   ▼
$api.useQuery('get', '/api/streams/{name}', { params: { path: { name } } })
```

Rename a JSON field in a Go struct, run `make gen`, and `tsc` fails in every
component that used it. The contract is explicit, versionable, and reviewable —
exactly what a CLI / Terraform / plugin roadmap needs anyway.

## Layout

```
cmd/server/          entrypoint: humacli app + `openapi` and `healthcheck` subcommands
internal/api/        models + in-memory store + Huma operations (+ humatest tests)
internal/web/        //go:embed of the built SPA, index.html fallback for client routes
web/                 Vite SPA (TanStack Router file-based routes under src/routes/)
openapi.yaml         generated contract (committed — the reviewable API surface)
```

## Prerequisites

- Go 1.25+
- Node 20.19+ / 22.12+ (Vite 8 requirement)
- `go install github.com/air-verse/air@latest` (dev hot-reload, optional)

## Quickstart

```bash
cd web && npm install && cd ..

# Regenerate the contract + types after changing Go handlers
make gen

# Dev: two terminals, fast HMR on both sides
make dev-api    # air → Go server on :8080
make dev-web    # vite on :5173, proxies /api → :8080

# Production: one static binary, SPA embedded
make build
./bin/server                 # UI on http://localhost:8080, docs on /docs
./bin/server openapi         # dump the OpenAPI 3.1 spec
SERVICE_PORT=8080 ./bin/server healthcheck   # container HEALTHCHECK probe

make test lint
```

Docker (multi-arch cross-compile, distroless runtime, self-healthchecking —
see `Dockerfile`):

```bash
docker buildx build --platform linux/amd64,linux/arm64 -t optimal-stack-showcase .
```

## Deliberate omissions (vs. the full optimal-stack.md)

Kept out to stay minimal; each slots in without restructuring:

- **SQLite + sqlc** — the store is an in-memory map behind the same handlers;
  swap in `modernc.org/sqlite` + sqlc for real persistence.
- **React Hook Form + Zod** — the create form is two controlled inputs;
  server-side validation via Huma schema tags is showcased instead (422s are
  free).
- **shadcn/ui, i18n, SSE, ffmpeg supervision** — app concerns, not
  stack-seam concerns.

## Known constraints

- `openapi-typescript@7` declares a `typescript@^5.x` peer, so the web app pins
  TypeScript `~5.9.3` rather than TS 6/7. Revisit when
  [openapi-ts widens the peer range](https://github.com/openapi-ts/openapi-typescript).
- `internal/web/dist/.gitkeep` exists so `//go:embed all:dist` compiles before
  the first web build; `make web` re-touches it after Vite empties the dir.
