# 0004 — Enforced verify gate for agentic-change confidence

**Date:** 2026-07-17
**Status:** Accepted

## Context

The repo is set up to hand a task to an agent, have it complete the work, and merge it. The intake side is solid (GitHub issues, `docs/agents/`, triage labels), and the CI gate chain in `.github/workflows/ci.yml` is real: lint → typecheck → `i18n:check` → unit → build → E2E against a live MediaMTX → Docker image smoke → semantic-release gated on all of it.

The weak leg is *proving no regression*. Today that confidence rests on two things that were designed for a human author, not an agent:

- **E2E breadth.** 11 Playwright specs cover the browser flows, but E2E is coarse and slow. It cannot see whether a new oRPC procedure is exercised at all, and it needs Docker + MediaMTX + browsers, so an agent skips it locally and only learns of a failure in CI ~10 min later.
- **Manual discipline.** The "before finishing" checklist in `CLAUDE.md`, the `FEATURES.md` "hard rule," and the `docs/debt/` registry all depend on the author *remembering* to run three separate commands and update a doc. A human reviewer catches lapses; an autonomous agent is both author and reviewer, so the lapse ships.

Concretely, an agent can add a `config.mediamtx.*` procedure with no unit test, skip the `FEATURES.md` update, pass every CI gate green, and no signal anywhere says the safety net just shrank. There is no coverage measurement in the repo (`turbo test` runs `vitest run` with no `--coverage`), no single preflight command, and no check tying a feature diff to its doc. The component/form layer (~21 `.tsx` files, RHF+Zod) has zero unit coverage and is only reached if an E2E flow happens to traverse it.

The api unit layer, per ADR 0001, now covers `config-store.ts`, `jobs.ts`, `media.ts`, and `router.ts`. Two substantive modules remain untested — `mediamtx.ts` (the MediaMTX client) and `recordings-fs.ts` — alongside the bootstrap/config trio `server.ts`, `env.ts`, `logger.ts` that unit tests can't meaningfully reach.

This is the same silent-failure class ADR 0001 called out — work that looks done and green but isn't actually guarded.

## Decision

Shift regression confidence from *discipline* to *enforced measurement*. The word "enforced" is load-bearing, so it rests on a precondition and three mechanisms.

**Precondition — server-side enforcement via branch protection.** Confirm (and keep true) that GitHub branch protection on `main`/`beta` requires the `build` job to pass before merge. Without this, every mechanism below is a job an autonomous author can merge past — the coverage floor, the doc gate, and `pnpm verify` all become the same *suggestion* this ADR exists to escape. This is verified up front (`gh api repos/:owner/:repo/branches/main/protection`), not deferred, because it is the single thing that makes "enforced" true rather than advisory.

1. **Coverage with a floor.** Turn on `vitest --coverage` (v8) over `apps/api/src` as an **exclude-list**: measure the whole directory, carve out `server.ts`, `env.ts`, and `logger.ts` (bootstrap/config, unreachable by unit tests) with a one-line reason in the coverage config. Exclude-list rather than an explicit include-list so a *new* logic file is measured by default — if it ships untested it drags the number down and trips the floor, rather than being silently unmeasured.
   - Enforce **line coverage only**. Branches/functions are reported in CI output but not gated, to avoid punishing the defensive code the repo's style rules already discourage and to avoid coverage-gaming.
   - The floor is a single **aggregate** number for now, set by *measuring* actual coverage after the baseline tests below land and rounding down a few points — not a guessed round number. Baseline tests for `mediamtx.ts` and `recordings-fs.ts` land in the same change, so the aggregate starts from a genuinely-covered base rather than one propped up by trivial-file dilution.
   - A per-file floor (`thresholds.perFile`) is the intended next tightening — it closes the one gap an aggregate leaves (a dark file hiding behind well-covered neighbours) — deferred only because it requires the two baseline test suites to exist first.
   - CI reports the number; a drop below the floor fails the `build` job. This makes "is this covered?" a value the agent can read, not a judgment it can skip.
2. **A single `pnpm verify` preflight.** A deterministic `package.json` script that composes the existing fast checks — `lint && typecheck && i18n:check && test` — with coverage on, so it reproduces exactly what the CI `build` job gates and "green locally" means "green in CI". Seconds, no Docker. The `CLAUDE.md` checklist becomes a command, not a memory test. This is a plain script, *not* a skill: the existing behavioral `/verify` skill (which drives the app end-to-end) remains a separate, complementary step and is not what this mechanism refers to.
3. **A `FEATURES.md` gate keyed to conventional commits.** When a PR contains a `feat:` commit but does not change `docs/FEATURES.md`, **fail** the `build` job. `feat:` already *means* "a user-visible feature" (it drives the minor release via `semantic-release`), which is exactly what `FEATURES.md`'s maintenance contract says must be documented — so the trigger is a near-zero-false-positive signal that needs no path list to maintain. It **fails**, never warns: a warning is the ignorable suggestion an autonomous self-reviewer scrolls past. The escape hatch is honest and self-correcting — if it isn't really a feature the commit was mistyped (fixing that also fixes the changelog); mislabeling `feat:`→`fix:` to dodge the gate also mislabels the release, so the incentive points the right way.

Scope is deliberately the fast, high-leverage layer. The component/form test layer (jsdom + Testing Library) is **deferred**, not decided against — see the payoff trigger. A local pre-push hook is **dropped** from scope entirely: its enforcement job is now covered by branch protection and its fast-feedback job by `pnpm verify`, so it would be tracking a phantom.

## Consequences

- An agent gains a self-serve, sub-minute answer to "am I done and regression-safe?" (`pnpm verify`) that doesn't require booting Docker, mirrors the CI gate exactly, and a hard signal when it adds untested api logic or forgets the doc.
- Enforcement now has a hard dependency on a repo *setting*, not just code. Branch protection lives outside the tree; if someone loosens it, the whole ADR silently reverts to advisory. The precondition names this so it stays a checked invariant rather than an assumption.
- A coverage floor is a ratchet: every future change must hold or raise it, which is the point, but it also means a legitimately hard-to-test change now needs an explicit `/* c8 ignore */` with a reason rather than silently lowering the bar. Adding a new logic file to `apps/api/src` with no test will trip the floor by design.
- The aggregate floor tolerates one dark file hiding behind well-covered neighbours until it is tightened to per-file. Landing the `mediamtx.ts` + `recordings-fs.ts` baselines with this change removes today's instance of that; the per-file follow-up removes the possibility.
- The `feat:`/`FEATURES.md` gate reads commit types on the PR branch. A genuinely user-visible change shipped under a non-`feat:` type (e.g. a `fix:` that alters behaviour) won't be caught — the gate trades that residual gap for zero path-list maintenance and near-zero false positives, which is the right trade for a self-reviewing agent that would otherwise learn to rubber-stamp a noisy gate.
- Two more moving parts in CI (coverage floor, doc gate) and one more root script to keep current.
- The floor measures line coverage on one directory, not correctness. It stops *untested* code, not *wrongly tested* code — ADR 0001's "a test you haven't seen fail isn't a test" discipline still carries that weight.

## Alternatives

- **Keep discipline + E2E breadth (status quo).** No new tooling; lean harder on the `CLAUDE.md` checklist, the `FEATURES.md` hard rule, and `/debt-ops` registration. Rejected: every one of those assumes an author who remembers, and the whole premise here is an autonomous agent that is its own reviewer. Discipline that isn't enforced is a suggestion, and suggestions rot fastest exactly when nobody is watching a merge.
- **Warn instead of fail; trigger the doc gate on file paths.** A softer rollout: warn on missing coverage/doc updates, and detect feature work by watching `router.ts`, `packages/contract/**`, `media.ts`, `apps/web/src/features/**`. Rejected on both counts. A warning is invisible to a self-reviewing agent. And `apps/web/src/features/**` changes constantly for styling, i18n, and refactors, so a path trigger cries wolf until the reflex becomes "add a throwaway `FEATURES.md` line to silence it" — corrupting the doc and requiring perpetual path-list maintenance (which this ADR would otherwise own). Keying to `feat:` is the sharper, self-maintaining signal.
- **Full coverage mandate + TDD across the whole tree.** A high threshold on every package including `apps/web` components and contract schemas. Rejected as the *first* step: `apps/web` runs Vitest in node env with no jsdom, so a component threshold would force the whole Testing Library layer up front (that is the deferred work), and a blanket high floor invites coverage-gaming — tests written to touch lines, not to fail. Start with a meaningful floor on the layer that is already structured for it (`apps/api/src`, per ADR 0001's thin-handler design) and raise scope deliberately.

## Payoff trigger

Revisit — and pull the deferred component/form layer forward, and tighten the aggregate floor to per-file — when any of: an agent-authored change ships a regression through the component/form layer that a unit test would have caught; the `apps/api/src` floor has held for a full release cycle and the marginal risk has visibly moved to `apps/web`; or a genuinely user-visible change ships under a non-`feat:` commit and escapes the doc gate. (The "red-CI PR found mergeable" trigger from the proposed draft is gone — making branch protection a precondition precludes it by construction.) Tracked against `docs/debt/20260714231521-vitest-layers-not-ported.md` and `docs/debt/20260717154951-enforced-verify-gate-unimplemented.md`.
