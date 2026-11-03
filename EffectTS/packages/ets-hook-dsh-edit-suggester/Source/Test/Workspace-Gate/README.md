Workspace-Gate - the workspace root and the history note

The `tools/post-execute` listener against the fake ctx and REAL temp trees: a call path with no
workspace root abstains before any candidate work, a rooted temp tree emits the HISTORY note naming
the companions the session touched right after the anchor, and the same tree with an agent that has
no history abstains `no-history`.

## Scenarios

- G1: the FOREIGN tree (no `.git`, no `package.json`) and NO session cwd - the
  downstream decision comes back UNCHANGED with no note, the logger and
  durable forms carry the byte-exact `abstained foreign-workspace  0.00`
  line, no `suggest` line appears, and the foreign call does not touch the
  ring (calls 0, no touched path, no note).

  A service getter that THROWS still abstains with no logger warning (the
  probe never throws).
- G2: the ROOTED tree (a `package.json`, the anchor `Source/Variable/Config.ts`,
  and the two companions `README.md` and `SCHEME.md`) with the session history
  seeded through the projection drive (three committed `tool/call` events
  folded by the registered unit) - the History note is byte-exact (family
  line, the two companions with `touched 1 time(s) after this file`, the
  standing caution), and the `suggest History 0.87 2 companions <path>` line
  is byte-exact in both forms.
- G2: the SAME rooted tree with an agent that has no history abstains
  `abstained no-history  0.00` (both forms) with no note - the root resolves,
  the pack does not exist, and the history is the only candidate source.

## Fixtures

The shared Harness (fake ctx with a DISTINCT root object, the real factory, the real built Target)
plus `node:fs` temp trees under the OS temp dir.

The optional service is injected as `Run.Context.workingDirectory = { get }`, the same shape that
the real harness service exposes, never a hard inject.

The session history is committed through the fake `sessionProjections` registry's `Commit` drive
(the registered unit folds each `tool/call` into that session's cell), so the suite does not need a
session bus.

## Expected ledger strings (byte-exact, `hook-dsh-edit-suggester: ` prefix)

`abstained foreign-workspace  0.00` (empty family, the no-signal shape),
`suggest History 0.87 2 companions <the temp Source/Variable/Config.ts path>`,
`abstained no-history  0.00`.

## Expected count

6 PASS.
