# Workspace-Gate - the workspace root and the history note

The `tools/post-execute` pipeline against the fake ctx and REAL temp workspaces: a foreign workspace abstains before any candidate work, our workspace emits the `History` note naming the companions the session touched right after the anchor, a workspace with no history abstains `no-history`, a history whose companions are gone abstains `no-companions`, and a foreign call never poisons the next in-workspace call.

## Scenarios

- G1: the FOREIGN workspace (a temp tree with `Source/Test/Foo/Test.ts` but no `.git` and no `package.json`), with no session cwd: the downstream decision comes back UNCHANGED with no note, the byte-exact `abstained foreign-workspace  0.00` line appears in the logger and the durable ledger, no `suggest` line appears, and the foreign call never creates per-agent memory; a service getter that THROWS still abstains with no logger warning.
- G2: with NO `workingDirectory` service at all, the absolute foreign path still resolves to no root and abstains with the same line.
- G3: OUR workspace (a temp tree WITH `package.json`, the anchor, `README.md` and `SCHEME.md`), where the seeded history makes `Adjacent` name the two companions: the `History 0.87` note is byte-exact and the `suggest History 0.87 2 candidates` line appears in both forms; another agent in the same tree, with no history, abstains `abstained no-history  0.00`.
- G4: a history whose whole companion set is gone (`GONE.md`, `ALSO-GONE.md`) abstains `abstained no-companions History 0.87`, both forms, with no note.
- G5: a foreign abstention followed by an in-workspace read still emits the History note, because the gate is per call and not sticky.

## Fixtures

The shared Harness (fake ctx, real factory, real built Target) plus `node:fs` temp trees under the OS temp dir.

The optional service is injected as `Run.Context.workingDirectory = { get }`.

The session history is seeded through the state probe (`Run.State.History.set(agent, { Seq, Touches })`), the same shape the `session/event` fold produces.

## Expected ledger strings (byte-exact, `test-suggester: ` prefix)

`abstained foreign-workspace  0.00` (empty family, the no-signal shape), `abstained no-history  0.00`, `abstained no-companions History 0.87`, `suggest History 0.87 2 candidates call read`.

## Expected count

9 PASS.
