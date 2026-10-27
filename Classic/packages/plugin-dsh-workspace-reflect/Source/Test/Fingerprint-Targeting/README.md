# Fingerprint-Targeting (the AST-aware targeting)

This folder covers the AST-aware targeting of the reflective Replace and the semantics consumer wiring of the rename.

## What it exercises

- **The graph's node is the AST source.** A `replace` may name the frozen node id of the graph (`node: "Block:<path>:3:body"`) instead of a line span, so `getNode` of the graph supplies the span and the check compares the content-derived FINGERPRINT with the current text before anything is written.
  The fingerprint formula belongs to the graph, and the folder computes the expected value with the built `Fingerprint` function of the graph, so a drift between the formulas of the two packages fails here.
- **Only the intended span changes.** The fixture is four lines, the Block node covers lines 3-4, and the replacement rewrites exactly those lines, so the ledger names the NODE's span, `replace <path> lines 3-4 (applied)`, never a span that the request carried.
- **A mismatch refuses and writes nothing.** A stale fingerprint (the span of the node changed under the caller) answers `rejected` with the documented `fingerprint mismatch` line and zero writes.
- **The textual fallback when the graph is absent.** A plain span replace still applies (the pre-AST form), a node target WITH an explicit span falls back to that span and still verifies the fingerprint, a node target with neither a graph nor a span refuses with `graph absent`, and the wrong fingerprint of the fallback still refuses.
- **The documented targeting refusals**: `fingerprint required for a node target`, `fingerprint without a node target`, `node path mismatch`, `node not targetable` (a File-kind id), `node not found`.
- **The rename consumes the semantics service.** The REAL built semantics plugin is mounted on the same fake context (probed through `ctx.get`, never injected), and the code filters the edits of its plan to the scope of the operation, so a block-scope rename rewrites only the in-scope occurrence while the file scope takes every edit.
  The deepened line records the edit count, and an identifier outside the scope falls back to the byte-exact `no occurrences in scope` refusal of the textual engine.

## The fixture

One inline file (`/repo/a.ts`) is served through the working fake fs of the harness, the fake graph serves the Block node, and the semantics plugin is mounted with `log: false`, so nothing is written outside the temp ledger.

## Expected ledger strings (byte-exact, `reflect: ` prefix)

`replace <path> lines 3-4 (applied)`,
`replace <path> lines 3-3 (applied)`,
`replace <path> lines 1-1 (applied)`,
`carried <path> (graph reindexed)`,
`rejected <path> (fingerprint mismatch)`,
`rejected <path> (graph absent)`,
`rejected <path> (node path mismatch)`,
`rejected <path> (no occurrences in scope)`,
`deepened <path> (1 edits via semantics)`,
`rename <path> alpha -> delta (applied)`,
`rename <path> alpha -> omega (applied)`.

## Expected count

18 PASS.
