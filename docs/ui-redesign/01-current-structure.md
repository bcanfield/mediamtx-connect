# Step 1 — Current Web App Structure

A snapshot of the UI as it exists today (cleanup branch, `src/`).

## 1. App chrome (root layout)

`src/app/layout.tsx`

- `<html>` → `<body>` with `flex flex-col gap-4 items-center`.
- Sticky `<header>` containing `<NavBar items=[Recordings, Config]>`.
- `<div max-w-7xl p-4>` wraps page children.
- `<ThemeProvider>` (next-themes, dark default).
- Global `<Toaster>` mounted once.
- `<ServiceWorker>` registered for PWA.

### NavBar (`src/components/nav-bar.tsx`)

- Brand: text "Connect" (left). Hidden on mobile.
- Desktop nav: inline links (`Recordings`, `Config`) with active-route highlighting.
- Mobile: hamburger → DropdownMenu with `Home / Recordings / Config`.
- Right side: a refresh button (`window.location.reload()`) and `ModeToggle` (light/dark/system).
- "Home" link is **only** in the brand and the mobile dropdown — desktop has no top-level "Live" or "Streams" link.

### Page chrome

- `<PageLayout header subHeader>` (`src/components/page-layout.tsx`) — `<h2>` + muted paragraph + `<Separator>` + content.
- `<GridLayout columnLayout="xs|small|medium|large">` (`src/components/grid-layout.tsx`) — Tailwind grid wrapper.
- `<PageSkeleton>` — 4 skeleton cards in a grid (used by `app/loading.tsx`).
- `<GridFormItem label>` (`src/components/grid-form-item.tsx`) — `grid-cols-2` with label on the left, control on the right. Used by every form row.

## 2. Pages

| Route | Component | File |
|---|---|---|
| `/` | `LiveViewPage` | `src/features/streams/live-view-page.tsx` |
| `/recordings` | `RecordingsIndexPage` | `src/features/recordings/recordings-index-page.tsx` |
| `/recordings/[streamname]` | `StreamRecordingsPage` | `src/features/recordings/stream-recordings-page.tsx` |
| `/config` | `ClientConfigPage` | `src/features/client-config/client-config-page.tsx` |
| `/config/mediamtx/global` | `MediaMTXConfigPage` | `src/features/mediamtx-config/mediamtx-config-page.tsx` |

`/config` uses a sub-layout (`src/app/config/layout.tsx`) that injects a left `<SidebarNav>` with two links.

### 2.1 `/` — Live View

Server component. Loads app config + `v3/pathsList` + `v3/configGlobalGet`.

Three error/empty states use the `<Alert>` component:

1. **No client config** (DB unreachable) — destructive alert.
2. **Cannot connect to MediaMTX** — destructive alert with code-block of URL and "Check Config" + "Refresh" buttons.
3. **No remote URL configured** — info alert pointing to `/config`.
4. **Connected but no streams** — info alert.
5. **Connected with streams** — `<GridLayout columnLayout="small">` of `<StreamCard>`s.

#### StreamCard (`src/features/streams/stream-card.tsx`)

- `<Card className="aspect-square">` with header (stream name in muted small text) and content area.
- Body: thumbnail (`/api/[streamName]/first-screenshot`) **or** live HLS via `<VideoPlayer>` if `?liveCams=` includes this stream.
- Toolbar (3 buttons): play/pause toggle (1/2 width, animates when live), recordings link (1/4), info popover (1/4) showing `Name` and `Online since` timestamp.
- Selection state lives in URL search params (`?liveCams=foo,bar`).

### 2.2 `/recordings` — Index

Server component. Reads `recordingsDirectory`, calls `countFilesInSubdirectories`.

States:

1. **No config** — destructive alert.
2. **Cannot read directory** — destructive alert with path code-block and "Check Config" link.
3. **No recordings** — info alert with `MTX_RECORD=yes` hint.
4. **Has recordings** — `<GridLayout columnLayout="xs">` (single column) of cards.

Each card: `<Video>` icon + stream name + count of recordings + "View" outline button. No thumbnail. No total size. No last-recording timestamp.

### 2.3 `/recordings/[streamname]` — Per-stream browser

Server component. Pagination via `?page` and `?take` (default 10).

- Header: `Recordings` + `Recordings for: {streamName}`.
- Right-aligned text-only "Showing X - Y of Z" with `<` `>` chevrons. No back link to `/recordings`.
- Body: `<GridLayout columnLayout="small">` (1-2 cols) of `<RecordingCard>`s.
- Error state: a single alert.

#### RecordingCard (`src/features/recordings/recording-card.tsx`)

- `<Card className="aspect-square">` with header showing `createdAt` (formatted) and file size in MB.
- Body: thumbnail **or** native `<video>` MP4 player when `?liveCams=` contains this filename.

  > Note: the `liveCams` URL key is **shared** between Live View and Recording playback selection. This is reusing the streams card mechanism for recording playback.

- Toolbar (3 buttons): play/pause (1/2), `<DownloadButton>` (1/4) which streams the MP4 with a `<Progress>` bar inside the button, info popover (1/4) showing filename + created date.

### 2.4 `/config` — Client Config

Server component reads the singleton `Config` row, hands it to `<ClientConfigForm>`.

- React Hook Form + Zod, `mode: 'onBlur'`.
- Submit button at the **top right** of the form.
- 5 fields, each rendered with `<GridFormItem label>` + `<Input>` + `<FormDescription>`:
  - `mediaMtxUrl`
  - `mediaMtxApiPort` (number)
  - `remoteMediaMtxUrl`
  - `recordingsDirectory`
  - `screenshotsDirectory`
- Toast on success / failure.
- No section grouping (only 5 fields).

### 2.5 `/config/mediamtx/global` — MediaMTX Global Config

`<MediaMTXConfigForm>` — ~75 fields.

- Single submit button at the **top right**.
- Sections separated only by `<Separator />` lines (no headings, no anchors). Implicit grouping in render order: Logging → Limits → External Auth → API → Metrics → PPROF → Run Hooks → RTSP → TLS (RTSP) → RTMP → HLS → WebRTC → ICE Servers (dynamic field array) → SRT.
- Every boolean field is a 2-option `<Select>` (`True` / `False`) — no native checkbox/switch.
- List fields (e.g., `logDestinations`, `protocols`, `authMethods`, `hlsTrustedProxies`, `webrtcTrustedProxies`, `webrtcIPsFromInterfacesList`, `webrtcAdditionalHosts`) are newline-split textareas.
- ICE Servers: `useFieldArray` add/remove rows, each with URL/Username/Password.
- All `<FormDescription />` are empty for the MediaMTX form.

## 3. Shared UI components in use

`src/components/`

- `nav-bar.tsx`, `mode-toggle.tsx`, `refresh-button.tsx`
- `page-layout.tsx`, `page-skeleton.tsx`
- `grid-layout.tsx`, `grid-form-item.tsx`
- `sidebar-nav.tsx`
- `video-player.tsx` (HLS.js wrapper)
- `service-worker.tsx`, `theme-provider.tsx`

`src/components/ui/` (shadcn primitives present today): button, input, textarea, select, form, card, alert, popover, dropdown-menu, separator, progress, label, skeleton, toast, toaster, use-toast.

## 4. Pain points / observations

These are the things the redesign should address. Keep them in mind for steps 2-5.

### App chrome

- "Live" / "Streams" has no top-nav link on desktop — only a brand-text shortcut. Discoverability is poor: a user who lands on `/recordings` cannot get back to live view without clicking the "Connect" wordmark.
- Refresh button is duplicated (in nav and in alert states) and is just `window.location.reload()`. It is non-obvious as a control.
- Brand text "Connect" is bare — no logo / icon, no environment indicator (dev / prod / streams count).

### Live View

- The connection-state logic produces 4 mutually-exclusive UI states but they all render as same-size `<Alert>`s — no visual hierarchy, no "check status" affordance once connected.
- StreamCard is locked to a square aspect ratio. Most cameras output 16:9 — content is letterboxed inside a square card.
- Stream name is in `CardDescription` (small, muted) instead of a real heading. There's no "live now" badge or red dot when actively playing.
- Toolbar uses 3 unlabeled icon buttons with non-uniform widths (1/2, 1/4, 1/4). No tooltips. The pulsing "play" button is the only feedback that a stream is live.
- "Online since" is buried in a popover. A "5 min ago" relative time on the card itself would be more useful.
- No "play all" / "stop all" / grid density control.

### Recordings index

- Single-column list with file count is information-sparse. No thumbnail per stream, no last-recorded time, no total size.
- Card is awkwardly laid out — title + button on the same row with a `flex items-center` hack.

### Per-stream recordings

- No back link / breadcrumb to `/recordings`.
- Pagination control is tiny right-aligned text — easy to miss. No page-size selector. No first/last buttons.
- Reuses the `?liveCams=` URL key for recording playback selection — semantically wrong (these are recordings, not live streams).
- Recording card uses the same square aspect ratio that letterboxes the thumbnail, just like StreamCard.
- Sort order is hard-coded newest-first; no toggle.
- No filtering by date. No multi-select / bulk download.

### Client config

- 5 fields rendered without grouping (fine — but the *MediaMTX URL* / *API port* pair is one logical unit, *recordings dir* / *screenshots dir* is another).
- Submit button at the **top right** is unconventional — most form patterns put save buttons at the bottom or stick them to the page.
- No "discard changes" affordance; the form just silently keeps dirty state until the user navigates away.
- No "test connection" button, even though we already make `pathsList` calls server-side.

### MediaMTX global config

- ~75 fields in a single column with **no section headings** and **no descriptions** — separator lines are the only orientation cue. Users have to guess which `address` field belongs to which transport.
- No table-of-contents / anchored side nav within the page.
- No search / filter to jump to a specific field (`hlsAddress`, `rtspAddress`, …).
- Boolean fields use `Select` "True" / "False" instead of `Switch` or `Checkbox` — visually noisy, slow to scan.
- Submit button is at the top with no sticky behavior — once you scroll 1500px down, you can't save without scrolling back up.
- ICE Servers add/remove uses `<Plus>` / `<Trash>` icon buttons without confirmation — easy to delete by mistake.
- Default `append({password: 'a', url: 'b', username: 'c'})` injects placeholder garbage values.

### General

- `<Alert>` is the only feedback primitive — used for errors, warnings, empty states. No distinction between *retryable* errors and *configuration* errors.
- No global "loading" indicator on server-action submission; toast appears only after.
- No keyboard shortcuts, no command palette.
- Theme toggle works, but there's no per-user persisted preference for grid density / page size / etc.
