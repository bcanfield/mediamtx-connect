#!/usr/bin/env bash
# Turn the recorded webm into README-ready assets:
#   output/demo.mp4  — H.264, good for a README <video> tag
#   output/demo.gif  — palette-optimized, capped width for fast inline load
# Usage: post.sh <path-to-webm> [speed]   (speed default 1.5 = 50% faster)
set -euo pipefail
cd "$(dirname "$0")"
SRC="${1:?usage: post.sh <webm> [speed]}"
SPEED="${2:-1.5}"
mkdir -p output

echo "→ demo.mp4 (${SPEED}x)"
ffmpeg -y -hide_banner -loglevel error -i "$SRC" \
  -vf "setpts=PTS/${SPEED},scale=1280:-2:flags=lanczos" -c:v libx264 -pix_fmt yuv420p -crf 22 -movflags +faststart -an \
  output/demo.mp4

echo "→ demo.gif (960px, palette-optimized, ${SPEED}x)"
ffmpeg -y -hide_banner -loglevel error -i "$SRC" \
  -vf "setpts=PTS/${SPEED},fps=16,scale=960:-2:flags=lanczos,split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=3" \
  output/demo.gif

echo "Done:"
ls -lh output/demo.mp4 output/demo.gif | awk '{print "  "$9"  "$5}'
