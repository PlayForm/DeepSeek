Workspace-Gate - the workspace gate and the existence filter

The `tools/post-execute` pipeline runs against the fake ctx and REAL temp workspaces: a foreign workspace abstains before detect, our workspace emits only the companions that exist, an emptied intent abstains `no-companions`, and a foreign call never poisons the next in-workspace call.

## Scenarios

- G1: the FOREIGN workspace (a temp tree with `Source/Test/Foo/Test.ts` but no `Documentation/ARCHIVE-STYLE.md`), with cwd through the optional `workingDirectory` service, returns the downstream decision UNCHANGED with no note, the byte-exact `abstained foreign-workspace  0.00` line appears in the logger and the durable ledger, no `suggest` line appears, and the foreign call never creates per-agent memory; a service getter that THROWS still abstains with no logger warning.
- G2: with NO `workingDirectory` service at all, the absolute foreign path still resolves to no root and abstains with the same line.
- G3: OUR workspace (a temp tree WITH `Documentation/ARCHIVE-STYLE.md`, the Test.ts, `Maintain/Run-Smokes.mjs` and `README.md`) produces a byte-exact Suite note that names the two real companions plus the two illustrative `Source/Test/<Suite>` targets (placeholders are exempt from the existence filter), and the `suggest Suite 0.65 4 candidates` line counts all four.
- G4: an intent whose whole target set is absent (Counts in the minimal tree) abstains `abstained no-companions Counts 0.55` in both forms with no note.
- G5: a foreign abstention followed by an in-workspace read still emits the Suite note, because the gate is per call and not sticky.

## Fixtures

The fixtures use the shared Harness (fake ctx, real factory, real built Target) plus `node:fs` temp trees under the OS temp dir.

The optional service is injected as `Run.Context.workingDirectory = { get }`.

## Expected ledger strings (byte-exact, `test-suggester: ` prefix)

`abstained foreign-workspace  0.00` (empty intent, the no-signal shape),
`abstained no-companions Counts 0.55`,
`suggest Suite 0.65 4 candidates call read`.

## Expected count

8 PASS.
