Workspace-Gate - the workspace root and the history note

The `tools/post-execute` listener against the fake ctx and REAL temp trees: a call path with no
`.git`/`package.json` root and no session cwd abstains `foreign-workspace`, a call inside a rooted
temp tree emits the HISTORY note naming the companions the session touched right after the anchor,
and the same rooted tree with no history abstains `no-history`.

## Scenarios

- G1: the FOREIGN path (a temp tree with `Source/Function/Apply.ts`, no
  `.git` and no `package.json` anywhere above it, and NO
  `workingDirectory` service) - the downstream decision comes back UNCHANGED
  with no note, the logger and durable forms carry the byte-exact
  `abstained foreign-workspace  0.00` line, no `suggest` line appears, and the
  foreign call never creates per-agent memory.

  A service getter that THROWS still abstains with no logger warning.
- G2: the ROOTED temp tree (a `.git` marker, the anchor
  `Source/Function/Apply.ts`, `Source/Library.ts` and `README.md`) - the
  session history is seeded through the projection drive (three committed
  `tool/call` events folded by the registered unit), and the History note is
  byte-exact (the two relative companion lines with their
  `touched 1 time(s) after this file` reasons and the history caveat); the
  `suggest History 0.70 2 candidates call write` line is byte-exact in both
  forms.
- G3: the SAME rooted tree with an agent that has no history abstains
  `abstained no-history  0.00` (both forms) with no note - the root resolves,
  the pack does not exist, and the history is the only candidate source.

## Fixtures

The shared Harness (fake ctx with a DISTINCT root object, the real factory, the real built Target)
plus `node:fs` temp trees under the OS temp dir.

The optional service is injected as `Run.Context.workingDirectory = { get }`; the foreign group
deletes it so the root walk has no cwd fallback.

## Expected ledger strings (byte-exact, `convention-suggester: ` prefix)

`abstained foreign-workspace  0.00` (empty intent, the no-signal shape),
`abstained no-history  0.00`,
`suggest History 0.70 2 candidates call write`.

## Expected count

6 PASS.
