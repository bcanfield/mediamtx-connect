#!/usr/bin/env bash
# Publish the four demo clips into MediaMTX as looping RTSP streams.
# PIDs are written to .work/ffmpeg.pids so run.sh can tear them down.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p .work
: > .work/ffmpeg.pids

for name in front-door driveway backyard workshop-pi; do
  ffmpeg -hide_banner -loglevel error -re -stream_loop -1 \
    -i "clips/${name}.mp4" -c copy -f rtsp -rtsp_transport tcp \
    "rtsp://127.0.0.1:8555/${name}" &
  echo $! >> .work/ffmpeg.pids
  echo "  ▶ publishing ${name} (pid $!)"
done
echo "All four streams publishing."
