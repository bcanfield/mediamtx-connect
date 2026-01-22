<div align="center">
  <h1>MediaMTX Connect</h1>
  <p><strong>Web UI for viewing and managing <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a> streams</strong></p>

  <p>
    <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?label=CI" alt="CI"></a>
    <a href="https://hub.docker.com/r/bcanfield/mediamtx-connect"><img src="https://img.shields.io/badge/docker-bcanfield/mediamtx--connect-blue" alt="Docker Hub"></a>
    <a href="https://github.com/bcanfield/mediamtx-connect/releases"><img src="https://img.shields.io/github/v/release/bcanfield/mediamtx-connect" alt="Release"></a>
  </p>

  <img src=".github/assets/demo.gif" alt="Cronicorn AI Adaptation" width="640">

</div>

## Quick Start

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git && cd mediamtx-connect
docker compose up -d
```

Open **http://localhost:3000** and configure your MediaMTX URL in the Config page.

## Features

- **Live Streams** — Watch HLS streams in real-time
- **Recordings** — Browse and playback with auto-generated thumbnails
- **Web Config** — Configure everything through the UI
- **Multi-arch** — Docker images for amd64/arm64

## Send a Stream

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

## Development

```bash
./scripts/setup-dev.sh   # Initial setup
npm run mediamtx         # Start MediaMTX with test streams
npm run dev              # Start the app at localhost:3000
```

<details>
<summary><strong>All Commands</strong></summary>

| Command | Description |
|---------|-------------|
| `npm run mediamtx` | Start MediaMTX with fake streams |
| `npm run mediamtx:stop` | Stop MediaMTX |
| `npm run dev` | Start Next.js dev server |
| `npm run test:e2e` | Run Playwright tests |
</details>

<details>
<summary><strong>Troubleshooting</strong></summary>

**Can't connect to MediaMTX?**
1. Check it's running: `docker ps | grep mediamtx`
2. Verify URL in Config (`http://localhost` for dev, `http://mediamtx` for Docker)

**Streams not showing?**
Set **Remote MediaMTX URL** in Config to your server's external IP/hostname.
</details>

## Examples

- [Fake Streams](examples/fake-streams/) — Test without cameras
- [Raspberry Pi Camera](examples/raspberry-pi-camera/) — Stream via GStreamer

## License

[MIT](LICENSE)
