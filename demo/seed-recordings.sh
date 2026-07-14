#!/usr/bin/env bash
# Fabricate a realistic recordings dataset so the Recordings views have content
# spanning Today and Yesterday. The app derives day-grouping + the time label
# from each file's mtime, and reads recording thumbnails from
# screenshots/<stream>/<recordingBaseName>.png (see recordings.queries.ts).
set -euo pipefail
cd "$(dirname "$0")"
REC=.work/recordings
SHOT=.work/screenshots
rm -rf "$REC" "$SHOT"; mkdir -p "$REC" "$SHOT"

# times of day to place recordings at (some today, some yesterday)
TODAY_TIMES=(08 11 14 16)      # hours
YEST_TIMES=(19 21 22)          # hours

for name in front-door driveway backyard workshop-pi; do
  mkdir -p "$REC/$name" "$SHOT/$name"
  # one representative frame per camera, reused as each recording's thumbnail
  ffmpeg -hide_banner -loglevel error -ss 3 -i "clips/$name.mp4" -frames:v 1 -q:v 3 "$SHOT/$name/_frame.png"

  make_rec() {
    local when="$1" mm="$2" dur="$3"       # touch-stamp, minute, seconds length
    local base="${when:0:8}_${when:8:2}-${mm}-00"
    ffmpeg -hide_banner -loglevel error -ss 0 -t "$dur" -i "clips/$name.mp4" -c copy "$REC/$name/$base.mp4"
    cp "$SHOT/$name/_frame.png" "$SHOT/$name/$base.png"
    touch -t "${when:0:12}.00" "$REC/$name/$base.mp4"
  }

  for h in "${TODAY_TIMES[@]}"; do
    stamp="$(date +%Y%m%d)${h}00"
    make_rec "$stamp" "$(( (RANDOM % 5) * 10 + 5 ))" "$(( (RANDOM % 6) + 5 ))"
  done
  for h in "${YEST_TIMES[@]}"; do
    stamp="$(date -v-1d +%Y%m%d)${h}00"
    make_rec "$stamp" "$(( (RANDOM % 5) * 10 + 5 ))" "$(( (RANDOM % 6) + 5 ))"
  done
  rm -f "$SHOT/$name/_frame.png"
  echo "  ✓ seeded $name ($(ls "$REC/$name" | wc -l | tr -d ' ') recordings)"
done
echo "Recordings seeded under $REC ; thumbnails under $SHOT"
