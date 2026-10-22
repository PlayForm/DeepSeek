# SCHEME - @playform/plugin-dsh-workspace

The workspace agent: the operational view, the four navigation tools, the
query surface. Loader contract: `name: plugin-dsh-workspace`, `apply`
(returns nothing), `Config` (Schemastery, all volatile), `inject:
["workspaceGraph", "pluginFactory", "tools"]`.

## Identity (four agreeing places)

| Place | Value |
| --- | --- |
| package name | `@playform/plugin-dsh-workspace` |
| `name` export | `plugin-dsh-workspace` |
| State build `module:` | `plugin-dsh-workspace` |
| ledger logFile default | `~/.dsh/workspace.log` |

## Config (every knob volatile)

| Field | Type | Default |
| --- | --- | --- |
| enabled | boolean | `false` |
| logFile | string | `~/.dsh/workspace.log` |
| mapDepth | number | `2` |
| mapMaxModules | number | `20` |
| findLimit | number | `50` |
| findLimitMax | number | `500` |
| expandDepth | number | `1` (cap 3, the graph contract) |
| expandMaxNeighbors | number | `50` |
| packetTokenBudget | number | `2000` |
| packetTokenMax | number | `4000` |
| tokenCharsPerToken | number | `4` |
| kinds | NodeKind[] | `[]` (all) |

Validation is fail-loud at load: `findLimitMax >= findLimit`,
`packetTokenMax >= packetTokenBudget`, `expandDepth in 1..3`, kinds checked
against the graph's node kinds.

## The four tools (V4-1 §3.4)

| Tool | Input | Result shape | Ledger line |
| --- | --- | --- | --- |
| `workspace_map` | `path?`, `depth?`, `cursor?` | `MapResult` | `workspace: map <path> (<modules> modules, <files> files)` |
| `workspace_find` | `name?`, `pattern?`, `kind?`, `limit?`, `cursor?` | `FindResult` | `workspace: find <query> (<n> nodes)` |
| `workspace_expand` | `id`, `kinds?`, `depth?` | `ExpandResult` | `workspace: expand <id> (<n> nodes, <m> edges)` |
| `workspace_context` | `id?`, `query?`, `budget?`, `version?` | `ContextResult` | `workspace: packet <focus> (<tokens> tokens, budget <budget>)` |

Every result carries `indexRevision`; pagination is by cursor (the last
node's id), never offset.

## Module-owned ledger strings (byte-stable)

```text
workspace: activated (bundle 0.1.0, tools 4)
workspace: disabled (enabled=false)
workspace: map <path> (<modules> modules, <files> files)
workspace: find <query> (<n> nodes)
workspace: expand <id> (<n> nodes, <m> edges)
workspace: packet <focus> (<tokens> tokens, budget <budget>)
```

## Decisions (the smallest faithful readings)

1. **Honesty over fake data.** The W1 graph parses only `contains`/`imports`
   edges; requesting `references`/`calls`/`tests` returns an empty set and
   the packet's OPEN lines name exactly what cannot be answered.
2. **Hotness proxy.** `workspace_map`'s hot symbols = symbols in files with
   inbound `imports` edges (the W1 graph has no reference counts).
3. **Token estimate.** No token counter is injected in v0; the packet budget
   is enforced via `tokenCharsPerToken` (default 4), documented as an
   estimate.
4. **Query surface = tools + query layer.** No second service handle is
   provided in v0; the `workspaceAgent` accessor is deliberately not
   declared in the Context augmentation. Consumers go through the tools and
   the graph service.
5. **Self-contained.** The graph contract is declared in
   `Interface/Graph.ts` from WAVE-1-BRIEF §4.3; the packet renderer is a
   local twin of the lib renderer. The end-phase wires the real imports.

## Status

Planned PoC; the smoke suite is the end-phase deliverable.
