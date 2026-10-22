# @playform/plugin-dsh-workspace

The **workspace agent**: the workspace regime's conversational surface
(the operational view, `Documentation/Plans/Workspace/WORKSPACE-AGENT.md`).
The conversation addresses the workspace through this plugin; everything
else in the family - the stamps, the indexes, the validations, the licenses,
the journals, the gates - stays the invisible plugin flow until an event
surfaces it (the visibility rule).

## The surface

Four navigation tools over the Wave-1 graph service (`ctx.workspaceGraph`):

| Tool                 | Input                        | Returns                                                       |
| -------------------- | ---------------------------- | ------------------------------------------------------------- |
| `workspace_map`      | path/module, depth           | top modules + roles, file count, entry points, hot symbols     |
| `workspace_find`     | name/pattern, kind, limit    | matching nodes with id, path, span, kind (cursor pagination)   |
| `workspace_expand`   | node id, edge kinds, depth   | the neighbors (contains, imports; references/calls/tests deferred to W2+, honestly) |
| `workspace_context`  | node id or query, budget     | the orientation packet (WORKSPACE/SCOPE/MAP/FOCUS/NEIGHBORS/EVIDENCE/OPEN/STALE) |

Compact tables plus ids; no full file bodies; pagination by cursor, never
offset. The packet is bounded (target 2k tokens), ranked by edge strength,
and always versioned so a stale view is detectable.

## Configuration

Ships **disabled** (`enabled: false`); every knob is volatile:

`enabled`, `log`/`logFile`, `mapDepth`, `mapMaxModules`, `findLimit`,
`findLimitMax`, `expandDepth`, `expandMaxNeighbors`, `packetTokenBudget`,
`packetTokenMax`, `tokenCharsPerToken`, `kinds`.

The graph machinery's knobs (domain, languages, include/exclude, limits)
belong to `@playform/plugin-dsh-workspace-graph`'s own Config - the
distribution law: each package's Config its own.

## Position in the family

The agent orchestrates every hook and is the only conversational surface;
its Config is the family's surface knobs. It is a pure consumer in v0:
`inject: ["workspaceGraph", "pluginFactory", "tools"]`, no event listeners.
Plan: `Documentation/Plans/Workspace-Family/WORKSPACE-AGENT.md`;
`Documentation/Plans/WORKSPACE-FAMILY-V4-1.md` sections 3.4-3.5.

## Status

Planned PoC (`tier: 2-planned` in `Temporary/npm-bootstrap/MANIFEST.json`);
the smoke suite is the end-phase deliverable.
