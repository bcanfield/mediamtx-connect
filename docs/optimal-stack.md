# Optimal Tech Stack — a greenfield proposal

> **Status: design exploration, not the shipped architecture.** This is a "if we started today, unbiased of what exists or what it would cost to transition" recommendation. The app currently runs on Next.js/React/Prisma — see [`ARCHITECTURE.md`](../ARCHITECTURE.md) for reality. Read this as an argument, not a migration plan.

## TL;DR

| Layer | Pick |
|-------|------|
| **Frontend** | React 19 + TypeScript + **Vite** (a static SPA — *not* Next.js) |
| **Backend** | **Go** — single static binary that embeds the SPA |
| **Data** | **SQLite** (pure-Go driver, no CGO) |
| **API seam** | OpenAPI-first in Go → generated typed TanStack Query hooks |
| **Media** | native `RTCPeerConnection` (hand-rolled WHEP/WHIP) + HLS.js fallback |
| **Deploy** | one static multi-arch binary + ffmpeg, in a tiny container |

## The thesis

**Optimal ≠ trendy. Optimal = every layer matches its actual job, and the load-bearing parts are boring-and-proven.** MediaMTX Connect has two jobs with two very different profiles, and a single full-stack framework conflates them:

- The **frontend's** real job is a rich, reliable, *browser-native media* control panel: WebRTC/WHEP/WHIP/HLS playback, a ~75-field accessible config form, 30-language incl. RTL, and lots of live-updating values.
- The **backend's** real job is a lean **edge media-appliance runtime** that lives on a Pi/NUC *next to a Go media server*: proxy large file streams, supervise ffmpeg processes, fan out live events, run unattended for months, and ship as one tiny artifact.

Pick the proven tool for each job rather than one tool that's a compromise for both.

## What actually drives the choice

The app's hardest, most differentiating demands:

- **Browser-native low-latency media** — WebRTC is the whole point (RTSP-in → WebRTC-out is the center of real MediaMTX usage). This is unavoidably a rich web client.
- **Streaming/proxying large files** — recordings download, playback-server proxying, clip export.
- **Spawning & supervising ffmpeg** — thumbnails, snapshots, transcode recipes, clip export.
- **Live, unattended reliability on constrained hardware** — a Pi/NUC, months of uptime, tiny footprint, multi-arch (amd64/arm64).
- **Lives next to a Go binary (MediaMTX)** — often on the same box; shares its OpenAPI and its contributor pool.
- **Small, single-writer state** — config, path metadata, config snapshots, audit log, tags, alert rules.
- **Form-heavy + poll-heavy UI** — the strongest case for typed forms and a real caching/query layer.

## Backend: Go

A single static binary. Router: Chi or stdlib `net/http`. API defined **OpenAPI-first with Huma** (structs → schema + validation). Data via **`modernc.org/sqlite`** (pure-Go, no CGO → truly static) with **sqlc** for typed queries. **`log/slog`** for structured logs, **robfig/cron** for jobs, **`os/exec`** for ffmpeg supervision, **SSE** for live feeds, **`embed.FS`** to bake the SPA into the binary.

Why Go is optimal *for this specific app*:

1. **It matches the operational shape exactly.** ~15MB static binary, near-zero idle memory, instant start, trivial `GOARCH=arm64` cross-compile, `scratch`/distroless-friendly. A Node SSR runtime is the wrong shape on edge hardware.
2. **Its hot paths are Go's sweet spots** — concurrent stream proxying, spawning/supervising many ffmpeg jobs, SSE fan-out, long-lived unattended reliability. The boring, bulletproof stuff Go was built for (MediaMTX, Docker, Caddy).
3. **Same language as the thing it wraps.** MediaMTX is Go — share its OpenAPI, potentially its types, and draw from the same contributor pool.
4. **It unlocks the roadmap for free.** The backlog wants a Connect API, a CLI, and a Terraform provider. OpenAPI-first Go gives the typed API, a Cobra CLI, and an IaC provider in Go's native ecosystem.

## Frontend: React 19 + TypeScript + Vite (not Next.js)

**TanStack Query** (the polling/cache/real-time engine this app lives on), **TanStack Router** (type-safe routes), **Tailwind + shadcn/ui (Radix)**, **React Hook Form + Zod**, native **`RTCPeerConnection`** with a hand-rolled WHEP/WHIP client + **HLS.js** fallback, **react-i18next** over ICU messages, **Vitest + Playwright**. Built to static assets, embedded in the Go binary.

Why React, and why not the trendier bets:

1. **The differentiator is media, and media reliability is what gets you fired.** WebRTC/WHEP/WHIP/HLS have the deepest real-world examples and libraries on React. Don't bet the core on a thinner ecosystem.
2. **shadcn/Radix is the most mature answer to the two hardest UI problems** — accessibility, and a scannable 75-field config across 30 languages incl. RTL.
3. **RHF + Zod + TanStack Query are best-in-class and React-native** — exactly the form-heavy + poll-heavy profile.
4. **Largest contributor pool** for an OSS companion tool.

**Why not Next.js** (a principled drop): Next's wins are SSR/RSC/edge/SEO. This is a single-user, auth-optional, inherently-dynamic, client-media-heavy dashboard — it gets ~none of those benefits while paying the server/client-boundary complexity and a Node-runtime footprint that mismatches a lean Go binary on a Pi. A static SPA served *from* the Go binary is simpler, lighter, and needs **zero Node in production**.

## The seam: type safety across two languages

Two languages means no automatic shared types — solved with codegen, and it's arguably *better architecture*:

- Connect's API is **OpenAPI-first in Go** (Huma) → `openapi-typescript` + `orval` generate typed **TanStack Query hooks**.
- MediaMTX's OpenAPI → generated Go + TS clients.

You get end-to-end type safety across the boundary **and** a real, documented API contract — which the CLI / Terraform / plugin roadmap needs anyway. Implicit server-action coupling hides that contract; forcing it is a feature.

## Data: SQLite, unapologetically

Embedded, single-file, zero-ops, single-writer — and the data is tiny. It matches MediaMTX's zero-dependency ethos. Postgres is a future *adapter* only if multi-server federation becomes a real product; it is not the default.

## What was rejected, and why

| Considered | Verdict | Why not |
|---|---|---|
| **Next.js full-stack** | ✗ | SSR/RSC/edge value ≈ 0 for a client-heavy single-user dashboard; Node SSR footprint is wrong next to a Go binary on a Pi. |
| **Bun + Hono (JS everywhere)** | ✗ (close 2nd) | Tempting: one language, shared types, `bun build --compile` → a binary. But won't bet an unattended edge appliance's process-supervision and months-long stream-proxy reliability on Bun's ARM runtime maturity over Go's certainty. |
| **Rust backend** | ✗ | Marginal gain over Go for a CRUD+proxy+exec app that offloads all heavy media to MediaMTX/ffmpeg; friction and contributor pool not worth it. Would win only for in-process media. |
| **SolidJS / Svelte 5 frontend** | ✗ | Fine-grained reactivity is technically better for live values and bundles are smaller, but media + a11y + component ecosystems aren't as deep — too much risk on the load-bearing parts. |
| **Postgres default** | ✗ | Over-provisioning; adds an ops dependency this single-node tool doesn't need. |

## The one honest cost

Go + TS is **two languages and a codegen step** — a broader skillset and slightly more ceremony than JS-everywhere with server actions. Worth it, because it buys the two things that matter for infrastructure-adjacent software: **an operational profile that fits the edge**, and **a real API contract the product's future depends on**. Boring where it must not fail (Go runtime, React media UI), modern where it's cheap (Vite, TanStack, shadcn).

---

# Docker setup

The whole app compiles to **one static binary with the SPA embedded inside it**, so the image is essentially *"tiny Go binary + ffmpeg"* — and ffmpeg is the only reason it isn't ~20MB.

## Dockerfile — three stages, cross-compiled

```dockerfile
# syntax=docker/dockerfile:1

# 1) Build the SPA — architecture-independent (just JS)
FROM node:22-alpine AS web
WORKDIR /web
COPY web/package.json web/package-lock.json ./
RUN npm ci
COPY web/ .
RUN npm run build                         # → /web/dist (static assets)

# 2) Build the Go binary, embedding the SPA. Runs NATIVELY, cross-compiles.
FROM --platform=$BUILDPLATFORM golang:1.23-alpine AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
COPY --from=web /web/dist ./internal/web/dist   # //go:embed picks this up
ARG TARGETOS TARGETARCH
RUN --mount=type=cache,target=/root/.cache/go-build \
    CGO_ENABLED=0 GOOS=$TARGETOS GOARCH=$TARGETARCH \
    go build -trimpath -ldflags="-s -w" -o /out/connect ./cmd/connect

# 3) Runtime — the ONLY heavy dependency is ffmpeg
FROM alpine:3.20
RUN apk add --no-cache ffmpeg tzdata \
 && adduser -D -u 10001 connect \
 && mkdir -p /data /recordings /screenshots \
 && chown -R connect /data /recordings /screenshots
COPY --from=build /out/connect /usr/local/bin/connect
USER connect
ENV CONNECT_DB=/data/connect.db
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD ["/usr/local/bin/connect", "healthcheck"]
ENTRYPOINT ["/usr/local/bin/connect"]
```

Three deliberate wins over a Node/Next/Prisma image:

- **`CGO_ENABLED=0` → fully static.** This is *why* the stack picks pure-Go SQLite (`modernc.org/sqlite`) — no libc, no CGO, no per-arch query-engine binaries.
- **Self-healthcheck subcommand.** `connect healthcheck` hits the app's own `/api/health` in-process, so there's **no `curl`/`wget` in the image** (it even works on `scratch`).
- **Self-migrating on boot.** Migrations are embedded and run in-process in `main()` — **no `start.sh` entrypoint**; the binary *is* the entrypoint.

## Multi-arch is nearly free

```bash
docker buildx build --platform linux/amd64,linux/arm64 -t bcanfield/mediamtx-connect .
```

The `web` stage is arch-independent. The `build` stage runs on the **native builder** (`$BUILDPLATFORM`) and *cross-compiles* to `$TARGETARCH` — no QEMU emulation of the compile, no native-module rebuilds, no Sharp/Prisma arch juggling. Only the final `alpine` layer is per-arch, and all it does is `apk add ffmpeg`.

## Compose — two containers, side by side

```yaml
services:
  mediamtx:
    image: bluenviron/mediamtx:latest
    restart: unless-stopped
    volumes:
      - ./mediamtx.yml:/mediamtx.yml:ro
      - recordings:/recordings          # <-- shared with connect
    ports:
      - "8554:8554"       # RTSP
      - "1935:1935"       # RTMP
      - "8888:8888"       # HLS
      - "8889:8889"       # WebRTC · WHEP/WHIP
      - "8189:8189"       # WebRTC ICE/TCP fallback  (matters for remote viewers)
      - "8890:8890/udp"   # SRT
    networks: [mtx]

  connect:
    image: bcanfield/mediamtx-connect:latest
    restart: unless-stopped
    depends_on: [mediamtx]
    environment:
      MEDIAMTX_API_URL:    http://mediamtx:9997   # internal network, not host-exposed
      REMOTE_MEDIAMTX_URL: http://localhost       # browser-reachable host for HLS/WHEP
    volumes:
      - connect-data:/data                        # SQLite (tiny)
      - recordings:/recordings                    # read recordings, write thumbnails
      - screenshots:/screenshots
    ports:
      - "3000:3000"
    networks: [mtx]

volumes: { connect-data: {}, recordings: {}, screenshots: {} }
networks: { mtx: {} }
```

Load-bearing details:

- **Shared `recordings` volume.** MediaMTX writes segments; Connect reads them and writes thumbnails. Same disk, no copying, no API round-trip for file access.
- **API stays internal.** Connect reaches MediaMTX on `mediamtx:9997` over the bridge network — the API port never has to be exposed to the host.
- **WebRTC needs `8889` *and* `8189` exposed.** The ICE/TCP fallback port is required for remote viewers behind NAT — without it, WHEP silently degrades to HLS. Cheap to get right, easy to forget.
- **Config seeds from env on first boot,** then the SQLite `Config` is source of truth.

## Dev mode

A `compose.dev.yml` adds the `fake-streams` rig. Locally you run **two** processes — the Vite dev server proxying `/api` → the Go backend on `:3000`, plus **`air`** for Go hot-reload — but **production is one binary**. Fast HMR on both sides in dev; zero Node in the shipped artifact.

## Optional: an all-in-one "appliance" image

Because Connect already supervises ffmpeg processes, it can just as easily supervise MediaMTX as a child process — enabling a second distribution: one image, one `docker run`, MediaMTX + Connect + ffmpeg together, for the "I just want an NVR box" self-hoster. Keep the two-container compose as the default (clean separation, independent upgrades); offer the appliance image as the low-friction on-ramp.

## The honest comparison

| | This stack | Node/Next/Prisma |
|---|---|---|
| Final image | Go binary (~20MB) **+ ffmpeg** (dominates) | Node + `.next` standalone + `node_modules` + Prisma engines + Sharp — several hundred MB |
| Multi-arch build | Cross-compile, no emulation, no native rebuilds | QEMU/native-module pain, Prisma binary targets |
| Entrypoint | The binary (self-migrates, self-healthchecks) | `start.sh` → `prisma migrate deploy` → `next start`, + curl for health |
| Runtime deps | ffmpeg only | Node runtime + native modules + ffmpeg |
| Idle footprint | Near-zero, instant start | Node baseline + Next server |

The point lands here: on a Pi next to a Go media server, the optimal deployment is *one small static binary and ffmpeg* — and this stack produces exactly that, almost for free.
