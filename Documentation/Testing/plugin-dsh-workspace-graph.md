# plugin-dsh-workspace-graph - the live test plan

## Identity
- Package: `@playform/plugin-dsh-workspace-graph`
  (Classic/packages/plugin-dsh-workspace-graph).
- Profile row id: `plugin-dsh-workspace-graph` (bundled in the desktop profile).
- Exposes: the `workspaceGraph` service (`export default class WorkspaceGraph
  extends Service` with `super(Context, "workspaceGraph")`, the service
  registers immediately on construction). The traceability/dependency graph
  store the workspace tools and the graph-suggester consume.
- Ledger lines: `` `graph: disabled (enabled=false)` `` (cold mount) and
  `` `graph: activated (domain=<domain>, languages=<n>)` `` with the observed
  default `graph: activated (domain=workspace_graph, languages=3)`. The service
  logs via the logger (its Config carries no logFile; the class service logs to
  the logger).

## Activation checks
1. Inspect Config: `cordis_inspect_query` host/Config/listConfigs
   `{"name": "@playform/plugin-dsh-workspace-graph"}` → one entry, status
   schema (defaults: domain workspace_graph, languages - 3 enabled).
2. Service check: `cordis_inspect_query` host/Service/listService
   `workspaceGraph` → resolves immediately on construction.
3. Ledger line: `graph: activated (domain=workspace_graph, languages=3)` in the
   logger.

## Test cases
| # | Trigger | Expected | Pass criteria |
| T1 | listConfigs query above | one entry, `status: "schema"` | the domain and 3 languages |
| T1 | The activated line's language count | matches the config | `languages=3` agrees with the schema |
| T1 | Query the graph contents | nodes and edges present | **KNOWN GAP**: the graph is empty |
| T2 | Write a /tmp scratch file (an fs/observed event) | the graph records the change | blocked until an index trigger exists |

## Known live gaps
- The graph is EMPTY: `workspace_map` → `map @ 0: 0 files`, `workspace_find` →
  `0 nodes`. v0 has no indexing trigger (no `workspace_index` tool, no
  fs/observed wiring). Fix direction: add an index trigger so the graph
  populates; until then every consumer (plugin-dsh-workspace tools,
  hook-dsh-graph-suggester) sees honest empty data.

## Fix loop
- Fix files: `Source/Library.ts` (the class, the wiring, the index trigger),
  `Source/Function/`, `Source/Variable/Config.ts`.
- Rebuild: `pnpm --config.verify-deps-before-run=false --dir Classic/packages/plugin-dsh-workspace-graph run prepublishOnly`
- Smokes: `node Classic/packages/plugin-dsh-workspace-graph/Target/Test/<Folder>/Test.js`
  per folder under `Source/Test/`. Then the app restart.

## Report stub
- Plugin: `@playform/plugin-dsh-workspace-graph`
- Tests run: T1 config - / T1 activation - / T1 contents - (empty) / T2 update -
- Defects: no index trigger - graph stays empty - add indexing
- Rebuild/smoke: -
- Residuals: -
