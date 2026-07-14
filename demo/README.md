# Demo capture harness

Everything needed to (re)generate the README demo video **end-to-end and
headlessly**: it fabricates camera-like streams, boots a throwaway MediaMTX + the
app, drives the UI with Playwright while recording, and renders `demo.mp4` /
`demo.gif`. One command rebuilds the whole thing.

> **If you're an agent asked to change the demo:** read "Data flow" and
> "File-by-file", make your edit in the one file that owns that concern (see the
> "Tweak cookbook"), then run `./run.sh` and verify with the "contact sheet"
> trick at the bottom. Mind the three gotchas — they cost real time to rediscover.

---

## What it produces

`output/` (git-ignored, regenerable):

| File | What | Notes |
|------|------|-------|
| `demo.mp4` | H.264, 1280×800, ~27s, <1 MB | Best for a README `<video>` tag |
| `demo.gif` | palette-optimized, 960px | Fallback for plain-markdown renderers |
| `demo-poster.png` | still frame | Poster for the `<video>` |

The shot: **Live Streams grid → play a stream (real HLS in the browser) →
Recordings index → per-stream recordings (Today/Yesterday) → play + download a
clip → MediaMTX config tabs (no YAML) → sticky save bar → light/dark toggle.**
Every scene shows a caption pill that names the page, plus a synthetic cursor.

---

## Requirements

- `ffmpeg` + `ffprobe` on PATH (any recent build; **`drawtext`/libfreetype not
  required** — see gotcha #1).
- Node + Playwright's chromium: `npx playwright install chromium` (one-time; the
  version must match the installed `@playwright/test`, or capture errors with
  "Executable doesn't exist").
- macOS/arm64 is assumed for the MediaMTX binary URL in `run.sh`. For another
  platform, change `ARCH`/`OS` handling or drop a `mediamtx` binary at
  `.bin/mediamtx` yourself.
- No Docker needed. The MediaMTX **binary** is downloaded to `.bin/` (cached).

---

## Quick start

```bash
./run.sh                 # full pipeline → output/demo.mp4 + demo.gif, then tears down
```

Re-render at a different speed **without** re-recording (the raw webm is kept in
`.work/video/`):

```bash
./post.sh .work/video/*.webm 1.35     # 1.35x instead of the default 1.5x
```

Step-by-step (what `run.sh` does, if you need to run a stage in isolation):

```bash
./gen-clips.sh                                   # 1. synthetic camera clips → clips/
.bin/mediamtx mediamtx-demo.yml &                # 2. start MediaMTX on the alt ports
./publish-streams.sh                             # 3. loop clips into MediaMTX as RTSP
./seed-recordings.sh                             # 4. fabricate Today/Yesterday recordings
# 5. from repo root: migrate .work/demo.db + `next start -p 3100` with the env below
DEMO_BASE_URL=http://localhost:3100 node capture.mjs   # 6. record → .work/video/*.webm
./post.sh .work/video/*.webm                     # 7. render output/demo.mp4 + demo.gif
```

---

## Data flow

```
gen-clips.sh ──> clips/*.mp4 ──(ffmpeg -stream_loop)──> MediaMTX  <── seed-recordings.sh writes
   (synthetic          publish-streams.sh                 │            .work/recordings + .work/screenshots
    camera footage)                                       │
                                                          │ RTSP :8555 in
                                                          │ HLS  :8890 out
                                                          │ API  :9998
                                                          ▼
                                              Next app (:3100) ── reads config/paths, serves pages,
                                              isolated SQLite (.work/demo.db)   serves recordings from disk
                                                          ▲                         │
                                                          │ HTTP page loads          │ browser's HLS.js pulls :8890
                                              capture.mjs (Playwright, headless chromium)
                                                          │ records browser → .work/video/*.webm
                                                          ▼
                                              post.sh (ffmpeg) → output/demo.mp4 + demo.gif
```

Key point: the app doesn't stream video itself. The browser plays **live** via
HLS pulled straight from MediaMTX (`:8890`), and plays **recordings** via the
app's own file-serving endpoints reading `.work/recordings`.

---

## File-by-file

| File | Owns | Edit it when you want to change… |
|------|------|--------------------------------|
| `run.sh` | Orchestration + lifecycle (download → start → capture → render → teardown) | Ports, MediaMTX version, the overall sequence |
| `gen-clips.sh` | The 4 synthetic camera clips (tint, motion, grain, vignette, REC dot) | Look of the fake footage, camera names, clip length |
| `mediamtx-demo.yml` | Throwaway MediaMTX config (alt ports, HLS CORS) | MediaMTX server settings the demo runs against |
| `publish-streams.sh` | Loops `clips/*.mp4` into MediaMTX as RTSP | Which streams publish; source protocol |
| `seed-recordings.sh` | Fabricates recordings + thumbnails with backdated mtimes | Recording count, day spread, file sizes |
| `capture.mjs` | The Playwright **shot list**, captions, synthetic cursor, video recording | Scenes, timing, caption text, viewport, theme |
| `post.sh` | ffmpeg render webm → mp4 + gif (+ speed) | Playback speed, output size/format, gif quality |

`.bin/`, `.work/`, `clips/`, `output/` are all git-ignored and regenerable.

---

## Ports, env, and URL wiring (why it's non-destructive)

The demo runs on **alternate ports** so it never collides with a MediaMTX/Connect
you already run on the defaults (8554/9997/8888/3000):

| Thing | Demo port | Default | Set in |
|-------|-----------|---------|--------|
| MediaMTX API | 9998 | 9997 | `mediamtx-demo.yml` + app env `MEDIAMTX_API_PORT` |
| MediaMTX RTSP | 8555 | 8554 | `mediamtx-demo.yml` + `publish-streams.sh` |
| MediaMTX HLS | 8890 | 8888 | `mediamtx-demo.yml` (`hlsAddress`) |
| MediaMTX WebRTC | 8891 | 8889 | `mediamtx-demo.yml` |
| App | 3100 | 3000 | `run.sh` (`next start -p 3100`) + `DEMO_BASE_URL` |

App env (`run.sh` exports these for `next start`):

```
DATABASE_URL=file:.work/demo.db            # isolated DB — never touches your real one
BACKEND_SERVER_MEDIAMTX_URL=http://127.0.0.1
MEDIAMTX_API_PORT=9998
REMOTE_MEDIAMTX_URL=http://localhost
MEDIAMTX_RECORDINGS_DIR=.work/recordings
MEDIAMTX_SCREENSHOTS_DIR=.work/screenshots
```

How Connect builds the two URLs that must line up (from `src/features/streams/`):

- **API base** = `${mediaMtxUrl}:${mediaMtxApiPort}` → `http://127.0.0.1:9998`
- **Live HLS** = `${remoteMediaMtxUrl}${hlsAddress}/${stream}/index.m3u8`
  → `http://localhost` + `:8890` (read from MediaMTX config via the API) +
  `/front-door/index.m3u8`. So `remoteMediaMtxUrl` carries **no port**;
  `hlsAddress` in `mediamtx-demo.yml` supplies it. Change one, change the other.

`run.sh` migrates a **fresh** `.work/demo.db` each run; the app's first-boot
bootstrap seeds the `Config` row from the env above, so the UI points at the demo
MediaMTX with zero manual config.

---

## Tweak cookbook

**Change caption text / wording** — `capture.mjs`, the `await cap('…')` calls.
Each scene's first `cap()` names the page.

**Add/remove/reorder a scene** — `capture.mjs`, the numbered `// N —` blocks.
Use the helpers: `goto(path)`, `cap(text)`, `clickLoc(locator, label)`,
`moveTo(x,y)`, `sleep(ms)`. `clickLoc` is best-effort (logs + continues on a
missing selector) so a UI change never aborts the whole run.

**Change pacing** — `sleep(ms)` values in `capture.mjs` for per-scene dwell; the
`goto` helper's trailing `sleep` for how fast captions appear after a page
switch.

**Change final speed** — `post.sh <webm> <speed>` (default 1.5). Re-render only,
no re-capture needed.

**Use real camera footage** (recommended for a stronger demo) — drop real loop
clips into `clips/` named exactly `front-door.mp4`, `driveway.mp4`,
`backyard.mp4`, `workshop-pi.mp4`, then skip `gen-clips.sh`. Everything
downstream keys off those names.

**Rename / change the set of cameras** — the names appear in **four** places,
keep them in sync: `gen-clips.sh` (the `clip …` calls), `publish-streams.sh` (the
`for name in …` loop), `seed-recordings.sh` (the `for name in …` loop), and
`capture.mjs` (the hard-coded `/recordings/front-door` scene).

**Change recordings dataset** (count, days, sizes) — `seed-recordings.sh`
(`TODAY_TIMES` / `YEST_TIMES`, clip durations). The app groups by file **mtime**
and reads thumbnails from `screenshots/<stream>/<recordingBase>.png`.

**Change viewport / theme / scale** — `capture.mjs`, `ctx = browser.newContext({
viewport, colorScheme, deviceScaleFactor, recordVideo })`.

**Change ports** — `mediamtx-demo.yml` + `publish-streams.sh` + the env in
`run.sh` (keep the API/HLS wiring above consistent).

---

## Gotchas (each cost real debugging time — don't rediscover them)

1. **`drawtext` may be missing.** Homebrew ffmpeg is often built without
   libfreetype, so `drawtext` fails with "No such filter". That's why on-video
   text (captions) is done as **DOM overlays in Playwright**, not ffmpeg text,
   and `gen-clips.sh` uses no text at all.
2. **Overlay must attach after `<body>` exists.** `addInitScript` runs at
   document-start; appending the cursor/caption to `document.documentElement`
   there renders nothing. `capture.mjs` waits for `document.body`
   (DOMContentLoaded) and appends to `body`.
3. **Set the caption AFTER `goto()`, never before.** A navigation reloads the
   page and wipes the injected overlay, so a caption set before `goto` is erased
   the instant you navigate and never shows. Every scene calls `goto()` first,
   then `cap()`.
4. **Alt ports are deliberate.** If you already run MediaMTX/Connect on the
   defaults, the demo must not clobber it. Keep the alternate ports (or change
   them everywhere per the table) — don't point the demo at your real stack.
5. **Playwright browser version must match** the installed package, or launch
   fails with "Executable doesn't exist"; run `npx playwright install chromium`.
6. **Streams are synthetic**, and the demo makes **no low-latency claim**
   (playback is HLS, ~seconds). Keep marketing copy honest.

---

## Verify the output (fast visual check)

Sample frames and tile them into one contact sheet, then open it — quicker than
scrubbing the video:

```bash
mkdir -p .work/frames
ffmpeg -y -i output/demo.mp4 -vf "fps=1/1.6" .work/frames/f%02d.png
ffmpeg -y -i .work/frames/f%02d.png -vf "scale=460:-1,tile=3x6:margin=5:padding=5" .work/contact.png
open .work/contact.png     # confirm each page shows its caption, HLS renders, save bar appears
```

---

## Promoting to the top-level README

`output/` is git-ignored. To ship the demo, copy `demo.mp4` (and/or `demo.gif`)
into `.github/assets/` and reference it from `README.md`.

⚠️ Changing the top-level `README.md` trips the translation staleness guard
(`npm run i18n:check`): all 30 `docs/i18n/README.*.md` must be re-synced in the
same change. Batch that; don't swap the asset piecemeal.
