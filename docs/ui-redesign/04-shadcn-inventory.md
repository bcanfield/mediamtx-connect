# Step 4 — shadcn Components & Blocks Inventory

This is the install list. Everything below is from the official shadcn registry — no third-party block libraries, no custom design tokens. Install with `npx shadcn@latest add <name>`.

## A. Already installed (in `src/components/ui/`)

Keep using as-is:

- `button` (`src/components/ui/button.tsx`, `button-variants.ts`)
- `input`
- `textarea`
- `label`
- `select`
- `form` (RHF integration)
- `card`
- `alert`
- `popover`
- `dropdown-menu`
- `separator`
- `progress`
- `skeleton`
- `toast` / `toaster` / `use-toast` ← **migrate these to `sonner`** (see B)

## B. Components to add

| Component | Install | Used for |
|---|---|---|
| `sidebar` | `npx shadcn@latest add sidebar` | The new global app shell. Includes `SidebarProvider`, `Sidebar`, `SidebarHeader`, `SidebarContent`, `SidebarFooter`, `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton`, `SidebarTrigger`, `SidebarInset`, `SidebarRail`. Adds the required CSS variables (`--sidebar-background`, `--sidebar-foreground`, etc.) to `app/globals.css`. |
| `breadcrumb` | `npx shadcn@latest add breadcrumb` | Top-bar breadcrumb on every page. |
| `tabs` | `npx shadcn@latest add tabs` | MediaMTX config sectioning. |
| `switch` | `npx shadcn@latest add switch` | Replace `Select "True"/"False"` for ~25 boolean fields in MediaMTX config. |
| `sonner` | `npx shadcn@latest add sonner` | Replaces `toast` / `toaster` / `use-toast`. After install, mount `<Toaster />` from `@/components/ui/sonner` in root layout, and replace `useToast()` calls with `import { toast } from 'sonner'`. |
| `empty` | `npx shadcn@latest add empty` | Single empty/error-state primitive used across all pages. Sub-components: `Empty`, `EmptyHeader`, `EmptyMedia`, `EmptyTitle`, `EmptyDescription`, `EmptyContent`. |
| `pagination` | `npx shadcn@latest add pagination` | Per-stream recordings page bottom pagination (replaces the right-aligned chevrons + text). |
| `command` | `npx shadcn@latest add command` | `⌘K` field search inside MediaMTX config. |
| `dialog` | `npx shadcn@latest add dialog` | Wraps the `command` palette as a modal. Used by `command` block patterns. |
| `aspect-ratio` | `npx shadcn@latest add aspect-ratio` | 16:9 stream / recording thumbnails. |
| `toggle-group` | `npx shadcn@latest add toggle-group` | Live-view density selector (2 / 3 / 4 cols). |
| `tooltip` | `npx shadcn@latest add tooltip` | Icon-only buttons (download, kebab actions, sidebar collapsed icons). |
| `badge` | `npx shadcn@latest add badge` | "live" indicator on stream cards, "n errors" counters on tab triggers, "3 unsaved" on save bar. |
| `scroll-area` | `npx shadcn@latest add scroll-area` | Sidebar nav (long lists) and ICE-servers list. |
| `calendar` | `npx shadcn@latest add calendar` | Date-range filter on per-stream recordings page. |
| `sheet` | `npx shadcn@latest add sheet` | Mobile sidebar (auto-used by the `sidebar` component on small screens — installs `sheet` as a peer). |

> The `sidebar` install pulls in `sheet` and `tooltip` as dependencies; listed separately for clarity.

## C. Blocks to use as starting points

Blocks are full-page reference layouts. Install once, then pare down to fit.

| Block | ID | Usage |
|---|---|---|
| **Collapsible icon sidebar** | `sidebar-07` | The global app shell. We'll trim its workspace switcher / footer user-menu and keep the structure: header (brand) + two `SidebarGroup`s (Primary nav, Settings nav) + footer (theme toggle + version). Install: `npx shadcn@latest add sidebar-07`. |
| **Inset sidebar with secondary nav** | `sidebar-08` | Reference for how to wire a `[Breadcrumb]` into the `SidebarInset` top bar. We borrow the inset-header pattern, not the secondary-nav. |
| **Dashboard with sidebar, charts, table** | `dashboard-01` | Reference for the **Live View** stat strip + grid layout + page header. We keep the layout shell, drop the charts (we don't have time-series data), keep the four `Card` stat tiles. |

We deliberately **don't** install heavier blocks (`login-*`, `signup-*`, `data-table` block, `calendar` block) — none apply.

## D. Component → page mapping

Reverse mapping so we can see what each page touches.

### Global shell

`sidebar`, `breadcrumb`, `tooltip`, `scroll-area`, `sheet` (auto), `dropdown-menu` (existing), `sonner`.

### `/` Live View

`card` + `aspect-ratio` (StreamCard), `dropdown-menu` (kebab), `badge` (live dot), `toggle-group` (density), `button` (Refresh, Play all), `empty` (4 states), `skeleton` (loading), `tooltip`.

### `/recordings` index

`card` + `aspect-ratio` (per-stream tile), `input` (search), `button`, `empty`, `skeleton`.

### `/recordings/[streamname]`

`card` + `aspect-ratio` (RecordingCard), `dropdown-menu` (kebab), `button` (download — keep existing `<DownloadButton>`), `pagination`, `input` (search), `popover` + `calendar` (date range), `select` (page size), `breadcrumb`, `empty`, `skeleton`, `progress` (existing — used by DownloadButton).

### `/config` Client Config

`card`, `form`, `input`, `label`, `separator`, `button`. Drop `<GridFormItem>`.

### `/config/mediamtx/global`

`tabs`, `card`, `form`, `input`, `textarea`, `switch` (replaces select-true-false), `separator`, `button`, `command` + `dialog` (`⌘K` field search), `badge` (per-tab error count, dirty count on save bar), `scroll-area` (long fields lists), `tooltip`, `empty` (load failure).

## E. Migration notes

### `toast` → `sonner`

The current code uses `useToast()` and renders `<Toaster>` from `@/components/ui/toaster`. The migration is mechanical:

1. `npx shadcn@latest add sonner` — adds `src/components/ui/sonner.tsx` and the `sonner` peer dep.
2. In `src/app/layout.tsx`, replace `import { Toaster } from '@/components/ui/toaster'` with `import { Toaster } from '@/components/ui/sonner'`.
3. In every callsite (`client-config-form.tsx`, `mediamtx-config-form.tsx`, `download-button.tsx`):
   ```ts
   // before
   const { toast } = useToast()
   toast({ title: 'Updated', variant: 'destructive' })
   // after
   import { toast } from 'sonner'
   toast.success('Updated')
   toast.error('There was an issue updating')
   ```
4. Delete `src/components/ui/toast.tsx`, `toaster.tsx`, `use-toast.ts`, `form-context.ts` (only if not still referenced elsewhere — verify with grep).

### `Sidebar` CSS variables

The sidebar install adds these to `globals.css`. Reuse the dark-default theme — no manual color picking needed.

```css
@layer base {
  :root {
    --sidebar-background: ...;
    --sidebar-foreground: ...;
    --sidebar-primary: ...;
    --sidebar-primary-foreground: ...;
    --sidebar-accent: ...;
    --sidebar-accent-foreground: ...;
    --sidebar-border: ...;
    --sidebar-ring: ...;
  }
  .dark { ... }
}
```

### `Switch` migration

For each `select`-true-false in `mediamtx-config-form.tsx`, replace with:

```tsx
<FormField
  name="api"
  control={form.control}
  render={({ field }) => (
    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
      <div className="space-y-0.5">
        <FormLabel>API</FormLabel>
        <FormDescription>Enable the MediaMTX HTTP API.</FormDescription>
      </div>
      <FormControl>
        <Switch checked={field.value} onCheckedChange={field.onChange} />
      </FormControl>
    </FormItem>
  )}
/>
```

This is the canonical shadcn settings-form pattern — copy/paste-able for all ~25 booleans.

## F. Things explicitly **not** to add

- ❌ Custom theme tokens (use shadcn defaults).
- ❌ Animation libraries (framer-motion, etc.) — Tailwind transitions are enough.
- ❌ Any block from a third-party registry (shadcnblocks.com, shadcnstudio.com, etc.).
- ❌ A custom `<DataTable>` for recordings — card grid is simpler and matches the use case.
- ❌ A custom `<KbdShortcut>` widget — `command` already includes one.
- ❌ A `<Container>` wrapper — `SidebarInset`'s padding is enough.

## Sources

- [shadcn/ui blocks](https://ui.shadcn.com/blocks) — block IDs and descriptions.
- [shadcn/ui sidebar component docs](https://ui.shadcn.com/docs/components/sidebar)
- [shadcn/ui empty component docs](https://ui.shadcn.com/docs/components/empty)
- [shadcn/ui sonner docs](https://ui.shadcn.com/docs/components/sonner)
- [shadcn/ui breadcrumb docs](https://ui.shadcn.com/docs/components/breadcrumb)
- [shadcn/ui pagination docs](https://ui.shadcn.com/docs/components/pagination)
- [shadcn/ui sidebar blocks](https://ui.shadcn.com/blocks/sidebar)
