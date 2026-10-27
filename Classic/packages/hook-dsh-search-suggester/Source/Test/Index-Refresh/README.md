# Index-Refresh

The plan's suite 7 (Index-Refresh) is re-specified onto the P2 graph projection: the projection is built once per apply, reused across calls, rebuilt on `tools/change` while `refreshOnBoot` holds, frozen when it does not, and re-probed while the graph is empty.

The suite asserts the snapshot call counts (the refresh evidence) and the note's order before and after a re-index.

## Scenarios

- R1: the projection is built once (the apply-time read) and reused by the judged calls.
- R2: `tools/change` drops the cache lazily (no snapshot inside the emit), the next read rebuilds it, and the re-indexed graph changes the note's order (`CHANGELOG.md` now leads).
- R3: `refreshOnBoot: false` freezes the projection, so `tools/change` does not rebuild and the note keeps the old order.
- R4: an empty snapshot is re-probed on every read (the projection is undefined, the note is neutral), with the snapshot counts pinned.
- R5: without a graph service the note is the neutral one and no warning fires.

## Expected ledger strings (byte-exact, `hook-dsh-search-suggester: ` prefix)

`suggest Version 0.92 7 candidates` (one per emitting agent).

## Expected count

7 PASS.
