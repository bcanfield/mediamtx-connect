# 0006 — Scope the pnpm trust policy around legacy semver rather than stay on pnpm 10

**Date:** 2026-07-28
**Status:** Accepted

## Context

`pnpm-workspace.yaml` sets `trustPolicy: no-downgrade`, which fails an install when a package's trust evidence is weaker than an earlier-published version of the same package. Under pnpm 10.7.0 this only gated newly resolved packages. pnpm 11 re-applies the policy to **every lockfile entry**, so upgrading the package manager surfaced two transitive dependencies that had been in the tree all along:

```
[ERR_PNPM_TRUST_DOWNGRADE] 2 lockfile entries failed verification:
  semver@5.7.2  High-risk trust downgrade (possible package takeover)
  semver@6.3.1  High-risk trust downgrade (possible package takeover)
```

Both reach the tree via `eslint-plugin-react-hooks` → `@babel/core`. Checked against the registry: both were published 2023-07-10 with no provenance attestation; the current 7.x line (7.7.4, 2026-02-05) *does* have attestations. The check is date-based and semver-blind, so a maintained older major with no provenance always reads as a "downgrade" against a newer major that has it. These are the well-known 5.x/6.x maintenance republishes, not a takeover.

This blocked CI on the pnpm v11 Renovate PR (#282) and blocks any local lockfile regeneration, which in turn blocks the seven other dependency PRs that need a fresh lockfile.

pnpm 11 also replaces `onlyBuiltDependencies` with an explicit `allowBuilds` map, so the upgrade requires that migration regardless.

## Decision

Keep `trustPolicy: no-downgrade` and add a two-entry `trustPolicyExclude` naming the exact versions:

```yaml
trustPolicyExclude:
  - semver@5.7.2
  - semver@6.3.1
```

The exclusion is pinned to specific versions, so a genuinely new semver release with weak trust evidence still fails the check.

## Consequences

- pnpm 11.17.0 installs cleanly; the lockfile passes the supply-chain check on a fresh resolution.
- The policy remains in force for every other package in the tree.
- The exclusion is version-pinned, so it silently stops applying once these two versions leave the tree — it does not decay into a permanent hole.
- Someone must revisit it if `@babel/core` keeps pulling legacy semver forward into new versions; the entries would need updating rather than quietly widening.

## Alternatives

- **Stay on pnpm 10.34.5** (the version from the non-major Renovate PR), which does not re-verify existing lockfile entries. No policy exception, but it defers the pnpm 11 upgrade indefinitely and leaves the underlying question unanswered — the same two packages are in the tree either way, just unexamined.
- **`trustPolicyIgnoreAfter`**, ignoring downgrades for anything published more than N minutes ago. One line instead of two, but it applies to every package and would silently absorb future flagged packages, which is the opposite of what the policy is for.

## Payoff trigger

Drop the exclusion when `eslint-plugin-react-hooks`/`@babel/core` no longer pull `semver@5.7.2` or `semver@6.3.1` — check with `pnpm why semver` after a major bump of either. If the entries are gone from the tree, delete the block and confirm `pnpm install` still passes.
