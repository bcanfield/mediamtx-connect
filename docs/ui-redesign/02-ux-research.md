# Step 2 — Optimal UX per Page

For each page, the **minimum viable upgrade** that aligns with mainstream patterns. We deliberately skip clever / custom ideas.

References used:

- shadcn/ui Blocks (sidebar, dashboard, settings) — [shadcn/ui blocks](https://ui.shadcn.com/blocks)
- NVR conventions — Reolink, Hikvision, UniFi Protect, camera.ui
- Long settings forms — Stripe Dashboard, Linear, Vercel project settings, GitHub repo settings
- Media library list-vs-grid — WordPress Media Library, Arlo Library, Plex
- Sticky save bar — Smashing Magazine "[Sticky Menus: UX Guidelines](https://www.smashingmagazine.com/2023/05/sticky-menus-ux-guidelines/)"

## A. Cross-cutting patterns to adopt

These apply to every page.

| Pattern | Use shadcn block | Rationale |
|---|---|---|
| **Single dashboard sidebar layout** for the whole app (collapsible to icons) | `dashboard-01` block + `Sidebar` primitive | Replaces the current top-only navbar. One nav for Live, Recordings, Config — and Config sub-items live inside the sidebar tree, removing the bespoke `SidebarNav` in `config/layout.tsx`. |
| **Top inset bar** with breadcrumb + page title + page-level actions | `SidebarInset` + `Breadcrumb` | Gives every page a consistent header area with a place for "Refresh", "Save", grid-density toggle, etc. |
| **`Sonner` toast** instead of the legacy Toaster | `sonner` | shadcn's toast is now `sonner`. Lower visual noise, better stacking, matches current best practice. |
| **`Switch` for booleans, not `Select` "True/False"** | `switch` | Standard. The MediaMTX form has ~25 boolean fields rendered as 2-option selects. |
| **Loading states via `Skeleton`** wrapped in `Suspense` | already have | Keep — but make `<PageSkeleton>` page-shape-aware, not a generic 4-tile stub. |
| **Empty states are a single primitive** with icon + title + description + CTA | shadcn `empty` (new in 2025) | Replaces the inconsistent `<Alert>`/`<Card>` empty states across pages. |

## B. `/` — Live View

### What users want here

> "Show me my cameras. Let me play one or all of them. Tell me which ones are healthy."

### Pattern: dashboard with stat strip + grid

1. **Stat strip** at the top — 3-4 small `Card` tiles: `Streams Online`, `Recordings (24h)`, `MediaMTX Reachable: yes/no`, `Last screenshot age`. Comes free with shadcn `dashboard-01` block.
2. **Grid density toggle** in the page-header bar (e.g. `ToggleGroup` 2 / 3 / 4 cols) — mirrors NVR convention (View 4 / View 9 / View 16). Persist in `localStorage`.
3. **"Play all" / "Stop all"** buttons in the page-header bar.
4. **Camera tiles**: 16:9 aspect ratio (not square), thumbnail by default, click → play in place. A red "live" dot + relative time ("started 3m ago") in the corner over the thumbnail. Recordings shortcut + info popover collapse into a single `DropdownMenu` triggered by a kebab.
5. **Connection-state precedence** (single source of truth, in this order):
   1. No DB config → `Empty` with "Reconfigure" CTA → `/config`.
   2. MediaMTX unreachable → `Alert variant="destructive"` with `Retry` and `Open config` actions.
   3. Reachable, no `remoteMediaMtxUrl` → `Alert variant="default"` with `Set remote URL` CTA.
   4. Reachable, no streams → `Empty` with stream-name code-block hint and "How to publish" link.
   5. All good → grid.

The current code already has this hierarchy; we just standardize the rendering.

## C. `/recordings` — Index

### What users want here

> "Show me which cameras have recordings, how many, and the latest one."

### Pattern: data-table OR card grid (pick one — not both)

Two equally valid patterns:

- **Table** (`data-table` block) — best when most users have ≥6 streams. Columns: thumbnail, stream, recording count, total size, latest recording, View. Sortable, searchable.
- **Card grid with thumbnail** — best when users have ≤6 streams. Each card: stream thumbnail (from `/api/[stream]/first-screenshot`), name, count, latest recording, "View" button.

**Recommendation: card grid with thumbnail.** Most MediaMTX deployments are home / small-business and have a handful of cameras. Cards reuse the live-view tile aesthetic. The table is overkill here and creates an inconsistent visual.

Add: **search input** at the top to filter by stream name (free with the page-header bar).

## D. `/recordings/[streamname]` — Per-stream browser

### What users want here

> "Find a specific recording — by date, then play or download it."

### Pattern: media library with date grouping

1. **Breadcrumb** `Recordings → {streamName}` in the page header. (Currently missing.)
2. **Header bar** with: stream name title, "Back to all streams" link, search input (filename), date range picker, page-size selector (10/25/50).
3. **Group recordings by day** — `dayjs` formatted "Today", "Yesterday", "Mon, May 5". Heading + grid of cards under each. This pattern is used by Arlo, Nest, Plex.
4. **Recording card**:
   - 16:9 thumbnail (not square).
   - Title: time only (`14:32:08`) — the day is already in the group heading.
   - Subtitle: file size + duration (we don't read duration today, but it's free-ish from `ffprobe`; defer to v2).
   - Hover/tap → play inline (`<video>` already streams from `view-recording`).
   - Trailing: download button (icon-only, with tooltip), kebab menu (info, copy link).
5. **Pagination as `Pagination` block** at the bottom (chevrons + numbered pages + page-size). Replace the "Showing 0-10 of 50" text with `Pagination` component.
6. **URL key**: stop reusing `?liveCams=`. Use `?play={fileName}` for the inline-playing recording.

## E. `/config` — Client Config

### What users want here

> "Edit 5 settings. Save them. See if MediaMTX is reachable."

### Pattern: simple settings card

This page is small (5 fields). Don't over-engineer it.

1. **`Card`** wrapping the form, with a `CardHeader` "Application Settings" + description.
2. **Two logical groups separated by `Separator`**:
   - **MediaMTX connection**: `mediaMtxUrl`, `mediaMtxApiPort`, `remoteMediaMtxUrl`.
   - **Storage**: `recordingsDirectory`, `screenshotsDirectory`.
3. **Save bar at the bottom of the card** — `Button type="submit"` + secondary `Cancel` (resets the form). Standard pattern.
4. **"Test connection" button** next to the MediaMTX fields — calls `pathsList` server-side, shows `CheckCircle` / `AlertCircle` inline. (Optional v2.)
5. **Inline field descriptions stay** as `FormDescription`.
6. **Form layout switches from `grid-cols-2` (label/control) to stacked label-above-input.** Two-column form rows feel cramped on mobile and modern shadcn forms are stacked by default.

## F. `/config/mediamtx/global` — MediaMTX Global Config

### What users want here

> "Find the one field I want to change in 75 fields. Save without losing my place."

This is **the** page that needs the most UX work.

### Pattern: Tabs OR Sections-with-anchored-side-nav (pick Tabs)

1. **`Tabs`** at the top, one per logical section: `Logging`, `API`, `RTSP`, `RTMP`, `HLS`, `WebRTC`, `SRT`, `Recording`. Renders only the active tab's fields → smaller DOM, faster, less overwhelming.
2. **Each tab body** = one shadcn `Card` per subsection (e.g., RTSP → "Server", "Encryption", "Auth").
3. **Sticky save bar** at the bottom of the page (and visible inside every tab) with `Save changes` + `Discard` + dirty-state count ("3 changes"). Pattern used by Vercel/GitHub/Linear settings. Smashing Magazine's [sticky menus guide](https://www.smashingmagazine.com/2023/05/sticky-menus-ux-guidelines/) recommends a compact, dismissible bar. shadcn's `dashboard-04` block has this pattern.
4. **Search input** in the page header that filters fields by label across all tabs (free — shadcn `Command` palette, `cmd+k`). For 75 fields this beats a side TOC.
5. **Boolean fields → `Switch`** (right-aligned) inside a `FormItem` row with `FormLabel` left + `FormDescription` below the label. This is the exact pattern shadcn shows in its "Settings" form examples.
6. **List fields (newline-split textarea)** stay as `Textarea` but get a small "comma- or newline-separated" `FormDescription`.
7. **ICE Servers** uses a `Card` with `Add server` button at the top, removable rows. Keep `useFieldArray`. Drop the placeholder default (`{password: 'a', url: 'b', username: 'c'}`) — start with empty strings.
8. **Field descriptions get filled in.** Currently every `<FormDescription />` is empty; we copy short MediaMTX docstrings (1 line each) for the most common fields.

### Why tabs over a single long form

- The current form is ~1400 lines / ~75 fields in one column with no headings. Users genuinely cannot tell which `address` field belongs to which transport.
- A tabbed form is the dominant pattern for protocol-level configuration UIs (e.g., HAProxy Data Plane, Traefik, Caddy admin UIs, Nginx Proxy Manager).
- Tabs let us add `formState.errors`-derived badges per section ("RTSP (2 errors)") without a global re-layout.

## G. App chrome — global

### Pattern: shadcn dashboard sidebar

Use the shadcn `sidebar-07` block (collapsible-icon sidebar) verbatim:

- **Sidebar header**: app name "MediaMTX Connect" + small status dot (green if reachable, red if not).
- **Primary nav group**:
  - `Live` (Home icon) → `/`.
  - `Recordings` (Film icon) → `/recordings`.
- **Settings nav group** (always expanded on the matching route):
  - `Client` → `/config`.
  - `MediaMTX` → `/config/mediamtx/global`.
- **Sidebar footer**: theme toggle + version number.
- **Top bar (`SidebarInset` header)**: `SidebarTrigger` (the only mobile menu we need — drops the bespoke DropdownMenu in `nav-bar.tsx`) + `Breadcrumb` + page-level actions slot.

The bespoke `<NavBar>`, the DropdownMenu mobile menu, the `<RefreshButton>` in the navbar, and the in-page `<SidebarNav>` for `/config` all collapse into this one structure.

---

## Sources

- [shadcn/ui Blocks](https://ui.shadcn.com/blocks)
- [shadcn Sidebar primitive docs](https://ui.shadcn.com/docs/components/radix/sidebar)
- [Smashing Magazine — Sticky Menus: UX Guidelines](https://www.smashingmagazine.com/2023/05/sticky-menus-ux-guidelines/)
- [20 Best Dashboard UI/UX Design Principles](https://medium.com/@allclonescript/20-best-dashboard-ui-ux-design-principles-you-need-in-2025-30b661f2f795)
- [seydx/camera.ui (NVR-style RTSP UI reference)](https://github.com/seydx/camera.ui)
- [Reolink — How to Live View Multiple Cameras](https://support.reolink.com/hc/en-us/articles/12784252003737-How-to-Live-View-Multiple-Cameras/)
- [Arlo Library/Feed user discussion (list vs grid for recordings)](https://community.arlo.com/t5/Arlo-Video-Doorbell/New-Arlo-Feed-instead-of-Library-no-grid-view-just-long-list-of/m-p/2430593)
- [WordPress Media Library — list/grid view](https://wordpress.org/documentation/article/media-library-screen/)
