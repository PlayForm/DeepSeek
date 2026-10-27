Workspace-Gate - the workspace gate and the existence filter

The `tools/post-execute` pipeline against the fake ctx and REAL temp workspaces: a foreign workspace abstains before recall/detect, our workspace emits the recalled files (history records, exempt from the existence filter), a record with an empty file set abstains `no-companions`, and a foreign call never poisons the next in-workspace call.

## Scenarios

- G1: the FOREIGN workspace (a temp tree with the recalled `src/Core.ts` but no `Documentation/ARCHIVE-STYLE.md`), with cwd through the optional `workingDirectory` service: the downstream decision comes back UNCHANGED with no note, the byte-exact `abstained foreign-workspace  0.00` line appears in the logger and the durable ledger, no `suggest` line appears, and the foreign call never creates per-agent memory; a service getter that THROWS still abstains with no logger warning.
- G2: with NO `workingDirectory` service at all, the absolute foreign path still resolves to no root and abstains with the same line.
- G3: OUR workspace (a temp tree WITH `Documentation/ARCHIVE-STYLE.md` and the recalled `README.md`), where the Repeat note is byte-exact and names the recalled file, and the `suggest Repeat 0.77 1 candidates` line counts it.
- G4: the recalled-history exemption, where a recalled `src/Gone.ts` absent from the workspace is STILL named (a history record, not a workspace path), and a record with an EMPTY file set abstains `abstained no-companions Repeat 0.77`, both forms, with no note.
- G5: a foreign abstention followed by an in-workspace read still emits the Repeat note, because the gate is per call and not sticky.

## Fixtures

The shared Harness (fake ctx, real factory, real built Target) plus `WriteStore`/`rmStore` and `node:fs` temp trees under the OS temp dir.

The recalled files are history records, so the existence filter does not check them (the workspace gate still runs on the call path).

The optional service is injected as `Run.Context.workingDirectory = { get }`.

## Expected ledger strings (byte-exact, `replay-suggester: ` prefix)

`abstained foreign-workspace  0.00` (empty intent, the no-signal shape), `abstained no-companions Repeat 0.77`, `suggest Repeat 0.77 1 candidates call read`.

## Expected count

9 PASS.
