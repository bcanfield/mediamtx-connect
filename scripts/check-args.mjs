// Argument parsing for `pnpm check`, in its own module so it can be tested
// without running the checks. See scripts/check.mjs for what it drives.
//
// `--since` with nothing after it used to read as `undefined` and fall through
// to working-tree mode: a green result for a set of files nobody asked about.

export function parseArgs(args) {
  const sinceIdx = args.indexOf('--since')
  const ref = sinceIdx === -1 ? null : args[sinceIdx + 1]

  // A ref starting with `-` is the next flag, not a ref named `--foo`.
  if (sinceIdx !== -1 && (!ref || ref.startsWith('-')))
    return { since: null, explicit: [], error: '--since needs a ref, e.g. `pnpm check --since main`' }

  // Guard the -1: without it `sinceIdx + 1` is 0 and a bare `pnpm check a.ts`
  // drops its own first path, falling back to the working tree.
  const refIdx = sinceIdx === -1 ? -1 : sinceIdx + 1

  return {
    since: ref,
    explicit: args.filter((a, i) => a !== '--since' && i !== refIdx),
  }
}
