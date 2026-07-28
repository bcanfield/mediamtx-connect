# Contributing

## Dev setup

```bash
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect
pnpm install
pnpm dev
```

That's it — no `.env`, no separate setup step. `pnpm dev` seeds sample
recordings/screenshots into `.dev-data/`, starts MediaMTX + fake streams in
Docker, and runs the web + api dev servers. Web dev server at
http://localhost:5173 (api on :3000). `pnpm dev:stop` stops the Docker stack
(it's left running between sessions by design, like a local database).

Requires Docker (for MediaMTX) and Node ≥22 + pnpm. `ffmpeg` is optional: the
committed fixtures give the Recordings and Streams pages content out of the box;
install ffmpeg (`brew install ffmpeg`) only if you want the api to generate live
snapshots from the fake streams.

Everything is configurable at runtime under **Config** — env vars only seed the
first boot (`.env.example` documents the optional overrides). Full script
catalog: `docs/FEATURES.md` §15.3. Monorepo commands and conventions: `AGENTS.md`.

## Tests

```bash
pnpm verify           # lint + typecheck + i18n + unit/component — no Docker, seconds
pnpm test:changed     # only tests your edits can reach
pnpm build            # e2e runs the built single-server
pnpm test:e2e         # headless, chromium
pnpm test:e2e:dev     # Playwright UI
```

Spec inventory: `docs/FEATURES.md` §15.1. Layers and conventions: `docs/TESTING.md`.

Assert unconditionally. The fixtures are deterministic — `globalSetup` seeds the
recordings and `scripts/wait-for-mediamtx.mjs` gates the suite on the stream
fleet being ready — so there is no varying state to defend against:

```ts
// Good
await expect(page.locator('[data-testid="stream-summary-card"]')).toHaveCount(3)

// Can't fail: green whether or not the feature works
const cards = await page.locator('[class*="card"]').count()
const empty = await page.getByText('No Recordings').isVisible()
expect(cards > 0 || empty).toBe(true)
```

> This reverses the "write tests resilient to multiple states" advice that used
> to live here. It was a reasonable response to asserting against live MediaMTX,
> but it is what produced 19 tests that passed with the feature broken. A
> conditional inside a `test()` body is now a lint error; if state genuinely
> varies, the test belongs in the component layer where it can be pinned.

## App settings storage

There is no database. The five app settings persist in a Zod-validated `config.json` under `$DATA_DIR` (seeded from env on first boot, then owned by the Config UI). Delete the file to re-seed from env.

## Code style

TypeScript, follow surrounding patterns, run `pnpm lint` before committing. Code rules live in `CLAUDE.md`; monorepo conventions in `AGENTS.md`.

## Pull requests

1. Branch: `git checkout -b feature/my-feature`
2. `pnpm typecheck && pnpm lint && pnpm i18n:check && pnpm build && pnpm test:e2e`
3. Update `docs/FEATURES.md` if behavior changed (mandatory — see `CLAUDE.md`)
4. PR with a clear description, titled per the convention below

### PR titles

`main` is squash-merged, so **the PR title becomes the commit subject that
semantic-release parses**. Title every PR `<type>[(scope)][!]: <description>`:

```
feat: add a WHEP playback fallback
fix(recordings): stop blaming MediaMTX for filesystem faults
feat!: drop the v1 config layout
```

Types: `feat`, `fix`, `perf`, `refactor`, `docs`, `style`, `test`, `build`,
`ci`, `chore`, `revert`. Only `feat`, `fix`, `perf`, and `revert` cut a
release; `!` (or a `BREAKING CHANGE:` footer) cuts a major. Everything else
merges without a version bump, which is the right answer for docs, tests, and
tooling.

A mistyped title is not a style nit — it silently drops the change out of the
next release. The `Conventional commit format` job in CI checks it, and CI
re-runs on a retitle — so fixing the title is enough, no empty commit needed.

## Releases

`main` releases on a nightly train (`.github/workflows/release.yml`, ~07:00
America/New_York) rather than per merge, so a night of dependency updates and
merged features rolls into one version, one changelog entry, and one
multi-arch image build. semantic-release publishes nothing on a night when no
releasable commit landed. The train refuses to run if the latest CI run on
`main` is not green, and `workflow_dispatch` triggers an out-of-band release.

## Questions

Open an issue.
