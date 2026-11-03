Workspace-Gate - the workspace gate and the recall validation

The `tools/post-execute` pipeline against the fake ctx and REAL temp workspaces: a foreign workspace abstains before recall/detect, our workspace emits only the recalled files the tree still has, a deleted path and a bare directory are dropped, a record whose files all vanish abstains `no-companions`, a recalled path in the anchor's own directory wins outright while the unrelated subtrees are dropped, without such a neighbor same-tree paths rank first, and a foreign call never poisons the next in-workspace call.

## Scenarios

- G1: the FOREIGN workspace (a temp tree with the recalled `src/Core.ts` but no `.git`/`package.json` root), with cwd through the optional `workingDirectory` service: the downstream decision comes back UNCHANGED with no note, the byte-exact `abstained foreign-workspace  0.00` line appears in the logger and the durable ledger, no `suggest` line appears, and the foreign call never creates per-agent memory; a service getter that THROWS still abstains with no logger warning.
- G2: with NO `workingDirectory` service at all, the absolute foreign path still resolves to no root and abstains with the same line.
- G3: OUR workspace (a temp tree WITH the `package.json` root marker and the recalled `src/Core.ts`), where the Repeat note is byte-exact (`intent=Repeat confidence=0.87`) and names the recalled file, and the `suggest Repeat 0.87 1 candidates` line counts it.
- G4: the tree validation, where a recalled `src/Gone.ts` the tree no longer has is DROPPED while the live `src/Core.ts` is named, a recalled DIRECTORY (`src/Nested`) is dropped, a record whose files ALL vanish abstains `abstained no-companions Repeat 0.87`, and a record with an EMPTY file set abstains the same way - all with no note.
- G5: a foreign abstention followed by an in-workspace read still emits the Repeat note, because the gate is per call and not sticky.
- G6: the same-tree ranking, where a record naming an `EffectTS` path first and a `Classic` path second is re-ranked so the `Classic` path (the call's own tree) is named first, and the `EffectTS` file is still named (never dropped for sitting in the other tree); no recalled path sits in the anchor's own directory here, so the tree partition is the fallback that decides.
- G7: the same-directory preference (the live-noise shape), where a record names one file beside the brand-new anchor (`packages/one/Source/Function/Exists.ts`) plus two unrelated subtrees (`packages/two/Source/Function/Exists.ts` and `packages/one/Source/Interface/Exists.ts`): the note names ONLY the neighbor, `targets (1)`, and both unrelated paths are dropped.

## Fixtures

The shared Harness (fake ctx, real factory, real built Target) plus `WriteStore`/`rmStore` and `node:fs` temp trees under the OS temp dir.

The root marker is `package.json`, because the workspace root is pack-independent (no pack signature gates a call any more).

The recalled files are validated against the tree: only an existing regular file is named, the anchor is excluded, a path in the anchor's own directory wins outright, and without such a neighbor same-tree paths rank first.

The optional service is injected as `Run.Context.workingDirectory = { get }`.

## Expected ledger strings (byte-exact, `replay-suggester: ` prefix)

`abstained foreign-workspace  0.00` (empty intent, the no-signal shape), `abstained no-companions Repeat 0.87`, `suggest Repeat 0.87 1 candidates call read`, `suggest Repeat 0.87 2 candidates call read`.

## Expected count

13 PASS.
