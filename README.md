<div align="center">

<h1>MediaMTX Connect</h1>

<p><strong>The web UI for <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a>.</strong><br>
Watch live streams, browse recordings, edit any config key — from your browser.</p>

<p>
  <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?branch=main&label=CI&style=flat-square" alt="CI"></a>
  <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect?style=flat-square&label=release" alt="Release"></a>
  <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-amd64%20%7C%20arm64-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT"></a>
</p>

<img src=".github/assets/demo.png" alt="MediaMTX Connect — live stream grid, recording browser, and config editor" width="860">

<details>
<summary>🌍 Read this in 30 languages</summary>
<p>
  🇺🇸 <strong>English</strong> •
  🇪🇸 <a href="./docs/i18n/README.es.md">Español</a> •
  🇨🇳 <a href="./docs/i18n/README.zh.md">中文</a> •
  🇮🇹 <a href="./docs/i18n/README.it.md">Italiano</a> •
  🇩🇪 <a href="./docs/i18n/README.de.md">Deutsch</a> •
  🇷🇺 <a href="./docs/i18n/README.ru.md">Русский</a> •
  🇫🇷 <a href="./docs/i18n/README.fr.md">Français</a> •
  🇵🇹 <a href="./docs/i18n/README.pt.md">Português</a> •
  🇯🇵 <a href="./docs/i18n/README.ja.md">日本語</a> •
  🇵🇱 <a href="./docs/i18n/README.pl.md">Polski</a> •
  🇰🇷 <a href="./docs/i18n/README.ko.md">한국어</a> •
  🇹🇷 <a href="./docs/i18n/README.tr.md">Türkçe</a> •
  🇳🇱 <a href="./docs/i18n/README.nl.md">Nederlands</a> •
  🇨🇿 <a href="./docs/i18n/README.cs.md">Čeština</a> •
  🇹🇼 <a href="./docs/i18n/README.zh-tw.md">繁體中文</a> •
  🇧🇷 <a href="./docs/i18n/README.pt-br.md">Português (BR)</a> •
  🇮🇩 <a href="./docs/i18n/README.id.md">Bahasa Indonesia</a> •
  🇷🇴 <a href="./docs/i18n/README.ro.md">Română</a> •
  🇸🇪 <a href="./docs/i18n/README.sv.md">Svenska</a> •
  🇩🇰 <a href="./docs/i18n/README.da.md">Dansk</a> •
  🇳🇴 <a href="./docs/i18n/README.no.md">Norsk</a> •
  🇫🇮 <a href="./docs/i18n/README.fi.md">Suomi</a> •
  🇬🇷 <a href="./docs/i18n/README.el.md">Ελληνικά</a> •
  🇭🇺 <a href="./docs/i18n/README.hu.md">Magyar</a> •
  🇺🇦 <a href="./docs/i18n/README.uk.md">Українська</a> •
  🇻🇳 <a href="./docs/i18n/README.vi.md">Tiếng Việt</a> •
  🇵🇭 <a href="./docs/i18n/README.tl.md">Tagalog</a> •
  🇹🇭 <a href="./docs/i18n/README.th.md">ไทย</a> •
  🇮🇳 <a href="./docs/i18n/README.hi.md">हिन्दी</a> •
  🇧🇩 <a href="./docs/i18n/README.bn.md">বাংলা</a>
</p>
</details>

</div>

## What it is

MediaMTX is a great streaming server with no UI. Connect is the missing front end — one container that talks to the MediaMTX API and turns it into a camera wall, a recording archive, and a config editor.

It's a companion, not a replacement. Every screen maps to something MediaMTX already exposes: a path, an API endpoint, a `runOn*` hook, a protocol it serves natively. No video stored, no media proxied, no database.

## Quick start

Multi-arch images (`linux/amd64`, `linux/arm64`) — Docker pulls the right one.

**Already running MediaMTX?** Add Connect beside it:

```bash
docker run -d \
  -p 3000:3000 \
  -e BACKEND_SERVER_MEDIAMTX_URL=http://<your-mediamtx-host> \
  -v /path/to/recordings:/recordings \
  -v mediamtx-connect-data:/data \
  bcanfield/mediamtx-connect:latest
```

**Starting from scratch?** The bundled compose runs both:

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

- **WebRTC or HLS, per card.** `AUTO` falls back silently, `LOW-LAT` insists on WebRTC, `COMPAT` forces HLS — and each card reports the transport it actually got.
- **Snapshots while idle.** A background job keeps a recent frame on every card, with its age on the pill.
- **Live telemetry.** Codecs, viewer count, and uptime, straight from the path list.
- **Honest record state.** Cards show whether a stream is *effectively* recording; a state Connect couldn't read says unknown, never off.
- **Publish URLs on the clipboard.** RTSP, RTMP, and SRT, built from the server's own listen addresses.

### Recordings

- MP4s per stream, grouped by day, with auto-generated thumbnails.
- An inline player that expands in place, seekable over HTTP range requests.
- Downloads that stream, with live progress and cancel.
- Press `/` to filter.

### Configuration, without YAML

- **The whole server config** — 65 typed, validated controls across Logging, API, Hooks, RTSP, RTMP, HLS, WebRTC, and SRT.
- **Path defaults and per-path overrides**, on the scopes MediaMTX serves them from. Saving a wildcard-backed stream writes a sparse entry, so untouched keys keep tracking the defaults.
- **All 15 `runOn*` hooks**, with a warning where saving restarts the path.
- **Sparse writes** — only the keys you changed.

### Ops

One process for API, SPA, and media · multi-arch · `GET /health` · structured logs · PWA · dark and light · 30 languages · no database.

## Environment variables

These seed the first boot. Everything stays editable under **Config**.

| Variable | Default | Purpose |
|----------|---------|---------|
| `BACKEND_SERVER_MEDIAMTX_URL` | `http://mediamtx` | Where Connect reaches the MediaMTX API from inside its container |
| `MEDIAMTX_API_PORT` | `9997` | MediaMTX API port |
| `MEDIAMTX_RECORDINGS_DIR` | `./recordings` | Host path mounted for recordings (compose only) |
| `MEDIAMTX_SCREENSHOTS_DIR` | `/screenshots` | Where thumbnails are stored |

`http://mediamtx` only resolves on the bundled compose network — for a standalone `docker run`, point it at your host.

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
| [Architecture](ARCHITECTURE.md) | How the pieces fit |
| [Contributing](CONTRIBUTING.md) | Dev setup, scripts, PR process |
| [Examples](examples/) | Raspberry Pi camera, fake streams for testing |

## Contributing

Issues and PRs welcome. `pnpm install && pnpm dev` gets you a full stack with fixtures — see [CONTRIBUTING.md](CONTRIBUTING.md), and note that PR titles are conventional commits. We follow a [Code of Conduct](CODE_OF_CONDUCT.md).

## License

[MIT](LICENSE)
