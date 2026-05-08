# Step 3 — Page Blueprints

ASCII layout sketches and component lists for each page. These are the **target** UI — Step 4 maps each labeled component to a shadcn primitive or block.

Notation: `[Component]` = shadcn primitive, `<Component>` = our wrapper.

---

## 0. Global shell

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Sidebar collapsed/expanded]    │  [SidebarInset]                   │
│  ┌──────────┐                   │  ┌──────────────────────────────┐ │
│  │ ● Connect│                   │  │ ☰  Live › Streams      🔄 ⚙  │ │  ← top bar (Breadcrumb + actions)
│  │          │                   │  ├──────────────────────────────┤ │
│  │ ◉ Live   │                   │  │                              │ │
│  │ ▢ Record.│                   │  │      page content            │ │
│  │          │                   │  │                              │ │
│  │ Settings │                   │  │                              │ │
│  │  Client  │                   │  │                              │ │
│  │  MediaMTX│                   │  │                              │ │
│  │          │                   │  │                              │ │
│  │ ─────────│                   │  │                              │ │
│  │ ☾ theme  │                   │  │                              │ │
│  │ v1.4.1   │                   │  └──────────────────────────────┘ │
│  └──────────┘                   │                                   │
└─────────────────────────────────────────────────────────────────────┘
```

**Components**

- `[Sidebar]` (`sidebar-07` block as the starting point — collapsible icon sidebar).
- `[SidebarHeader]` — app name + status dot.
- `[SidebarMenu]` × 2 groups (Primary, Settings).
- `[SidebarFooter]` — `<ModeToggle>` + version text.
- `[SidebarInset]` — page-shell wrapper.
- `[Breadcrumb]` in the top bar.
- `<PageActions>` slot in the top bar — page renders into this for refresh / save / density toggle.

**Files**

- Replace `src/app/layout.tsx` → wrap children in `[SidebarProvider]` + `[Sidebar]` + `[SidebarInset]`.
- Delete `src/components/nav-bar.tsx`, `src/components/sidebar-nav.tsx`, `src/components/refresh-button.tsx` (refresh becomes a button in the inset top bar).
- Delete `src/app/config/layout.tsx` (the sub-sidebar dies; settings nav lives in the global sidebar).

---

## 1. `/` — Live View

```
┌─ top bar ───────────────────────────────────────────────────────┐
│ Live                                  [Refresh] [Density 2/3/4] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                │
│  │  3      │ │  12     │ │  ✓      │ │  2m ago │   ← stat tiles │
│  │ Online  │ │ 24h rec │ │ MediaMTX│ │ Last shot│              │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘                │
│                                                                 │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐    │
│  │ ● cam-front     │ │   cam-driveway  │ │   cam-garage    │    │
│  │ ┌─────────────┐ │ │ ┌─────────────┐ │ │ ┌─────────────┐ │    │
│  │ │   16:9      │ │ │ │   16:9      │ │ │ │   16:9      │ │    │
│  │ │  thumbnail  │ │ │ │  thumbnail  │ │ │ │  thumbnail  │ │    │
│  │ └─────────────┘ │ │ └─────────────┘ │ │ └─────────────┘ │    │
│  │ live · 3m ago  ⋮│ │ idle           ⋮│ │ idle           ⋮│    │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

**Components**

- `<StatTile>` × 4 — `Card` with title + big number/value. Reuse for each stat.
- `<StreamGrid>` — `[CSS grid]`, density 2/3/4 from `[ToggleGroup]` in top bar, persisted in `localStorage`.
- `<StreamCard>` — `[Card]` with:
  - `[AspectRatio ratio={16/9}]` over thumbnail / `<VideoPlayer>` swap.
  - Top-left overlay: red dot (live) or pause icon (idle) + relative time (`dayjs.fromNow`).
  - Top-right overlay: `[DropdownMenu]` kebab — items: View recordings, Stream info (instead of three separate buttons).
  - Click on the body toggles play / stop.
- `<EmptyState>` for the four error/empty cases (no config, no API, no remote URL, no streams) — uses shadcn `[Empty]`.

**State**

- URL: `?play=foo,bar` (renamed from `liveCams`).
- Local: `density` in `localStorage('liveDensity')`.

---

## 2. `/recordings` — Index

```
┌─ top bar ───────────────────────────────────────────────────────┐
│ Recordings                              [Search streams...]     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ │
│  │ ┌──────────────┐ │ │ ┌──────────────┐ │ │ ┌──────────────┐ │ │
│  │ │   thumbnail  │ │ │ │   thumbnail  │ │ │ │   thumbnail  │ │ │
│  │ └──────────────┘ │ │ └──────────────┘ │ │ └──────────────┘ │ │
│  │ cam-front        │ │ cam-driveway     │ │ cam-garage       │ │
│  │ 142 recordings   │ │ 30 recordings    │ │ 5 recordings     │ │
│  │ Latest: 2m ago   │ │ Latest: 1h ago   │ │ Latest: 3d ago   │ │
│  │           [View] │ │           [View] │ │           [View] │ │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**Components**

- `<RecordingsStreamCard>` — `[Card]` with:
  - `[AspectRatio 16/9]` `<Image src="/api/[stream]/first-screenshot">` (thumbnail of the stream itself).
  - Stream name as `[CardTitle]`.
  - Description: count + latest timestamp ("Latest: 2 minutes ago") via `dayjs.fromNow`.
  - Footer: `[Button]` "View".
- Top-bar `[Input type="search"]` filters client-side on stream name.
- `<EmptyState>` for the three error/empty cases.

**Data note**

The current query only returns counts. To show "Latest: …", extend `countFilesInSubdirectories` to also return `mtime` of the newest file per subdir. Trivial change.

---

## 3. `/recordings/[streamname]` — Per-stream browser

```
┌─ top bar ───────────────────────────────────────────────────────┐
│ Recordings › cam-front       [Search]  [Range ▾]  [25/page ▾]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Today                                                          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                │
│  │ 14:32   │ │ 13:55   │ │ 12:01   │ │ 09:18   │  ← 16:9 cards  │
│  │ 24 MB   │ │ 31 MB   │ │ 18 MB   │ │ 22 MB   │                │
│  │ ▷  ⤓  ⋮ │ │ ▷  ⤓  ⋮ │ │ ▷  ⤓  ⋮ │ │ ▷  ⤓  ⋮ │                │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘                │
│                                                                 │
│  Yesterday                                                      │
│  ┌─────────┐ ┌─────────┐ ...                                    │
│                                                                 │
│  ─────────────────────────────────────────────────────────      │
│           [<]  1  2  3  4  5  ...  [>]                          │
└─────────────────────────────────────────────────────────────────┘
```

**Components**

- `[Breadcrumb]` "Recordings / cam-front" (links the parent).
- Top-bar controls: `[Input search]`, `[Popover + Calendar]` date range, `[Select]` page size.
- Day group heading = a `<h3 class="text-sm font-medium text-muted-foreground">`.
- `<RecordingCard>` — `[Card]`:
  - `[AspectRatio 16/9]` thumbnail / inline `<video>` when active.
  - `[CardHeader]`: time `14:32:08` as title; right-side: `{fileSize} MB` muted.
  - `[CardFooter]`: play `[Button]`, `<DownloadButton>` (existing — keep), `[DropdownMenu]` kebab (Open in new tab, Copy URL, View metadata).
- `[Pagination]` block at bottom replaces "Showing X-Y of Z".

**State**

- URL: `?page`, `?take`, `?play=fileName`, `?q=search`, `?from=YYYY-MM-DD`, `?to=YYYY-MM-DD`.

---

## 4. `/config` — Client Config

```
┌─ top bar ────────────────────────────────────────────────────┐
│ Settings › Client                                            │
├──────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Application Settings                                   │  │
│  │ Connection and storage paths used by MediaMTX Connect. │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │ MediaMTX connection                                    │  │
│  │                                                        │  │
│  │   MediaMTX URL    [____________________]               │  │
│  │   Internal hostname or container name.                 │  │
│  │                                                        │  │
│  │   API port        [9997     ]                          │  │
│  │   Default 9997.                                        │  │
│  │                                                        │  │
│  │   Remote URL      [____________________]               │  │
│  │   Browser-reachable URL for HLS playback.              │  │
│  │ ────────────────────────────────────────────────       │  │
│  │ Storage                                                │  │
│  │                                                        │  │
│  │   Recordings dir  [/recordings           ]             │  │
│  │   Screenshots dir [/screenshots          ]             │  │
│  │                                                        │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │                                  [Reset]  [Save]       │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

**Components**

- `[Card]` with `[CardHeader]`, `[CardContent]`, `[CardFooter]`.
- `[Form]` (RHF + Zod) — keep the schema. **Stacked layout** — drop `<GridFormItem>` for this form. Use plain `[FormItem]` with `[FormLabel]` above `[FormControl]`.
- `[Separator]` between the two groups.
- Footer: `[Button variant="outline"]` Reset (calls `form.reset(defaultValues)`) + `[Button type="submit"]` Save (disabled when not dirty/valid). Submit always at the **bottom** of the card.

---

## 5. `/config/mediamtx/global` — MediaMTX Global Config

```
┌─ top bar ──────────────────────────────────────────────────────────┐
│ Settings › MediaMTX                          [Search fields  ⌘K]   │
├────────────────────────────────────────────────────────────────────┤
│  ┌─ Tabs ───────────────────────────────────────────────────────┐  │
│  │ [Logging] [API] [Hooks] [RTSP] [RTMP] [HLS] [WebRTC] [SRT]   │  │
│  │                                                       [Rec.] │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌─ Card: HLS ──────────────────────────────────────────────────┐  │
│  │ HLS server                                                   │  │
│  │   Enabled                          [Switch ━●━]              │  │
│  │   Address          [:8888                  ]                 │  │
│  │   Encryption                       [Switch ━━○]              │  │
│  │   Certificate     [_______________________]                  │  │
│  │ ──────────────────────────────────────────────────────       │  │
│  │ Segments                                                     │  │
│  │   Segment count    [7         ]                              │  │
│  │   Segment duration [1s        ]                              │  │
│  │   Part duration    [200ms     ]                              │  │
│  │   Always remux                     [Switch ━●━]              │  │
│  │ ──────────────────────────────────────────────────────       │  │
│  │ CORS / Proxies                                               │  │
│  │   Allow origin    [*           ]                             │  │
│  │   Trusted proxies [Textarea (newline)                  ]     │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
├─ sticky save bar ──────────────────────────────────────────────────┤
│ 3 unsaved changes              [Discard]   [Save changes]          │
└────────────────────────────────────────────────────────────────────┘
```

**Components**

- `[Tabs]` with one `[TabsTrigger]` per section.
- Each `[TabsContent]` contains 1+ `[Card]` for sub-grouping.
- `[Switch]` for booleans.
- `[Input]` / `[Input type="number"]` for scalars.
- `[Textarea]` for newline-separated lists (keep existing helpers).
- `<IceServersFieldArray>` — `useFieldArray`, render as a `[Card]` with "Add server" + a list of removable rows. Drop the `{password: 'a'}` placeholder.
- `[Command]` palette (`⌘K`) — single search index of all field labels; selecting jumps to the tab and scrolls to the field (use `field.ref` + `scrollIntoView`).
- **Sticky save bar** — full-width `div` fixed/sticky at the bottom of `[SidebarInset]` content. Shows `formState.dirtyFields` count, `Discard` (`form.reset`) and `Save changes` (`form.handleSubmit`).

### Per-tab field lists

Direct mapping from existing schema (no schema changes needed).

| Tab | Subsections / fields |
|---|---|
| **Logging** | logLevel, logDestinations (textarea), logFile |
| **Limits** *(merged into Logging tab as a second card)* | readTimeout, writeTimeout, writeQueueSize, udpMaxPayloadSize, externalAuthenticationURL |
| **API** | api (switch), apiAddress · metrics (switch), metricsAddress · pprof (switch), pprofAddress |
| **Hooks** | runOnConnect, runOnConnectRestart (switch), runOnDisconnect |
| **RTSP** | Server: rtsp (switch), rtspAddress, rtpAddress, rtcpAddress, multicastIPRange, multicastRTPPort, multicastRTCPPort, protocols (textarea) · TLS: encryption, serverKey, serverCert · Auth: authMethods (textarea) |
| **RTMP** | rtmp (switch), rtmpAddress, rtmpEncryption, rtmpsAddress, rtmpServerKey, rtmpServerCert |
| **HLS** | Server: hls (switch), hlsAddress, hlsEncryption (switch), hlsServerKey, hlsServerCert · Segments: hlsAlwaysRemux (switch), hlsVariant, hlsSegmentCount, hlsSegmentDuration, hlsPartDuration, hlsSegmentMaxSize · CORS: hlsAllowOrigin, hlsTrustedProxies (textarea), hlsDirectory |
| **WebRTC** | Server: webrtc (switch), webrtcAddress, webrtcEncryption (switch), webrtcServerKey, webrtcServerCert · Network: webrtcAllowOrigin, webrtcTrustedProxies (textarea), webrtcLocalUDPAddress, webrtcLocalTCPAddress, webrtcIPsFromInterfaces (switch), webrtcIPsFromInterfacesList (textarea), webrtcAdditionalHosts (textarea) · ICE Servers: webrtcICEServers2 (FieldArray) |
| **SRT** | srt (switch), srtAddress |

**Note:** "Recording" exists in the schema but the existing form omits it. Keep parity with the existing form for v1; add a "Recording" tab in v2 if/when needed.

---

## 6. Empty / error state primitive

A single `<EmptyState>` wrapper used everywhere.

```
<EmptyState
  icon={AlertTriangle}
  title="Cannot connect to MediaMTX"
  description="Unable to reach http://mediamtx:9997"
  actions={[
    { label: 'Retry', onClick: refresh },
    { label: 'Open config', href: '/config', variant: 'outline' },
  ]}
/>
```

Replaces today's mix of `<Alert variant="destructive">` and ad-hoc card layouts in:

- LiveViewPage (4 states)
- RecordingsIndexPage (3 states)
- StreamRecordingsPage (1 state)
- ClientConfigPage / MediaMTXConfigPage (any future)

Implementation = thin wrapper around shadcn's new `[Empty]` block (added 2025).

---

## 7. Component delete / keep / new list

**Delete (no longer needed):**

- `src/components/nav-bar.tsx` — replaced by `[Sidebar]`.
- `src/components/sidebar-nav.tsx` — replaced by `[SidebarMenu]`.
- `src/components/refresh-button.tsx` — replaced by an inline `[Button]` in the top bar.
- `src/components/grid-form-item.tsx` — replaced by stacked `[FormItem]`.
- `src/components/grid-layout.tsx` — replaced by `<StreamGrid>` + a 2-3 line CSS grid div.
- `src/components/page-skeleton.tsx` — replaced by per-page skeletons (or removed entirely; Suspense fallbacks become small).
- `src/components/page-layout.tsx` — replaced by the global `[SidebarInset]` top-bar.

**Keep (unchanged):**

- `src/components/video-player.tsx` (HLS.js wrapper).
- `src/components/mode-toggle.tsx`.
- `src/components/theme-provider.tsx`.
- `src/components/service-worker.tsx`.
- `src/features/recordings/download-button.tsx`.

**New:**

- `src/components/app-sidebar.tsx` — the `[Sidebar]` block adapted to our routes.
- `src/components/page-header.tsx` — the `[SidebarInset]` top bar + `[Breadcrumb]` + actions slot.
- `src/components/empty-state.tsx` — wrapper around `[Empty]`.
- `src/features/streams/stream-grid.tsx` — density-aware grid (replaces `<GridLayout>` for live view).
- `src/features/mediamtx-config/sticky-save-bar.tsx` — sticky save bar (only this page needs it).
- `src/features/mediamtx-config/field-search.tsx` — `⌘K` field search.
