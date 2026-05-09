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

Already running MediaMTX? Add the UI alongside it. Replace `/path/to/recordings` with the host directory your MediaMTX records into:

```bash
docker run -d \
  --name mediamtx-connect \
  -p 3000:3000 \
  -v /path/to/recordings:/recordings \
  -v mediamtx-connect-data:/app/prisma \
  bcanfield/mediamtx-connect:latest
```

Open **http://localhost:3000** → **Config** and set:

- **MediaMtx Url** — how the container reaches MediaMTX. `http://host.docker.internal` on Docker Desktop, the host IP on Linux, or the service name (e.g. `http://mediamtx`) when attached to a shared docker network.
- **Remote MediaMtx URL** — how *browsers* reach MediaMTX (your server's public hostname / IP).

Saving takes effect immediately. The `mediamtx-connect-data` volume persists settings — without it, config resets on restart.

<details>
<summary><strong>Add to an existing <code>docker-compose.yml</code></strong></summary>

Drop this service alongside your `mediamtx` service:

```yaml
services:
  mediamtx-connect:
    image: bcanfield/mediamtx-connect:latest
    restart: unless-stopped
    depends_on:
      - mediamtx
    ports:
      - '3000:3000'
    volumes:
      - ./recordings:/recordings        # match your MediaMTX recordings mount
      - mediamtx-connect-data:/app/prisma

volumes:
  mediamtx-connect-data:
```

Set **MediaMtx Url** to `http://mediamtx` (or whatever your service is named) in Config.

</details>

<details>
<summary><strong>Don't have MediaMTX yet?</strong></summary>

The repo ships an all-in-one stack — MediaMTX + Connect together, sane defaults:

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
docker compose up -d
```

</details>

<details>
<summary><strong>Preparing your MediaMTX</strong></summary>

Your `mediamtx.yml` needs three things:

```yaml
api: yes
apiAddress: :9997        # Connect calls this for paths and config

hls: yes                 # browser playback
hlsAddress: :8888

pathDefaults:
  record: yes
  recordPath: /recordings/%path/%Y-%m-%d_%H-%M-%S    # %path = one folder per stream
```

If you've restricted `authInternalUsers`, allow the IP / network where Connect runs. A working reference is in [`mediamtx.yml`](mediamtx.yml).

</details>

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
