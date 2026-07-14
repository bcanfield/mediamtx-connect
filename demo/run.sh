#!/usr/bin/env bash
# One-command demo capture. Non-destructive: alternate ports + isolated DB/dirs.
# Tears down MediaMTX / ffmpeg / the app on exit. Regenerates demo/output/*.
set -euo pipefail
cd "$(dirname "$0")"
ROOT="$(cd .. && pwd)"
WORK="$(pwd)/.work"
MTX_VER="v1.19.2"
ARCH="$(uname -m)"; [ "$ARCH" = "x86_64" ] && ARCH=amd64 || ARCH=arm64
OS="$(uname -s | tr '[:upper:]' '[:lower:]')"

cleanup() {
  echo "→ teardown"
  [ -f "$WORK/app.pid" ] && kill "$(cat "$WORK/app.pid")" 2>/dev/null || true
  [ -f "$WORK/mediamtx.pid" ] && kill "$(cat "$WORK/mediamtx.pid")" 2>/dev/null || true
  [ -f "$WORK/ffmpeg.pids" ] && while read -r p; do kill "$p" 2>/dev/null || true; done < "$WORK/ffmpeg.pids"
}
trap cleanup EXIT
mkdir -p "$WORK" .bin

# 1. MediaMTX binary
if [ ! -x .bin/mediamtx ]; then
  echo "→ download MediaMTX ${MTX_VER} ${OS}/${ARCH}"
  curl -sL -o .bin/mtx.tgz "https://github.com/bluenviron/mediamtx/releases/download/${MTX_VER}/mediamtx_${MTX_VER}_${OS}_${ARCH}.tar.gz"
  tar -xzf .bin/mtx.tgz -C .bin mediamtx; rm -f .bin/mtx.tgz
fi

# 2. clips
[ -f clips/front-door.mp4 ] || bash gen-clips.sh

# 3. MediaMTX (alt ports)
echo "→ start MediaMTX (api 9998 / rtsp 8555 / hls 8890)"
nohup .bin/mediamtx mediamtx-demo.yml > "$WORK/mediamtx.log" 2>&1 &
echo $! > "$WORK/mediamtx.pid"; sleep 2

# 4. publish + seed
bash publish-streams.sh; sleep 4
bash seed-recordings.sh

# 5. app (isolated DB, alt ports)
export DATABASE_URL="file:$WORK/demo.db"
export BACKEND_SERVER_MEDIAMTX_URL="http://127.0.0.1" MEDIAMTX_API_PORT=9998
export REMOTE_MEDIAMTX_URL="http://localhost"
export MEDIAMTX_RECORDINGS_DIR="$WORK/recordings" MEDIAMTX_SCREENSHOTS_DIR="$WORK/screenshots"
export NODE_ENV=production
rm -f "$WORK/demo.db"
echo "→ migrate + start app on :3100"
( cd "$ROOT" && npx prisma migrate deploy --schema=src/lib/prisma/schema.prisma >/dev/null )
( cd "$ROOT" && nohup npx next start -p 3100 > "$WORK/app.log" 2>&1 & echo $! > "$WORK/app.pid" )
for i in $(seq 1 30); do
  [ "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3100/api/health 2>/dev/null)" = "200" ] && break
  sleep 1
done

# 6. capture + 7. render
rm -rf "$WORK/video"; mkdir -p "$WORK/video"
DEMO_BASE_URL=http://localhost:3100 node capture.mjs
bash post.sh "$(ls "$WORK"/video/*.webm | head -1)"
echo "✓ demo/output/demo.mp4 + demo.gif"
