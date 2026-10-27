# Real-Graph-And-Tools

The test drives the FIVE tools over a REAL populated graph.

## Intent

The test proves the consumer chain end to end: the real `@playform/plugin-dsh-workspace-graph` service (from its built Target) is populated through its own indexing trigger over a deterministic file map, and the five tools of the workspace agent then answer from that graph with real ids, real spans, real fingerprints, and the real `indexRevision`.

Every other folder in this package drives `FakeGraph`, while this one drives the real service, which is the difference that the POC gap analysis named ("the workspace tools return empty live").

## Scenario

The fixture is a four-file map under `/ws`: `src/core.ts` (imports `./util.ts` through a `.ts` specifier, so the v0 parser resolves the imports edge), `src/util.ts`, `src/core.test.ts` (a test path) and `README.md` (two headings).

- Group R1: the indexing trigger through the tool.
    - Check: "workspace_index fills the graph and returns the real counts" - the first tool call re-indexes the four files as `{ indexRevision: "8", indexed: 4, skipped: 0, failed: 0, files: 4 }` and gives the byte-exact `workspace: index /ws (4 indexed, 0 skipped, 0 failed, 4 files)` line.
    - Check: "the index render is the pure one-line summary" - `index @ 8: 4 indexed, 0 skipped, 0 failed, 4 files`.
- Group R2: workspace_map.
    - Check: "workspace_map returns the real modules, roles, entry points and hot symbols" - four modules in record order with the DocSection role for `README.md`, the two real entry points (nothing imports them), the two hot symbols (`core`, `util`, whose files have inbound imports edges), and revision "8".
- Group R3: workspace_find.
    - Check: "workspace_find returns real rows with real spans and fingerprints" - the three real symbols, `core` spanning 3-5, a 64-hex fingerprint, and the version token.
    - Check: "cursor pagination resumes over the real node order" - limit 1 pages by the real ids, and `truncated` flips.
- Group R4: workspace_expand.
    - Check: "workspace_expand follows the real contains and imports edges" - the expansion carries the START node first (the graph contract), then the Symbol, the Block and the imported file, with the three edges in record order.
- Group R5: workspace_context.
    - Check: "the orientation packet carries real graph content" - the WORKSPACE line carries the real revision, the MAP lines the four real files with their roles, the FOCUS line the real id, span and fingerprint prefix, the NEIGHBORS lines the real edges (imports first, then contains), and the EVIDENCE line the real span.
- Group R6: the scope and the bound through the tool.
    - Check: "a scoped index walks only that subtree" - `/ws/src` gives three files.
    - Check: "maxFiles is passed through to the graph walk" - two files, revision "2".
- Group R7: purity.
    - Check: "the five tools never touch the workspace ctx's fs seam" - the own fs of the workspace agent stays untouched, and the walk belongs to the graph service.

## Fixtures

- `RealGraph` from the Harness: the real graph class over an in-memory file map whose `resolve`/`stat`/`readText`/`listDir`/`contains` drive the real walk and parser.
  The graph gets its own ctx, while the ctx fs of the workspace plugin stays the throwing purity guard.

## Expected ledger strings (byte-exact)

- `plugin-dsh-workspace: workspace: index /ws (4 indexed, 0 skipped, 0 failed, 4 files)`.
- `plugin-dsh-workspace: workspace: index /ws/src (3 indexed, 0 skipped, 0 failed, 3 files)`.

## Edge cases

- The `find` `pattern` of the graph is a case-insensitive SUBSTRING and not a glob, per its declared contract, and the role lookup now goes through `Function/Role.ts` with the declared semantics, because the old `<path>*` glob only ever worked against the matcher of the FakeGraph and this folder is what caught it.
- The `expand` contract of the graph carries the start node first, and the FakeGraph fixture in Tools-And-Packet does not, so this folder is the one that pins the real shape.
- The version token of the graph is already `v1`, and the packet grammar prefixes a literal `v`, so the FOCUS line reads `vv1`, which is the existing render, unchanged here and asserted as it is.

## Expected count

10 PASS.
