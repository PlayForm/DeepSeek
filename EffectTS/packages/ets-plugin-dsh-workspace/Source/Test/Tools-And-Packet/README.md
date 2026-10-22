# Tools-And-Packet - the four navigation tools and the orientation packet tests

The four tools executed against the real built library over a deterministic
fake graph: the disabled refusals, the byte-exact per-tool ledger lines, the
cursor pagination, the deferred-kind honesty, the eight-line packet grammar,
the token truncation, the stale marker, and the fs purity on the tool path.

## Scenarios

- T1: while disabled each tool refuses with its byte-exact error
  (`workspace_map: the workspace plugin is disabled (enabled=false)` etc.).
- T2: workspace_map returns the contract shape (modules with roles from the
  DocSection, entry points from the imports edges, hot symbols from the
  imported files), the byte-exact `workspace: map (root) (2 modules,
  2 files)` line, and the pure one-line render.
- T3: workspace_find returns the row shape, paginates strictly by cursor,
  and logs the byte-exact `workspace: find src/*.ts (2 nodes)` line.
- T4: workspace_expand follows outgoing edges, returns an honest empty set
  for deferred kinds and unknown ids, and logs the byte-exact
  `workspace: expand File:src/b.ts (1 nodes, 1 edges)` line.
- T5: workspace_context renders the fixed eight-line grammar byte-exactly,
  ranks imports above contains, sets STALE on a version mismatch, logs the
  byte-exact packet line, stamps LastPacketTokens, and truncates honestly
  under a small budget.
- T6: executing all four tools never touches the fs seam.

## Expected count

19 PASS.
