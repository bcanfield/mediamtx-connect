# MediaMTX Connect — Design Handoff

Implementation guide for the approved mockups in `MediaMTX Connect — Hi-fi.dc.html`.
**Visual source of truth: turn 2 (boards 2a–2e)** plus the shell-independent boards **1c** (Live View states) and **1h** (stream card anatomy / actions menu at full scale). Turn 1 boards 1a/1d–1g are superseded (sidebar shell was rejected in favor of top-nav).

Target stack: React + Tailwind + shadcn/ui, dark mode default, light mode first-class.

---

## 1. Design tokens

Geist (Vercel) design language, dark inversion. Map to shadcn CSS variables. Values below are the exact hexes used in the mocks.

### Dark (default)

| Token (shadcn var) | Value | Used for |
|---|---|---|
| `--background` | `#0a0a0a` | page canvas |
| `--card` / `--popover` | `#111111` | cards, inputs (`#161616` for menus/save bar) |
| `--border` | `#262626` | the structural 1px hairline, everywhere |
| `--border` (subtle) | `#1f1f1f` | page-level dividers (nav bottom, section rules) |
| `--border` (row) | `#161616` | config field-row separators |
| hover border | `#3a3a3a` | card/button hover state |
| `--foreground` | `#ededed` | headings, primary text, config keys |
| body text | `#a1a1a1` | secondary text, nav idle |
| muted | `#8f8f8f` | captions, help text, meta lines |
| faint | `#666666` | eyebrows, placeholders, timestamps (`#4a4a4a` for faintest) |
| `--primary` | `#ededed` on `#0a0a0a` | primary button = inverted ink (white bg, black text) |
| `--accent` (active fill) | `#1a1a1a` | selected nav item, segmented-control active, hover fill |
| link / focus / positive | `#0070f3` | links, focus rings, progress bars, "connected", ENABLED, active toggles |
| destructive / LIVE / REC | `#ff4d4d` (dot), `#ff6b6b` (text), `rgba(255,77,77,.35)` (border) | LIVE badge, REC, errors. Error input border `#7a2020` |
| warning / dirty | `#f5a623` (dot/text), `#3a2c10` (border) | unsaved-change dots, playback-URL callout |

### Light

Not mocked; derive from Geist source tokens (`_ds/...tokens/colors.css`): canvas `#fafafa`, card `#ffffff`, hairline `#ebebeb`, ink `#171717`, body `#4d4d4d`, mute `#8f8f8f`, faint `#a1a1a1`. Same blue/red/amber semantics. Primary button inverts back to ink-on-white → `#171717` bg, white text.

### Typography

- **Geist Sans** everything; **Geist Mono** for: config keys, eyebrows, badges/chips, timestamps, URLs/paths, byte counts, keyboard hints. Both are open source (`geist` npm package).
- Weights binary: 600 headings, 500 labels/buttons/keys, 400 body. No light, no italic.
- Negative tracking on headings: 20px/-0.4px page titles, 15px/-0.3px section titles, 14px/-0.28px card titles.
- Eyebrows/badges: Geist Mono 500, 10–11px, UPPERCASE, letter-spacing 0.06–0.08em. The ONLY uppercase in the app.
- Body/UI sizes: 13–13.5px primary, 11.5–12px secondary, help text 11.5px.

### Radius & elevation

- 6px: buttons, inputs, segmented controls, nav pills, toggles' container chips
- 12px: stream/recording cards; 8px: dropdown menus; 10px: save bars, state panels; 100px pill: overlay badges (LIVE, protocol, SNAPSHOT)
- Elevation is hairline-first: cards flat with 1px border, **no shadow**. Only floating chrome (dropdown menu, save bar) gets `0 8px 30px rgba(0,0,0,.5–.6)`.

### Spacing

4px scale. Card footer padding 10–12px; page gutter 28–32px; grid gap 14–16px; form field stack 18px; section gap 26–30px.

---

## 2. Screen inventory & shadcn mapping

### Global shell (all screens)

Top nav, two rows in one bordered header (`border-b #1f1f1f`):
- Row 1 (56px): logo mark (24px square, `#ededed` bg, mono "M") + wordmark "MediaMTX **Connect**" (Connect at 400/`#8f8f8f`); right: connection status (blue dot + `connected · v1.9` mono), language picker trigger (`Popover` + `Command` for searchable 30-language list), theme toggle (`Button` variant ghost, icon).
- Row 2: tabs — Live (with red dot), Recordings | divider | App Config, MediaMTX Config. Active = 500 weight `#ededed` + 2px bottom border `#ededed`; idle = 400 `#8f8f8f`, hover → `#ededed`. Implement as `NavLink`s styled like `Tabs`, not actual Tabs (they're routes).
- Mobile: row 2 scrolls horizontally or collapses to a `Sheet`; not mocked — implementer's choice, keep 44px hit targets.

### Live View `/` (board 2a; states board 1c)

- Toolbar: stream count summary (left, muted); right: playback-mode `ToggleGroup` (AUTO / LOW-LAT / COMPAT, mono labels) + density `ToggleGroup` (2/3/4). Density persists (localStorage); playing set syncs to `?play=cam1,cam2`.
- Grid: `grid-cols-{density}`, gap 14px.
- **StreamCard** (custom component — see §3).
- States (board 1c):
  - Server unreachable: centered panel, red-tinted border `#2e1414` + faint red gradient wash, ✕ icon in circle, title + mono URL in message, primary "Open App Config" + secondary "Retry", auto-retry countdown line (mono, faint).
  - Zero streams: dashed border `#2a2a2a` panel, publish-URL hints in a `CodeBlock`-style well (`#111` bg, mono, stream name in blue).
  - Playback URL missing: amber banner (`#3a2c10` border, amber gradient wash) ABOVE the grid; cards render at 75% opacity with Play disabled.
  - Missing thumbnail: diagonal-stripe placeholder (`repeating-linear-gradient(45deg,#101010 0 10px,#131313 10px 20px)`), dashed circle icon, mono caption "no snapshot yet — first capture in ~30s".

### Recordings index `/recordings` (board 2b; states board 1d bottom row)

- Toolbar: totals summary + filter `Input` (280px, ⌕ prefix, `/` keyboard-hint `Badge`). Client-side instant filter.
- Card per stream: thumbnail with timestamp (top-right, mono) + "N RECORDINGS" chip (bottom-left); footer: name, "latest {relative} · {size}", `→` affordance. Whole card clickable → `/recordings/[stream]`. Hover: border → `#3a3a3a`.
- Empty state: dashed panel + "Enable recording" CTA. Error state: red panel + "Open App Config" CTA (see board 1d).

### Per-stream recordings `/recordings/[stream]` (board 2c)

- Content centered, max-width 920px. `Breadcrumb` (Recordings / {stream}). Header: stream name + totals + "● RECORDING NOW" (red, mono) when live-recording.
- Day groups: mono uppercase eyebrow headers ("TODAY — JULY 14"), hairline underline.
- Recording row (default): 118px 16:9 thumb (duration stamp bottom-right) + time range (500) + "size · duration · codec" meta + Play `Button` (outline) + download icon `Button`. Hover: border → `#3a3a3a`.
- Open/playing row: expands to full-width video card, custom seekbar (3px track `rgba(255,255,255,.15)`, blue fill, white knob), Close (primary) + Download (outline). Open items tracked in URL.
- Downloading row: blue `Progress` (3px) + mono status line "downloading… 348 MB of 561 MB · 11.2 MB/s" + Cancel. Success/error → `Sonner` toast.
- `Pagination`: "Showing 1–10 of 486" left; ← 1 2 3 … 49 → right; active page = filled `#1a1a1a`, no border.

### App Config `/config` (board 2d)

- Single column, max-width 640px, centered. Two sections with mono eyebrow headers: MEDIAMTX CONNECTION, STORAGE.
- Fields: `Label` (500/13px) + `Input` (38px, mono value text) + help text (11.5px muted) below. API port fixed ~180px wide.
- **Playback URL is the hero field**: wrapped in an amber-bordered callout box with "REQUIRED FOR LIVE PLAYBACK" pill badge; error state = red input border `#7a2020` + `0 0 0 3px rgba(255,77,77,.08)` ring + ✕ error line with suggested fix.
- Focus ring (any input): blue border + `0 0 0 3px rgba(0,112,243,.15)`.
- **Save bar**: floating, bottom-fixed within content width, `#161616` bg, amber dot + "2 unsaved changes · 1 field needs attention", Reset (ghost) + Save (disabled = `#2a2a2a` bg `#666` text when invalid/unchanged; enabled = primary). Renders only when dirty.

### MediaMTX Config `/config/mediamtx/global` (board 2e)

- Layout: sticky left anchor rail (200px, "ON THIS PAGE") + one continuously scrolling form (max-width ~1060px total). **Not tabs** — scroll-with-rail chosen deliberately so errors are findable.
- Rail rows: section name; right slot shows error-count badge (red pill) OR "OFF" (mono, faint) for disabled protocols. Active section highlighted (`#1a1a1a` fill) via scroll-spy. Mobile: rail collapses to horizontal chip row (sticky top).
- Sections (8): Logging, API, Hooks, RTSP, RTMP, HLS, WebRTC, SRT. Protocol sections have header rows: name + one-line description + ENABLED/OFF mono label + `Switch`. Disabled section: header at 55% opacity, its fields hidden ("6 options hidden while off").
- **ConfigFieldRow** (custom — see §3): key column 280px fixed + control column flexible, hairline row separators.
- WebRTC ICE servers: repeatable group — rows of [url (flex 1.6) | username | password] `Input`s + remove ✕ icon button; dashed "+ Add ICE server" button.
- **Pending-changes bar**: like App Config save bar but wider; shows dirty-key chips by name (mono pills, `#222` bg; erroring key gets red text + ✕), Discard (ghost) + "Save to server" (primary).
- Field labels are MediaMTX config keys **verbatim, never localized** (Geist Mono). Help text IS localized.

---

## 3. Custom components (not in shadcn)

### `StreamCard`

The densest surface; designed to scale from today's 3 affordances to ~8 (board 1h). Reserved overlay zones on the 16:9 media area:

- **top-left**: status pills (100px radius, `rgba(10,10,10,.75)` bg) — LIVE (red dot + mono label, red-tinted border), protocol+latency ("WEBRTC · ~0.4s"), future: SHARED (blue). Idle cards show "SNAPSHOT · 14s ago" instead.
- **top-right**: mono timestamp; future: snapshot icon button.
- **bottom-left**: codec chips (4px radius, `rgba(255,255,255,.09)` bg, mono 10px) — H265, OPUS, 4K…
- **bottom-right**: telemetry (mono, muted) — "1080p · 4.2 Mb/s", future "3 viewers".
- Bottom edge: `linear-gradient(transparent, rgba(0,0,0,.7))` scrim behind the bottom chips.
- Idle card: centered white circular play affordance (46px).
- **Footer** (outside media): name (500) + "online since {t} · {uptime}" meta (+ "· ● REC" red, `white-space:nowrap`); right: Play (outline) / Stop (primary) + ⋯ `DropdownMenu` trigger (30px square, 6px radius).

Props sketch: `{ name, thumbnailUrl?, onlineSince, playing, protocol?, latencySec?, codecs?[], resolution?, bitrate?, recording?, shared?, viewers? }` — every optional prop adds a chip in its zone; nothing reflows.

Actions `DropdownMenu` (board 1h), grouped by separators: [Open stream detail, View recordings, Take snapshot] / [Record (with ON/OFF mono state), Copy publish URLs, Share & embed…] / [Edit path config, Edit hooks]. Today only "View recordings" ships; the grouping is the extension contract.

### `ConfigFieldRow`

`{ key, help, dirty?, error? , control }` — mono key (13px/500) + optional amber dirty dot, help below (11.5px muted), control right-aligned (toggles) or full-width (inputs). Row separator `#161616`. Error: red border on control + ✕ message line below.

### `SaveBar`

`{ summary, chips?[], onDiscard, onSave, saveDisabled }` — floating bottom bar, appears only when dirty. Shared by both config pages.

---

## 4. Behavior spec

- **URL state**: `?play=` (Live View playing set), open recordings on per-stream page. Reload/share-safe.
- **Persistence** (localStorage): density (2/3/4), playback mode, theme, language.
- **Dirty tracking** (both config pages): compare against last-saved snapshot; save bar mounts/unmounts; Save disabled while any field invalid or nothing changed; per-section error counts roll up to the rail badges live.
- **Validation**: inline, on blur/change; error message always includes a concrete suggested fix where possible.
- **Toasts** (`Sonner`): save success/failure, download complete/failed, snapshot taken.
- **Server polling**: connection status dot in header; unreachable state auto-retries with visible countdown.
- **Multiple simultaneous players** is a first-class case (camera wall) — never assume one active video.
- **Hover** is enhancement only; every hover affordance must also be reachable on touch (menus via tap, controls always visible on cards at mobile widths).

## 5. i18n & a11y

- 30 languages incl. Thai/Hindi/Bengali/CJK. Never fixed-width text containers; card footers, nav tabs, save-bar summaries must truncate/wrap gracefully. Test German (long) + Thai (tall glyphs).
- MediaMTX config keys and all mono technical values (URLs, codecs, byte counts) are **never translated**.
- Relative times ("latest 9 minutes ago", "online since 06:12") via a locale-aware lib.
- Radix (via shadcn) covers menus/toggles/tabs ARIA. Additional: `aria-live` on connection status + download progress; LIVE badge needs text, not color alone (it has both); keyboard: `/` focuses filter, Escape closes players/menus; focus rings always visible (blue ring spec above).
- Hit targets ≥44px on touch (mock buttons are 30–32px desktop; enlarge on mobile).

## 6. Assets & gaps

- Thumbnails in mocks are placeholders (gradients + stripes) — real snapshot images replace the media-area background; keep overlay zones and scrim.
- Icons: mocks use unicode stand-ins (⋯ ⌖ ▶ ◐ ✕ ↓ ⌕). Replace with **Lucide** (the Geist-adjacent set): `MoreHorizontal`, `Crosshair`/`Focus` (snapshot), `Play`, `SunMoon`, `X`, `Download`, `Search`, `ChevronDown`, `ArrowRight`.
- Not designed yet (deliberately — don't block on these, don't design them out): mobile layouts, light mode, per-stream detail page, NVR timeline, sessions table, wizards, publish page, embed builder. The StreamCard zones + menu grouping are the extension contract for the card-related ones.
