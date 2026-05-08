<div align="center">
  <h1>MediaMTX Connect</h1>
  <p><strong>Web UI for viewing and managing <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a> streams</strong></p>

  <p>
    <a href="https://github.com/bcanfield/mediamtx-connect/actions"><img src="https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?label=CI" alt="CI"></a>
    <a href="https://codecov.io/gh/bcanfield/mediamtx-connect"><img src="https://codecov.io/gh/bcanfield/mediamtx-connect/branch/main/graph/badge.svg" alt="Coverage"></a>
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

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Examples

- [Fake Streams](examples/fake-streams/) — Test without cameras
- [Raspberry Pi Camera](examples/raspberry-pi-camera/) — Stream via GStreamer

## License

[MIT](LICENSE)
