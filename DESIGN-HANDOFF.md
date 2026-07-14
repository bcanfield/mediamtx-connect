# MediaMTX Connect — Feature Handoff for Design

> **Temp doc.** A plain-language inventory of what this app does, page by page, written for a designer who has never seen it. It intentionally avoids describing the current visual design so you can bring an unbiased take. Where a current behavior is mentioned (e.g., "grid of cards"), treat it as *what exists*, not *what we want*.

## What the app is

MediaMTX Connect is a self-hosted web UI companion to [MediaMTX](https://github.com/bluenviron/mediamtx), a popular open-source media server. People run MediaMTX to ingest camera/video streams (security cams, Raspberry Pi cameras, OBS, drones); MediaMTX Connect is the browser dashboard that sits next to it.

It answers three user needs:

1. **Watch my live streams** in a browser, from anywhere.
2. **Browse and download my recordings** without SSHing into a server.
3. **Configure everything** (both this app and the MediaMTX server itself) through forms instead of YAML files.

## Who uses it

Self-hosters and homelab users — technical enough to run Docker, but they want a clean UI instead of raw config files and API calls. Typical setups: a handful of security cameras, a Raspberry Pi camera, or a small streaming rig. Usually one user, no accounts/login (it lives on a home network or behind a reverse proxy). Used on desktop and mobile; it's installable as a PWA.

Scale expectations: typically 1–10 streams, occasionally more. Recordings can accumulate into the hundreds per stream.

---

## Pages

### 1. Live View (`/`) — the home page

The default landing page. Shows every stream currently active on the MediaMTX server.

- Each stream is represented by a **card**: a 16:9 thumbnail (most recent auto-captured screenshot), the stream name, and how long it's been online ("online since…").
- **Play/Stop per stream** — playing swaps the thumbnail for a live HLS video player, inline in the card. Multiple streams can play at once (a "watch all my cameras" wall is a real use case).
- A **"LIVE" indicator** marks actively playing streams.
- The set of playing streams is encoded in the URL (`?play=cam1,cam2`), so a layout can be reloaded or shared.
- A **per-stream actions menu** currently offers "View recordings" (jump to that stream's recordings) and is the extension point for future per-stream actions.
- A **density control** lets the user choose how many columns of cards (2/3/4); the choice persists.

**States to design for:**
- Cannot connect to the MediaMTX server at all (error, with a path to the Config page).
- Connected but zero active streams (empty state).
- Streams exist but the app isn't configured with a browser-reachable playback URL yet — playback can't work until the user fills one config field, and we prompt them to do it.
- Normal: 1–10+ stream cards, some playing, some not.
- Thumbnail missing for a stream (fallback needed).

### 2. Recordings index (`/recordings`)

Overview of all streams that have recordings on disk.

- One **card per stream**: latest thumbnail, stream name, total recording count, and "latest recording <relative time>".
- **Search/filter** by stream name (client-side, instant).
- Each card drills into that stream's recording browser.

**States:** recordings directory misconfigured/inaccessible (error), no recordings yet (empty state with a hint on enabling recording), normal grid.

### 3. Per-stream recordings (`/recordings/[stream]`)

Browse a single stream's recordings — this list can get long.

- **Paginated list** (default 10/page) sorted newest-first, with page controls.
- Recordings are **grouped by day** ("Today", "Yesterday", then dated headings); each item shows its time of day and file size.
- Each recording is a card with a 16:9 auto-generated thumbnail.
- **Inline playback** — Play swaps the thumbnail for an MP4 video player (with seeking). Open recordings are tracked in the URL, so state survives reload.
- **Download** with a visible progress bar (files are large; downloads take time) and success/error feedback.
- Breadcrumb navigation back to the recordings index.

### 4. Application settings (`/config`)

Configure the Connect app itself. One form, five fields, in two conceptual groups:

- **MediaMTX connection**: server URL, API port, and the *browser-reachable* playback URL (this last one is the field that unlocks live playback for remote viewers — it's the single most important setting and a common stumbling block for new users).
- **Storage**: filesystem paths for recordings and screenshots.

Every field has help text explaining its impact. The form validates inline, only allows submit when changed and valid, offers reset-to-saved, and confirms save success/failure.

### 5. MediaMTX server settings (`/config/mediamtx/global`)

The heavyweight page: a full editor for the MediaMTX server's global configuration — **~75 fields** covering every option the server exposes. This is the app's flagship capability ("edit everything, no YAML required").

- Fields are organized into **eight sections**: Logging, API, Hooks, RTSP, RTMP, HLS, WebRTC, SRT (the last five are streaming protocols, each with an on/off master switch plus its own options).
- Field types: on/off toggles (many), free text, numbers, multi-value lists, and one repeatable structured group (WebRTC ICE servers: URL/username/password rows with add/remove).
- **Validation errors are surfaced per section** so the user can find a broken field among 75 without hunting.
- **Unsaved changes** are tracked; a persistent affordance shows how many edits are pending, with Save / Discard. Reads and writes go live against the running server.
- Field labels intentionally mirror MediaMTX's own config key names (users cross-reference MediaMTX docs), so labels stay technical/English even in localized UIs.

**Design challenge:** this page is dense by nature. The interesting problem is making 75 technical fields scannable and non-intimidating without dumbing them down — the audience *wants* full control.

---

## Global / cross-cutting

- **Navigation:** persistent app-level nav with two groups — Application (Live, Recordings) and Settings (App Config, MediaMTX Config) — plus theme toggle and language switcher. Currently a collapsible sidebar (icon-collapse on desktop, drawer on mobile); redesign freely.
- **Theming:** light and dark, user-toggleable, dark default. Both modes are first-class.
- **Internationalization:** 30 languages, including RTL-adjacent scripts (Thai, Hindi, Bengali) and CJK. Copy lengths vary a lot — layouts can't assume English string widths. A searchable language picker lives in the chrome.
- **Responsive:** real mobile usage ("check my cameras from my phone"). Video cards, the recordings list, and both config forms all need to work on small screens.
- **PWA:** installable, with an app icon and standalone display — it should feel at home as a pinned "camera app" on a phone.
- **Accessibility:** keyboard nav and ARIA are baseline expectations (currently via Radix primitives).
- **Feedback patterns in use:** toasts for save success/error, inline validation messages, empty states with a CTA toward the fix, destructive alerts for connection/misconfiguration errors, progress indication for downloads.
- **No auth/user accounts** — no login, profile, or permissions surface anywhere.

## Where this is heading — design for extension (not built yet)

> A research-backed feature slate is queued (tracked as GitHub issues; see the epic and `docs/ideas/`). **None of this is built.** It's here only so your structure, navigation, and especially the stream card can *absorb* it later — you don't need to design these now, just don't design them out. Everything in the sections above still describes today's reality.

- **The stream card becomes the densest surface.** Beyond today's thumbnail / name / online-since / LIVE, cards will likely carry a **protocol + "~Ns behind live" latency badge**, **codec chips** (H264/H265/AV1…), and a **snapshot button** — and the per-stream actions menu (today just "View recordings") grows into many actions (open detail, edit path, copy publish URLs, toggle recording, edit hooks). Design the card and its menu to scale gracefully from ~1 to ~8 affordances.
- **Live View gains a grid-level playback-mode control** (low-latency / compatible / automatic) next to the density control, and live playback moves to **low-latency WebRTC** rather than today's HLS — so latency/quality becomes state worth showing, and the "wall of cameras" case stays first-class.
- **A new Per-stream detail page.** Clicking a stream opens a page combining live **health** (codecs, connected readers, byte counters, uptime, error counts), **config**, recording controls, publish URLs, and hooks. A new primary surface — it affects navigation and the card→detail drill-in pattern.
- **Recordings is heading toward an NVR timeline** — a zoomable **scrubber with a playhead**, segment markers, a live tail while recording, and drag **in/out handles** for clip export. The biggest interaction shift in the app; today's paginated card list is only the starting point.
- **A live sessions surface** — a real-time **table** of who's connected across protocols, with a per-row "kick." Denser and more data-grid than the current card-centric pages.
- **Guided flows arrive.** An "**Add camera**" wizard, a **first-run setup** wizard, and a **diagnostics ("doctor") checklist** page. No multi-step/wizard pattern exists today.
- **Browser-based publishing** — a capture page (camera / mic / screen pickers, quality sliders, local preview) to go live *from* the browser.
- **Sharing & embedding** — a chrome-less **public player** route plus an **embed-builder** dialog (snippet output, size presets). Introduces a per-stream **public / private** notion — still no user login, but "this stream is shared publicly" becomes a state to represent.
- **More live-updating data everywhere** (latency, health, session counts) — subtle real-time affordances matter more than in today's mostly-static pages.

## Out of scope for this doc

Backend behavior the user never sees directly (background thumbnail generation, retention cleanup, health endpoint, Docker packaging). It only shows up in the UI as "thumbnails appear automatically" and "old thumbnails disappear after 2 days."

## Reference

The exhaustive, implementation-linked feature inventory lives at `docs/FEATURES.md` if you need to verify a detail.
