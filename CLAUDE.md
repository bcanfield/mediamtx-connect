## What this project is

MediaMTX Connect — a Next.js web UI for viewing and managing media streams from a [MediaMTX](https://github.com/bluenviron/mediamtx) server. Live HLS viewing, recording browse/playback/download with auto-thumbnails, and a full web-based config editor.

## Hard rule for every change

If your change adds, removes, or modifies a user-visible feature, route, API endpoint, server action, schema, cron, or integration, you **must** update `docs/FEATURES.md` in the same change. See the "Maintenance contract" at the top of that file.

## Where things live

| Topic | Path |
|-------|------|
| Feature catalog (source of truth — read first) | `docs/FEATURES.md` |
| Project layout, naming, imports, file conventions | `docs/PROJECT-STRUCTURE.md` |
| System diagram | `ARCHITECTURE.md` |
| Database schema | `src/lib/prisma/schema.prisma` |

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

## Code rules

- **Boring over clever.** Use the documented, mainstream way to do things. No bespoke abstractions, no defensive fallbacks for things that can't happen, no premature generality. Three similar lines beat a clever helper.
- **No AI-sounding comments.** Write like you're leaving a note for a coworker — short, specific, and only when the *why* isn't obvious from the code. Skip preambles ("This function..."), restating the code, and over-explaining trivial logic. We do love a human-like & concise one-liner above complex code
- `process.env` access goes through the env module (`env.VARIABLE_NAME`); enforced by ESLint.
- Use the shared `logger` (Pino). `console.*` is banned outside `logger.ts` and the env module.
- Forms use React Hook Form + Zod.
- Never edit `src/lib/mediamtx/generated.ts` or `src/lib/prisma/migrations/`.
- E2E tests live under `tests/e2e/` (Playwright); feature tests may colocate.

## Before finishing

- [ ] Layout/naming per `docs/PROJECT-STRUCTURE.md`.
- [ ] `docs/FEATURES.md` updated.
- [ ] `npm run typecheck` and `npm run lint` clean.
