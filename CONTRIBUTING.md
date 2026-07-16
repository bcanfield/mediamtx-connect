# Contributing

## Dev setup

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
cp .env.example .env
pnpm setup      # deps + test fixtures — once
pnpm dev:all    # MediaMTX + fake streams + web/api dev servers
```

Web dev server at http://localhost:5173 (api on :3000). Ctrl-C tears the docker stack down.

Needs `ffmpeg` on PATH (`brew install ffmpeg`). The Docker image bundles it, but in dev the api runs on the host and spawns it for snapshots and recording thumbnails — without it, the snapshot cron logs a spawn error every 30s and stream cards stay on "no snapshot yet".

To run the pieces separately, use `pnpm mediamtx` and `pnpm dev` in two terminals. Without MediaMTX, the Streams page shows a "Cannot connect" message; Recordings and Config still work against the seeded test data.

Full script catalog: `docs/FEATURES.md` §15.3. Monorepo commands and conventions: `AGENTS.md`.

## Tests

```bash
pnpm build            # e2e runs the built single-server
pnpm test:e2e         # headless
pnpm test:e2e:dev     # Playwright UI
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

## App settings storage

There is no database. The five app settings persist in a Zod-validated `config.json` under `$DATA_DIR` (seeded from env on first boot). Delete the file to re-seed from env.

## Code style

TypeScript, follow surrounding patterns, run `pnpm lint` before committing. Code rules live in `CLAUDE.md`; monorepo conventions in `AGENTS.md`.

## Pull requests

1. Branch: `git checkout -b feature/my-feature`
2. `pnpm typecheck && pnpm lint && pnpm i18n:check && pnpm build && pnpm test:e2e`
3. Update `docs/FEATURES.md` if behavior changed (mandatory — see `CLAUDE.md`)
4. PR with a clear description

## Questions

Open an issue.
