# Real-Graph-And-Tools

The folder tests the FIVE tools over a REAL populated graph.

## Intent

The intent is to prove the consumer chain end to end: the test populates the real `@playform/plugin-dsh-workspace-graph` service (from its built Target) through its own indexing trigger over a deterministic file map, and then the five tools of the workspace agent answer from that graph with real ids, real spans, real fingerprints, and the real `indexRevision`.

Every other folder in this package drives `FakeGraph`, and this one drives the real service, which is the difference that the POC gap analysis named ("the workspace tools return empty live").

## Scenario

The fixture is a four-file map under `/ws`: `src/core.ts` (which imports `./util.ts` through a `.ts` specifier, so the v0 parser resolves the imports edge), `src/util.ts`, `src/core.test.ts` (a test path), and `README.md` (two headings).

- **Group R1: the indexing trigger through the tool.**

    - **Check: "workspace_index fills the graph and returns the real counts".**

        The first tool call re-indexes the four files and returns `{ indexRevision: "8", indexed: 4, skipped: 0, failed: 0, files: 4 }` with the byte-exact `workspace: index /ws (4 indexed, 0 skipped, 0 failed, 4 files)` line.

    - **Check: "the index render is the pure one-line summary".**

        The render is `index @ 8: 4 indexed, 0 skipped, 0 failed, 4 files`.

- **Group R2: workspace_map.**

    - **Check: "workspace_map returns the real modules, roles, entry points and hot symbols".**

        The tool returns four modules in record order with the DocSection role for `README.md`, the two real entry points (nothing imports them), and the two hot symbols (`core`, `util`, whose files have inbound imports edges), at revision "8".

- **Group R3: workspace_find.**

    - **Check: "workspace_find returns real rows with real spans and fingerprints".**

        The tool returns the three real symbols, with `core` spanning 3-5, a 64-hex fingerprint, and the version token.

    - **Check: "cursor pagination resumes over the real node order".**

        With limit 1 the pages follow the real ids, and `truncated` flips.

- **Group R4: workspace_expand.**

    - **Check: "workspace_expand follows the real contains and imports edges".**

        The expansion carries the START node first (the graph contract), then the Symbol, the Block, and the imported file, with the three edges in record order.

- **Group R5: workspace_context.**

    - **Check: "the orientation packet carries real graph content".**

        The WORKSPACE line carries the real revision, the MAP lines carry the four real files with their roles, the FOCUS line carries the real id, span, and fingerprint prefix, the NEIGHBORS lines carry the real edges (imports first, then contains), and the EVIDENCE line carries the real span.

- **Group R6: the scope and the bound through the tool.**

    - **Check: "a scoped index walks only that subtree".**

        `/ws/src` yields three files.

    - **Check: "maxFiles is passed through to the graph walk".**

        The call yields two files at revision "2".

- **Group R7: purity.**

    - **Check: "the five tools never touch the workspace ctx's fs seam".**

        The fs of the workspace agent stays untouched, because the walk belongs to the graph service.

## Fixtures

- **`RealGraph` from the Harness.**

    The class is the real graph over an in-memory file map whose `resolve`/`stat`/`readText`/`listDir`/`contains` drive the real walk and parser.

    The graph gets its own ctx, and the ctx fs of the workspace plugin stays the throwing purity guard.

## Expected ledger strings (byte-exact)

- `plugin-dsh-workspace: workspace: index /ws (4 indexed, 0 skipped, 0 failed, 4 files)`.
- `plugin-dsh-workspace: workspace: index /ws/src (3 indexed, 0 skipped, 0 failed, 3 files)`.

## Edge cases

- **The role lookup.**

    The `pattern` of the graph's `find` is a case-insensitive SUBSTRING and not a glob (its declared contract), so the role lookup now goes through `Function/Role.ts` with the declared semantics.

    The old `<path>*` glob only ever worked against the matcher of the FakeGraph, and this folder is what caught it.

- **The expand shape.**

    The `expand` contract of the graph carries the start node first, and the FakeGraph fixture in Tools-And-Packet does not, so this folder is the one that pins the real shape.

- **The version token.**

    The graph version token is already `v1`, and the packet grammar prefixes a literal `v`, so the FOCUS line reads `vv1` - the existing render, unchanged here and asserted as it is.

## Expected count

10 PASS.
