<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong>The web UI for <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a>.</strong><br>
Watch live streams, browse recordings, and edit your MediaMTX config from the browser.</p>

<p>
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?branch=main&label=CI&style=flat-square" alt="CI"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect?style=flat-square&label=release" alt="Release"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-amd64%20%7C%20arm64-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT"></a>
</p>

<img src=".github/assets/demo.png" alt="MediaMTX Connect — live stream grid, recording browser, and config editor" width="860">


</div>

## What it is

MediaMTX is a great streaming server with no UI. Connect is the missing front end — one container that talks to the MediaMTX API and turns it into a camera wall, a recording archive, and a config editor.

It's a companion, not a replacement. Every screen maps to something MediaMTX already exposes: a path, an API endpoint, a `runOn*` hook, a protocol it serves natively. No video stored, no media proxied, no database.

## Quick start

Multi-arch images (`linux/amd64`, `linux/arm64`); Docker pulls the right one.

**Already running MediaMTX?** Add Connect beside it:

```bash
docker run -d \
  -p 3000:3000 \
  -e BACKEND_SERVER_MEDIAMTX_URL=http://<your-mediamtx-host> \
  -e REMOTE_MEDIAMTX_URL=http://<host-your-browser-uses> \
  -v /path/to/recordings:/recordings \
  -v mediamtx-connect-data:/data \
  -v mediamtx-connect-screenshots:/screenshots \
  bcanfield/mediamtx-connect:latest
```

**Starting from scratch?** The bundled compose builds Connect and runs it next to MediaMTX:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

Then open <http://localhost:3000>.

> [!IMPORTANT]
> Connect needs `api: yes` in your `mediamtx.yml`. The [included config](mediamtx.yml) works as-is.

## What you get

### Live view

Every path MediaMTX knows, in a 2–4 column grid.

- **WebRTC or HLS, per card.** `AUTO` falls back silently, `LOW-LAT` insists on WebRTC, `COMPAT` forces HLS. Each card reports the transport it actually got.
- **Snapshots while idle.** A background job keeps a recent frame on every card, with its age on the pill. Need a fresh one now? Take it from the card menu.
- **Live telemetry.** Codecs, viewer count, and uptime, straight from the path list.
- **Honest record state.** Cards show whether a stream is *effectively* recording; a state Connect couldn't read says unknown, never off.
- **Publish URLs on the clipboard.** RTSP, RTMP, and SRT, built from the server's own listen addresses.

### Recordings

- MP4 or MPEG-TS segments per stream, grouped by day, with auto-generated thumbnails.
- An inline player that expands in place, seekable over HTTP range requests.
- Downloads that stream, with live progress and cancel.
- Press `/` to filter.

### Configuration, without YAML

- **The whole server config:** 65 typed, validated controls across Logging, API, Hooks, RTSP, RTMP, HLS, WebRTC, and SRT.
- **Path defaults and per-path overrides**, on the scopes MediaMTX serves them from. Saving a wildcard-backed stream writes a sparse entry, so untouched keys keep tracking the defaults.
- **A paths catalog** with live and regex badges, a guided "add an RTSP camera" form, and revert or delete for any path's own entry (with a warning if someone is connected).
- **Every `runOn*` hook**, with a warning where saving restarts the path.
- **Sparse writes.** Only the keys you changed get sent.

### Ops

One process for API, SPA, and media · multi-arch · `GET /api/health` · structured logs · installable as a PWA · dark and light · 30 languages · no database.

## Environment variables

These seed the first boot. Everything stays editable under **Config**.

| Variable | Default in the image | Purpose |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Where Connect reaches the MediaMTX API |
| `MEDIAMTX_API_PORT` | `9997` | MediaMTX API port |
| `REMOTE_MEDIAMTX_URL` | `http://localhost` | Where the *browser* reaches MediaMTX for playback. Set it whenever the browser isn't on the server |
| `MEDIAMTX_RECORDINGS_DIR` | `/recordings` | Where Connect reads recordings |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Where snapshots and thumbnails go |
| `DATA_DIR` | `/data` | Where `config.json` lives |
| `PORT` | `3000` | HTTP port |
| `LOG_LEVEL` | `info` | Pino log level |

`http://mediamtx` only resolves on the bundled compose network. For a standalone `docker run`, point it at your host. With compose, set `REMOTE_MEDIAMTX_HOST` in `.env` instead of `REMOTE_MEDIAMTX_URL`: it also sets the WebRTC host MediaMTX advertises. [`.env.example`](.env.example) explains each one, and `pnpm dev` uses localhost defaults with no `.env` at all.

## How it works

```
Browser ──HLS / WebRTC (WHEP)──────────────────────────┐
   │                                                   │
   │ oRPC (typed)                                      ▼
   ▼                                              ┌──────────┐
┌─────────────────────┐    MediaMTX HTTP API      │ MediaMTX │
│ mediamtx-connect    │ ────────────────────────▶ │  server  │
│ Hono API + React SPA│                           └──────────┘
└─────────────────────┘                                │
   │ reads                                             │ writes
   ▼                                                   ▼
recordings/ + screenshots/  ◀────────────────────  MP4 segments
```

Playback is browser-to-MediaMTX. Connect moves JSON, plus the recordings and thumbnails it reads off disk.

## Docs

| | |
|---|---|
| [Features](docs/FEATURES.md) | Every shipped capability, route, and procedure |
| [Architecture](docs/ARCHITECTURE.md) | How the pieces fit |
| [Contributing](CONTRIBUTING.md) | Dev setup, scripts, PR process |
| [Examples](examples/) | Raspberry Pi camera, fake streams for testing |

## Contributing

Issues and PRs welcome. `pnpm install && pnpm dev` gets you a full stack with fixtures. See [CONTRIBUTING.md](CONTRIBUTING.md), and note that PR titles are conventional commits. We follow a [Code of Conduct](CODE_OF_CONDUCT.md).

## License

[MIT](LICENSE)
