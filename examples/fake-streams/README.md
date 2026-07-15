# Fake Streams for Development

Generate fake RTSP streams for testing MediaMTX Connect without real cameras.

## What It Does

Loops a test video file and pushes it to MediaMTX as 5 separate streams (`stream1` through `stream5`).

## Usage

### With Docker Compose

The dev compose file already includes this service behind the `streams` profile:

```bash
docker compose -f docker-compose.dev.yml --profile streams up -d
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
