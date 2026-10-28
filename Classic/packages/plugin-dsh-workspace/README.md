# @playform/plugin-dsh-workspace

> v0.2.1 - UNPUBLISHED - plan:
> [Workspace/WORKSPACE-AGENT](../../Documentation/Plans/Workspace/WORKSPACE-AGENT.md)

## The role

The plugin is the **workspace agent**, which is the conversational surface of the workspace regime
(the operational view, `Documentation/Plans/Workspace/WORKSPACE-AGENT.md`).

The conversation addresses the workspace through this plugin, and everything else in the family (the
stamps, the indexes, the validations, the licenses, the journals, the gates) stays in the invisible
plugin flow until an event surfaces it (the visibility rule).

## The surfaces

Five tools sit over the Wave-1 graph service (`ctx.workspaceGraph`): the four navigation tools plus
the indexing trigger that fills the graph.

| Tool                | Input                                  | Returns                                                                             |
| ------------------- | -------------------------------------- | ----------------------------------------------------------------------------------- |
| `workspace_map`     | path/module, depth                     | top modules + roles, file count, entry points, hot symbols                          |
| `workspace_find`    | name/pattern, kind, limit              | matching nodes with id, path, span, kind (cursor pagination)                        |
| `workspace_expand`  | node id, edge kinds, depth             | the neighbors (contains, imports; references/calls/tests deferred to W2+, honestly) |
| `workspace_context` | node id or query, budget               | the orientation packet (WORKSPACE/SCOPE/MAP/FOCUS/NEIGHBORS/EVIDENCE/OPEN/STALE)    |
| `workspace_index`   | path (default = session cwd), maxFiles | the walk's counts: indexed, skipped, failed, files                                  |

The tools return compact tables plus ids, never full file bodies, and pagination is by cursor, never
by offset.

The packet is bounded (target 2k tokens), ranked by edge strength, and always versioned, so a stale
view is detectable.

`workspace_index` is the indexing trigger: it delegates to `indexWorkspace` of the graph service, so
the walk, the per-file gates, the `maxFiles` bound and the counts all stay in
`@playform/plugin-dsh-workspace-graph`, and the agent never touches `ctx.fs` itself.

Run it first when the graph is empty, because `workspace_map` on an unindexed workspace honestly
reports zero files.

Its byte-exact ledger line is the one NEW line that this work adds, and the rest are unchanged in
SCHEME.md:

```text
workspace: index <path> (<indexed> indexed, <skipped> skipped, <failed> failed, <files> files)
```

The activation line moved with the fifth tool: `workspace: activated (bundle 0.2.1, tools=5)`.

## The configuration

The package ships **disabled** (`enabled: false`), and every knob is volatile:

`enabled`, `log`/`logFile`, `mapDepth`, `mapMaxModules`, `findLimit`, `findLimitMax`, `expandDepth`,
`expandMaxNeighbors`, `packetTokenBudget`, `packetTokenMax`, `tokenCharsPerToken`, `kinds`.

The knobs of the graph machinery (domain, languages, include/exclude, limits) belong to the own
Config of `@playform/plugin-dsh-workspace-graph`, per the distribution law that each package's
Config is its own.

### The policy block (D6)

The config carries the shared per-action allowlist (`policy: Policy()`, composed from the block of
the factory) and maps it to `State.Allow`:

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

The actions of the workspace agent are read-only and all **AUTOMATIC**, and it has **no gated
action** (no file write, no batch commit, no spawn), so the block documents the posture and refuses
nothing.

The block is one volatile object, so a policy flip is hot-editable without a remount, and a `policy`
section of a resolved pack overrides the defaults per action (the wiring is the next refinement).

## Position in the family

The agent orchestrates every hook and is the only conversational surface, and its Config holds the
surface knobs of the family.

It is a pure consumer in v0: `inject: ["workspaceGraph", "pluginFactory", "tools"]`, with no event
listeners.

Plan: `Documentation/Plans/Workspace-Family/WORKSPACE-AGENT.md`;
`Documentation/Plans/WORKSPACE-FAMILY-V4-1.md` sections 3.4-3.5.

## The ledger

```text
workspace: activated (bundle 0.2.1, tools=5)
workspace: index <path> (<indexed> indexed, <skipped> skipped, <failed> failed, <files> files)
```

## The build and the tests

The build runs `pnpm prepublishOnly` (Source/prepublishOnly.sh), which does the plugin build (ESM
`Target/`, with the Test tree excluded), the Test build, the harness selfcheck, and the Test
type-check.

## The plan

- Planned PoC (`tier: 2-planned` in `Temporary/npm-bootstrap/MANIFEST.json`), and the smoke suite is
  the end-phase deliverable.
- [Workspace/WORKSPACE-AGENT](../../Documentation/Plans/Workspace/WORKSPACE-AGENT.md) - the
  conversational surface.
- [WORKSPACE-FAMILY-V4-1](../../Documentation/Plans/WORKSPACE-FAMILY-V4-1.md) - sections 3.4-3.5.

## License

CC0-1.0.
