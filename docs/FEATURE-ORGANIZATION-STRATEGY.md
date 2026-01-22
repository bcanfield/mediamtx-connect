# Feature Organization Strategy

This document outlines the organizational structure for scaling MediaMTX Connect to 100+ features while maintaining clarity, consistency, and AI-agent compatibility.

---

## Table of Contents

1. [Core Principles](#core-principles)
2. [Directory Structure](#directory-structure)
3. [Feature Anatomy](#feature-anatomy)
4. [Shared Code Organization](#shared-code-organization)
5. [Naming Conventions](#naming-conventions)
6. [File Templates](#file-templates)
7. [Migration Plan](#migration-plan)
8. [AI Agent Rules](#ai-agent-rules)

---

## Core Principles

### 1. Feature Colocation
All code related to a feature lives together. A developer (or AI) working on "backup" should find everything in one place.

### 2. Explicit Boundaries
Features should have clear boundaries with minimal cross-feature imports. Shared code must be explicitly designated.

### 3. Predictable Structure
Every feature follows the same internal structure. AI agents can reliably know where to create files.

### 4. Progressive Disclosure
Simple features can be simple (single file). Complex features expand into the full structure as needed.

### 5. Domain-Driven Grouping
Features are grouped by domain (streams, recordings, config, system) for logical organization.

---

## Directory Structure

```
src/
├── features/                    # All feature modules
│   ├── streams/                 # Domain: Live streaming
│   │   ├── live-view/          # Feature: Live stream viewing
│   │   ├── stream-control/     # Feature: Start/stop/restart streams
│   │   └── stream-stats/       # Feature: Stream statistics
│   │
│   ├── recordings/              # Domain: Recording management
│   │   ├── browse/             # Feature: Browse recordings
│   │   ├── playback/           # Feature: Video playback
│   │   ├── download/           # Feature: Download recordings
│   │   ├── delete/             # Feature: Delete recordings
│   │   └── export/             # Feature: Export recordings
│   │
│   ├── config/                  # Domain: Configuration
│   │   ├── client/             # Feature: Client settings
│   │   ├── mediamtx/           # Feature: MediaMTX settings
│   │   └── backup/             # Feature: Config backup/restore
│   │
│   ├── storage/                 # Domain: Storage management
│   │   ├── disk-usage/         # Feature: Disk space monitoring
│   │   ├── cleanup/            # Feature: Auto-cleanup rules
│   │   └── quotas/             # Feature: Storage quotas
│   │
│   ├── auth/                    # Domain: Authentication (future)
│   │   ├── login/
│   │   ├── users/
│   │   └── permissions/
│   │
│   └── system/                  # Domain: System utilities
│       ├── health/             # Feature: Health monitoring
│       ├── logs/               # Feature: Log viewing
│       └── updates/            # Feature: Update management
│
├── shared/                      # Shared code (NOT features)
│   ├── components/             # Shared React components
│   │   ├── ui/                 # Primitives (shadcn/ui)
│   │   ├── layout/             # Layout components
│   │   └── feedback/           # Toasts, alerts, modals
│   │
│   ├── hooks/                  # Shared React hooks
│   ├── utils/                  # Shared utilities
│   ├── types/                  # Shared TypeScript types
│   └── constants/              # App-wide constants
│
├── lib/                        # External integrations
│   ├── prisma/                 # Database (unchanged)
│   ├── MediaMTX/               # API client (unchanged)
│   └── external/               # Other external APIs
│
├── app/                        # Next.js routing layer (thin)
│   ├── (main)/                 # Main app routes
│   │   ├── page.tsx            # Home → imports from features/streams
│   │   ├── recordings/         # → imports from features/recordings
│   │   └── config/             # → imports from features/config
│   │
│   ├── api/                    # API routes (thin handlers)
│   │   └── [feature]/          # Delegate to feature logic
│   │
│   ├── layout.tsx
│   └── globals.css
│
├── env.ts                      # Environment (unchanged)
└── instrumentation.ts          # Background jobs (unchanged)
```

---

## Feature Anatomy

Every feature follows this internal structure (files created as needed):

```
features/[domain]/[feature-name]/
├── index.ts                    # Public API (re-exports)
├── README.md                   # Feature documentation (optional)
│
├── components/                 # React components
│   ├── [Feature]Page.tsx      # Main page component
│   ├── [Feature]Card.tsx      # Card component (if needed)
│   ├── [Feature]Form.tsx      # Form component (if needed)
│   ├── [Feature]List.tsx      # List component (if needed)
│   └── _internal/             # Private components (not exported)
│
├── actions/                    # Server actions
│   ├── get[Feature].ts        # Read operations
│   ├── create[Feature].ts     # Create operations
│   ├── update[Feature].ts     # Update operations
│   └── delete[Feature].ts     # Delete operations
│
├── api/                        # API route handlers
│   └── route.ts               # Route handler logic
│
├── hooks/                      # Feature-specific hooks
│   └── use[Feature].ts
│
├── utils/                      # Feature-specific utilities
│   └── [feature]-helpers.ts
│
├── types/                      # Feature-specific types
│   └── index.ts
│
├── schemas/                    # Zod validation schemas
│   └── [feature].schema.ts
│
├── constants/                  # Feature constants
│   └── index.ts
│
└── __tests__/                  # Feature tests
    ├── [Feature].test.ts      # Unit tests
    └── [Feature].e2e.ts       # E2E tests
```

### Example: Backup Feature

```
features/config/backup/
├── index.ts                    # export { BackupPage, createBackup, restoreBackup }
│
├── components/
│   ├── BackupPage.tsx         # Main page UI
│   ├── BackupForm.tsx         # Create backup form
│   ├── BackupList.tsx         # List of backups
│   ├── BackupCard.tsx         # Individual backup display
│   └── RestoreDialog.tsx      # Restore confirmation dialog
│
├── actions/
│   ├── getBackups.ts          # List all backups
│   ├── createBackup.ts        # Create new backup
│   ├── restoreBackup.ts       # Restore from backup
│   └── deleteBackup.ts        # Delete a backup
│
├── api/
│   └── route.ts               # POST/GET/DELETE handlers
│
├── hooks/
│   └── useBackupStatus.ts     # Polling for backup progress
│
├── utils/
│   └── backup-helpers.ts      # File compression, validation
│
├── types/
│   └── index.ts               # Backup, BackupMetadata types
│
├── schemas/
│   └── backup.schema.ts       # CreateBackupSchema, etc.
│
└── __tests__/
    └── backup.e2e.ts
```

---

## Shared Code Organization

### When Code Goes in `shared/`

Code belongs in `shared/` if it meets ANY of these criteria:
- Used by 3+ features
- Generic UI component (no business logic)
- App-wide utility (logging, formatting)
- Common type definitions

### Shared Components Structure

```
shared/components/
├── ui/                         # shadcn/ui primitives (unchanged)
│   ├── button.tsx
│   ├── card.tsx
│   └── ...
│
├── layout/                     # Layout components
│   ├── PageLayout.tsx         # Page wrapper
│   ├── GridLayout.tsx         # Responsive grid
│   ├── PageSkeleton.tsx       # Loading state
│   └── SidebarNav.tsx         # Sidebar navigation
│
├── feedback/                   # User feedback
│   ├── toast.tsx
│   ├── toaster.tsx
│   └── use-toast.ts
│
├── forms/                      # Form utilities
│   ├── GridFormItem.tsx       # Form field wrapper
│   └── FormError.tsx          # Error display
│
└── media/                      # Media components
    ├── VideoPlayer.tsx        # HLS player (was cam.tsx)
    └── Thumbnail.tsx          # Image thumbnail
```

### Shared Hooks

```
shared/hooks/
├── useMediaQuery.ts           # Responsive breakpoints
├── useLocalStorage.ts         # Persist state
├── useDebounce.ts             # Debounce values
└── usePagination.ts           # Pagination logic
```

### Shared Utils

```
shared/utils/
├── logger.ts                  # Pino logger
├── file-operations.ts         # File system utilities
├── formatting.ts              # Date, number formatting
├── validation.ts              # Common validators
└── cn.ts                      # Tailwind class merge
```

### Shared Types

```
shared/types/
├── api.ts                     # API response types
├── pagination.ts              # Pagination types
├── common.ts                  # Generic types
└── index.ts                   # Re-exports
```

---

## Naming Conventions

### Files

| Type | Pattern | Example |
|------|---------|---------|
| Page component | `[Feature]Page.tsx` | `BackupPage.tsx` |
| Card component | `[Feature]Card.tsx` | `RecordingCard.tsx` |
| Form component | `[Feature]Form.tsx` | `ClientConfigForm.tsx` |
| List component | `[Feature]List.tsx` | `BackupList.tsx` |
| Dialog component | `[Feature]Dialog.tsx` | `RestoreDialog.tsx` |
| Server action | `[verb][Feature].ts` | `createBackup.ts` |
| Hook | `use[Feature].ts` | `useBackupStatus.ts` |
| Schema | `[feature].schema.ts` | `backup.schema.ts` |
| Types | `index.ts` in types/ | `types/index.ts` |
| Constants | `index.ts` in constants/ | `constants/index.ts` |
| Utils | `[feature]-helpers.ts` | `backup-helpers.ts` |

### Directories

- **Feature names**: kebab-case (`live-view`, `disk-usage`)
- **Component folders**: lowercase (`components`, `actions`)
- **Domain names**: kebab-case, singular if possible (`config`, `storage`)

### Exports

```typescript
// features/config/backup/index.ts

export { createBackup } from './actions/createBackup'
// Actions (named exports)
export { getBackups } from './actions/getBackups'

export { BackupForm } from './components/BackupForm'
// Components (named exports)
export { BackupPage } from './components/BackupPage'

// Schemas (named exports)
export { CreateBackupSchema } from './schemas/backup.schema'

// Types (re-export all)
export * from './types'
```

---

## File Templates

### Server Action Template

```typescript
// features/[domain]/[feature]/actions/[verb][Feature].ts
'use server'

import { prisma } from '@/lib/prisma'
import { logger } from '@/shared/utils/logger'
import type { [Feature] } from '../types'

export async function [verb][Feature](
  // params
): Promise<[Feature] | null> {
  try {
    // Implementation
  } catch (error) {
    logger.error({ error }, '[verb][Feature] failed')
    return null
  }
}
```

### Page Component Template

```typescript
// features/[domain]/[feature]/components/[Feature]Page.tsx
import { PageLayout } from '@/shared/components/layout/PageLayout'
import { get[Feature] } from '../actions/get[Feature]'

export async function [Feature]Page() {
  const data = await get[Feature]()

  return (
    <PageLayout
      title="[Feature Title]"
      subheader="[Feature description]"
    >
      {/* Content */}
    </PageLayout>
  )
}
```

### Form Component Template

```typescript
// features/[domain]/[feature]/components/[Feature]Form.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { [Feature]Schema, type [Feature]FormData } from '../schemas/[feature].schema'
import { Button } from '@/shared/components/ui/button'
import { Form } from '@/shared/components/ui/form'

interface [Feature]FormProps {
  onSubmit: (data: [Feature]FormData) => Promise<void>
  defaultValues?: Partial<[Feature]FormData>
}

export function [Feature]Form({ onSubmit, defaultValues }: [Feature]FormProps) {
  const form = useForm<[Feature]FormData>({
    resolver: zodResolver([Feature]Schema),
    defaultValues,
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields */}
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
```

### Schema Template

```typescript
// features/[domain]/[feature]/schemas/[feature].schema.ts
import { z } from 'zod'

export const [Feature]Schema = z.object({
  // fields
})

export type [Feature]FormData = z.infer<typeof [Feature]Schema>
```

### Types Template

```typescript
// features/[domain]/[feature]/types/index.ts

export interface [Feature] {
  id: string
  // fields
  createdAt: Date
  updatedAt: Date
}

export interface [Feature]ListResponse {
  items: [Feature][]
  total: number
  page: number
  pageSize: number
}
```

---

## Migration Plan

### Phase 1: Create New Structure

1. Create `features/` directory with domain folders
2. Create `shared/` directory structure
3. Move `components/ui/` to `shared/components/ui/`

### Phase 2: Migrate Shared Components

Move these to `shared/components/`:
- `grid-layout.tsx` → `shared/components/layout/GridLayout.tsx`
- `page-layout.tsx` → `shared/components/layout/PageLayout.tsx`
- `page-skeleton.tsx` → `shared/components/layout/PageSkeleton.tsx`
- `sidebar-nav.tsx` → `shared/components/layout/SidebarNav.tsx`
- `cam.tsx` → `shared/components/media/VideoPlayer.tsx`
- `grid-form-item.tsx` → `shared/components/forms/GridFormItem.tsx`
- `mode-toggle.tsx` → `shared/components/feedback/ModeToggle.tsx`
- `theme-provider.tsx` → `shared/components/providers/ThemeProvider.tsx`

### Phase 3: Migrate Utils

- `app/utils/logger.ts` → `shared/utils/logger.ts`
- `app/utils/file-operations.ts` → `shared/utils/file-operations.ts`
- `lib/utils.ts` → `shared/utils/cn.ts`

### Phase 4: Migrate Existing Features

#### Streams Feature
```
features/streams/live-view/
├── components/
│   ├── LiveViewPage.tsx      # From app/page.tsx
│   └── StreamCard.tsx        # From components/stream-card.tsx
├── actions/
│   └── getStreams.ts         # New action
└── index.ts
```

#### Recordings Feature
```
features/recordings/browse/
├── components/
│   ├── RecordingsPage.tsx    # From app/recordings/page.tsx
│   ├── StreamRecordingsPage.tsx  # From app/recordings/[streamname]/page.tsx
│   ├── RecordingCard.tsx     # From components/recording-card.tsx
│   └── DownloadButton.tsx    # From app/recordings/[streamname]/_components/downloadVideo.tsx
├── actions/
│   ├── getStreamRecordings.ts  # From actions/getStreamRecordings.ts
│   └── getScreenshot.ts      # From actions/getScreenshot.ts
└── index.ts
```

#### Config Feature
```
features/config/client/
├── components/
│   ├── ClientConfigPage.tsx  # From app/config/page.tsx
│   └── ClientConfigForm.tsx  # From app/config/client-config-form.tsx
├── actions/
│   ├── getAppConfig.ts       # From actions/getAppConfig.ts
│   └── updateClientConfig.ts # From actions/updateClientConfig.ts
├── schemas/
│   └── client-config.schema.ts  # Extract from form
└── index.ts

features/config/mediamtx/
├── components/
│   ├── MediaMTXConfigPage.tsx  # From app/config/mediamtx/global/page.tsx
│   └── MediaMTXConfigForm.tsx  # From app/config/config-form.tsx
├── actions/
│   └── updateGlobalConfig.ts   # From actions/updateGlobalConfig.ts
├── schemas/
│   └── mediamtx-config.schema.ts  # Extract from form
└── index.ts
```

### Phase 5: Update Imports

1. Update all import paths to use new structure
2. Update `@/` alias if needed
3. Run TypeScript to catch any broken imports

### Phase 6: Update App Router

Make `app/` a thin routing layer:

```typescript
// app/recordings/page.tsx
import { RecordingsPage } from '@/features/recordings/browse'

// app/page.tsx
import { LiveViewPage } from '@/features/streams/live-view'

export default LiveViewPage
export default RecordingsPage
```

---

## AI Agent Rules

### Rules for Creating New Features

```markdown
## FEATURE CREATION RULES

When creating a new feature:

1. **Determine the domain**: Which domain does this feature belong to?
   - streams, recordings, config, storage, auth, system

2. **Create the feature directory**:
   ```
   features/[domain]/[feature-name]/
   ```

3. **Start with index.ts**: Always create an index.ts that exports the public API

4. **Create files as needed** (don't create empty files):
   - UI needed? → Create `components/`
   - Server actions? → Create `actions/`
   - Form validation? → Create `schemas/`
   - Custom types? → Create `types/`
   - Feature-specific utils? → Create `utils/`

5. **Follow naming conventions**:
   - Components: PascalCase with feature prefix
   - Actions: camelCase verb + feature name
   - Files: kebab-case for folders, PascalCase for components

6. **Import rules**:
   - Import shared code from `@/shared/`
   - Import other features via their index.ts only
   - Never import internal files from other features
```

### Rules for Modifying Existing Features

```markdown
## FEATURE MODIFICATION RULES

When modifying an existing feature:

1. **Read the feature's index.ts first** to understand the public API

2. **Check for existing patterns**: Look at how similar things are done in the feature

3. **Keep changes scoped**: Don't modify files outside the feature unless necessary

4. **Update exports**: If adding new public components/actions, add to index.ts

5. **Don't break the public API**: Existing exports should remain working
```

### Rules for Shared Code

```markdown
## SHARED CODE RULES

When to add to shared/:

1. **Component used by 3+ features**: Move to shared/components/
2. **Hook used by 3+ features**: Move to shared/hooks/
3. **Utility used by 3+ features**: Move to shared/utils/
4. **Type used by 3+ features**: Move to shared/types/

When NOT to add to shared/:

1. **Feature-specific logic**: Keep in feature's own utils/
2. **Feature-specific types**: Keep in feature's own types/
3. **Premature abstraction**: Wait until 3rd usage
```

### Import Path Rules

```markdown
## IMPORT PATH RULES

1. **Shared code**: `@/shared/[category]/[file]`
   ```typescript
   import { Button } from '@/shared/components/ui/button'
   import { logger } from '@/shared/utils/logger'
   ```

2. **Feature code (from same feature)**: Relative paths
   ```typescript
   import { getBackups } from '../actions/getBackups'
   import { BackupCard } from './BackupCard'
   ```

3. **Feature code (from other feature)**: Via index.ts only
   ```typescript
   import { RecordingCard } from '@/features/recordings/browse'
   // NOT: import { RecordingCard } from '@/features/recordings/browse/components/RecordingCard'
   ```

4. **Library code**: `@/lib/[library]`
   ```typescript
   import { prisma } from '@/lib/prisma'
   ```

5. **Environment**: `@/env`
   ```typescript
   import { env } from '@/env'
   ```
```

---

## Appendix: Domain Reference

| Domain | Description | Example Features |
|--------|-------------|------------------|
| `streams` | Live stream management | live-view, stream-control, stream-stats, stream-sources |
| `recordings` | Recording management | browse, playback, download, delete, export, search |
| `config` | App configuration | client, mediamtx, backup, restore, presets |
| `storage` | Storage management | disk-usage, cleanup, quotas, retention |
| `auth` | Authentication | login, users, roles, permissions, api-keys |
| `system` | System utilities | health, logs, updates, diagnostics, notifications |
| `analytics` | Usage analytics | stats, reports, charts, exports |
| `integrations` | External integrations | webhooks, mqtt, home-assistant, frigate |

---

## Summary Checklist for AI Agents

Before creating any feature code, verify:

- [ ] Feature is in correct domain
- [ ] Feature folder follows naming convention
- [ ] index.ts exists and exports public API
- [ ] Components follow naming pattern
- [ ] Actions follow naming pattern
- [ ] Imports use correct paths
- [ ] No imports from other features' internal files
- [ ] Shared code is in `shared/` (if reused 3+ times)
- [ ] Types are defined in feature's `types/`
- [ ] Schemas are defined in feature's `schemas/`
