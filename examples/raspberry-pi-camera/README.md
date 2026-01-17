# Raspberry Pi Camera Streaming

Stream video from a Raspberry Pi camera to MediaMTX using GStreamer.

## Requirements

- Raspberry Pi with camera module
- Docker installed on the Pi
- MediaMTX server running and accessible

## Setup

1. Set the MediaMTX RTSP URL:

```bash
export MEDIAMTX_RTSP_URL=rtsp://your-mediamtx-server:8554
```

2. Build and run:

```bash
docker-compose -f docker-compose-cam.yml up --build
```

The stream will be available at `rtsp://your-mediamtx-server:8554/mystream`.

## Configuration

Edit the `command` in `docker-compose-cam.yml` to adjust:

- `bitrate=800` - Video bitrate in kbps
- `width=640,height=480` - Resolution
- `framerate=15/1` - Frame rate
- `exposure-mode=night` - Camera exposure mode
- `annotation-mode=time+date` - Overlay timestamp on video

## Audio

The setup includes optional audio streaming via PulseAudio. See `rpicam/audio_stream.sh` for configuration.
