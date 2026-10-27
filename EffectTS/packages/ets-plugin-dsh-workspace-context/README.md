# @playform/plugin-dsh-workspace-context

> v0.1.0 - UNPUBLISHED - plan:
> [Workspace-Family/CONTEXT](../../../Documentation/Plans/Workspace-Family/CONTEXT.md)

## The role

The workspace family's **context service** supplies the attention projection - the
required/relevant/deferred - and the context economy.

- **The orientation packet** (V4-1 section 3.5).

    The packet has the eight fixed sections `WORKSPACE <name> @ <revision>` / `SCOPE` / `MAP` /
    `FOCUS` (the node, its span, its fingerprint, its version) / `NEIGHBORS` (the strongest edges,
    ranked) / `EVIDENCE` (the files/spans) / `OPEN` (the honest gaps) / `STALE` (the version the
    caller held, when it differs).

    The plugin builds the packet from the index of the sibling workspace-graph through a
    self-contained structural handle.

- **The budget.**

    The target is 2000 tokens (`budgetTokens`), with a configurable hard cap (`budgetMaximum`).

    The plugin measures the budget with the harness `ctx.tokenMeter` where available, else at ~4
    chars/token.

    Over budget, the weakest neighbors drop first, and the plugin ledgers every clamp.

- **The lenses.**

    The lenses are `code` (default), `docs`, and `tests`, and the shipped catalog filters the
    eligible node and edge kinds.

- **The surfaces.**

    The surfaces are the `workspaceContext` service (declaration-merged accessor: `packet`,
    `lenses`, `focusOf`, `statistics`) and the read-only `workspace_context` tool.

- **The packet memo.**

    The service serves `packet(query)` through a bounded memo, where a hit returns the same packet
    object and writes no second ledger line.

    The `graph/invalidated` trace event of the graph clears the memo, so the next identical query
    rebuilds against the new revision (D5).

    The trace bus (`ctx.trace`) is optional, and without it the memo lives until the process ends.

The plugin ships **disabled** (the IDLE-forever posture): it never appears in the bundles of the
profile and enables only by an explicit ACTIVATE.

Plan: Documentation/Plans/WORKSPACE-FAMILY-V4-1.md section 3.5 +
Documentation/Plans/Workspace-Family/CONTEXT.md.

## The plan

- Documentation/Plans/WORKSPACE-FAMILY-V4-1.md section 3.5 - the orientation packet.
- [Workspace-Family/CONTEXT](../../../Documentation/Plans/Workspace-Family/CONTEXT.md) - the context
  service.
- **The disabled posture.**

    The plugin ships **disabled** (the IDLE-forever posture): it never appears in the bundles of the
    profile and enables only by an explicit ACTIVATE.

## License

CC0-1.0.

### The policy block (D6)

The config carries the shared per-action allowlist (`policy: Policy()`, composed from the factory's
block) and maps it to `State.Allow`:

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

The actions of the context service are read-only, all **AUTOMATIC**.

It has **no gated action** (no file write, no batch commit, no spawn), so the block documents the
posture and refuses nothing.

The block is one volatile object, so a policy flip is hot-editable without a remount.

The `policy` section of a resolved pack overrides the defaults for each action (the wiring is the
next refinement).
