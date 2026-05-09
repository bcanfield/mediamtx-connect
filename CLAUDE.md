## Hard rule for every change

If your change adds, removes, or modifies a user-visible feature, route, API endpoint, server action, schema, cron, or integration, you **must** update `docs/FEATURES.md` in the same change. See its "Maintenance contract."

## Where things live

| Topic | Path |
|-------|------|
| Feature catalog (source of truth — read first) | `docs/FEATURES.md` |
| Layout, naming, imports, conventions | `docs/PROJECT-STRUCTURE.md` |
| System diagram | `ARCHITECTURE.md` |
| Dev setup, scripts, PR process | `CONTRIBUTING.md` |
| Test layers, conventions, CI gates | `docs/TESTING.md` |
| Database schema | `src/lib/prisma/schema.prisma` |
| i18n policy and "add a language" workflow | `docs/I18N.md` |

## Code rules

- **Boring over clever.** Mainstream way wins. No bespoke abstractions, no defensive fallbacks for things that can't happen. Three similar lines beat a clever helper.
- **No AI-sounding comments.** Write like a note to a coworker — only when the *why* isn't obvious. Skip preambles, code-restatement, trivial-logic explanation. A concise one-liner above complex code is welcome.
- `process.env` goes through `src/lib/env.ts` (lint-enforced).
- Use the shared `logger` (Pino). `console.*` is banned outside `logger.ts` and `env.ts`.
- Forms: React Hook Form + Zod.
- User-visible strings live in `messages/*.json` (one namespace per feature). No hardcoded JSX literals in `src/features/**` or `src/components/**`. Use `Link`/`useRouter` from `@/i18n/navigation`, not `next/link` or `next/navigation`. See `docs/I18N.md`.
- Never edit `src/lib/mediamtx/generated.ts` or `src/lib/prisma/migrations/`.
- E2E tests live under `tests/e2e/` (Playwright); feature tests may colocate.

## Before finishing

- [ ] Layout/naming per `docs/PROJECT-STRUCTURE.md`.
- [ ] `docs/FEATURES.md` updated.
- [ ] `npm run typecheck`, `npm run lint`, and `npm run i18n:check` clean.
