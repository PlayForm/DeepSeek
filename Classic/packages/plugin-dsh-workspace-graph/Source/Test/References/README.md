# References (the consumer wiring of the `references` edge)

This folder covers the graph's DEFERRED `references` edge, which is now wired: after a file is parsed, the graph asks the workspace-semantics service for the reference list of that file and emits one honest edge per resolved reference.

## What it exercises

- **The probe, not the inject.** The graph's `inject` stays `["fs", "storage"]`, the service is found through `ctx.get` under its registered name `workspaceSemantics` and under the plan's short alias `semantics`, so a bare fixture keeps working unchanged.
- **The real index with the REAL service.** A temp tree is written to disk and indexed through `indexWorkspace`, and the semantics service is mounted on the same fake context with its real built plugin, while the fixture (`src/core.ts`) declares `config` and `core` and uses `config.port` inside `core` and again at the top level, so the folder pins both owner rules:
  - inside a declaration: `Symbol:<path>:core -references-> Symbol:<path>:config` with the use site's line span;
  - at the top level: `File:<path> -references-> Symbol:<path>:config`.
- **The edge counts are real.** The `graph: indexed ...` line and the snapshot count the references edges (4 nodes, 5 edges for the fixture; 8 nodes and 7 edges for the whole tree).
- **No service, no edges.** The same tree without the service makes zero `references` edges, the counts fall back to the parsed ones (5 edges), and no `semantics:` line appears.
- **A disabled service is silence.** It is present, answers `undefined`, and adds no edge and no line of its own beyond its own `disabled` line.
- **No dangling edges.** For a Markdown file with a link target, the semantics service resolves the file (1 symbol, 1 reference) but the target names no Symbol node of the file, so NO edge is emitted.
- **The alias.** A service registered only under `semantics` is probed too.

## The fixture

`Tree()` writes a real temp directory (`src/core.ts`, `src/lib.ts`, `README.md`), and the harness serves it through its disk-backed fake fs, whose `readText` accepts both a resolved target and a bare path, because the semantics service reads by path.

The semantics plugin is mounted with `log: false`, so nothing is written outside the temp tree.

## Expected ledger strings (byte-exact, `graph: ` prefix)

`indexed <path> version <version> (4 nodes, 5 edges)` (with the service), `indexed <path> version <version> (4 nodes, 3 edges)` (without it), `semantics: resolved <path> (2 symbols, 2 references)`, `semantics: resolved <path> (1 symbols, 1 references)` (the Markdown file), `semantics: disabled (enabled=false)`.

## Expected count

10 PASS.
