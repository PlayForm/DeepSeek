# plugin-dsh-workspace - the live test plan

## Identity

- Package: `@playform/plugin-dsh-workspace` (Classic/packages/plugin-dsh-workspace).
- Profile row id: `plugin-dsh-workspace` (bundled in the desktop profile).
- Exposes: the four graph tools `workspace_map`, `workspace_find`, `workspace_expand`,
  `workspace_context` (Source/Function/ToolMap.ts, ToolFind.ts, ToolExpand.ts, ToolContext.ts). The
  workspace graph's tool surface over the `workspaceGraph` service.
- Ledger line: `` `plugin-dsh-workspace: disabled (enabled=false)` `` on a cold mount; logFile
  `~/.dsh/workspace.log`.

## Activation checks

1. Inspect Config: `cordis_inspect_query` host/Config/listConfigs
   `{"name": "@playform/plugin-dsh-workspace"}` → one entry, status schema.
2. Tool check: the Tool provider lists `workspace_map`, `workspace_find`, `workspace_expand`,
   `workspace_context`.
3. Ledger line: the activated line in `~/.dsh/workspace.log`; a cold mount logs the byte-exact
   `plugin-dsh-workspace: disabled (enabled=false)`.

## Test cases

| # | Trigger | Expected | Pass criteria | | T1 | listConfigs query above | one entry,
`status: "schema"` | the defaults match | | T1 | `workspace_map` with no arguments | the top-level
modules | **KNOWN GAP**: currently `map @ 0: 0 files` | | T1 | `workspace_find` name=ToolMap | the
node with id/path/kind | **KNOWN GAP**: currently `0 nodes` | | T1 | `workspace_context` on a found
node | the orientation packet (WORKSPACE...STALE) | blocked until the graph indexes |

## Known live gaps

- The graph is EMPTY: `workspace_map` → `map @ 0: 0 files`, `workspace_find` → `0 nodes`. v0 has no
  indexing trigger (no `workspace_index` tool, no fs/observed wiring). Fix direction: add an index
  trigger (in this package's Source or the graph service's). The tools exist and respond - the data
  is the missing part.

## Fix loop

- Fix files: `Source/Function/ToolMap.ts`, `ToolFind.ts`, `ToolExpand.ts`, `ToolContext.ts`,
  `Source/Library.ts` (the wiring / index trigger).
- Rebuild:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/plugin-dsh-workspace run prepublishOnly`
- Smokes: `node Classic/packages/plugin-dsh-workspace/Target/Test/<Folder>/Test.js` per folder under
  `Source/Test/`. Then the app restart.

## Report stub

- Plugin: `@playform/plugin-dsh-workspace`
- Tests run: T1 config - / T1 map - (0 files) / T1 find - (0 nodes)
- Defects: no index trigger - tools return empty graphs - add workspace_index/fs-observed wiring
- Rebuild/smoke: -
- Residuals: -
