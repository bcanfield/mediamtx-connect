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

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API route handlers
│   ├── config/            # Configuration pages
│   ├── recordings/        # Recording browser pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page (live streams)
│   └── utils/             # App utilities (logger, file-ops)
├── actions/               # Server actions
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── lib/
│   ├── MediaMTX/         # Auto-generated API client (from OpenAPI)
│   ├── prisma.ts         # Prisma client singleton
│   └── prisma/           # Schema and migrations
├── env.ts                 # Centralized environment variables
└── instrumentation.ts     # Next.js instrumentation (background jobs)
```

## Code Conventions

### Environment Variables
- All `process.env` access must go through `src/env.ts`
- ESLint enforces this with `node/prefer-global/process` rule
- Use `env.VARIABLE_NAME` instead of `process.env.VARIABLE_NAME`

### Logging
- Use the logger from `src/app/utils/logger.ts` (Pino-based)
- `console.*` is forbidden except in `logger.ts` and `env.ts`

### Imports
- Use `@/*` alias for imports from `src/` directory
- Example: `import { env } from '@/env'`

### Components
- UI primitives live in `src/components/ui/` (shadcn/ui)
- App-specific components in `src/components/`
- Pages use the App Router convention (`page.tsx`, `layout.tsx`)

### Auto-generated Files (Do Not Edit)
- `src/lib/MediaMTX/generated.ts` - MediaMTX API client
- `src/lib/prisma/migrations/` - Prisma migrations

### Forms
- Use React Hook Form with Zod schemas for validation
- Form components use shadcn/ui Form primitives

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

E2E tests use Playwright. The app works without MediaMTX for most features (recordings, config). Use `npm run mediamtx` to start test streams for live stream testing.

## Docker

Multi-arch support (amd64/arm64). Use `docker compose up -d` for local development with the full stack.
