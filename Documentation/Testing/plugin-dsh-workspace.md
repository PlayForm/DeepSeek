# plugin-dsh-workspace - the live test plan

## Identity

- Package: `@playform/plugin-dsh-workspace` (Classic/packages/plugin-dsh-workspace).
- Profile row id: `plugin-dsh-workspace` (bundled in the desktop profile; ships disabled in the
  bundle patch per the SCHEME's Status).
- Exposes: FIVE tools - `workspace_map`, `workspace_find`, `workspace_expand`, `workspace_context`
  plus the NEW indexing trigger `workspace_index` (SCHEME "The five tools (V4-1 §3.4 plus the
  indexing trigger)"). The workspace agent's tool surface over the `workspaceGraph` service;
  `workspace_index` delegates to the graph service's `indexWorkspace(path, { maxFiles })` and never
  touches `ctx.fs` itself (SCHEME: "the agent stays a pure consumer").
- Config fields (all volatile, SCHEME "Config"): `enabled`, `logFile`, `mapDepth`, `mapMaxModules`,
  `findLimit`, `findLimitMax`, `expandDepth` (1..3), `expandMaxNeighbors`, `packetTokenBudget`,
  `packetTokenMax`, `tokenCharsPerToken`, `kinds`, `policy` (the D6 allowlist block; the agent is
  read-only, all AUTOMATIC, no gated action).
- Ledger lines (byte-stable, SCHEME "Module-owned ledger strings"):
  `` `plugin-dsh-workspace: disabled (enabled=false)` `` (cold mount) and
  `` `workspace: activated (bundle 0.1.0, tools=5)` `` - the `tools` count moved from 4 to 5 with
  the fifth tool. logFile `~/.dsh/playform/plugin-dsh-workspace.log`.

## Activation checks

1. **The Config.**

    Inspect Config: `cordis_inspect_query` host/Config/listConfigs
    `{"name": "@playform/plugin-dsh-workspace"}` → one entry, status schema.

2. **The tool check.**

    Tool check: the Tool provider lists FIVE tools - `workspace_map`, `workspace_find`,
    `workspace_expand`, `workspace_context`, `workspace_index`.

3. **The ledger line.**

    Ledger line: the activated line in `~/.dsh/playform/plugin-dsh-workspace.log`; a cold mount logs
    the byte-exact `plugin-dsh-workspace: disabled (enabled=false)`.

    On activation the line reads `workspace: activated (bundle 0.1.0, tools=5)`.

## Test cases

| #   | Trigger                                          | Expected                                   | Pass criteria                                                                                                                       |
| --- | ------------------------------------------------ | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| T1  | listConfigs query above                          | one entry, `status: "schema"`              | the defaults match the SCHEME's Config table                                                                                        |
| T1  | `workspace_map` with no arguments                | the top-level modules                      | `workspace: map <path> (<modules> modules, <files> files)`                                                                          |
| T1  | `workspace_find` name=ToolMap                    | the node with id/path/kind                 | `workspace: find <query> (<n> nodes)`; `pattern` is a case-insensitive substring over id and name (SCHEME decision 6), never a glob |
| T1  | `workspace_context` on a found node              | the orientation packet (WORKSPACE...STALE) | every result carries `indexRevision`; pagination by cursor, never offset                                                            |
| T2  | `workspace_index` with no arguments              | the walk runs from the session cwd         | `workspace: index <path> (<indexed> indexed, <skipped> skipped, <failed> failed, <files> files)`                                    |
| T2  | `workspace_index` path=/tmp/scratch, maxFiles=10 | the walk stops at the bound                | the bound is honored; an absent/negative/non-finite option falls back to the graph's `Config.maxFiles`                              |
| T3  | all five tools over the real populated graph     | honest data                                | the Real-Graph-And-Tools smoke drives all five; real `expand` carries the start node first                                          |

## Known live gaps

- FIXED. The old "graph is EMPTY / no index trigger" gap is closed: `workspace_index` exists and
  delegates to the graph service's `indexWorkspace`, and the real-graph coverage is built and smoked
    - per the SCHEME's Status: `Wiring-And-Contract` (17), `Tools-And-Packet` (19, FakeGraph),
      `Real-Graph-And-Tools` (10, the real populated graph). No outstanding known gap in this plan.

## Fix loop

- Fix files: `Source/Function/ToolMap.ts`, `ToolFind.ts`, `ToolExpand.ts`, `ToolContext.ts`,
  `ToolIndex.ts`, `Source/Library.ts` (the wiring / the indexing trigger).
- Rebuild:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/plugin-dsh-workspace run prepublishOnly`
- Smokes: `node Classic/packages/plugin-dsh-workspace/Target/Test/<Folder>/Test.js` per folder under
  `Source/Test/` (`Wiring-And-Contract`, `Tools-And-Packet`, `Real-Graph-And-Tools`). Then the app
  restart.

## Report stub

- Plugin: `@playform/plugin-dsh-workspace`
- Tests run: T1 config - / T1 map - / T1 find - / T1 context - / T2 index - / T2 bound - / T3 real
  graph -
- Defects: none outstanding - the index trigger exists and the real-graph smokes pass
- Rebuild/smoke: -
- Residuals: -
