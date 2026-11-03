# Projection

The P2 GRAPH PROJECTION (the approved re-spec: the generated repo index of the plan becomes a projection of `ctx.workspaceGraph`, Completion-Spec/03-SUGGESTERS.md section 3).

The candidate scoring derives from the graph (the node exists, its kind matches the expected kinds of the family, its depth, and its version-token recency), and the sticky section renders the projected index instead of the plain candidate list.

## Scenarios

- J1: with a graph that gives `SCHEME.md` the newer version token, the note leads with it, while the projection adds NO ledger string (the activation and the `suggest` line are the only lines).
- J2: without a graph the note is the neutral one (the documented fallback: scope 1.0, literal 0.5).
- J3: the sticky section renders the projected index (the proven companions, newest first), and it stays gated by `enabled`.
- J4: a graph that proves no candidate keeps the unproven tiers (literal 0.3), so the note is the neutral one.
- J5: the kind test, where a node of an unexpected kind scores below an expected one even when it carries the newer token.
- J6: the depth test, where with equal recency the shallower proven path leads.

## The candidates

Every scenario seeds one temp workspace (the anchor `README.md` plus the companions) and the agent's history with the anchor and its companions; the graph then proves those companion paths.

`Variable/Kinds` gives the synthetic `History` family the plain-file kinds, so the kind test is meaningful for it.

## Fixtures

The shared Harness plus `FakeGraph(nodes)`: a fake `workspaceGraph` whose `snapshot()` returns the given nodes and counts its reads.

The graph is mounted BEFORE apply (the `Make(Raw, Prepare)` hook), so the apply-time projection warm-up also sees it.

## Expected ledger strings (byte-exact, `hook-dsh-search-suggester: ` prefix)

`activated (bundle 0.2.1, history, threshold 0.75)`, `suggest History 0.87 2 candidates`.

## Expected count

8 PASS.
