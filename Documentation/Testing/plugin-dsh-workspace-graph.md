# plugin-dsh-workspace-graph - the live test plan

## Identity

- Package: `@playform/plugin-dsh-workspace-graph` (Classic/packages/plugin-dsh-workspace-graph).
- Profile row id: `plugin-dsh-workspace-graph` (bundled in the desktop profile).
- Exposes: the `workspaceGraph` service (`export default class WorkspaceGraph extends Service` with
  `super(Context, "workspaceGraph")`, `static inject = ["fs", "storage"]`, the service registers
  immediately on construction). The traceability/dependency graph store the workspace tools and the
  graph-suggester consume. The INDEXING TRIGGER lives here: `indexWorkspace(root?, { maxFiles? })`
  resolves the root through `ctx.fs.resolve` (omitted = the session working directory), walks
  breadth-first with sorted listings, rejects an entry whose canonical identity is outside the root,
  and calls `indexFile` for every candidate without duplicating the per-file gates (SCHEME §6).
- Config fields (all volatile, SCHEME §2): `enabled`, `domain` (default `workspace_graph`),
  `languages` (all three of typescript/javascript/markdown), `include`, `exclude`
  (`node_modules/**`, `**/Target/**`, `**/.git/**`), `maxFileBytes`, `maxNodesPerFile`, `maxFiles`
  (default 2000 - the one field the INDEXING TRIGGER added to the frozen W1 table), `limitDefault`,
  `limitMaximum`, `policy` (the D6 allowlist block; the graph's only action is index, all AUTOMATIC,
  no gated action).
- Trace: the trace adapter (SCHEME §6.1) consumes `observe/stamp` from the family's trace bus
  (`ctx.trace`, PROBED via `ctx.get("trace")`, never injected) and schedules one detached re-index
  through `indexFile`; the graph emits `graph/indexed` (`{ path, version, revision }`) and
  `graph/invalidated` (`{ path, reason, version? }`, reason `replaced`/`removed`/`absent`) with no
  new ledger line (SCHEME §6.2). References edges come from the probed workspace-semantics service
  (SCHEME §6.3); no service means no references edges, never faked.
- Ledger lines (byte-stable, SCHEME §8): `` `graph: disabled (enabled=false)` `` (cold mount),
  `` `graph: activated (domain=<domain>, languages=<n>)` `` with the observed default
  `graph: activated (domain=workspace_graph, languages=3)`, plus the indexing-trigger lines
  `graph: workspace indexed <n> files (...)`, `graph: workspace capped at <maxFiles> files`,
  `graph: reindexed <path> (<status>)` and the W1 lines `graph: indexed/skipped/failed/removed`,
  `graph: domain <domain> opened (<records> records)`. The service logs via the logger.

## Activation checks

1. **The Config.**

    Inspect Config: `cordis_inspect_query` host/Config/listConfigs
    `{"name": "@playform/plugin-dsh-workspace-graph"}` → one entry, status schema (defaults: domain
    workspace_graph, languages - all three, exclude triple, maxFileBytes 1000000, maxNodesPerFile
    5000, maxFiles 2000, limitDefault 50, limitMaximum 500).

2. **The service check.**

    Service check: `cordis_inspect_query` host/Service/listService `workspaceGraph` → resolves
    immediately on construction.

3. **The ledger line.**

    Ledger line: `graph: activated (domain=workspace_graph, languages=3)` in the logger.

## Test cases

| #   | Trigger                                                                                      | Expected                                            | Pass criteria                                                                                                                       |
| --- | -------------------------------------------------------------------------------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| T1  | listConfigs query above                                                                      | one entry, `status: "schema"`                       | the domain, the 3 languages and the new fields (maxFiles 2000, the five number fields)                                              |
| T1  | The activated line's language count matches the config                                       | `languages=3` agrees with the schema                | the line is byte-exact                                                                                                              |
| T2  | Call `indexWorkspace()` (or the workspace plugin's `workspace_index` tool) with no arguments | the walk from the session cwd                       | `graph: workspace indexed <n> files (<indexed> indexed, <skipped> skipped, <failed> failed)`; `files` = the records held afterwards |
| T2  | `indexWorkspace(root, { maxFiles: 0 })`                                                      | the walk indexes nothing                            | a finite option `>= 0` is honored; `workspace capped at` only when the walk stopped at the bound                                    |
| T2  | A root that cannot be listed                                                                 | rejection                                           | never an honest-looking zero (SCHEME §6)                                                                                            |
| T3  | Write a /tmp scratch file while the trace bus is wired                                       | one `observe/stamp` consumed, one detached re-index | ledger `reindexed <resolved path> (<status>)`; the record is replaced and `graph/invalidated` (reason `replaced`) is emitted        |
| T3  | Delete a record via `removeFile`                                                             | the record is gone                                  | ledger `removed <path>`, `graph/invalidated` (reason `removed`), revision bumped                                                    |
| T1  | Query the graph contents after the index                                                     | nodes and edges present                             | File/Symbol/Block/Test/DocSection nodes; `contains` + `imports` edges (plus `references` only when the semantics service answers)   |

## Known live gaps

- FIXED. The old "graph is EMPTY / no index trigger" gap is closed: `indexWorkspace` exists, is
  bounded by `maxFiles`, persists through the storage domain named `Config.domain` (version 1,
  per-record, `invalidRecords: "backup-and-skip"`, the `records` table plus the `__meta` record),
  and the trace adapter re-indexes on `observe/stamp`. Honest limits that remain (SCHEME §5, by
  design, not gaps): line/regex parsing without the compiler API, only relative import specifiers
  produce edges, `calls`/`tests` edges are deferred, and `references` edges exist only when the
  workspace-semantics service is mounted.

## Fix loop

- Fix files: `Source/Library.ts` (the class, the wiring, the index trigger), `Source/Function/`
  (including `Trace/Adapter.ts` and `Trace/Consume.ts`), `Source/Variable/Config.ts`.
- Rebuild:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/plugin-dsh-workspace-graph run prepublishOnly`
- Smokes: `node Classic/packages/plugin-dsh-workspace-graph/Target/Test/<Folder>/Test.js` per folder
  under `Source/Test/`. Then the app restart.

## Report stub

- Plugin: `@playform/plugin-dsh-workspace-graph`
- Tests run: T1 config - / T1 activation - / T2 index - / T2 bound - / T2 unlistable root - / T3
  reindex - / T3 removal - / T1 contents -
- Defects: none outstanding - the index trigger and the trace adapter are built
- Rebuild/smoke: -
- Residuals: calls/tests edges and the ConfigKey node kind remain deferred (not faked)
