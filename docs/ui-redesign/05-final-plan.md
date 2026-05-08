# Step 5 — Final Implementation Plan

The actionable plan. Read steps 1-4 first; this doc is the order-of-operations distillation.

## Guiding rules

1. **Boring over clever.** Every component comes from shadcn. No bespoke layout primitives.
2. **One PR per phase.** Each phase below is independently shippable; CI stays green at every step.
3. **No backend changes.** Server actions / queries / Prisma schema are untouched. Only `recordings.queries.ts` may grow a `latestMtime` field (Phase 4) — additive only.
4. **Update `docs/FEATURES.md`** in the same PR that ships each phase, per the project's hard rule.

## Phase 0 — Component install (small, reviewable PR)

```bash
npx shadcn@latest add sidebar breadcrumb tabs switch sonner empty pagination command dialog aspect-ratio toggle-group tooltip badge scroll-area calendar
```

**Acceptance**

- `npm run typecheck`, `npm run lint`, `npm run build` all green.
- New files appear under `src/components/ui/`.
- `globals.css` gets `--sidebar-*` CSS vars from the sidebar install.
- No usage yet — this PR only adds the primitives. Old UI keeps working.

---

## Phase 1 — App shell (sidebar + breadcrumb top bar)

**Goal:** Replace `NavBar` + `RefreshButton` + the in-page `<SidebarNav>` for `/config` with one global `Sidebar` + `SidebarInset` chrome.

**Add**

- `src/components/app-sidebar.tsx` — adapts `sidebar-07` block:
  - Header: app name "Connect" + green/red status dot.
  - Group "Application": Live (`/`), Recordings (`/recordings`).
  - Group "Settings": Client (`/config`), MediaMTX (`/config/mediamtx/global`).
  - Footer: `<ModeToggle>` + version (read from `package.json` at build time, or hard-code).
- `src/components/page-header.tsx` — `SidebarTrigger` + `Breadcrumb` + actions slot.

**Edit**

- `src/app/layout.tsx` — wrap in `SidebarProvider` + `<AppSidebar>` + `<SidebarInset>`. Mount `<Toaster />` from `@/components/ui/sonner` (replace legacy toaster).
- Every page (`page.tsx` × 5) — add a `<PageHeader breadcrumb={…} actions={…} />` at the top, drop `<PageLayout header subHeader>`.

**Delete**

- `src/components/nav-bar.tsx`
- `src/components/sidebar-nav.tsx`
- `src/components/refresh-button.tsx`
- `src/components/page-layout.tsx`
- `src/app/config/layout.tsx`

**Migrate toasts (same PR)**

- Replace `useToast()` + `toast({ title, variant })` with `import { toast } from 'sonner'` + `toast.success(…)` / `toast.error(…)` in:
  - `src/features/client-config/client-config-form.tsx`
  - `src/features/mediamtx-config/mediamtx-config-form.tsx`
  - `src/features/recordings/download-button.tsx`
- Delete `src/components/ui/toast.tsx`, `toaster.tsx`, `use-toast.ts`, `form-context.ts` (after grep confirms no other refs).

**Acceptance**

- All five existing pages render with the new shell.
- Mobile: sidebar collapses to a sheet via `SidebarTrigger`.
- E2E (`tests/e2e/streams.spec.ts`, `recordings.spec.ts`, `config.spec.ts`) — update selectors but keep the assertions; suite stays green.

---

## Phase 2 — Empty / error state primitive

**Goal:** Replace ad-hoc `<Alert>` / `<Card>` empty states with a single `<EmptyState>` wrapper around `[Empty]`.

**Add**

- `src/components/empty-state.tsx` — wrapper:
  ```tsx
  <EmptyState
    icon={AlertTriangle}
    title="…"
    description="…"
    actions={[{ label: 'Retry', onClick: … }]}
  />
  ```

**Edit**

- `src/features/streams/live-view-page.tsx` — collapse the 4 `<Alert>` blocks to `<EmptyState>` with `variant="destructive"` only on the unreachable case.
- `src/features/recordings/recordings-index-page.tsx` — same pattern.
- `src/features/recordings/stream-recordings-page.tsx` — same pattern.

**Acceptance**

- `tests/e2e/streams.spec.ts` connection-state cases still pass (titles unchanged: "Cannot connect to MediaMTX", "Configure Remote URL", "No Active Streams"). Update selectors to point at the Empty component.

---

## Phase 3 — Live View page

**Goal:** Tightened, NVR-style live grid.

**Add**

- `src/features/streams/stream-grid.tsx` — density-aware grid (replaces `<GridLayout columnLayout="small">` for live view). Reads `density` from `localStorage('liveDensity')`, falls back to 3.
- `<DensityToggle>` in `<PageHeader actions>` — `[ToggleGroup]` 2 / 3 / 4. Writes `localStorage`.
- 4 stat tiles in a row above the grid (Streams Online, 24h recordings, MediaMTX Reachable, Last screenshot age). Each is a small `[Card]`.

**Edit**

- `src/features/streams/stream-card.tsx`:
  - Wrap thumbnail / `<VideoPlayer>` in `[AspectRatio ratio={16/9}]`. Drop `aspect-square`.
  - Header: stream name as `[CardTitle]` with a `[Badge variant="destructive"]` "LIVE" when actively playing; relative-time text under the title.
  - Replace 3-button toolbar with: click body to play/stop + `[DropdownMenu]` kebab (View recordings, Stream info).
- URL key: rename `?liveCams=…` → `?play=…`. Search-and-replace in `stream-card.tsx` and any test asserting on the URL.

**Acceptance**

- `tests/e2e/streams.spec.ts` — update selectors. Still asserts: 4 connection states, card with name, click→play, info popover content.
- 16:9 layout — verify on desktop + mobile.

---

## Phase 4 — Recordings index page

**Goal:** Card grid with thumbnail + latest-recording timestamp.

**Edit**

- `src/features/recordings/file-operations.ts` — `countFilesInSubdirectories` now returns `{ count: number, latestMtime: Date | null }` per stream. Trivial `fs.statSync` walk.
- `src/features/recordings/recordings-index-page.tsx` — render new card layout (16:9 thumbnail via `/api/[stream]/first-screenshot`, name as `[CardTitle]`, `count + dayjs(latest).fromNow()` as description, `[Button]` "View" in `[CardFooter]`).
- `<PageHeader actions>` — `[Input type="search" placeholder="Search streams"]` filters client-side.

**Acceptance**

- `tests/e2e/recordings.spec.ts` index assertions still pass (cards render per stream, "View" button navigates).
- New `dayjs.relativeTime` plugin must be loaded — add to `dayjs` import shim.
- `docs/FEATURES.md` §2.1 updated: card now shows latest-recording timestamp.

---

## Phase 5 — Per-stream recordings page

**Goal:** Date-grouped media library with proper pagination.

**Edit**

- `src/features/recordings/stream-recordings-page.tsx`:
  - Top header: `[Breadcrumb]` Recordings → {streamName} (in `<PageHeader breadcrumb>`).
  - Top-right actions: `[Input search]`, `[Popover + Calendar]` date range, `[Select]` 10/25/50.
  - Group recordings by `dayjs(createdAt).startOf('day')` — render `Today / Yesterday / Mon May 5` headings.
  - Replace the chevron+text pagination with `[Pagination]` block at the bottom.
- `src/features/recordings/recording-card.tsx`:
  - Wrap thumbnail / `<video>` in `[AspectRatio 16/9]`.
  - Header: time only (`HH:mm:ss`) as title, `{N} MB` muted on the right.
  - Footer: play `[Button]` + existing `<DownloadButton>` + `[DropdownMenu]` kebab (Open in new tab, Copy URL, Metadata).
  - Stop using `?liveCams=` — switch to `?play={fileName}` (rename in `searchParams.get/set` calls).

**Acceptance**

- `tests/e2e/recordings.spec.ts` per-stream assertions still pass (cards render, pagination navigates).
- New URL params `?play`, `?q`, `?from`, `?to` are additive — old URLs without them still work.
- `docs/FEATURES.md` §2.2-§2.3 updated.

---

## Phase 6 — Client Config page

**Goal:** Card-wrapped form with stacked inputs and save bar at the bottom.

**Edit**

- `src/features/client-config/client-config-form.tsx`:
  - Wrap form in `[Card]` with header "Application Settings".
  - Drop `<GridFormItem>` for this form. Use stock `[FormItem] > [FormLabel] + [FormControl] + [FormDescription]`.
  - Two groups separated by `[Separator]`: "MediaMTX connection" (3 fields), "Storage" (2 fields).
  - Move `Submit` to `[CardFooter]` at the bottom. Add `[Button variant="outline"]` "Reset" that calls `form.reset(defaultValues)` — only enabled when `formState.isDirty`.

**Acceptance**

- `tests/e2e/config.spec.ts` — same assertions, updated selectors. Save round-trip still works.
- `docs/FEATURES.md` §3.1 updated with new form structure.

---

## Phase 7 — MediaMTX Global Config page (the big one)

This is the largest change. Ship behind no flag, but in two sub-phases:

### 7a. Tabs + Switch + section cards (no save bar yet)

**Add**

- `src/features/mediamtx-config/sections/` — one component per tab: `LoggingSection.tsx`, `ApiSection.tsx`, `HooksSection.tsx`, `RtspSection.tsx`, `RtmpSection.tsx`, `HlsSection.tsx`, `WebrtcSection.tsx`, `SrtSection.tsx`. Each renders a `[Card]` per subsection. Map fields per the table in `03-blueprints.md` §5.

**Edit**

- `src/features/mediamtx-config/mediamtx-config-form.tsx`:
  - Wrap in `[Tabs defaultValue="logging"]`.
  - Body becomes `<TabsContent value="…"><LoggingSection /></TabsContent>` × N.
  - Replace every `Select` "True"/"False" with `[Switch]` (use the canonical shadcn settings-form FormItem pattern from `04-shadcn-inventory.md` §E).
  - Drop the `{password: 'a', url: 'b', username: 'c'}` placeholder in `useFieldArray.append`. Use `{ url: '', username: '', password: '' }`.
  - Fill in short `FormDescription` strings for the most-touched fields (RTSP/RTMP/HLS/WebRTC enable+address). Sourced from MediaMTX docs.

**Acceptance**

- `tests/e2e/config.spec.ts` — extend with a "switch tab" assertion. All 75 fields still render and submit.
- `tests/mediamtx-config.schemas.test.ts` — unchanged; schema isn't touched.
- `docs/FEATURES.md` §3.2 updated to reflect tab structure.

### 7b. Sticky save bar + dirty count + ⌘K field search

**Add**

- `src/features/mediamtx-config/sticky-save-bar.tsx` — sticky-bottom `<div>` inside `[SidebarInset]`. Reads `formState.dirtyFields`, shows `n unsaved changes`, `Discard` (`form.reset(globalConf)`) + `Save changes` (`form.handleSubmit(onSubmit)`).
- `src/features/mediamtx-config/field-search.tsx` — `[Command]` palette (mounted in a `[Dialog]`, trigger `⌘K`). Single hard-coded list of `{ label, fieldName, tab }` for all 75 fields. On select: `setActiveTab(tab); element.scrollIntoView()`.
- `[Badge]` next to each `[TabsTrigger]` showing `Object.keys(formState.errors).filter(matchesTab).length` when > 0.

**Edit**

- `src/features/mediamtx-config/mediamtx-config-form.tsx` — drop the top-right Submit button (the sticky bar replaces it).

**Acceptance**

- `tests/e2e/config.spec.ts` — assert the sticky bar appears on edit and disappears after save.
- `⌘K` is keyboard-only — add a small "Search fields" `[Button]` in `<PageHeader actions>` that opens the same dialog for mouse users.

---

## Phase 8 — Cleanup

**Delete**

- `src/components/grid-layout.tsx` — last user (`live-view-page.tsx`) replaced in Phase 3; recordings pages replaced in 4-5.
- `src/components/grid-form-item.tsx` — replaced by stock `FormItem` in Phases 6 + 7.
- `src/components/page-skeleton.tsx` and `src/app/loading.tsx`'s usage — page-shape-aware skeletons live with their pages now (or skip Suspense for these pages — they're already `force-dynamic`).
- Remaining legacy `toast` files (toast.tsx, toaster.tsx, use-toast.ts) — verified-unused.

**Acceptance**

- Repo grep for `<NavBar`, `<PageLayout`, `<GridLayout`, `<GridFormItem`, `<SidebarNav`, `useToast`, `from '@/components/ui/toaster'` — zero hits.
- `docs/FEATURES.md` §8 updated to reflect the trimmed `src/components/` directory.

---

## Total scope at a glance

| Add | Edit | Delete |
|---|---|---|
| `app-sidebar.tsx`, `page-header.tsx`, `empty-state.tsx`, `stream-grid.tsx`, `mediamtx-config/sections/*` (8 files), `sticky-save-bar.tsx`, `field-search.tsx` + 15 shadcn primitives | 5 page components, 2 card components, 3 form components | 7 component files (`nav-bar`, `sidebar-nav`, `refresh-button`, `page-layout`, `page-skeleton`, `grid-layout`, `grid-form-item`) + 1 layout (`config/layout.tsx`) + legacy toast files |

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| E2E selectors break on every phase | Each phase updates only the touched specs; CI runs the full suite per PR. Use semantic selectors (`getByRole`, `getByText`) over class-based ones. |
| `Sidebar` CSS variables collide with existing theme | Sidebar install adds `--sidebar-*` only — orthogonal to existing `--background`/`--foreground`. Verify dark theme in Phase 1. |
| `sonner` mounting position differs from legacy Toaster | Mount once in `layout.tsx`. Default position (`bottom-right`) is fine; don't override. |
| MediaMTX form `Switch` migration loses default values | The schema already coerces booleans. `Switch checked={field.value}` works directly with the existing schema. Verified by `mediamtx-config.schemas.test.ts`. |
| URL param rename `liveCams` → `play` breaks deep links | Live View and Recordings used the same key. Rename is intentional (they're semantically different). Deep-link breakage is acceptable for this app (it's not a public-facing site). Communicate in the PR / `CHANGELOG`. |

## Phase ordering rationale

- Phase 0 first — adding primitives is risk-free and unblocks all later phases.
- Phase 1 (shell) before pages — every page wants the new top-bar, so doing the shell first lets each subsequent phase be a smaller diff.
- Phase 2 (empty state) before pages 3-5 — the new empty-state primitive is used by all of them; landing it first avoids duplicated migration work.
- Phases 3-7 are independent within themselves and could be parallelized if multiple devs are involved; otherwise tackle in this order (live view first because it's the smallest payoff:effort, MediaMTX config last because it's the biggest).
- Phase 8 (cleanup) is a final sweep — only safe once nothing references the deleted files.
