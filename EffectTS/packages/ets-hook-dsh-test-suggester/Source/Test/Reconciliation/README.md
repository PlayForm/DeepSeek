# Reconciliation - the smoke claims against the tree

The wave 2c re-spec of the completion spec for this package ([03-SUGGESTERS.md](../../../../Documentation/Plans/Completion-Spec/03-SUGGESTERS.md)): on a judged call in a package, the smoke claims of the package are reconciled with the tree it actually has.

The evidence is the `## Expected count` of the folder READMEs, the folders, the suite files, the roster of the aggregate runner (`Target/Test/<Folder>/Test.js`), and, when the workspace graph is present, its `Test` nodes.

The reconciliation is READ-ONLY: it reads with `node:fs` (never `ctx.fs`), and its only surface is ONE `additionalContexts` notice.

## Scenarios

- C1: a CONSISTENT tree (two counted, suite-bearing, rostered folders) logs the byte-exact clear line exactly once per root and emits NO note, which is the documented abstention.
- C2: a DRIFTING tree emits ONE note naming every drifted file and the expected/actual counts, byte-exactly: a folder without a README count, a README count whose `Test.ts` is gone, and a suite the aggregate runner never runs; the ledger line is byte-exact too, and the note is one frozen labeled notice.
- C3: the graph-present path names a stale `Test` node (a node whose file is gone), while the graph-absent path of the same tree stays clear (the graph is optional) and an unpopulated graph contributes no drift.
- C4: the gate, where the dedupe holds an unchanged drift set, the cooldown suppresses a changed one, and the per-turn cap suppresses the next.
- C5: a package with no `Source/Test` tree is silent (nothing to reconcile), and a foreign workspace is gated before the reconciliation runs.
- C6: the read-only posture, where ZERO `ctx.fs` operations happen and the tree is untouched after the note.

## Fixtures

Real temp package trees (the pack signature, `package.json`, `Source/Test/...`, `Target/Test/...`) plus the shared Harness (fake ctx, real factory, real built Target).

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
