#!/bin/bash
# Publishes stream1..5 to MediaMTX as wildcard-backed RTSP streams (they are not
# declared in mediamtx.dev.yml, so they ride the `all_others` catch-all — the
# normal case the app is built around). Each uses a different codec / resolution
# / audio mix via ffmpeg lavfi synthetic sources, so the Streams page shows a
# diverse fleet without shipping any video files. Named + on-demand cameras are
# defined in mediamtx.dev.yml instead.

set -eu

echo "Waiting for MediaMTX to start..."
sleep 5

RTSP="rtsp://mediamtx:8554"

# stream1 — H264 + AAC, 720p30 (the WebRTC + audio baseline)
ffmpeg -re -f lavfi -i testsrc=size=1280x720:rate=30 \
  -f lavfi -i sine=frequency=440:sample_rate=48000 \
  -c:v libx264 -preset ultrafast -tune zerolatency -pix_fmt yuv420p -g 60 \
  -c:a aac -f rtsp -rtsp_transport tcp "$RTSP/stream1" &

# stream2 — H264, no audio, 720p25
ffmpeg -re -f lavfi -i testsrc2=size=1280x720:rate=25 \
  -c:v libx264 -preset ultrafast -tune zerolatency -pix_fmt yuv420p -g 50 \
  -f rtsp -rtsp_transport tcp "$RTSP/stream2" &

# stream3 — H264 + Opus, 480p25
ffmpeg -re -f lavfi -i smptebars=size=640x480:rate=25 \
  -f lavfi -i sine=frequency=660:sample_rate=48000 \
  -c:v libx264 -preset ultrafast -tune zerolatency -pix_fmt yuv420p -g 50 \
  -c:a libopus -f rtsp -rtsp_transport tcp "$RTSP/stream3" &

# stream4 — H265/HEVC, no audio, 540p20 (HEVC codec chip + playback fallback)
ffmpeg -re -f lavfi -i testsrc=size=960x540:rate=20 \
  -c:v libx265 -preset ultrafast -x265-params keyint=40 -pix_fmt yuv420p \
  -f rtsp -rtsp_transport tcp "$RTSP/stream4" &

# stream5 — M-JPEG, 720p15 (M-JPEG codec chip; unsupported in WebRTC/HLS).
# -huffman 0 forces standard Huffman tables, which MediaMTX's RTSP M-JPEG
# (RFC 2435) requires — the default optimized tables get rejected.
ffmpeg -re -f lavfi -i testsrc2=size=1280x720:rate=15 \
  -c:v mjpeg -q:v 5 -huffman 0 -pix_fmt yuvj420p \
  -f rtsp -rtsp_transport tcp "$RTSP/stream5" &

wait
