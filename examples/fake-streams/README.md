# Fake Streams for Development

Generate fake RTSP streams for testing MediaMTX Connect without real cameras.

## What It Does

Loops a test video file and pushes it to MediaMTX as 5 separate streams (`stream1` through `stream5`).

## Usage

### With Docker Compose

Add this service to your `docker-compose.yml`:

```yaml
fake-streams:
  build: ./examples/fake-streams
  depends_on:
    mediamtx:
      condition: service_healthy
  networks:
    - mtx
```

### Standalone

```bash
cd examples/fake-streams
docker build -t fake-streams .
docker run --network=host fake-streams
```

## Files

- `Dockerfile` - Alpine container with ffmpeg
- `ffmpeg-test.sh` - Script that creates 5 RTSP streams
- `test.mp4` - Sample video file
- `config/mediamtx.yml` - MediaMTX configuration for local testing
