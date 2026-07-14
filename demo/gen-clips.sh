#!/usr/bin/env bash
# Generate camera-like loop clips for the demo (synthetic but "CCTV"-shaped:
# tinted low-light scene + moving subject + timestamp overlay + grain + vignette).
# Deterministic, no network. Output: demo/clips/<name>.mp4
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p clips

FONT="/System/Library/Fonts/Supplemental/Arial.ttf"
DUR=16; FPS=25; SIZE=1280x720

# args: name  bg_hex  label  subject_w subject_h subject_y speed  stamp
clip() {
  local name="$1" bg="$2" label="$3" sw="$4" sh="$5" sy="$6" speed="$7" stamp="${8//:/\\:}"
  local range=$(( 1280 + sw + 200 ))
  # No drawtext (this ffmpeg lacks libfreetype); camera names live in the app UI.
  # Look = tinted low-light scene + moving subject + soft lens + grain + vignette
  # + semi-transparent OSD bars + a blinking red REC dot.
  ffmpeg -y -loglevel error \
    -f lavfi -i "color=c=${bg}:s=${SIZE}:r=${FPS}:d=${DUR}" \
    -filter_complex "
      [0:v]
      drawbox=x='mod(t*${speed}\,${range})-${sw}-100':y=${sy}:w=${sw}:h=${sh}:color=0xcdd8e2@0.85:t=fill,
      drawbox=x='mod(t*${speed}\,${range})-${sw}-100+8':y=$((sy+8)):w=$((sw-16)):h=$((sh-16)):color=0x7f8f9d@0.6:t=fill,
      drawbox=x='640+520*sin(t*0.6)':y=$((sy-40)):w=26:h=26:color=0xb9c6d2@0.5:t=fill,
      gblur=sigma=1.1,
      noise=alls=12:allf=t,
      vignette=PI/4.2,
      drawbox=x=0:y=0:w=1280:h=54:color=black@0.42:t=fill,
      drawbox=x=0:y=666:w=1280:h=54:color=black@0.42:t=fill,
      drawbox=x=1214:y=20:w=16:h=16:color=0xe0564f@0.9:t=fill
    " -c:v libx264 -pix_fmt yuv420p -t ${DUR} "clips/${name}.mp4"
  echo "  ✓ clips/${name}.mp4"
}

echo "Generating camera clips..."
clip front-door  0x0e1a24 "CAM01  FRONT-DOOR"  70 180 470 150 "2026-07-14 14:32:07"
clip driveway    0x111a1e "CAM02  DRIVEWAY"   240 120 430  95 "2026-07-14 14:31:52"
clip backyard    0x0c1712 "CAM03  BACKYARD"    60 150 500  55 "2026-07-14 14:33:18"
clip workshop-pi 0x1a1410 "CAM04  WORKSHOP-PI" 90 160 460 120 "2026-07-14 14:30:41"
echo "Done."
