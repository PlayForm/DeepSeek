# Projection

The P2 GRAPH PROJECTION (the approved re-spec: the plan's generated repo
index becomes a projection of `ctx.workspaceGraph`,
Completion-Spec/03-SUGGESTERS.md section 3). The candidate scoring derives
from the graph - the node exists, its kind matches the intent's expected
kinds, its depth and its version-token recency - and the sticky section
renders the projected index (the top graph paths per intent) instead of the
static pack list.

## Scenarios

- J1: with a graph proving the Version set, the note leads with the proven
  paths (`package.json`, `Site/package.json`, `CHANGELOG.md`,
  `Site/Source/Library/Content.ts`) and the unproven globs fall out of the
  top seven; the projection adds NO ledger string (the activation and the
  `suggest` line are the only lines).
- J2: without a graph the note is byte-identical to the PoC (the neutral
  fallback: scope 1.0, literal 0.5).
- J3: the sticky section renders the projected index (five concrete graph
  paths, the `*/Source/Function/Apply.ts` glob resolved to the ccr twin),
  and it stays gated by `enabled`.
- J4: a graph that proves no candidate keeps the unproven tiers (literal
  0.3, glob scope 0.7), so the literals outrank the unproven globs.
- J5: the kind test - a node of an unexpected kind scores below an expected
  one even when it is shallower.
- J6: the depth test - with equal recency, the shallower proven path leads.

## Fixtures

The shared Harness plus `FakeGraph(nodes)`: a fake `workspaceGraph` whose
`snapshot()` returns the given nodes and counts its reads. The graph is
mounted BEFORE apply (the `Make(Raw, Prepare)` hook), so the offline seed
also sees it.

## Expected ledger strings (byte-exact, `hook-dsh-search-suggester: ` prefix)

`activated (bundle 0.3.0, intents 10, threshold 0.75)`,
`suggest Version 0.92 7 candidates`.

## Expected count

8 PASS.
