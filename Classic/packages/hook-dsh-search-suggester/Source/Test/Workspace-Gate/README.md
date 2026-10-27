Workspace-Gate - the workspace gate and the existence filter

The `tools/post-execute` listener runs against the fake ctx and REAL temp workspaces: a foreign workspace abstains before detect and score, our workspace emits only the candidates that exist, an emptied family abstains `no-companions`, and a foreign call never poisons the next in-workspace call.

## Scenarios

- G1: the FOREIGN workspace (a temp tree with `package.json` but no `Documentation/ARCHIVE-STYLE.md`), with cwd through the optional `workingDirectory` service, returns the downstream decision UNCHANGED with no note, the logger and durable forms carry the byte-exact `abstained foreign-workspace  0.00` line, no `suggest` line appears, and the foreign call does not touch the ring (no call, no note, no pending window); a service getter that THROWS still abstains with no logger warning.
- G2: with NO `workingDirectory` service at all, the absolute foreign path still resolves to no root and abstains with the same line.
- G3: OUR workspace (a temp tree WITH `Documentation/ARCHIVE-STYLE.md`, `package.json`, `CHANGELOG.md` and the three family-glob files) produces a byte-exact Version note that names ONLY the candidates that exist (the missing `Site/Source/Library/Content.ts` and `Documentation/Plugins/PLUGIN-FAMILY.md` are NOT named), and the `suggest Version 0.92 5 candidates` line counts only the survivors.
- G4: a family whose whole candidate set is absent (Owner in the minimal tree) abstains `abstained no-companions Owner 0.66` in both forms with no note.
- G5: a foreign abstention followed by an in-workspace grep still emits the Version note, because the gate is per call and not sticky.

## Fixtures

The fixtures use the shared Harness (fake ctx with a DISTINCT root object, the real factory, the real built Target) plus `node:fs` temp trees under a dedicated temp parent (so the base-aware `*/<rest>` sibling glob sees only the fixture's branches).

The optional service is injected as `Run.Context.workingDirectory = { get }`.

## Expected ledger strings (byte-exact, `hook-dsh-search-suggester: ` prefix)

`abstained foreign-workspace  0.00` (empty intent, the no-signal shape),
`abstained no-companions Owner 0.66`,
`suggest Version 0.92 5 candidates`.

## Expected count

8 PASS.
