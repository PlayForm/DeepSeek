# Reconciliation - the smoke claims against the tree

The completion spec's wave 2c re-spec for this package ([03-SUGGESTERS.md](../../../../Documentation/Plans/Completion-Spec/03-SUGGESTERS.md)) reconciles a package's smoke claims with the tree it actually has on a judged call in that package: the folder READMEs' `## Expected count`, the folders, the suite files, the aggregate runner's roster (`Target/Test/<Folder>/Test.js`), and, when the workspace graph is present, its `Test` nodes.

The reconciliation is READ-ONLY: it reads with `node:fs` (never `ctx.fs`), and its only surface is ONE `additionalContexts` notice.

## Scenarios

- C1: a CONSISTENT tree (two counted, suite-bearing, rostered folders) logs the byte-exact clear line exactly once per root and emits NO note, which is the documented abstention.
- C2: a DRIFTING tree emits ONE note naming every drifted file and the expected/actual counts byte-exactly: a folder without a README count, a README count whose `Test.ts` is gone, and a suite the aggregate runner never runs, with a byte-exact ledger line and one frozen labeled notice.
- C3: the graph-present path names a stale `Test` node (a node whose file is gone), the graph-absent path of the same tree stays clear (the graph is optional), and an unpopulated graph contributes no drift.
- C4: the gate, where the dedupe holds an unchanged drift set, the cooldown suppresses a changed one, and the per-turn cap suppresses the next.
- C5: a package with no `Source/Test` tree is silent (nothing to reconcile), and a foreign workspace is gated before the reconciliation runs.
- C6: the read-only posture, where ZERO `ctx.fs` operations occur and the tree is untouched after the note.

## Fixtures

The fixtures use real temp package trees (the pack signature, `package.json`, `Source/Test/...`, `Target/Test/...`) plus the shared Harness (fake ctx, real factory, real built Target).

The graph fake supplies only the `find` facet the probe uses.

There is no fake clock.

## Expected ledger strings (byte-exact, `test-suggester: ` prefix)

```
reconciliation clear <package> (<e> expected, <a> actual)
reconciliation drift <n> drifts <package> (<e> expected, <a> actual) call <tool>
reconciliation skipped deduped <package>
reconciliation skipped cooldown <package>
reconciliation skipped cap <package>
```

## Expected count

19 PASS.
