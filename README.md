<div align="center">
  <h1>MediaMTX Connect</h1>
  <p><strong>A web UI for <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a> — watch live streams, browse recordings, and manage config from your browser.</strong></p>

  <p>
    <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?label=CI" alt="CI"></a>
    <a href="https://codecov.io/gh/bcanfield/mediamtx-connect"><img src="https://codecov.io/gh/bcanfield/mediamtx-connect/branch/main/graph/badge.svg" alt="Coverage"></a>
    <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-bcanfield/mediamtx--connect-blue" alt="Docker Hub"></a>
    <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect" alt="Release"></a>
  </p>

  <img src=".github/assets/demo.gif" alt="MediaMTX Connect demo" width="720">
</div>

---

## Quick start

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

Open **http://localhost:3000** — point it at your MediaMTX server on the Config page.

## What it does

- **Live View** — HLS playback for every active path, with auto-generated thumbnails
- **Recordings** — Paginated browser with in-page playback and one-click downloads
- **Config** — Every MediaMTX `GlobalConf` field as a typed, validated form — no YAML
- **Production-ready** — Healthcheck, structured logs, multi-arch images (amd64/arm64), PWA install

## Send a stream

```bash
# RTSP
ffmpeg -re -i input.mp4 -c copy -f rtsp rtsp://localhost:8554/mystream

# RTMP
ffmpeg -re -i input.mp4 -c copy -f flv rtmp://localhost:1935/mystream
```

<details>
<summary><strong>OBS Studio</strong></summary>

Settings → Stream → Custom
- Server: `rtmp://localhost:1935`
- Stream Key: `mystream`

</details>

## Docs

- [Architecture](ARCHITECTURE.md) · [Full feature inventory](docs/FEATURES.md) · [Contributing](CONTRIBUTING.md)
- Examples: [Fake streams](examples/fake-streams/) · [Raspberry Pi camera](examples/raspberry-pi-camera/)

## License

[MIT](LICENSE)
