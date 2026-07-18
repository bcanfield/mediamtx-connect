# MediaMTX Connect Architecture

## System Overview

MediaMTX Connect is a pnpm/Turborepo monorepo: a Vite + React SPA (`apps/web`) and a Hono API (`apps/api`) share one oRPC contract (`packages/contract`) and ship as a single Docker image where Hono serves the SPA build, the JSON API, and media streaming from one process.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BROWSER (SPA)                                  │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  ┌─────────────┐  │
│  │ Streams Page  │  │ Recordings    │  │ Config Pages  │  │ HLS.js      │  │
│  │ (Live View)   │  │ Pages         │  │               │  │ (Video)─────┼──┼── HLS directly from
│  └───────┬───────┘  └───────┬───────┘  └───────┬───────┘  └─────────────┘  │   MediaMTX (:8888)
│          │   TanStack Query + oRPC client      │  <img>/<video>/download   │
└──────────┼──────────────────┼──────────────────┼───────────────┼────────────┘
           │                  │                  │               │
           └───────────┬──────┴──────────────────┘               │
                       │ /rpc/* (typed JSON)                     │ /media/* (binary, Range)
              ┌────────▼─────────────────────────────────────────▼────────┐
              │                    Hono API (Port 3000)                   │
              │  serves SPA build · oRPC router · media streaming ·       │
              │  /api/health · cron jobs (ffmpeg thumbnails, retention)   │
              └────────┬──────────────────┬──────────────────┬────────────┘
                       │                  │                  │
                ┌──────▼──────┐    ┌──────▼──────┐    ┌──────▼──────────┐
                │ config.json │    │ File System │    │  MediaMTX API   │
                │ (/data)     │    │ (mp4/png)   │    │  (Port 9997)    │
                └─────────────┘    └─────────────┘    └────────┬────────┘
                                                               │
                                                      ┌────────▼────────┐
                                                      │    MediaMTX     │
                                                      │    Server       │
                                                      │ ┌─────────────┐ │
                                                      │ │RTSP (8554)  │ │
                                                      │ │RTMP (1935)  │ │
                                                      │ │HLS  (8888)  │ │
                                                      │ └─────────────┘ │
                                                      └────────┬────────┘
                                                               │
                                                      ┌────────▼────────┐
                                                      │  Video Sources  │
                                                      │  (IP Cameras,   │
                                                      │   OBS, etc.)    │
                                                      └─────────────────┘
```

## Type safety across the wire

`packages/contract` defines every API shape once (oRPC + Zod v4). `apps/api/src/router.ts` implements it with `implement(contract)` — handlers that drift from the contract fail to compile. `apps/web/src/orpc.ts` consumes it through a `ContractRouterClient` wrapped in TanStack Query utils. No codegen; native `Date` values survive serialization.

Binary payloads (thumbnails, MP4 playback/download with HTTP Range support) deliberately bypass oRPC as plain Hono routes under `/media/*`.

See `docs/STACK.md` for the stack rationale and `docs/MIGRATION.md` for how the previous Next.js architecture mapped onto this one.
