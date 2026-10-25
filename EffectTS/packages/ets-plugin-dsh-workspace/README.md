# @playform/plugin-dsh-workspace

> v0.1.0 - UNPUBLISHED - plan:
> [Workspace/WORKSPACE-AGENT](../../Documentation/Plans/Workspace/WORKSPACE-AGENT.md)

## The role

The **workspace agent**: the workspace regime's conversational surface (the operational view,
`Documentation/Plans/Workspace/WORKSPACE-AGENT.md`). The conversation addresses the workspace
through this plugin; everything else in the family - the stamps, the indexes, the validations, the
licenses, the journals, the gates - stays the invisible plugin flow until an event surfaces it (the
visibility rule).

## The surfaces

Five tools over the Wave-1 graph service (`ctx.workspaceGraph`): the four navigation tools plus the
indexing trigger that fills the graph.

| Tool                | Input                                  | Returns                                                                             |
| ------------------- | -------------------------------------- | ----------------------------------------------------------------------------------- |
| `workspace_map`     | path/module, depth                     | top modules + roles, file count, entry points, hot symbols                          |
| `workspace_find`    | name/pattern, kind, limit              | matching nodes with id, path, span, kind (cursor pagination)                        |
| `workspace_expand`  | node id, edge kinds, depth             | the neighbors (contains, imports; references/calls/tests deferred to W2+, honestly) |
| `workspace_context` | node id or query, budget               | the orientation packet (WORKSPACE/SCOPE/MAP/FOCUS/NEIGHBORS/EVIDENCE/OPEN/STALE)    |
| `workspace_index`   | path (default = session cwd), maxFiles | the walk's counts: indexed, skipped, failed, files                                  |

Compact tables plus ids; no full file bodies; pagination by cursor, never offset. The packet is
bounded (target 2k tokens), ranked by edge strength, and always versioned so a stale view is
detectable.

`workspace_index` is the indexing trigger: it delegates to the graph service's `indexWorkspace`, so
the walk, the per-file gates, the `maxFiles` bound and the counts all stay in
`@playform/plugin-dsh-workspace-graph` - the agent never touches `ctx.fs` itself. Run it first when
the graph is empty; `workspace_map` on an unindexed workspace honestly reports zero files. Its
byte-exact ledger line (the one NEW line this work adds; the rest are unchanged in SCHEME.md):

```text
workspace: index <path> (<indexed> indexed, <skipped> skipped, <failed> failed, <files> files)
```

The activation line moved with the fifth tool: `workspace: activated (bundle 0.1.0, tools=5)`.

## The configuration

Ships **disabled** (`enabled: false`); every knob is volatile:

`enabled`, `log`/`logFile`, `mapDepth`, `mapMaxModules`, `findLimit`, `findLimitMax`, `expandDepth`,
`expandMaxNeighbors`, `packetTokenBudget`, `packetTokenMax`, `tokenCharsPerToken`, `kinds`.

The graph machinery's knobs (domain, languages, include/exclude, limits) belong to
`@playform/plugin-dsh-workspace-graph`'s own Config - the distribution law: each package's Config
its own.

### The policy block (D6)

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

## Position in the family

The agent orchestrates every hook and is the only conversational surface; its Config is the family's
surface knobs. It is a pure consumer in v0: `inject: ["workspaceGraph", "pluginFactory", "tools"]`,
no event listeners. Plan: `Documentation/Plans/Workspace-Family/WORKSPACE-AGENT.md`;
`Documentation/Plans/WORKSPACE-FAMILY-V4-1.md` sections 3.4-3.5.

## The plan

Planned PoC (`tier: 2-planned` in `Temporary/npm-bootstrap/MANIFEST.json`); the smoke suite is the
end-phase deliverable.

- [Workspace/WORKSPACE-AGENT](../../Documentation/Plans/Workspace/WORKSPACE-AGENT.md) - the
  conversational surface.
- [WORKSPACE-FAMILY-V4-1](../../Documentation/Plans/WORKSPACE-FAMILY-V4-1.md) - sections 3.4-3.5.

## License

CC0-1.0.
