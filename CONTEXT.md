# Domain context

## Responsive breakpoint policy (2026-07-15)

Decided after a full visual pass of every view at 320/360/640/768/1024/1280/1600.

**Supported viewport range: 360–1920 CSS px.** 320 is best-effort: no horizontal
page overflow and everything stays reachable/usable, but cramped layouts and
truncated metadata are acceptable there.

**Named breakpoints in use: `sm` (640), `lg` (1024), `xl` (1280) only.**
`md` and `2xl` are deliberately unused — don't introduce them without updating
this policy. Roles:

- `< 640` — single-column mobile. Tab nav scrolls horizontally (fits fully at
  ≥360 via tighter gaps); grid-density toggle and header connection status are
  hidden; MediaMTX-config rows stack (key → help → control).
- `sm` (640) — two-column card grids; density toggle + connection status appear;
  MediaMTX-config rows switch to the `[280px | control]` grid.
- `lg` (1024) — three-column card grids; MediaMTX-config chip nav is replaced by
  the sticky section rail; ICE-server editor rows go from stacked to one-line
  (kept stacked below `lg` because the sm control column is too narrow).
- `xl` (1280) — page container cap (`max-w-7xl`) becomes visible headroom; no
  structural changes. Header and tab nav share the same `max-w-7xl` container so
  their left edge aligns with content on wide screens.

Forms use narrower centered columns (App Config ~585px) instead of breakpoints —
line length is controlled by max-width, not media queries.
