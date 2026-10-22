# @playform/plugin-dsh-workspace-graph

The WORKSPACE GRAPH: a DeepSeek Harness service (`ctx.workspaceGraph`) that
builds the W1 graph schema v0 over the workspace files - four node kinds
(`File`, `Symbol`, `Block`, `Test`) plus Markdown `DocSection`s and two edge
kinds (`contains`, `imports`), with stable ids, content-derived fingerprints,
and the `indexRevision` the graph was built from.

The v0 parser is a line/regex scanner (no compiler API): TypeScript and
JavaScript declarations with brace-counted spans, relative-import edges,
test-path detection, and one `DocSection` per Markdown heading. Every
deferred kind (`ConfigKey`, `references`, `calls`, `tests`) is NOT faked -
W2+ work.

The class-form loader contract: `export default class WorkspaceGraph extends
Service` registered under the exact name `workspaceGraph`,
`static inject = ["fs", "storage"]`, and `static Config` (the Schemastery
schema, every field volatile). The plugin ships DISABLED (`enabled: false` in
the patch row and the schema default): the service registers, and `indexFile`
skips with the byte-exact `graph: skipped <path> (disabled)` line until an
explicit ACTIVATE.

Records live in the KV facet through the storage domain (one record per path
plus the `__meta` revision record in the `records` table of the domain named
`Config.domain`, default `workspace_graph`); absent storage falls back to the
in-memory mirror. The plugin writes nothing outside its own domain.

Build and smoke:

```sh
pnpm --dir Classic/packages/plugin-dsh-workspace-graph run prepublishOnly
node Classic/packages/plugin-dsh-workspace-graph/Target/Test/<Folder>/Test.js
```

Plan: Documentation/Plans/Workspace-Family/WAVE-1-BRIEF.md section 4 (the
frozen contract). Schema: see SCHEME.md.
