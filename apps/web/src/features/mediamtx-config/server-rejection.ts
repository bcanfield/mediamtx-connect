// MediaMTX names the key it refused in the reason it answers with — `invalid
// source: '...'`, `'runOnInit' can't be used with a regular expression path` —
// so a rejected save can land on the field that caused it instead of only in a
// toast that disappears with the field still wrong.
//
// Matched against the keys the save actually sent: nothing else could be at
// fault, and a reason that mentions none of them means we don't know which
// field to blame. Longest key first, or `record` would swallow `recordPath`.
export function offendingField(reason: string, changedKeys: string[]): string | null {
  const haystack = reason.toLowerCase()
  return [...changedKeys]
    .sort((a, b) => b.length - a.length)
    .find(key => haystack.includes(key.toLowerCase())) ?? null
}
