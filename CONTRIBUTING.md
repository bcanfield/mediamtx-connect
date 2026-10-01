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
pnpm verify           # what CI's Build job runs: lint, typecheck, i18n, unit/component tests, build
pnpm test:changed     # only tests your edits can reach
pnpm build            # e2e runs the built single-server
pnpm test:e2e         # headless, chromium
pnpm test:e2e:dev     # Playwright UI
```

Spec inventory: `docs/FEATURES.md` §15.1. Layers and conventions, including why tests must assert unconditionally: `docs/TESTING.md`.

## App settings storage

There is no database. The five app settings persist in a Zod-validated `config.json` under `$DATA_DIR` (seeded from env on first boot, then owned by the Config UI). Delete the file to re-seed from env.

## Code style

TypeScript, follow surrounding patterns, run `pnpm lint` before committing. Code rules and conventions live in `AGENTS.md`.

## Pull requests

1. Branch: `git checkout -b feature/my-feature`
2. `pnpm verify && pnpm test:e2e`
3. Update `docs/FEATURES.md` if behavior changed (mandatory; see `AGENTS.md`)
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

## Questions and decisions

Open an issue. This is a one-maintainer project: [@bcanfield](https://github.com/bcanfield) has the final say on direction and on what gets merged, and decisions are made in the open on issues and pull requests.
