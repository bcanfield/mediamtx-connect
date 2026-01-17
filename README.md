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
- Health check endpoints for monitoring

## Quick Start

### 1. Create environment file

```bash
# Create .env file
echo "MEDIAMTX_RECORDINGS_DIR=./recordings" > .env
```

### 2. Create docker-compose.yml

```yaml
services:
  mediamtx:
    image: bluenviron/mediamtx:1.11.3
    container_name: mediamtx
    restart: unless-stopped
    environment:
      - MTX_API=yes
      - MTX_APIADDRESS=:9997
      - MTX_RECORD=yes
      - MTX_RECORDPATH=/recordings/%path/%Y-%m-%d_%H-%M-%S
      - MTX_HLS=yes
      - MTX_HLSADDRESS=:8888
    volumes:
      - ${MEDIAMTX_RECORDINGS_DIR:-./recordings}:/recordings
    networks:
      - mtx
    ports:
      - "8554:8554"      # RTSP
      - "8890:8890/udp"  # WebRTC/ICE UDP
      - "1935:1935"      # RTMP
      - "8888:8888"      # HLS
      - "8889:8889"      # WebRTC HTTP
      - "9997:9997"      # API

  mediamtx-connect:
    image: ghcr.io/bcanfield/mediamtx-connect:latest
    depends_on:
      - mediamtx
    container_name: mediamtx-connect
    restart: unless-stopped
    networks:
      - mtx
    volumes:
      - ${MEDIAMTX_RECORDINGS_DIR:-./recordings}:/recordings
      - mediamtx-connect-data:/app/prisma
    ports:
      - "3000:3000"

networks:
  mtx:
    name: mtx

volumes:
  mediamtx-connect-data:
```

### 3. Start the services

```bash
docker compose up -d
```

### 4. Access the web interface

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MEDIAMTX_RECORDINGS_DIR` | Directory for storing recordings | `./recordings` |

### Initial Setup

On first launch, navigate to the **Config** page to set:

1. **MediaMTX URL**: Internal URL to reach MediaMTX (default: `http://mediamtx`)
2. **MediaMTX API Port**: API port (default: `9997`)
3. **Remote MediaMTX URL**: External URL for accessing streams in browser (e.g., `http://your-server-ip`)
4. **Recordings Directory**: Path to recordings inside container (default: `/recordings`)
5. **Screenshots Directory**: Path for auto-generated thumbnails (default: `/screenshots`)

## Streaming to MediaMTX

### RTSP Stream

```bash
ffmpeg -re -i input.mp4 -c copy -f rtsp rtsp://localhost:8554/mystream
```

### RTMP Stream

```bash
ffmpeg -re -i input.mp4 -c copy -f flv rtmp://localhost:1935/mystream
```

### OBS Studio

1. Go to Settings > Stream
2. Service: Custom
3. Server: `rtmp://localhost:1935`
4. Stream Key: `mystream`

## Architecture Support

Docker images are built for:
- `linux/amd64` (Intel/AMD 64-bit)
- `linux/arm64` (ARM 64-bit, Raspberry Pi 4, Apple Silicon)

## Development

### Prerequisites

- Node.js 20+
- npm

### Setup

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Start development server
npm run dev
```

### Building

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Docker Build

```bash
# Build Docker image
docker build -t mediamtx-connect .

# Run container
docker run -p 3000:3000 mediamtx-connect
```

## Troubleshooting

### "Error reaching MediaMTX"

1. Ensure MediaMTX is running: `docker ps | grep mediamtx`
2. Check the MediaMTX URL in Config page matches your setup
3. If running outside Docker, use `http://localhost` instead of `http://mediamtx`
4. Verify the API port (default: 9997) is correct

### "MEDIAMTX_RECORDINGS_DIR variable is not set"

Create a `.env` file in the same directory as your `docker-compose.yml`:

```bash
echo "MEDIAMTX_RECORDINGS_DIR=./recordings" > .env
```

### Streams not showing in browser

1. Set the **Remote MediaMTX URL** in Config to your server's external IP/hostname
2. Ensure port 8888 (HLS) is accessible from your browser
3. Check browser console for CORS or connection errors

### Recordings not appearing

1. Verify `MTX_RECORD=yes` is set in MediaMTX environment
2. Check that the recordings directory is mounted in both containers
3. Ensure the directory has correct permissions

## Examples

The `examples/` directory contains additional setups:

- **[Fake Streams](examples/fake-streams/)** - Generate test RTSP streams for development without real cameras
- **[Raspberry Pi Camera](examples/raspberry-pi-camera/)** - Stream from a Raspberry Pi camera module via GStreamer

## License

[MIT](LICENSE)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
