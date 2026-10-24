# SCHEME - @playform/plugin-dsh-workspace-context

The configuration schema (all knobs volatile; hot edits commit without remounting):

| Field           | Type      | Default                                            |
| --------------- | --------- | -------------------------------------------------- |
| `logFile`       | string    | `~/.dsh/playform/ets-plugin-dsh-workspace-context.log` |
| `enabled`       | boolean   | `false`                                            |
| `budgetTokens`  | number    | `2000` (the target)                                |
| `budgetMaximum` | number    | `4000` (the hard cap, >= target)                   |
| `lenses`        | string[]  | `["code", "docs", "tests"]`                        |
| `lensDefault`   | string    | `code`                                             |
| `neighborLimit` | number    | `20`                                               |
| `evidenceLimit` | number    | `12`                                               |
| `mapLimit`      | number    | `12`                                               |
| `workspaceName` | string    | `workspace`                                        |
| `policy`        | Allowlist | the D6 defaults                                    |

Ledger lines (module-owned, byte-stable, prefixed `context: `):

```
disabled (enabled=false)
activated (budget=<target>/<max>, lenses=<n>)
packet <focus> (<tokens> tok, lens <lens>)
clamped (<from> -> <to> tok, budget <max>)
stale <id> (caller held <version>)
focus <caller> -> <id>
```

Service: `ctx.workspaceContext` - `packet(query)`, `lenses()`, `focusOf(caller)`, `statistics()`.
Tool: `workspace_context` (read-only).

## The packet memo and the trace invalidation

`packet(query)` is served through a bounded memo (`Function/Cached`, 256 entries) keyed by
`Function/CacheKey`: the query's five fields plus the service's own knobs (a volatile flip changes
the packet, so the memo never survives it). A hit returns the SAME packet object - the graph reads,
the ranking and the budget clamp are skipped, and no second `packet` ledger line is written. The
graph's `indexRevision` is deliberately NOT part of the key: the memo is stable-until-event.

The invalidation is the trace's (D5): the graph emits `graph/invalidated` when a record it held is
replaced, removed or observed absent, and `Source/Trace/Adapter.ts` (wired from apply only after the
enabled gate, disposed with the fiber) consumes it through `Source/Trace/Invalidate.ts`, which
clears the memo wholesale (a packet may cite any path in FOCUS/NEIGHBORS/EVIDENCE). The caller-focus
tracker (`State.Focus`) is NOT touched: the STALE contract is about the version the caller held,
which an invalidation does not change. The invalidation is silent - no new ledger line (the module's
strings stay byte-exact); the trace ring is the evidence. The bus (`ctx.trace`, provided by
`@playform/ets-plugin-dsh-factory`, which the service already injects) is optional: without it the memo
simply lives until the process ends.

## Packet bands

The packet is built from `ctx.workspaceGraph` (the real W1 service when it is mounted; an absent
sibling degrades to the honest `workspace graph unavailable` OPEN line). The bands:

| Band      | Content                                                                                                       |
| --------- | ------------------------------------------------------------------------------------------------------------- |
| WORKSPACE | `WORKSPACE <workspaceName> @ <indexRevision>`                                                                 |
| SCOPE     | the requested id / query                                                                                      |
| MAP       | the PARENT directory of every eligible File node, biggest first, ties by name, capped at `mapLimit`           |
| FOCUS     | the focus node's id, span, fingerprint prefix and version (or `FOCUS (none: <scope>)`)                        |
| NEIGHBORS | the outgoing edges of the focus, ranked by the weight table (imports beats contains; ties by `from->to` text) |
| EVIDENCE  | the focus file and span, then every other file touched by a ranked edge                                       |
| OPEN      | the honest gaps (absent graph, unknown lens, neighbor truncation), else `(none)`                              |
| STALE     | only when the caller's held version differs from the focus version                                            |

The MAP band groups by the file's parent directory: the real graph stores resolved absolute paths,
whose first segment is empty, so the older first-segment form collapsed every real workspace into
one nameless band (the `Real-Graph-Packet` folder pins the parent-directory form).

State probe: `ctx.__pluginDshWorkspaceContextState`.

## The policy block (D6)

The config carries the shared per-action allowlist (`policy: Policy()`, composed from the factory's
block), mapped to `State.Allow`:

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

The context service's actions are read-only, all **AUTOMATIC**; it has **no gated action** (no file
write, no batch commit, no spawn), so the block documents the posture and refuses nothing. The block
is one volatile object, so a policy flip is hot-editable without a remount; a resolved pack's
`policy` section overrides the defaults per action (the wiring is the next refinement).

No new ledger line: the package has no gated action.
