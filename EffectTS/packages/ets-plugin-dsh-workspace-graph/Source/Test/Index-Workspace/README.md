# Index-Workspace

The folder covers the INDEXING TRIGGER over a real fixture tree and the trace adapter (`observe/stamp` on the bus of the family) that keeps the graph incremental.

## Intent

The intent is to prove that a real walk of a real directory populates the graph, and that the populated graph answers the consumer queries (`snapshot`, `find`, `getNode`, `expand`, `neighborhood`).

The folder also proves that the walk is deterministic and bounded, that a second run is idempotent, that the incremental trace consumer re-indexes an observed change (with the coalescing of the detached loop), and that the disabled posture still skips every candidate with the byte-exact line.

This closes the gap that the POC analysis named: "THE INDEXING TRIGGER (the live graph is empty)".

## Scenario

The test writes the fixture to a fresh temp directory (`node:fs`): `src/core.ts` (which imports `./util.ts` through a `.ts` specifier, and the v0 parser adds no extension, so a resolved imports edge needs the exact path), `src/util.ts`, `src/core.test.ts` (a test path), `README.md` (two headings), `node_modules/pkg/index.ts` (an excluded directory), and `src/link.ts`, a symlink to a file OUTSIDE the root.

- **Group I1: the walk and the counts.**

    - **Check: "indexWorkspace indexes the fixture tree and returns the counts".**

        The call returns `{ indexed: 4, skipped: 0, failed: 0, files: 4 }`, writes the byte-exact `graph: workspace indexed 4 files (4 indexed, 0 skipped, 0 failed)` line, and reports revision "4".

    - **Check: "the walk never follows the symlink out of the root and prunes node_modules".**

        No `link.ts`, `node_modules`, or `secret` line appears at all, because the out-of-root entry is not a candidate and the excluded directory is not descended.

    - **Check: "the graph sees the records through snapshot, find and getNode".**

        The graph holds 11 nodes and 9 edges: four File nodes, two DocSections, one Test, the File node under its resolved path with a real version token, the `core` symbol, the `4:body` block, and the `The workspace` DocSection.

    - **Check: "expand follows the resolved imports edge".**

        The expansion lists the File, the Symbol, the Block, and the imported File, with the three edges in record order.

    - **Check: "neighborhood serves the component the suggester consumes".**

        The component holds the anchor (definition), the test file (tests), and the imported file (dependencies), and a repo-relative anchor matches by suffix.

        An unknown anchor is an empty component.

- **Group I2: idempotence and the walk bound.**

    - **Check: "a second run is idempotent (same records, same fingerprints)".**

        The run gives the same counts, identical `id fingerprint` pairs, and revision "8".

    - **Check: "maxFiles bounds the walk and the cap is ledgered".**

        Two candidates give two records and the byte-exact `graph: workspace capped at 2 files` line.

    - **Check: "maxFiles 0 indexes nothing and is still bounded (never unbounded)".**

        The call gives zero counts and the `capped at 0 files` line, because a non-positive or non-finite option can never turn the walk unbounded.

    - **Check: "a root that cannot be listed rejects instead of reporting zero".**

        The fs error propagates, and the graph stores nothing.

- **Group I3: the trace adapter (`observe/stamp` on the bus).**

    - **Check: "the trace subscription is wired when the graph is enabled".**

        The ctx's root holds one live `observe/stamp` subscription and ZERO `fs/observed` root handlers, because the direct registration is gone and the bus is the source.

    - **Check: "an observed change re-indexes the file with the byte-exact line".**

        The re-index writes `graph: reindexed <path> (indexed)` at revision "5", with a new fingerprint and version, the new symbol in the graph, and 13 nodes.

    - **Check: "rapid events for one path are coalesced into one re-index".**

        Two synchronous stamps produce ONE line and one revision bump.

    - **Check: "an excluded path and an absent observation are ignored silently".**

        The graph shows no revision change and no new re-index line, because the absent stamp only emits `graph/invalidated`.

- **Group I4: the disabled gate.**

    - **Check: "a disabled graph still walks but every candidate is skipped".**

        The walk returns `{ indexed: 0, skipped: 4, failed: 0, files: 0 }` with no `fs/observed` handler and no `observe/stamp` subscription, and it writes the four byte-exact `graph: skipped <path> (disabled)` lines.

- **Group I5: the A7 purity guard.**

    - **Check: "the fake fs records zero writeText calls (A7)".**

## Fixtures

- **`Tree` from the Harness.**

    The helper writes the files to a fresh temp root and returns the root plus a sibling directory (the symlink target).

- **`MakeDisk` from the Harness.**

    The helper gives the real graph over the disk-backed fake fs (`resolve` realpaths, `listDir` reads the directory, `contains` compares canonical identities).

## Expected ledger strings (byte-exact)

- `graph: workspace indexed 4 files (4 indexed, 0 skipped, 0 failed)`.
- `graph: workspace capped at 2 files`.
- `graph: reindexed <path> (indexed)`.
- `graph: skipped <path> (disabled)`.

## Edge cases

- **The symlink and the exclude.**

    `ctx.fs.contains` rejects a symlink out of the root before anything is read, and the walk never descends a directory that matches an exclude pattern.

- **The coalescing.**

    The coalescing is the detached loop of the trace library and not a timer, because the smoke awaits `State.Flush` (the flush promise of the loop) and never sleeps.

## Expected count

15 PASS.
