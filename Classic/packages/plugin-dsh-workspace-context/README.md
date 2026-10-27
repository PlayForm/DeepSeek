# @playform/plugin-dsh-workspace-context

> v0.1.0 - UNPUBLISHED - plan:
> [Workspace-Family/CONTEXT](../../../Documentation/Plans/Workspace-Family/CONTEXT.md)

## The role

The workspace family's **context service**: the attention projection - the
required/relevant/deferred - the context economy.

- **The orientation packet** (V4-1 section 3.5): the eight fixed sections
  `WORKSPACE <name> @ <revision>` / `SCOPE` / `MAP` / `FOCUS` (the node, its span, its fingerprint,
  its version) / `NEIGHBORS` (the strongest edges, ranked) / `EVIDENCE` (the files/spans) / `OPEN`
  (the honest gaps) / `STALE` (the version the caller held, when it differs).

    Built from the sibling workspace-graph's index through a self-contained structural handle.

- **The budget**: target 2000 tokens (`budgetTokens`), configurable hard cap (`budgetMaximum`).

    Measured with the harness `ctx.tokenMeter` where available, else ~4 chars/token.

    Over budget, the weakest neighbors drop first; every clamp is ledgered.

- **The lenses**: `code` (default), `docs`, `tests` - the shipped catalog filters the eligible node
  and edge kinds.
- **The surfaces**: the `workspaceContext` service (declaration-merged accessor: `packet`, `lenses`,
  `focusOf`, `statistics`) and the read-only `workspace_context` tool.

- **The packet memo**: `packet(query)` is served through a bounded memo (a hit returns the same
  packet object and writes no second ledger line); the graph's `graph/invalidated` trace event
  clears it, so the next identical query rebuilds against the new revision (D5).

    The trace bus (`ctx.trace`) is optional - without it the memo simply lives until the process
    ends.

The plugin ships **disabled** (the IDLE-forever posture): it never appears in the profile's bundles
and enables only by an explicit ACTIVATE.

Plan: Documentation/Plans/WORKSPACE-FAMILY-V4-1.md section 3.5 +
Documentation/Plans/Workspace-Family/CONTEXT.md.

## The surfaces

- The `workspaceContext` service (declaration-merged accessor: `packet`, `lenses`, `focusOf`,
  `statistics`).
- The read-only `workspace_context` tool.
- The optional `ctx.trace` (`graph/invalidated` clears the packet memo).

## The ledger

The lines are prefixed `context: ` (byte-exact; see also the smoke folders' expected-string
sections):

```text
context: activated (budget=2000/4000, lenses=3)
context: disabled (enabled=false)
context: packet <id> (<tokens> tok, lens <lens>)
context: clamped (<tokens> -> <tokens> tok, budget <max>)
```

## The configuration

| Field           | Default                                            | Meaning                                      |
| --------------- | -------------------------------------------------- | -------------------------------------------- |
| `enabled`       | `false`                                            | the master switch (the IDLE-forever posture) |
| `log`           | `true`                                             | the ledger switch (shared cell)              |
| `logFile`       | `~/.dsh/playform/plugin-dsh-workspace-context.log` | the ledger                                   |
| `budgetTokens`  | `2000`                                             | the target token budget                      |
| `budgetMaximum` | `4000`                                             | the hard cap                                 |
| `lensDefault`   | `code`                                             | the default lens                             |
| `neighborLimit` | `20`                                               | the NEIGHBORS section bound                  |
| `evidenceLimit` | `12`                                               | the EVIDENCE section bound                   |
| `mapLimit`      | `12`                                               | the MAP section bound                        |
| `workspaceName` | `workspace`                                        | the WORKSPACE section name                   |
| `policy.*`      | D6 defaults                                        | the per-action allowlist (see below)         |

Every field is a volatile cell.

## The build and the tests

The build is `pnpm prepublishOnly` (Source/prepublishOnly.sh): the plugin build (ESM `Target/`, Test
tree excluded), the Test build, the harness selfcheck, and the Test type-check.

## The plan

- Documentation/Plans/WORKSPACE-FAMILY-V4-1.md section 3.5 - the orientation packet.
- [Workspace-Family/CONTEXT](../../../Documentation/Plans/Workspace-Family/CONTEXT.md) - the context
  service.
- The plugin ships **disabled** (the IDLE-forever posture): it never appears in the profile's
  bundles and enables only by an explicit ACTIVATE.

## License

CC0-1.0.

### The policy block (D6)

The config carries the shared per-action allowlist (`policy: Policy()`, composed from the factory's
block), mapped to `State.Allow`:

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

The context service's actions are read-only, all **AUTOMATIC**; it has **no gated action** (no file
write, no batch commit, no spawn), so the block documents the posture and refuses nothing.

The block is one volatile object, so a policy flip is hot-editable without a remount; a resolved
pack's `policy` section overrides the defaults per action (the wiring is the next refinement).
