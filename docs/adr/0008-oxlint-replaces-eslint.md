# 0008 — oxlint and oxfmt replace ESLint

**Date:** 2026-10-29
**Status:** Accepted

## Context

Linting and formatting both ran through ESLint 10 with `@antfu/eslint-config`, which parses TypeScript with typescript-eslint. typescript-eslint peers on `typescript <6.1.0` and calls the TypeScript JS API, which TypeScript 7.0 doesn't ship. With TS 7 installed, `pnpm lint` dies with "typescript-eslint does not support TS 7.0", and that alone held the TypeScript 7 Renovate PR (#279). The rest of the repo already typechecked, tested and built cleanly under 7.0.2.

oxlint's type-aware rules run in `oxlint-tsgolint`, a Go binary built on typescript-go (TypeScript 7 itself). It never loads the project's `typescript` package, so the TypeScript version stops being a linter question.

## Decision

- **oxlint** lints, configured in `oxlint.config.mts` (one root config with path overrides, like the old flat config). It's `.mts` because it composes selector lists and spreads `eslint-plugin-regexp`'s recommended set, which JSON can't do.
- **Type-aware rules are on** (`options.typeAware`). oxlint's `correctness` category is on, which brings tsgolint's default set (`no-floating-promises`, `await-thenable`, `unbound-method`, …), plus `no-misused-promises`, `no-unnecessary-type-assertion`, `only-throw-error`, `restrict-plus-operands` and `dot-notation`. The old config never wired a tsconfig into typescript-eslint, so none of these ran before.
- **Native rules first.** ESLint plugins with no native port run as oxlint JS plugins: `eslint-plugin-regexp`, `@e18e/eslint-plugin`, `eslint-plugin-antfu`, `eslint-plugin-n` (as `n/`), `eslint-plugin-perfectionist`, and `oxlint-plugin-eslint` (ESLint's own core rules, `eslint-js/`) for `no-restricted-syntax` and a handful of core rules. Every one of them loads under TypeScript 7.0.2.
- **No @eslint-react.** It imports the TypeScript JS API at load time (`@typescript-eslint/type-utils` → `ts-api-utils`), so under TS 7 it crashes the whole config. Its recommended rules map to native `react/*` rules, `no-restricted-imports` (react-dom APIs) and `no-restricted-syntax` (React 19's removed APIs). The ones with no equivalent are listed below.
- **oxfmt** formats (`.oxfmtrc.json`): Prettier-compatible output, single quotes, no semicolons, 120 columns, imports sorted with antfu's grouping. Markdown, CSS and HTML are ignored, as they were before. ESLint used to format through `@stylistic`, so the switch reformatted the repo once.
- **JSON and YAML checks** that ESLint ran through `eslint-plugin-pnpm` and `jsonc` move to `scripts/repo-config.test.mjs`, since oxlint only lints JS and TS: every dependency is `catalog:`, no unused or duplicate catalog entry, the required pnpm settings are present, and tracked JSON is strict and has no duplicate keys.
- Disable comments are `oxlint-disable-*` only (`respectEslintDisableDirectives: false`), and unused ones are errors.

## What carried over

Every rule that was on in the old setup is accounted for. The full rule-by-rule table is in the description of the PR that added this ADR. Summary of the 466 rules that were on:

| Where it went | Rules |
|---|---|
| Native oxlint rule | 211 |
| JS plugin (regexp, e18e, antfu, n, perfectionist, eslint-js) | 91 |
| oxfmt (layout: `@stylistic`, JSON/YAML spacing, quotes, indents) | 95 |
| Outside oxlint (`repo-config.test.mjs`, oxfmt `sortImports`, `reportUnusedDisableDirectives`) | 34 |
| Dropped | 35 (21 of them were warnings) |

The repo-specific rules: the i18n JSX-literal ban, the `console.*` ban outside the two loggers and the no-conditionals-in-e2e-tests ban all carry over unchanged, as `eslint-js/no-restricted-syntax` and native `no-console`.

### Dropped rules that were errors

| Rule | Why |
|---|---|
| `antfu/curly`, `antfu/if-newline`, `antfu/consistent-list-newline`, `antfu/consistent-chaining` | Layout. They encode antfu's formatter style, which oxfmt replaces. Any core `curly` mode either fights oxfmt's line breaks or forces braces repo-wide. |
| `command/command` | Not a check. eslint-plugin-command runs codemods triggered by magic comments. |
| `eslint-comments/no-aggregating-enable` | Directive style. Unused and duplicate directives are still errors. |
| `node/process-exit-as-throw` | Never reports; it only adjusts ESLint's code-path analysis. |
| `jsonc/sort-keys`, `jsonc/sort-array-values`, `yaml/sort-keys`, `pnpm/yaml-blank-lines` | Key and line order in tsconfig, package.json `files` and pnpm-workspace.yaml. Cosmetic. oxfmt still sorts package.json. |
| `react/no-access-state-in-setstate` | Class components only; the app has none. |
| `react/no-nested-lazy-component-declarations` | No native port, and the app doesn't use `lazy()`. |
| `react/rsc-function-definition` | Server Components only; this is a client-only SPA. |

Dropped warnings (never failed lint): seven `jsdoc/*` rules with no native port, and from @eslint-react `jsx-no-leaked-dollar`, `jsx-no-leaked-semicolon`, `naming-convention-*`, `no-unnecessary-use-prefix`, `no-unused-class-component-members`, `no-context-provider` and `web-api-no-leaked-*`.

## Consequences

- TypeScript 7 no longer depends on the linter.
- `pnpm lint` takes ~3.6s cold with type-aware rules on, against 8.6s cold (4.0s with a warm `--cache`) for ESLint without them. There's no cache to keep, so CI drops `.eslintcache`.
- New `pnpm format` / `pnpm format:check`; `verify`, `check` and CI run the check.
- Turning on type-aware and `correctness` rules surfaced real issues: nine floating promises (now `void`ed on purpose), eleven redundant type assertions. A few new rules are switched off with a reason in the config.
- `eslint` and `@typescript-eslint/utils` are still in the lockfile, as dependencies of the JS plugins, not as a linter. pnpm warns about the `typescript` peer range of `@typescript-eslint/utils` under TS 7; perfectionist loads and works regardless.
- JS plugins are alpha in oxlint and not covered by its semver. If one breaks, move its rules to a native equivalent or drop them here with a reason.
- `oxlint.config.mts` needs Node 22.18+ (type stripping), so `engines` says so.
- `semver@5.7.2`/`6.3.1` left the tree with `eslint-plugin-react-hooks`, so ADR 0006's `trustPolicyExclude` is gone.

## Alternatives

- **Wait for typescript-eslint** to support TS 7.1's API. No date, and it keeps type-aware linting off.
- **`@typescript/typescript6` side by side** (the escape hatch the catalog comment named): lints and typechecks against two type systems.
- **Keep `@stylistic` as an oxlint JS plugin** instead of a formatter: no reformat, but JSON/YAML layout would go unchecked (JS plugins can't parse them) and layout would stay a lint concern.
