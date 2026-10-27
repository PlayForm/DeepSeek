Workspace-Gate - the workspace gate and the existence filter

The `tools/post-execute` pipeline runs against the fake ctx and REAL temp workspaces: a foreign workspace abstains before recall and detect, our workspace emits the recalled files (history records, exempt from the existence filter), a record with an empty file set abstains `no-companions`, and a foreign call never poisons the next in-workspace call.

## Scenarios

- G1: the FOREIGN workspace (a temp tree with the recalled `src/Core.ts` but no `Documentation/ARCHIVE-STYLE.md`), with cwd through the optional `workingDirectory` service, returns the downstream decision UNCHANGED with no note, logs the byte-exact `abstained foreign-workspace  0.00` line in the logger and the durable ledger, logs no `suggest` line, and never creates per-agent memory; a service getter that THROWS still abstains with no logger warning.
- G2: with NO `workingDirectory` service at all, the absolute foreign path still resolves to no root and abstains with the same line.
- G3: OUR workspace (a temp tree WITH `Documentation/ARCHIVE-STYLE.md` and the recalled `README.md`) produces a byte-exact Repeat note that names the recalled file, and the `suggest Repeat 0.77 1 candidates` line counts it.
- G4: the recalled-history exemption names a recalled `src/Gone.ts` that is absent from the workspace (a history record, not a workspace path), while a record with an EMPTY file set abstains `abstained no-companions Repeat 0.77` in both forms with no note.
- G5: a foreign abstention followed by an in-workspace read still emits the Repeat note, because the gate is per call and not sticky.

## Fixtures

The fixtures use the shared Harness (fake ctx, real factory, real built Target) plus `WriteStore`/`rmStore` and `node:fs` temp trees under the OS temp dir.

The recalled files are history records, so the existence filter does not check them (the workspace gate still runs on the call path).

The optional service is injected as `Run.Context.workingDirectory = { get }`.

## Expected ledger strings (byte-exact, `replay-suggester: ` prefix)

`abstained foreign-workspace  0.00` (empty intent, the no-signal shape),
`abstained no-companions Repeat 0.77`,
`suggest Repeat 0.77 1 candidates call read`.

## Expected count

9 PASS.
