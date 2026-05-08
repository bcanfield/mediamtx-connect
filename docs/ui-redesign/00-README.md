# UI Redesign — Working Folder

This directory contains the multi-step planning for a UI redesign pass on MediaMTX Connect.

The goal is **simple, minimal, user-friendly, clean, best practices** — no custom components or re-inventions where shadcn/ui already covers it.

## Reading order

1. [`01-current-structure.md`](./01-current-structure.md) — inventory of the existing UI: pages, components, layout primitives, observed pain points.
2. [`02-ux-research.md`](./02-ux-research.md) — UX patterns to apply per page, drawn from current dashboard / media-app conventions.
3. [`03-blueprints.md`](./03-blueprints.md) — page-by-page blueprint (layout sketch, components, states).
4. [`04-shadcn-inventory.md`](./04-shadcn-inventory.md) — concrete shadcn primitives, blocks, and registry items to install/use.
5. [`05-final-plan.md`](./05-final-plan.md) — final actionable plan: ordered work units, what to add/remove/keep, acceptance criteria.

## Scope

Front-end UI only. Server actions, queries, schemas, and routing **stay as-is**. We only change:

- App chrome (root layout, navigation).
- Page templates (Live View, Recordings index, Stream recordings, Client Config, MediaMTX Global Config).
- Shared components (cards, grid, page header).

## Non-goals

- No new features.
- No backend / API / Prisma changes.
- No design tokens beyond shadcn defaults.
- No custom animation, no bespoke widgets.
