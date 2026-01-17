# Deployment Guide

Complete deployment instructions for MediaMTX Connect.

## Docker Compose (Recommended)

Full docker-compose configuration with MediaMTX and MediaMTX Connect:

```yaml
version: "3.4"
services:
  mediamtx:
    image: bluenviron/mediamtx
    container_name: mediamtx
    restart: unless-stopped
    environment:
      - MTX_API=yes
      - MTX_APIADDRESS=:9997
      - MTX_RECORD=yes
    volumes:
      - ${MEDIAMTX_RECORDINGS_DIR}:/recordings
    networks:
      - mtx
    ports:
      - 8554:8554      # RTSP
      - 8890:8890/udp  # WebRTC/UDP
      - 1935:1935      # RTMP
      - 8888:8888      # HLS
      - 8889:8889      # WebRTC/HTTP
      - 9997:9997      # API
  mediamtx-connect:
    image: bcanfield/mediamtx-connect
    container_name: mediamtx-connect
    restart: unless-stopped
    volumes:
      - ${MEDIAMTX_RECORDINGS_DIR}:/recordings
    networks:
      - mtx
    ports:
      - 3000:3000
networks:
  mtx:
    name: mtx
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MEDIAMTX_RECORDINGS_DIR` | Local path to store recordings | Yes |

## Port Reference

| Port | Protocol | Service |
|------|----------|---------|
| 3000 | HTTP | MediaMTX Connect UI |
| 8554 | RTSP | RTSP streaming |
| 8888 | HTTP | HLS streaming |
| 8889 | HTTP | WebRTC |
| 8890 | UDP | WebRTC |
| 1935 | TCP | RTMP |
| 9997 | HTTP | MediaMTX API |

## Quick Start

1. Create a `.env` file:
```bash
MEDIAMTX_RECORDINGS_DIR=/path/to/recordings
```

2. Start the stack:
```bash
docker-compose up -d
```

3. Access the UI at `http://localhost:3000`

## Running Without Docker

```bash
# Install dependencies
npm install

# Run database migrations
npm run migrate

# Start development server
npm run dev
```

## Configuration

MediaMTX Connect automatically discovers your MediaMTX instance on the same Docker network. For custom configurations, see the [MediaMTX documentation](https://github.com/bluenviron/mediamtx).
