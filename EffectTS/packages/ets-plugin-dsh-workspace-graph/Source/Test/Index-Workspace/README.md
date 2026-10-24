# Index-Workspace

The INDEXING TRIGGER over a real fixture tree, and the trace adapter
(`observe/stamp` on the family's bus) that keeps the graph incremental.

## Intent

Prove that the graph is populated by a real walk of a real directory, that the
populated graph answers the consumer queries (`snapshot`, `find`, `getNode`,
`expand`, `neighborhood`), that the walk is deterministic and bounded, that a
second run is idempotent, that the incremental trace consumer re-indexes an
observed change (with the detached loop's coalescing), and that the disabled
posture still skips every candidate with the byte-exact line. This closes the
gap the POC analysis named: "THE INDEXING TRIGGER (the live graph is empty)".

## Scenario

The fixture is written to a fresh temp directory (`node:fs`): `src/core.ts`
(imports `./util.ts` through a `.ts` specifier - the v0 parser adds no
extension, so a resolved imports edge needs the exact path), `src/util.ts`,
`src/core.test.ts` (a test path), `README.md` (two headings),
`node_modules/pkg/index.ts` (an excluded directory), and `src/link.ts`, a
symlink to a file OUTSIDE the root.

- Group I1: the walk and the counts.
    - Check: "indexWorkspace indexes the fixture tree and returns the counts" -
      `{ indexed: 4, skipped: 0, failed: 0, files: 4 }`, the byte-exact
      `graph: workspace indexed 4 files (4 indexed, 0 skipped, 0 failed)` line,
      revision "4".
    - Check: "the walk never follows the symlink out of the root and prunes
      node_modules" - no `link.ts`, `node_modules` or `secret` line at all: the
      out-of-root entry is not a candidate and the excluded directory is not
      descended.
    - Check: "the graph sees the records through snapshot, find and getNode" -
      11 nodes, 9 edges, four File nodes, two DocSections, one Test, the File
      node under its resolved path with a real version token, the `core`
      symbol, the `4:body` block, and the `The workspace` DocSection.
    - Check: "expand follows the resolved imports edge" - the expansion lists
      the File, the Symbol, the Block and the imported File, with the three
      edges in record order.
    - Check: "neighborhood serves the component the suggester consumes" - the
      anchor (definition), the test file (tests) and the imported file
      (dependencies); a repo-relative anchor matches by suffix; an unknown
      anchor is an empty component.
- Group I2: idempotence and the walk bound.
    - Check: "a second run is idempotent (same records, same fingerprints)" -
      the same counts, identical `id fingerprint` pairs, revision "8".
    - Check: "maxFiles bounds the walk and the cap is ledgered" - two
      candidates, two records, the byte-exact `graph: workspace capped at 2
      files` line.
    - Check: "maxFiles 0 indexes nothing and is still bounded (never
      unbounded)" - zero counts and the `capped at 0 files` line: a
      non-positive or non-finite option can never turn the walk unbounded.
    - Check: "a root that cannot be listed rejects instead of reporting zero" -
      the fs error propagates and nothing is stored.
- Group I3: the trace adapter (`observe/stamp` on the bus).
    - Check: "the trace subscription is wired when the graph is enabled" - one
      live `observe/stamp` subscription, ZERO `fs/observed` root handlers (the
      direct registration is gone; the bus is the source), on the ctx's root.
    - Check: "an observed change re-indexes the file with the byte-exact line" -
      `graph: reindexed <path> (indexed)`, revision "5", a new fingerprint and
      version, the new symbol in the graph, 13 nodes.
    - Check: "rapid events for one path are coalesced into one re-index" - two
      synchronous stamps produce ONE line and one revision bump.
    - Check: "an excluded path and an absent observation are ignored silently" -
      no revision change, no new re-index line (the absent stamp only emits
      `graph/invalidated`).
- Group I4: the disabled gate.
    - Check: "a disabled graph still walks but every candidate is skipped" -
      `{ indexed: 0, skipped: 4, failed: 0, files: 0 }`, no `fs/observed` handler,
      no `observe/stamp` subscription, and the four byte-exact
      `graph: skipped <path> (disabled)` lines.
- Group I5: the A7 purity guard.
    - Check: "the fake fs records zero writeText calls (A7)".

## Fixtures

- `Tree` from the Harness: writes the files to a fresh temp root and returns
  the root plus a sibling directory (the symlink target).
- `MakeDisk` from the Harness: the real graph over the disk-backed fake fs
  (`resolve` realpaths, `listDir` reads the directory, `contains` compares
  canonical identities).

## Expected ledger strings (byte-exact)

- `graph: workspace indexed 4 files (4 indexed, 0 skipped, 0 failed)`.
- `graph: workspace capped at 2 files`.
- `graph: reindexed <path> (indexed)`.
- `graph: skipped <path> (disabled)`.

## Edge cases

- A symlink out of the root is rejected by `ctx.fs.contains` before anything
  is read; a directory matching an exclude pattern is never descended.
- The coalescing is the trace library's detached loop, not a timer: the smoke
  awaits `State.Flush` (the loop's flush promise), so there is no sleep.

## Expected count

15 PASS.
