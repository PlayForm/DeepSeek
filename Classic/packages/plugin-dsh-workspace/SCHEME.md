# SCHEME - @playform/plugin-dsh-workspace

The workspace agent: the operational view, the five tools, the query surface. Loader contract:
`name: plugin-dsh-workspace`, `apply` (returns nothing), `Config` (Schemastery, all volatile),
`inject: ["workspaceGraph", "pluginFactory", "tools"]`.

## Identity (four agreeing places)

| Place                  | Value                                      |
| ---------------------- | ------------------------------------------ |
| package name           | `@playform/plugin-dsh-workspace`           |
| `name` export          | `plugin-dsh-workspace`                     |
| State build `module:`  | `plugin-dsh-workspace`                     |
| ledger logFile default | `~/.dsh/playform/plugin-dsh-workspace.log` |

## Config (every knob volatile)

| Field              | Type       | Default                                    |
| ------------------ | ---------- | ------------------------------------------ |
| enabled            | boolean    | `false`                                    |
| logFile            | string     | `~/.dsh/playform/plugin-dsh-workspace.log` |
| mapDepth           | number     | `2`                                        |
| mapMaxModules      | number     | `20`                                       |
| findLimit          | number     | `50`                                       |
| findLimitMax       | number     | `500`                                      |
| expandDepth        | number     | `1` (cap 3, the graph contract)            |
| expandMaxNeighbors | number     | `50`                                       |
| packetTokenBudget  | number     | `2000`                                     |
| packetTokenMax     | number     | `4000`                                     |
| tokenCharsPerToken | number     | `4`                                        |
| kinds              | NodeKind[] | `[]` (all)                                 |
| policy             | Allowlist  | the D6 defaults                            |

Validation is fail-loud at load: `findLimitMax >= findLimit`, `packetTokenMax >= packetTokenBudget`,
`expandDepth in 1..3`, kinds checked against the graph's node kinds.

## The policy block (D6)

The config carries the shared per-action allowlist (`policy: Policy()`, composed from the factory's
block), mapped to `State.Allow`:

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

The workspace agent's actions are read-only, all **AUTOMATIC**; it has **no gated action** (no file
write, no batch commit, no spawn), so the block documents the posture and refuses nothing. The block
is one volatile object, so a policy flip is hot-editable without a remount; a resolved pack's
`policy` section overrides the defaults per action (the wiring is the next refinement).

No new ledger line: the package has no gated action.

## The five tools (V4-1 §3.4 plus the indexing trigger)

| Tool                | Input                                             | Result shape    | Ledger line                                                                                      |
| ------------------- | ------------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------ |
| `workspace_map`     | `path?`, `depth?`, `cursor?`                      | `MapResult`     | `workspace: map <path> (<modules> modules, <files> files)`                                       |
| `workspace_find`    | `name?`, `pattern?`, `kind?`, `limit?`, `cursor?` | `FindResult`    | `workspace: find <query> (<n> nodes)`                                                            |
| `workspace_expand`  | `id`, `kinds?`, `depth?`                          | `ExpandResult`  | `workspace: expand <id> (<n> nodes, <m> edges)`                                                  |
| `workspace_context` | `id?`, `query?`, `budget?`, `version?`            | `ContextResult` | `workspace: packet <focus> (<tokens> tokens, budget <budget>)`                                   |
| `workspace_index`   | `path?` (default = session cwd), `maxFiles?`      | `IndexResult`   | `workspace: index <path> (<indexed> indexed, <skipped> skipped, <failed> failed, <files> files)` |

Every result carries `indexRevision`; pagination is by cursor (the last node's id), never offset.

`workspace_index` is the INDEXING TRIGGER: it delegates to the graph service's
`indexWorkspace(path, { maxFiles })` - the walk, the per-file gates, the bound and the counts all
live in `@playform/plugin-dsh-workspace-graph`; the agent stays a pure consumer and never touches
`ctx.fs`. The tool refuses with the family's byte-exact error shape when the plugin is disabled.

## Module-owned ledger strings (byte-stable)

```text
workspace: activated (bundle 0.1.0, tools=5)
workspace: disabled (enabled=false)
workspace: map <path> (<modules> modules, <files> files)
workspace: find <query> (<n> nodes)
workspace: expand <id> (<n> nodes, <m> edges)
workspace: packet <focus> (<tokens> tokens, budget <budget>)
workspace: index <path> (<indexed> indexed, <skipped> skipped, <failed> failed, <files> files)
```

The activation line's `tools` count moved from 4 to 5 with the fifth tool; the string is
module-owned and asserted byte-exactly by the smoke.

## Decisions (the smallest faithful readings)

1. **Honesty over fake data.** The W1 graph parses only `contains`/`imports` edges; requesting
   `references`/`calls`/`tests` returns an empty set and the packet's OPEN lines name exactly what
   cannot be answered.
2. **Hotness proxy.** `workspace_map`'s hot symbols = symbols in files with inbound `imports` edges
   (the W1 graph has no reference counts).
3. **Token estimate.** No token counter is injected in v0; the packet budget is enforced via
   `tokenCharsPerToken` (default 4), documented as an estimate.
4. **Query surface = tools + query layer.** No second service handle is provided in v0; the
   `workspaceAgent` accessor is deliberately not declared in the Context augmentation. Consumers go
   through the tools and the graph service.
5. **Self-contained.** The graph contract is declared in `Interface/Graph.ts` from WAVE-1-BRIEF §4.3
   (plus the indexing trigger's `indexWorkspace`); the packet renderer is a local twin of the lib
   renderer. The end-phase wires the real imports.
6. **The role lookup uses the graph's declared `find` semantics.** `pattern` is a case-insensitive
   SUBSTRING over the node id and name (never a glob). The old `<path>*` form only matched the
   FakeGraph's glob and never the real service; `Function/Role.ts` now matches the declared way and
   re-checks the exact path (the real-graph smoke caught it).
7. **Real-graph coverage.** `Real-Graph-And-Tools` drives all five tools over a graph populated by
   the real `indexWorkspace`; the other folders keep the deterministic FakeGraph. Both shapes are
   pinned: the real `expand` carries the start node first, the FakeGraph fixture does not.

## Status

Built and smoked: `Wiring-And-Contract` (17), `Tools-And-Packet` (19, FakeGraph) and
`Real-Graph-And-Tools` (10, the real populated graph). Ships disabled in the bundle patch.
