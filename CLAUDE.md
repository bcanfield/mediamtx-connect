# CLAUDE.md

Guidance for Claude Code when working in this repo. Keep this file short and rule-oriented.

## What this project is

MediaMTX Connect — a Next.js web UI for viewing and managing media streams from a [MediaMTX](https://github.com/bluenviron/mediamtx) server. Live HLS viewing, recording browse/playback/download with auto-thumbnails, and a full web-based config editor.

## Source of truth for features

**`docs/FEATURES.md` is the living source of truth for the current feature state of the app** — every route, server action, schema, background job, and shipped capability is catalogued there.

> **Hard rule for every change:** if your change adds, removes, or modifies a user-visible feature, route, API endpoint, server action, schema, cron, or integration, you **must** update `docs/FEATURES.md` in the same change. A code change without a matching `FEATURES.md` update is incomplete. See the "Maintenance contract" section at the top of that file for the exact update conventions.

Other living references:

- `docs/FEATURES.md` — current feature inventory (read this before discussing what the app does).
- `ARCHITECTURE.md` — high-level system diagram.

## Commands

```bash
npm run dev            # Next.js dev server
npm run build          # Production build
npm run start          # Run prod server
npm run typecheck      # TypeScript type check
npm run lint           # ESLint
npm run lint:fix       # ESLint autofix
npm run test:e2e       # Playwright E2E
npm run setup          # ./scripts/setup-dev.sh
npm run mediamtx       # Start MediaMTX with fake test streams
npm run mediamtx:stop  # Stop MediaMTX
npm run generate       # prisma generate
npm run migrate        # prisma migrate deploy
npm run db:seed        # Seed DB
npm run db:reset       # Reset DB
```

## Project Structure

```
src/
├── features/              # Feature modules (domain-driven)
│   ├── streams/           # Live streaming
│   ├── recordings/        # Recording browse/playback
│   └── config/            # App + MediaMTX configuration
├── shared/                # Shared code (used by 3+ features)
│   ├── components/        # ui/, layout/, forms/, feedback/, media/, providers/
│   ├── hooks/  utils/  types/
├── lib/                   # External integrations (MediaMTX client, Prisma)
├── app/                   # Thin Next.js routing layer (pages + api routes)
├── env.ts                 # Centralized env access
└── instrumentation.ts     # Background jobs (cron)
```

Reserved feature domains (currently empty, see `docs/FEATURES.md` §19): `storage`, `system`, `auth`, `analytics`, `integrations`, plus `config/backup`.

## Code Conventions

### Environment variables
- All `process.env` access goes through `src/env.ts`. Use `env.VARIABLE_NAME`.
- ESLint rule `node/prefer-global/process` enforces this.

### Logging
- Use `logger` from `@/shared/utils/logger` (Pino).
- `console.*` is banned outside `logger.ts` and `env.ts`.

### Auto-generated (do not edit)
- `src/lib/MediaMTX/generated.ts` — MediaMTX API client.
- `src/lib/prisma/migrations/` — Prisma migrations.

### Forms
- React Hook Form + Zod. Schemas live in the feature's `schemas/` directory.

## Feature Development Rules

> **CRITICAL.** Every new or modified feature follows these rules.

### Domains

| Domain | Purpose |
|--------|---------|
| `streams` | Live streaming (viewing, control, stats) |
| `recordings` | Recording management (browse, playback, export) |
| `config` | App + MediaMTX configuration (settings, backup) |
| `storage` | Storage management (disk, cleanup, quotas) |
| `auth` | Authentication (login, users, permissions) |
| `system` | System utilities (health, logs, updates) |
| `analytics` | Usage analytics (stats, reports) |
| `integrations` | External integrations (webhooks, MQTT) |

### Feature directory layout

```
src/features/[domain]/[feature-name]/
├── index.ts              # PUBLIC API — required
├── components/           # [Feature]Page.tsx, [Feature]Form.tsx, …
├── actions/              # [verb][Feature].ts (server actions)
├── schemas/              # [feature].schema.ts (Zod)
├── types/                # index.ts
├── hooks/                # use[Feature].ts
├── utils/
└── __tests__/
```

Create only the subfolders you need. **Always create `index.ts`** with explicit exports.

### Naming conventions

| Type | Pattern | Example |
|------|---------|---------|
| Page | `[Feature]Page.tsx` | `BackupPage.tsx` |
| Form | `[Feature]Form.tsx` | `BackupForm.tsx` |
| Card | `[Feature]Card.tsx` | `BackupCard.tsx` |
| List | `[Feature]List.tsx` | `BackupList.tsx` |
| Server action | `[verb][Feature].ts` | `createBackup.ts`, `getBackups.ts` |
| Hook | `use[Feature].ts` | `useBackupStatus.ts` |
| Schema | `[feature].schema.ts` | `backup.schema.ts` |
| Folder | kebab-case | `disk-usage`, `live-view` |

### Imports

```typescript
import { env } from '@/env'

// Other features: ONLY via index.ts
import { RecordingCard } from '@/features/recordings/browse'
// WRONG: import { RecordingCard } from '@/features/recordings/browse/components/RecordingCard'

// Libraries
import { prisma } from '@/lib/prisma'

// Shared
import { Button } from '@/shared/components/ui/button'
import { PageLayout } from '@/shared/components/layout/PageLayout'
import { logger } from '@/shared/utils/logger'

// Same feature: relative paths
import { getBackups } from '../actions/getBackups'
import { BackupCard } from './components/BackupCard'
```

### When to use `shared/`

Move code to `shared/` only when it's used by **3+ features**, is generic UI with no business logic, or is an app-wide utility. Don't preemptively share — keep code in features until it's actually reused.

### Wiring features into routes

`app/` is a thin routing layer. Pages just import from features:

```typescript
// app/config/backup/page.tsx
import { BackupPage } from '@/features/config/backup'

export default BackupPage
```

### Templates

**Server action**

```typescript
// features/[domain]/[feature]/actions/[verb][Feature].ts
'use server'

import type { FeatureType } from '../types'
import { prisma } from '@/lib/prisma'
import { logger } from '@/shared/utils/logger'

export async function verbFeature(params: ParamType): Promise<FeatureType | null> {
  try {
    return result
  }
  catch (error) {
    logger.error({ error }, 'verbFeature failed')
    return null
  }
}
```

**Page component**

```typescript
// features/[domain]/[feature]/components/[Feature]Page.tsx
import { PageLayout } from '@/shared/components/layout/PageLayout'
import { getFeature } from '../actions/getFeature'

export async function FeaturePage() {
  const data = await getFeature()
  return (
    <PageLayout title="Feature Title" subheader="Description">
      {/* Content */}
    </PageLayout>
  )
}
```

**Feature `index.ts`**

```typescript
// Actions
export { createBackup } from './actions/createBackup'
export { getBackups } from './actions/getBackups'
// Components
export { BackupForm } from './components/BackupForm'
export { BackupPage } from './components/BackupPage'
// Schemas (if exposed)
export { CreateBackupSchema } from './schemas/backup.schema'
// Types
export type { Backup, BackupMetadata } from './types'
```

## Tests

- E2E suites live under `tests/e2e/` (Playwright). Feature-specific tests can also be colocated in `features/[domain]/[feature]/__tests__/`.
- Use `npm run mediamtx` to start test streams for live testing.
- Detailed coverage map: `docs/FEATURES.md` §15.

## Pointers (don't duplicate detail here)

| Topic | Where it lives |
|-------|----------------|
| Current feature catalog | `docs/FEATURES.md` |
| Routes / APIs / server actions / schemas | `docs/FEATURES.md` §10–§12 |
| Background jobs (cron) | `docs/FEATURES.md` §4 |
| Database schema | `src/lib/prisma/schema.prisma` (overview in `docs/FEATURES.md` §6) |
| Docker / compose / deployment | `docs/FEATURES.md` §13 |
| Tech stack versions | `docs/FEATURES.md` §17 |

## Quick checklist before finishing a change

- [ ] Code lives in the right `features/[domain]/[feature]/` folder.
- [ ] `index.ts` exports the public API; no deep imports from other features.
- [ ] Naming patterns followed (`[Feature]Page.tsx`, `[verb][Feature].ts`, `[feature].schema.ts`).
- [ ] `process.env` only accessed via `@/env`; no `console.*`.
- [ ] Auto-generated files untouched.
- [ ] **`docs/FEATURES.md` updated to reflect the change.**
- [ ] `npm run typecheck` and `npm run lint` clean; tests added/updated where it makes sense.

## Common mistakes

- Putting feature code under `app/` instead of `src/features/`.
- Importing from another feature's internal files instead of its `index.ts`.
- Adding feature-specific code to `shared/` before it has 3+ consumers.
- Forgetting to export from `index.ts`.
- Shipping a feature change without updating `docs/FEATURES.md`.
