# CLAUDE.md

This file provides guidance for Claude Code when working with this repository.

## Project Overview

MediaMTX Connect is a Next.js web UI for viewing and managing media streams from a [MediaMTX](https://github.com/bluenviron/mediamtx) server. It provides live HLS stream viewing, recording browsing with auto-generated thumbnails, and web-based configuration.

## Tech Stack

- **Framework**: Next.js 16 (App Router) with React 19
- **Styling**: Tailwind CSS 4 with shadcn/ui components (Radix UI)
- **Database**: SQLite via Prisma ORM
- **Video**: HLS.js for browser playback
- **Forms**: React Hook Form + Zod validation
- **Testing**: Playwright for E2E tests
- **Linting**: ESLint 9 with @antfu/eslint-config

## Commands

```bash
npm run dev          # Start Next.js dev server
npm run build        # Production build
npm run typecheck    # TypeScript type checking
npm run lint         # Run ESLint
npm run lint:fix     # Auto-fix lint issues
npm run test:e2e     # Run Playwright E2E tests
npm run setup        # Initial dev setup (./scripts/setup-dev.sh)
npm run mediamtx     # Start MediaMTX with fake test streams
npm run mediamtx:stop # Stop MediaMTX
npm run generate     # Generate Prisma client
npm run migrate      # Deploy Prisma migrations
npm run db:seed      # Seed database
npm run db:reset     # Reset database
```

## Project Structure

> **Full architecture documentation**: See `docs/FEATURE-ORGANIZATION-STRATEGY.md`

```
src/
├── features/               # Feature modules (domain-driven)
│   ├── streams/           # Live streaming features
│   │   └── live-view/     # Main stream viewing
│   ├── recordings/        # Recording features
│   │   ├── browse/        # Browse/list recordings
│   │   └── playback/      # Video playback
│   ├── config/            # Configuration features
│   │   ├── client/        # Client settings
│   │   ├── mediamtx/      # MediaMTX settings
│   │   └── backup/        # Backup/restore
│   ├── storage/           # Storage management
│   └── system/            # System utilities
│
├── shared/                 # Shared code (used by 3+ features)
│   ├── components/        # Shared React components
│   │   ├── ui/           # shadcn/ui primitives
│   │   ├── layout/       # Layout components
│   │   ├── forms/        # Form utilities
│   │   └── media/        # Media components
│   ├── hooks/            # Shared React hooks
│   ├── utils/            # Shared utilities
│   └── types/            # Shared TypeScript types
│
├── lib/                    # External integrations
│   ├── MediaMTX/          # Auto-generated API client
│   └── prisma/            # Database schema & migrations
│
├── app/                    # Next.js routing (thin layer)
│   ├── api/               # API route handlers
│   ├── (main)/            # Main app routes
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
│
├── env.ts                  # Centralized environment variables
└── instrumentation.ts      # Background jobs
```

## Code Conventions

### Environment Variables
- All `process.env` access must go through `src/env.ts`
- ESLint enforces this with `node/prefer-global/process` rule
- Use `env.VARIABLE_NAME` instead of `process.env.VARIABLE_NAME`

### Logging
- Use the logger from `@/shared/utils/logger` (Pino-based)
- `console.*` is forbidden except in `logger.ts` and `env.ts`

### Auto-generated Files (Do Not Edit)
- `src/lib/MediaMTX/generated.ts` - MediaMTX API client
- `src/lib/prisma/migrations/` - Prisma migrations

### Forms
- Use React Hook Form with Zod schemas for validation
- Form components use shadcn/ui Form primitives
- Schemas live in feature's `schemas/` directory

---

## Feature Development Rules

> **CRITICAL**: All AI agents MUST follow these rules when creating or modifying features.

### Creating a New Feature

1. **Identify the domain** for your feature:
   | Domain | Purpose |
   |--------|---------|
   | `streams` | Live streaming (viewing, control, stats) |
   | `recordings` | Recording management (browse, playback, export) |
   | `config` | App configuration (settings, backup) |
   | `storage` | Storage management (disk, cleanup, quotas) |
   | `auth` | Authentication (login, users, permissions) |
   | `system` | System utilities (health, logs, updates) |
   | `analytics` | Usage analytics (stats, reports) |
   | `integrations` | External integrations (webhooks, mqtt) |

2. **Create the feature directory**:
   ```
   src/features/[domain]/[feature-name]/
   ```

3. **Always create `index.ts`** that exports the public API

4. **Use this internal structure** (create only what you need):
   ```
   features/[domain]/[feature-name]/
   ├── index.ts              # PUBLIC API - Required
   ├── components/           # React components
   │   └── [Feature]Page.tsx
   ├── actions/              # Server actions
   │   └── get[Feature].ts
   ├── schemas/              # Zod validation
   │   └── [feature].schema.ts
   ├── types/                # TypeScript types
   │   └── index.ts
   ├── hooks/                # React hooks
   ├── utils/                # Feature utilities
   └── __tests__/            # Tests
   ```

### Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Page component | `[Feature]Page.tsx` | `BackupPage.tsx` |
| Form component | `[Feature]Form.tsx` | `BackupForm.tsx` |
| Card component | `[Feature]Card.tsx` | `BackupCard.tsx` |
| List component | `[Feature]List.tsx` | `BackupList.tsx` |
| Server action | `[verb][Feature].ts` | `createBackup.ts`, `getBackups.ts` |
| Hook | `use[Feature].ts` | `useBackupStatus.ts` |
| Schema | `[feature].schema.ts` | `backup.schema.ts` |
| Feature folder | kebab-case | `disk-usage`, `live-view` |

### Import Rules

```typescript
import { env } from '@/env'
// Other features: ONLY via index.ts
import { RecordingCard } from '@/features/recordings/browse'
// Libraries
import { prisma } from '@/lib/prisma'

import { PageLayout } from '@/shared/components/layout/PageLayout'
// WRONG: import { RecordingCard } from '@/features/recordings/browse/components/RecordingCard'

// Shared code: use @/shared/
import { Button } from '@/shared/components/ui/button'
import { logger } from '@/shared/utils/logger'

import { getBackups } from '../actions/getBackups'
// Same feature: use relative paths
import { BackupCard } from './components/BackupCard'
```

### When to Use `shared/`

Move code to `shared/` when:
- Used by **3 or more features**
- Generic UI component with no business logic
- App-wide utility (logging, formatting)

**Do NOT prematurely add to `shared/`** - keep code in features until it's reused.

### Feature Index.ts Template

```typescript
// features/config/backup/index.ts

// Actions
export { createBackup } from './actions/createBackup'
export { getBackups } from './actions/getBackups'

export { BackupForm } from './components/BackupForm'
// Components
export { BackupPage } from './components/BackupPage'

// Schemas (if needed externally)
export { CreateBackupSchema } from './schemas/backup.schema'

// Types
export type { Backup, BackupMetadata } from './types'
```

### Server Action Template

```typescript
// features/[domain]/[feature]/actions/[verb][Feature].ts
'use server'

import type { FeatureType } from '../types'
import { prisma } from '@/lib/prisma'
import { logger } from '@/shared/utils/logger'

export async function verbFeature(params: ParamType): Promise<FeatureType | null> {
  try {
    // Implementation
    return result
  }
  catch (error) {
    logger.error({ error }, 'verbFeature failed')
    return null
  }
}
```

### Page Component Template

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

### Connecting Features to Routes

The `app/` directory is a **thin routing layer**. Pages import from features:

```typescript
// app/config/backup/page.tsx
import { BackupPage } from '@/features/config/backup'

export default BackupPage
```

---

## Database

Single SQLite table `Config` stores app configuration:
- MediaMTX server URL and API port
- Remote MediaMTX URL (for external access)
- Recordings and screenshots directories

Schema location: `src/lib/prisma/schema.prisma`

## Background Jobs

Defined in `src/instrumentation.ts`:
- Thumbnail generation: every 30 minutes via ffmpeg
- Screenshot cleanup: daily at midnight (removes files >2 days old)

## Testing

- E2E tests use Playwright in `features/[domain]/[feature]/__tests__/`
- Feature tests should be colocated with features
- Use `npm run mediamtx` to start test streams for live testing

## Docker

Multi-arch support (amd64/arm64). Use `docker compose up -d` for local development with the full stack.

---

## Quick Reference for AI Agents

### Before Creating Any Feature

1. Check if feature exists: `ls src/features/[domain]/`
2. Read similar features for patterns
3. Create feature folder with `index.ts`
4. Follow naming conventions exactly

### Checklist

- [ ] Feature in correct domain?
- [ ] `index.ts` created with exports?
- [ ] Components follow `[Feature]Name.tsx` pattern?
- [ ] Actions follow `[verb][Feature].ts` pattern?
- [ ] Imports use correct paths?
- [ ] No imports from other features' internal files?
- [ ] Types in `types/index.ts`?
- [ ] Schemas in `schemas/[feature].schema.ts`?

### Common Mistakes to Avoid

- Creating files in `app/` instead of `features/`
- Importing internal files from other features
- Putting feature-specific code in `shared/`
- Forgetting to export from `index.ts`
- Using wrong naming patterns
