# References (the consumer wiring of the `references` edge)

The folder covers the DEFERRED `references` edge of the graph, now wired: after the graph parses a file, it asks the workspace-semantics service for the reference list of the file and emits one honest edge per resolved reference.

## What it exercises

- **The probe, not the inject.**

    The `inject` of the graph stays `["fs", "storage"]`, and the plugin finds the service through `ctx.get` under its registered name `workspaceSemantics` (and the short alias of the plan, `semantics`).

    A bare fixture therefore keeps working unchanged.

- **The real index with the REAL service.**

    The test writes a temp tree to disk and indexes it through `indexWorkspace`, and it mounts the semantics service on the same fake context with its real built plugin.

    The fixture (`src/core.ts`) declares `config` and `core` and uses `config.port` inside `core` and again at the top level, so the folder pins both owner rules:

    - inside a declaration: `Symbol:<path>:core -references-> Symbol:<path>:config` with the line span of the use site;
    - at the top level: `File:<path> -references-> Symbol:<path>:config`.

- **The edge counts are real.**

    The `graph: indexed ...` line and the snapshot count the references edges (4 nodes and 5 edges for the fixture; 8 nodes and 7 edges for the whole tree).

- **No service, no edges.**

    The same tree without the service produces zero `references` edges, so the counts fall back to the parsed ones (5 edges) and no `semantics:` line appears.

- **A disabled service is silence.**

    The service is present, answers `undefined`, and adds no edge and no line of its own beyond its own `disabled` line.

- **No dangling edges.**

    In a Markdown file with a link target the semantics service resolves the file (1 symbol, 1 reference), but the target names no Symbol node of the file, so NO edge is emitted.

- **The alias.**

    The plugin probes a service that is registered only under `semantics` too.

## The fixture

`Tree()` writes a real temp directory (`src/core.ts`, `src/lib.ts`, `README.md`), and the harness serves it through its disk-backed fake fs, whose `readText` accepts both a resolved target and a bare path (the semantics service reads by path).

The test mounts the semantics plugin with `log: false`, so nothing is written outside the temp tree.

## Expected ledger strings (byte-exact, `graph: ` prefix)

`indexed <path> version <version> (4 nodes, 5 edges)` (with the service),
`indexed <path> version <version> (4 nodes, 3 edges)` (without it),
`semantics: resolved <path> (2 symbols, 2 references)`,
`semantics: resolved <path> (1 symbols, 1 references)` (the Markdown file),
`semantics: disabled (enabled=false)`.

## Expected count

10 PASS.
