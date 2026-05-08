# Contributing

## Dev setup

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
cp .env.example .env
npm run setup     # deps, prisma, seed, fixtures — once
npm run dev:all   # MediaMTX + fake streams + Next.js
```

App at http://localhost:3000. Ctrl-C tears the docker stack down.

To run the pieces separately, use `npm run mediamtx` and `npm run dev` in two terminals. Without MediaMTX, the Streams page shows a "Cannot connect" message; Recordings and Config still work against the seeded test data.

Full script catalog: `docs/FEATURES.md` §15.3.

## Tests

```bash
npm run test:e2e        # headless
npm run test:e2e:dev    # Playwright UI
```

Spec inventory: `docs/FEATURES.md` §15.1.

Write tests resilient to multiple states:

```ts
// Good
const cards = await page.locator('[class*="card"]').count()
const empty = await page.getByText('No Recordings').isVisible()
expect(cards > 0 || empty).toBe(true)

// Brittle
await expect(page.locator('[class*="card"]')).toHaveCount(3)
```

## Database

SQLite + Prisma (config table only). `npx prisma studio` to browse; `npm run db:reset && npm run db:seed` to start over.

## Code style

TypeScript, follow surrounding patterns, run `npm run lint` before committing. Code rules live in `CLAUDE.md`.

## Pull requests

1. Branch: `git checkout -b feature/my-feature`
2. `npm run typecheck && npm run lint && npm run test:e2e`
3. Update `docs/FEATURES.md` if behavior changed (mandatory — see `CLAUDE.md`)
4. PR with a clear description

## Questions

Open an issue.
