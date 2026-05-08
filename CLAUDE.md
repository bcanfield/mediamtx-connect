## Hard rule for every change

If your change adds, removes, or modifies a user-visible feature, route, API endpoint, server action, schema, cron, or integration, you **must** update `docs/FEATURES.md` in the same change. See its "Maintenance contract."

## Where things live

| Topic | Path |
|-------|------|
| Feature catalog (source of truth — read first) | `docs/FEATURES.md` |
| Layout, naming, imports, conventions | `docs/PROJECT-STRUCTURE.md` |
| System diagram | `ARCHITECTURE.md` |
| Dev setup, scripts, PR process | `CONTRIBUTING.md` |
| Database schema | `src/lib/prisma/schema.prisma` |

## Code rules

- **Boring over clever.** Mainstream way wins. No bespoke abstractions, no defensive fallbacks for things that can't happen. Three similar lines beat a clever helper.
- **No AI-sounding comments.** Write like a note to a coworker — only when the *why* isn't obvious. Skip preambles, code-restatement, trivial-logic explanation. A concise one-liner above complex code is welcome.
- `process.env` goes through `src/lib/env.ts` (lint-enforced).
- Use the shared `logger` (Pino). `console.*` is banned outside `logger.ts` and `env.ts`.
- Forms: React Hook Form + Zod.
- Never edit `src/lib/mediamtx/generated.ts` or `src/lib/prisma/migrations/`.
- E2E tests live under `tests/e2e/` (Playwright); feature tests may colocate.

## Before finishing

- [ ] Layout/naming per `docs/PROJECT-STRUCTURE.md`.
- [ ] `docs/FEATURES.md` updated.
- [ ] `npm run typecheck` and `npm run lint` clean.
