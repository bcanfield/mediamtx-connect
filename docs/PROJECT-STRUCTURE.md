# Project Structure

A simple, low-ceremony Next.js layout optimized for clarity and agent navigation. Pairs with `.agents/skills/next-best-practices/`.

## Layout

```
src/
├── app/                          # Routing only — pages import from features
│   ├── (marketing)/              # Route groups for layout boundaries
│   ├── (app)/                    # Authenticated app
│   │   ├── layout.tsx
│   │   └── posts/[id]/page.tsx
│   ├── api/                      # Route handlers (webhooks, public APIs only)
│   ├── layout.tsx
│   └── page.tsx
│
├── features/                     # Domain code — bulk of the app
│   └── posts/
│       ├── post-card.tsx         # Flat. No components/ subfolder.
│       ├── post-list.tsx
│       ├── create-post-form.tsx
│       ├── posts.actions.ts      # 'use server' — mutations
│       ├── posts.queries.ts      # Server-only reads (cache())
│       ├── posts.schemas.ts      # Zod
│       └── posts.types.ts
│
├── components/                   # Shared UI, no business logic
│   └── ui/                       # Primitives (button.tsx, input.tsx)
│
├── lib/                          # Infrastructure
│   ├── db.ts                     # Prisma/Drizzle client
│   ├── auth.ts
│   ├── env.ts                    # Validated env (zod)
│   ├── logger.ts
│   └── utils.ts
│
├── hooks/                        # Shared hooks (3+ consumers)
└── proxy.ts                      # v16+ (middleware.ts on v14-15)
```

## Rules

1. **`app/` is routing only.** Pages import a feature component and render it. No business logic in `app/`.
2. **Flat feature folders.** No `components/`, `actions/`, `schemas/` subdirs until a feature exceeds ~10 files.
3. **No barrel `index.ts` files.** Import from the actual file: `from '@/features/posts/post-card'`. Barrels hurt tree-shaking, hide locations, and add maintenance.
4. **Descriptive, greppable filenames.** `post-card.tsx`, not `card.tsx`. Filename search must be useful.
5. **Split reads from writes.** `*.actions.ts` for `'use server'` mutations, `*.queries.ts` for server-only reads. No `services/`, `repositories/`, `controllers/`.
6. **Promote at 3+ consumers.** Code starts in the feature that owns it. Move to `components/`, `hooks/`, or `lib/utils.ts` only when a third caller appears.
7. **One env file (`lib/env.ts`).** All `process.env` access goes through it.
8. **Use Next.js conventions.** Route groups `(group)`, private folders `_components`, colocation. Don't reinvent organization the framework provides.

## Server / Client / API Boundaries

Aligned with `next-best-practices/data-patterns.md`:

| Need                          | Use                                |
|-------------------------------|------------------------------------|
| Read in a server component    | Direct DB call in `*.queries.ts`   |
| Mutation from UI              | Server Action in `*.actions.ts`    |
| Webhook / external REST API   | `app/api/*/route.ts`               |
| Client-side read              | Pass from server, or route handler |

- Don't put mutations in route handlers when a Server Action works.
- Don't make a route handler for internal reads — fetch directly in the Server Component.

## Naming

| Type                  | Pattern                | Example                   |
|-----------------------|------------------------|---------------------------|
| Component             | `kebab-case.tsx`       | `post-card.tsx`           |
| Server actions file   | `[feature].actions.ts` | `posts.actions.ts`        |
| Queries file          | `[feature].queries.ts` | `posts.queries.ts`        |
| Schema                | `[feature].schemas.ts` | `posts.schemas.ts`        |
| Hook                  | `use-[name].ts`        | `use-mobile.ts`           |
| Folder                | kebab-case             | `posts`, `billing`        |

## Imports

```ts
// tsconfig: { "paths": { "@/*": ["./src/*"] } }
import { env } from '@/lib/env'
import { db } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { PostCard } from '@/features/posts/post-card'   // direct file
import { createPost } from '@/features/posts/posts.actions'

// Same feature: relative
import { PostCard } from './post-card'
```

## What this structure deliberately omits

- Barrel `index.ts` re-exports.
- DDD layers (`domain/`, `application/`, `infrastructure/`).
- `services/`, `repositories/`, `dto/`, `controllers/`.
- Root `types/` or `constants/` folders (colocate with usage).
- Per-feature `__tests__/` requirement (colocate or use `tests/` — your call).

## When to deviate

- **Feature exceeds ~15 files** — split into `posts/components/`, `posts/server/`. Don't pre-split.
