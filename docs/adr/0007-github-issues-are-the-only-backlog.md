# 0007 — GitHub issues are the only backlog

**Date:** 2026-10-01
**Status:** Accepted

Unshipped work lives in GitHub issues and nowhere else. The repo describes what exists
(`docs/FEATURES.md`) and why it is built that way (ADRs). It does not describe what
might exist.

Between July and September 2026 the repo grew a second backlog alongside the issue tracker:
34 files under `docs/debt/`, seven idea catalogs under `docs/ideas/` (~1,300 lines),
and two planning docs (`TRIAGE-PLAN.md`, `GRILL-QUEUE.md`), most of them written by agent
skills. Within weeks half of the debt entries were already paid off but not deleted,
the idea catalogs said "nothing here is shipped" about shipped features, and each
item existed twice (file and issue) with no rule for which one was right. All of it was
harvested into issues and deleted on 2026-10-01. The pinned roadmap issue orders what
comes next.

The trade-off: in-repo files are greppable by an agent without network access, while
issues need `gh`. We took the network dependency over the drift. `docs/agents/issue-tracker.md`
says how to read and write issues.

**Consequences.** Don't create `docs/debt/`, `docs/ideas/`, `TODO.md`, or a planning doc
in the tree. A known limitation goes in a code comment, if the code is the right place
for it, or an issue. A tool that writes a debt registry to the repo should be pointed
at the issue tracker or not used.
