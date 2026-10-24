# Fingerprint-Targeting (the AST-aware targeting)

The folder covers the reflective Replace's AST-aware targeting and the
rename's semantics consumer wiring.

## What it exercises

- **The graph's node is the AST source.** A `replace` may name the graph's
  frozen node id (`node: "Block:<path>:3:body"`) instead of a line span: the
  graph's `getNode` supplies the span, and the content-derived FINGERPRINT is
  verified against the current text before anything is written. The fingerprint
  formula is the graph's own - the folder computes the expected value with the
  graph's built `Fingerprint` function, so a drift between the two packages'
  formulas fails here.
- **Only the intended span changes.** The fixture is four lines; the Block node
  covers lines 3-4 and the replacement rewrites exactly those lines (the ledger
  names the NODE's span, `replace <path> lines 3-4 (applied)`, never a span the
  request carried).
- **A mismatch refuses and writes nothing.** A stale fingerprint (the node's
  span changed under the caller) answers `rejected` with the documented
  `fingerprint mismatch` line and zero writes.
- **The textual fallback when the graph is absent.** A plain span replace still
  applies (the pre-AST form); a node target WITH an explicit span falls back to
  that span and still verifies the fingerprint; a node target with neither a
  graph nor a span refuses with `graph absent`; the fallback's wrong fingerprint
  still refuses.
- **The documented targeting refusals**: `fingerprint required for a node
  target`, `fingerprint without a node target`, `node path mismatch`, `node not
  targetable` (a File-kind id), `node not found`.
- **The rename consumes the semantics service.** The REAL built semantics
  plugin is mounted on the same fake context (probed through `ctx.get`, never
  injected); its plan's edits are filtered to the operation's scope, so a
  block-scope rename rewrites only the in-scope occurrence while the file scope
  takes every edit. The deepened line records the edit count; an identifier
  outside the scope falls back to the textual engine's byte-exact
  `no occurrences in scope` refusal.

## The fixture

One inline file (`/repo/a.ts`) served through the harness's working fake fs;
the fake graph serves the Block node; the semantics plugin is mounted with
`log: false`, so nothing is written outside the temp ledger.

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
