<div align="center">
  <h1 align="center">MediaMTX Connect</h1>

  <strong>A web interface for viewing and managing media streams</strong>

  <strong>Powered by <a href="https://github.com/bluenviron/mediamtx">MediaMTX</a></strong>

  ![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/bcanfield/mediamtx-connect/ci.yml?label=CI)
  [![Docker Hub](https://img.shields.io/badge/docker-bcanfield/mediamtx--connect-blue)](https://hub.docker.com/r/bcanfield/mediamtx-connect)
  [![GitHub Container Registry](https://img.shields.io/badge/ghcr-mediamtx--connect-blue)](https://github.com/bcanfield/mediamtx-connect/pkgs/container/mediamtx-connect)
  [![GitHub Release](https://img.shields.io/github/v/release/bcanfield/mediamtx-connect)](https://github.com/bcanfield/mediamtx-connect/releases)
</div>

<br>

https://github.com/bcanfield/mediamtx-connect/assets/12603953/ae1e3e0f-401e-4560-a373-b46ea5679870

## Features

- View live HLS streams from MediaMTX
- Browse and playback recorded streams
- Auto-generated thumbnails for recordings
- Configurable through web UI
- Multi-architecture Docker support (amd64/arm64)

## Quick Start

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Configuration

On first launch, navigate to the **Config** page to set:

1. **MediaMTX URL**: Internal URL to reach MediaMTX (default: `http://mediamtx`)
2. **Remote MediaMTX URL**: External URL for browser stream access (e.g., `http://your-server-ip`)
3. **Recordings/Screenshots Directory**: Paths inside container (defaults: `/recordings`, `/screenshots`)

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MEDIAMTX_RECORDINGS_DIR` | Host directory for recordings | `./recordings` |

## Streaming to MediaMTX

```bash
# RTSP
ffmpeg -re -i input.mp4 -c copy -f rtsp rtsp://localhost:8554/mystream

# RTMP
ffmpeg -re -i input.mp4 -c copy -f flv rtmp://localhost:1935/mystream
```

**OBS Studio**: Settings > Stream > Custom > Server: `rtmp://localhost:1935` > Stream Key: `mystream`

## Development

```bash
# Setup and run
./scripts/setup-dev.sh
docker compose -f docker-compose.dev.yml up -d
npm run dev

# Optional: add 5 fake test streams
docker compose -f docker-compose.dev.yml --profile streams up -d
```

The app runs at [http://localhost:3000](http://localhost:3000).

### Project Structure

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Production (both services) |
| `docker-compose.dev.yml` | Development (MediaMTX only, optional fake streams) |
| `mediamtx.yml` | MediaMTX config with API access enabled |

## Troubleshooting

### "Cannot connect to MediaMTX"

1. Check MediaMTX is running: `docker ps | grep mediamtx`
2. Verify URL in Config page (`http://localhost` for dev, `http://mediamtx` for Docker)
3. MediaMTX v1.11+ requires the included `mediamtx.yml` for API access

### Streams not showing

Set **Remote MediaMTX URL** in Config to your server's external IP/hostname.

## Examples

- **[Fake Streams](examples/fake-streams/)** - Test RTSP streams without cameras
- **[Raspberry Pi Camera](examples/raspberry-pi-camera/)** - Stream from Pi camera via GStreamer

## License

[MIT](LICENSE)
