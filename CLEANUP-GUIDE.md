# Repo cleanup: operating guide for an autonomous session

You are running unattended. The maintainer will read your PR and final report and
won't answer questions mid-run. Make the call yourself, write down why in the
decision log, and keep going.

This file is temporary. Commit it first and delete it in your last commit.

## Mission

This repo came out of a Next.js → Vite/React + Hono rewrite, and it was the
maintainer's first try at agentic development. That left a lot behind: planning
docs, a debt registry, idea catalogs, a stale board, and code no one has audited
since. When you're done the repo should be small, consistent and obviously
pointed somewhere.

**Done means all of these are true:**

1. A single PR from branch `chore/repo-cleanup` against `main`, with
   `pnpm verify` green. Don't merge it.
2. Every doc that survives does a job no other doc does, and nothing it says is
   false. The list of survivors is at least 40% shorter than the starting list
   (77 tracked `.md` files outside `node_modules`, `CHANGELOG.md` excluded).
3. You've made behavior-preserving code cleanup: dead code, unused deps, stale
   stubs, rule violations. Anything bigger than that becomes a ticket, not a
   change.
4. `CLAUDE.md` / `AGENTS.md` are rewritten, deduplicated, and they pass the
   cold-read test (Phase 5).
5. GitHub has **10 new tickets**, written to the `to-tickets` standard, plus one
   pinned roadmap issue that orders them. All the old open issues are closed,
   each with a comment explaining why. In-flight issues are the exception (see
   guardrails).
6. The **smallhours** integration is gone from the repo, along with every
   reference to it (Phase 4b). The maintainer decided this. It isn't up for
   debate.
7. The PR description holds the final report (see the end of this file).

## Guardrails (hard rules)

These hold no matter what you find.

- **Disable the smallhours loop before doing anything on GitHub** (Phase 0,
  step 1). Until `gh workflow view agent-loop` shows it disabled, don't add or
  remove *any* label. Adding `ready-for-agent` starts a real implementing agent
  within seconds, and that has already happened by accident once (see
  `TRIAGE-PLAN.md` §1). If disabling fails, stop all board work and say so in
  the report.
- **Don't touch in-flight work.** As of 2026-10-01, the smallhours agent opened
  PR #326 (for issue #293) and PR #316 (for #304). Leave both PRs and both
  issues open, and don't edit them. With the loop gone, nobody will drive those
  PRs, so list them in the report for the human to review or close. Re-check
  for others at Phase 7.
- Leave issue #4 (Renovate Dependency Dashboard), all Renovate PRs, and
  `renovate-approve.yml` alone. No dependency version bumps: Renovate owns the
  catalog versions.
- Don't edit `release.yml` or the semantic-release config. Apart from
  disabling `agent-loop`, don't disable workflows.
- **Don't delete repo secrets and don't touch GitHub App installations.**
  `AGENT_APP_ID`, `AGENT_APP_PRIVATE_KEY` and `CLAUDE_CODE_OAUTH_TOKEN` are only
  used by `agent-loop.yml`, but deleting them destroys credentials. Revoking the
  OAuth token and uninstalling the Fixer App are the human's job. Put them in
  the report's follow-ups. Leave `GH_TOKEN`, `DOCKER_*` alone.
- Don't merge, push to `main`, or delete remote branches you didn't create.
- No feature work. Code changes preserve behavior. If you find a real bug, write
  it up as a ticket candidate (Phase 6). If it's a one-liner, ship it as a
  separate `fix:` PR so it gets a release.
- Snapshot before you destroy anything. Phase 0 exports the full board. Delete
  a file only after you've harvested anything worth keeping into a surviving
  doc or a ticket draft.
- Stop and report instead of improvising if `gh` auth fails or `pnpm install`
  can't run. If baseline `pnpm verify` is red on untouched `main`, record the
  failure, carry on with docs and board work, and don't paper over it.

## How to use the mattpocock skills

The plugin is installed (`mattpocock-skills`). Some of its skills you can call
with the Skill tool. Others are marked `disable-model-invocation`, so they're
user-only, and for those you **Read the SKILL.md and follow it yourself**. Find
them with:

```
fd SKILL.md ~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills
```

The per-repo setup is already done. `docs/agents/{issue-tracker,triage-labels,domain}.md`
and the `## Agent skills` block in `CLAUDE.md` exist: GitHub, default labels,
single-context. Don't re-run setup interactively. In Phase 5, diff those three
files against the current templates in `setup-matt-pocock-skills/` and update
them in place.

| Phase | Skill | Invocation |
|---|---|---|
| 1 | `research` (MediaMTX surface, primary sources only) | Skill tool |
| 1 | `improve-codebase-architecture` (report only, skip the interactive grill) | read SKILL.md |
| 2 | `grilling` / `grill-with-docs`, self-grilled (rules below) | read SKILL.md |
| 2 | `domain-modeling` (CONTEXT.md, ADRs) | Skill tool |
| 4 | `codebase-design` (vocabulary for refactor decisions), `tdd` (if any behavior is touched) | Skill tool |
| 5 | `writing-for-agents` (CLAUDE.md, AGENTS.md) | Skill tool |
| 6 | `to-tickets` (ticket shape, blocking edges) | read SKILL.md |
| 7 | `triage` (state machine, closing comments) | read SKILL.md |
| 8 | `code-review` against `origin/main` | Skill tool |

**Self-grilling.** The grilling skills expect a human on the other end. Here you
play both parts. Write each question down, answer it from evidence (the code,
`docs/FEATURES.md`, the `CLAUDE.md` § Project goal, the issue history), and log
the Q and A in `.scratch/cleanup/DECISIONS.md`. If the answer depends on what
the maintainer *wants* rather than on a fact you can check, pick the default
that fits the project goal, mark it `[OWNER CALL]`, and list it in the final
report.

**About "the Claude API prompt optimizer".** The Console prompt improver is a UI
tool for API prompts. No supported endpoint for it is reachable from here. Its
job is done by `writing-for-agents` plus the cold-read test in Phase 5. Don't go
looking for an API.

## Working state and resuming

- Add `.scratch/` to `.gitignore`. Everything you produce along the way lives in
  `.scratch/cleanup/`.
- `.scratch/cleanup/PROGRESS.md` is a phase checklist. Update it at the end of
  every phase. If context gets compacted or you restart, re-read this guide,
  then PROGRESS.md and DECISIONS.md, and pick up from the first unchecked item.
- Commit at the end of each phase with a conventional message (`chore(docs): …`,
  `refactor(api): …`). Run `pnpm check` before each commit and `pnpm verify`
  before pushing.
- Use subagents for the wide read-only audits so file dumps stay out of your
  context. Each one writes its findings to a file, and you read the file.

## Phase 0: Setup and snapshot

1. `gh workflow disable agent-loop`, then confirm with `gh workflow view
   agent-loop`. This can be undone (`gh workflow enable`), and the file itself is
   deleted in Phase 4b. While it's merely disabled, the cron and the label
   triggers stop.
2. `git fetch origin && git switch -c chore/repo-cleanup origin/main`. This
   guide is untracked, so it comes along. Commit it.
3. Snapshot the board to `.scratch/cleanup/board-snapshot.json`: every open
   issue with body, labels and comments, plus open PRs and the full label list.
4. Run `pnpm install && pnpm verify` and record the baseline (pass/fail, timing)
   in PROGRESS.md. Check whether Docker is running. If it is, `pnpm build &&
   pnpm test:e2e` is available to you later.

## Phase 1: Audit (read-only, run in parallel)

Start these as parallel subagents. Each writes `.scratch/cleanup/audit-<name>.md`.

- **docs**: For every tracked `.md`, record its purpose, who reads it (human,
  agent, both), whether it overlaps another doc, whether it contradicts the
  code, and when it last changed. Give each a verdict: keep, merge into X,
  harvest-then-delete, or delete. Known suspects:
  - Agentic scaffolding: `TRIAGE-PLAN.md`, `GRILL-QUEUE.md`,
    `docs/M7-VALIDATION.md`.
  - `docs/debt/` (30 files). Map each one to an existing issue, a ticket
    candidate, or "drop". Also find whatever generates or references them:
    `apps/api/src/jobs.ts`, `Dockerfile`, the ADRs.
  - `docs/ideas/` (7 files, ~1,300 lines). The tickets and roadmap issue will
    replace it.
  - `docs/MIGRATION.md`. The migration is finished.
  - Five overlapping structure docs: `docs/STACK.md`,
    `docs/PROJECT-STRUCTURE.md`, `ARCHITECTURE.md`, `docs/RESPONSIVE.md`,
    `AGENTS.md`.
  - `GOVERNANCE.md` on a solo-maintainer project.
  - `docs/i18n/README.*.md` (29 machine-translated READMEs plus the
    `i18n:check:readme` script that enforces them).
- **code**: `pnpm dlx knip` (unused files, exports, deps), `eslint-disable`
  and `@ts-*` directives, TODO/FIXME, placeholder stubs (see debt
  `stream-card-action-stubs`), violations of the `CLAUDE.md` code rules
  (`console.*`, raw `fetch` on API routes, schemas defined outside
  `packages/contract`, hardcoded JSX strings, `process.env` outside `env.ts`),
  and tests that could never fail (ADR 0005 says this has happened twice
  already). Follow `improve-codebase-architecture`, but only up to its report:
  list the deepening candidates and don't run the interactive part.
- **board**: For each open issue, record status against the code: shipped,
  partly shipped (say which part), still valid, stale, or a duplicate of #N.
  Name the MediaMTX primitive it consumes, if any. Note any useful content
  that a new ticket would have to carry forward.
- **agent-infra**: `CLAUDE.md`, `AGENTS.md`, `apps/*/AGENTS.md`,
  `.claude/skills` → `.agents/skills` symlinks (are they used, and are they
  current?), `docs/agents/*`. Look for duplicated instructions, contradictions,
  stale facts (for example, the TypeScript version note), and anything Claude
  Code never loads. Also list **every smallhours touchpoint** for Phase 4b:
  `rg -n -i 'smallhours|agent-loop|agent-working|autofix|AGENT_APP|CLAUDE_CODE_OAUTH|M7' --hidden -g '!node_modules' -g '!CHANGELOG.md'`.
- **mediamtx**: Use `research`. Find the MediaMTX version the app targets
  (debt: schema lag at v1.11.3; issue #202 says 1.19.3), the current stable
  release, and which parts of MediaMTX's surface (config keys, API endpoints,
  `runOn*` hooks, playback server, protocols) Connect still doesn't expose.
  Use primary sources only: the MediaMTX repo, its README, its `apidocs`
  OpenAPI spec. Save the findings for Phase 6.

**Exit:** five audit files exist, and DECISIONS.md has a one-line verdict for
every doc and every open issue.

## Phase 2: Direction and domain

Self-grill the direction. How far is the app from "the ideal MediaMTX
companion"? What's the biggest gap? What should the app stop doing or stop
documenting? Should the 30-language README stay? Should the ADR 0004
enforcement mechanisms (#214, #305, #306) be built or dropped?

Then use `domain-modeling` to tidy `CONTEXT.md`. It currently mixes glossary
and policy (see debt `context-md-mixes-glossary-and-policy`). Review the six
ADRs. Mark any that are superseded or never implemented. Write a new ADR only
for a durable decision you actually made here, such as "the issue tracker is
the only backlog; no idea or debt files in-repo".

Defaults, unless the evidence argues otherwise. Each one is `[OWNER CALL]` and
all of them can be undone with git:

- Delete the translated READMEs and the readme i18n check, and keep the 30-locale
  *app* translations. Reason: machine-translated with no reviewer (#198), and a
  drift burden on every README edit.
- Delete `docs/ideas/` and `docs/debt/` once you've harvested them. The backlog
  lives in GitHub.
- Delete `MIGRATION.md`. If a mapping fact still explains current code, move it
  into an ADR or the architecture doc.

## Phase 3: Consolidate the docs

Aim for a set where every reader has exactly one place to look. Starting point,
adjust with evidence:

- **Root:** `README.md`, `CLAUDE.md` (plus `AGENTS.md`, per Phase 5),
  `CONTEXT.md`, `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`,
  `CHANGELOG.md` (generated, don't touch), license.
- **`docs/`:** `FEATURES.md`, one architecture doc (merging `ARCHITECTURE.md`,
  `STACK.md`, `PROJECT-STRUCTURE.md`, `RESPONSIVE.md`), `TESTING.md`,
  `I18N.md`, `adr/`, `agents/`.
- `examples/` and `demo/` READMEs stay if they're accurate.

Rules:

- Merge, don't concatenate. When a fact appears twice, keep it in the doc that
  owns it and link from the other.
- Check `README.md`'s feature list against `docs/FEATURES.md` and the code,
  because the `CLAUDE.md` hard rule requires both to stay accurate.
- Fix every reference to a moved or deleted file, in code, CI, the Dockerfile,
  scripts and docs: `rg -n '<old-path>'`. If you delete `docs/i18n/`, remove the
  script from `package.json` and CI too.
- Apply the `humanize` skill to prose humans will read (README, CONTRIBUTING).

**Exit:** the doc count meets target, `rg` finds no dangling references, and
`pnpm verify` is green.

## Phase 4: Code cleanup

Work through the code audit, one small commit per theme (unused deps, dead
exports, stubs, rule violations, vacuous tests).

- Only change what preserves behavior. Before deleting an export, confirm it
  isn't reached dynamically (routes in `apps/web/src/main.tsx`, oRPC router
  keys, message namespaces).
- If you replace or delete a vacuous test, `tdd` applies: break the covered line,
  watch the new test fail, then restore the line.
- A contract change updates contract, handler and web usage in the same commit.
- Architecture candidates from the audit don't get implemented. They compete for
  a slot in Phase 6.
- If Docker is available, run `pnpm build && pnpm test:e2e` at the end of the
  phase.

## Phase 4b: Remove smallhours

smallhours (`bcanfield/smallhours`) was the CI agent loop. It turned
`ready-for-agent` issues into PRs and auto-fixed red CI. The maintainer is
removing it entirely. Known touchpoints as of 2026-10-01. Re-run the Phase 1
`rg` to catch anything new.

- **Delete:** `.smallhours.yml`, `.github/workflows/agent-loop.yml`,
  `docs/M7-VALIDATION.md` (a smallhours milestone marker).
- **`eslint.config.mjs`:** remove the `.smallhours-toolkit/**` ignore.
- **`.github/workflows/ci.yml`:** the conventional-commit title check stays,
  because semantic-release still needs it. Rewrite the comment that justifies
  its placement by the loop. Moving it into its own workflow is optional.
- **`AGENTS.md`:** delete "If you are an agent running in CI". The sandbox, no
  Docker, the `.smallhours.yml` verify re-entry: none of it applies anymore. Keep
  the advice that a test must be seen failing, and move it to the conventions.
- **`docs/FEATURES.md`:** delete §15.5 "Agent environment". Fix the `pnpm
  verify` row and the PR-title-check bullet so they don't mention the loop. The
  `CLAUDE.md` hard rule requires this, because a CI integration is being removed.
- **`docs/agents/triage-labels.md`:** delete the "System-owned states" section.
  `ready-for-agent` still exists as the mattpocock role ("fully specified, an
  agent can pick it up"). It just doesn't trigger anything now.
- **ADR 0004** (enforced verify gate for agentic confidence): it was written
  for the loop. Use `domain-modeling` to mark it superseded, or rewrite what's
  still true (the `pnpm verify` gate itself), and close or re-scope #214, #305
  and #306 to match in Phase 7.
- **README / CONTRIBUTING:** remove any mention of the loop or of agent-opened
  PRs.

**Exit:** the `rg` above finds nothing outside `CHANGELOG.md`, and `pnpm verify`
is green.

## Phase 5: Agent instructions

Use `writing-for-agents`. Facts to work from:

- Claude Code loads `CLAUDE.md`, not `AGENTS.md`. Right now `CLAUDE.md` says
  "read AGENTS.md", and the two overlap (PR-title rule, env rule, logger rule,
  contract rule). Pick one canonical file. Recommended: make `AGENTS.md`
  canonical for non-Claude agents, and reduce `CLAUDE.md` to
  `@AGENTS.md` plus whatever is Claude-specific. Fold `apps/*/AGENTS.md` in, or
  justify keeping them.
- Cut anything the linter, typechecker or CI already enforces down to a single
  line. Cut anything an agent would learn by reading the code once. Keep
  commands, hard rules, where things live, and the project-goal lens.
- Update the "Where things live" table to match the Phase 3 doc set.
- Update `docs/agents/*` against the current setup-skill templates. Phase 4b
  already removed the smallhours label note.

**Cold-read test (the prompt-optimizer step).** Start a fresh subagent and give
it only the new always-loaded instructions. Ask it ten questions that a new
agent working here would need answered, for example: where API shapes live,
how to add a user-visible string, what to run before pushing, what PR title a
docs-only change gets, which label it must never apply, where binary endpoints
go, how to add a locale, what to read before touching recordings. Score its
answers against the repo. Fix the instructions and run it again until it gets
10/10 without padding the file. Record the scores in DECISIONS.md.

## Phase 6: The 10 tickets

These replace the old board. Read `to-tickets` and follow its shape: tracer-bullet
vertical slices, explicit blocking edges, acceptance criteria an AFK agent can
check.

Where candidates come from: Phase 1 board verdicts (whatever is still valid),
the MediaMTX gap research, the architecture candidates, the bugs you found,
`FEATURES-LONGLIST.md` Top 10, and debt items worth keeping.

How to choose:

- Apply the `CLAUDE.md` § Project goal lens first: does it surface or wrap
  something MediaMTX already exposes? At least 7 of the 10 should. Spend the
  other 3 or fewer on health work that unblocks the rest (the MediaMTX schema
  sync from #202 is the obvious one).
- Rank by leverage (what it unblocks), then MediaMTX-native fit, then whether
  an agent can implement it.
- Size each ticket for one agent session. For reference, a five-layer ticket
  (contract, api, web, i18n, tests) took one session about 26 minutes. Split
  anything bigger.

Each ticket body contains:

- **Why**: the user problem, plus the MediaMTX primitive it consumes (config
  key, endpoint, hook or protocol).
- **Scope** and **Out of scope**.
- **Acceptance criteria**, which must include updating `docs/FEATURES.md`.
- **Likely files**.
- **Verification**: `pnpm verify`, plus e2e if it touches the UI.
- **Blocked by**.
- **Supersedes #a, #b**: carry forward whatever content from those issues still
  matters, so nobody needs to open them again.

Draft them in `.scratch/cleanup/tickets/NN-slug.md`. Then have a fresh subagent
critique each one with: "could an agent implement this with zero questions, and
would the result be checkable?" Revise.

Publish with `gh issue create`. Before applying any label, confirm `agent-loop`
is still disabled. Labels: `ready-for-agent` if the ticket passed the critique
with no open questions, otherwise `ready-for-human`, plus `enhancement` or
`tech-debt`. Add blocking edges the way `docs/agents/issue-tracker.md` describes
(native dependencies, or fall back to a `Blocked by:` line). Then create one
roadmap issue that lists the 10 in order, with a sentence of reasoning each, and
pin it with `gh issue pin`.

## Phase 7: Close the old board

Re-check what's in flight (guardrails). For every other open issue except #4:

- If it's shipped, close it as completed with a comment pointing at the code or
  the FEATURES.md section.
- If a new ticket covers it, close it as not planned with "Superseded by #N" and
  a one-line explanation.
- If it's stale or out of direction, close it as not planned with the reason.
  Reopening is always possible.
- Epic #190: close it, pointing at the roadmap issue.

Label hygiene: the vocabulary that survives is the five mattpocock roles
(`docs/agents/triage-labels.md`), the category labels (`bug`, `enhancement`,
`documentation`, `tech-debt`), `released` (semantic-release uses it), and
GitHub's defaults. Delete the labels that only smallhours used: `agent`,
`agent-working`, `temp-agent-working`, `in-review`, `ci-failing`,
`ready-to-merge`, `human-needed`, `autofix-attempt-1/2/3`. Also delete
`grilled`, which was process bookkeeping. Deleting a label strips it from the
in-flight issues and PRs too, which is fine because it carries no meaning
without the loop. Record the deletions in the report.

## Phase 8: Review and ship

1. Run `code-review` against `origin/main` and fix what it finds.
2. Delete `CLEANUP-GUIDE.md` and make sure nothing references it. Final
   `pnpm verify`, then e2e if Docker is available.
3. Push and open the PR. Title: `chore: consolidate docs, prune dead code, reset
   agent instructions`. It doesn't ship a release, which is correct here; real
   fixes went in separate `fix:` PRs. The body is the final report.

## Final report (PR body, and your last message)

- **Outcome**: doc count before → after, LOC removed, deps removed, verify and
  e2e status.
- **Docs**: a table of each doc and what happened to it (kept / merged into X /
  deleted, with the reason).
- **Code**: what changed, grouped by theme.
- **Agent instructions**: before/after line counts and the cold-read scores.
- **Board**: a table of each old issue, its disposition and its successor.
  Links to the 10 tickets and the roadmap issue.
- **Way forward**: 3–5 sentences on what to do next and why, starting with
  which tickets to promote to `ready-for-agent` first.
- **[OWNER CALL] items**: every judgment call that was really the
  maintainer's, with the default you chose and how to undo it.
- **Human follow-ups**: delete the repo secrets `AGENT_APP_ID`,
  `AGENT_APP_PRIVATE_KEY` and `CLAUDE_CODE_OAUTH_TOKEN`. Revoke that OAuth token.
  Uninstall the smallhours Fixer GitHub App from the repo. Decide what happens
  to agent PRs #316 and #326, which nobody drives anymore. After this PR merges,
  `agent-loop.yml` is gone, so its disabled state doesn't matter.
- **Anything you couldn't do**, and why.
