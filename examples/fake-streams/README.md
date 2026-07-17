# Fake Streams for Development

Generate synthetic RTSP streams for testing MediaMTX Connect without real cameras.

## What It Does

Publishes five streams (`stream1`–`stream5`) to MediaMTX from ffmpeg `lavfi`
sources — no video files needed. Each varies so the Streams page shows a diverse
fleet:

| Path | Video | Audio | Resolution |
|------|-------|-------|------------|
| `stream1` | H264 | AAC | 1280×720 @30 |
| `stream2` | H264 | — | 1280×720 @25 |
| `stream3` | H264 | Opus | 640×480 @25 |
| `stream4` | H265/HEVC | — | 960×540 @20 |
| `stream5` | M-JPEG | — | 1280×720 @15 |

These are **not** declared in `mediamtx.dev.yml`, so they ride the `all_others`
wildcard (confName `all_others`) — the normal, wildcard-backed case. The named
and on-demand cameras (`front-door`, `warehouse-cam`, `parking-lot`, …) live in
`mediamtx.dev.yml` instead.

## Usage

### With Docker Compose

`pnpm dev` starts this service automatically as part of the dev stack. To run
just the MediaMTX side standalone:

```bash
docker compose -f docker-compose.dev.yml up -d
```

### Standalone

```bash
cd examples/fake-streams
docker build -t fake-streams .
docker run --network=host fake-streams
```

## Files

- `Dockerfile` — Alpine container with ffmpeg
- `ffmpeg-test.sh` — publishes the five streams from lavfi sources
