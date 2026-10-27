# @playform/hook-dsh-workspace-govern

> v0.1.0 - UNPUBLISHED - plan:
> [Workspace-Family/GOVERN](../../../Documentation/Plans/Workspace-Family/GOVERN.md)

## The role

The workspace-govern hook: the governance gate of the workspace family's invisible flow - operate
proposes → **the govern gates** → the authority licenses → the approve binds.

On every gated `tools/pre-execute` call, and for every proposal handed to the `workspaceGovern`
service, the hook runs the four **independent means-checks** on the ProposedChange before any
AuthorizationDecision downstream.

An intent must not authorize its own means: the gate checks the means; the intent is never the
permission.

The plugin ships **disabled** (the idle-forever posture) and enables only by an explicit ACTIVATE.

## The surfaces

- The `tools/pre-execute` waterfall listener: every gated tool call runs the four checks.
- The service `ctx.workspaceGovern` (registered from apply):

- `gate(proposal)` - run the four checks on one proposal record, get the gate decision.
- `decisions(limit?)` - the decision ring, newest first.
- `statistics()` - `{ decisions, sequence }`.

## The four independent checks

| Obligation      | Semantics                                                          | Failure behavior (recovery table) |
| --------------- | ------------------------------------------------------------------ | --------------------------------- |
| `contributes`   | The proposal declares a non-empty contribution to the operation    | fail-open                         |
| `scope`         | The target matches the authorized-scope allowlist                  | **fail-closed**                   |
| `policy`        | The policy table lookup by proposal kind (allow / deny / escalate) | fail-open (a table read failure)  |
| `preconditions` | The proposal's declared preconditions are satisfied                | fail-open                         |

The fail-open recovery table is the honest-recovery contract
(`Documentation/Plans/WORKSPACE-FAMILY-V4-1.md` section 3.9): per-obligation failure behavior, never
a silent default.

An override list in the config replaces rows.

## The gate outcomes

- **pass** - the downstream decision is returned unchanged (the checks saw no denial and no policy
  rule forced otherwise).
- **deny** - the waterfall returns `{ kind: "deny", reason: "govern: ..." }`: the proposals become
  the effects ONLY through the gates.
- **escalate** - the waterfall returns `{ kind: "ask", ... }`: the approval is the approve family's
  step, not this one.

Recursion prevention: every proposal carries the operation identifier, the parent identifier and the
event category; an operation identifier gated more than `loopBound` times is dropped with a ledger
line.

## The configuration (all volatile)

| Field             | Default                                                  | Meaning                                                                                                       |
| ----------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `enabled`         | `false`                                                  | the master switch                                                                                             |
| `log` / `logFile` | `true` / `~/.dsh/playform/hook-dsh-workspace-govern.log` | the durable ledger (one log per module)                                                                       |
| `tools`           | `write, edit, bash, applyPatch`                          | the gated tool names                                                                                          |
| `scope`           | `[]` (unrestricted)                                      | the authorized-scope allowlist (globs)                                                                        |
| `exclude`         | `node_modules/**, **/Target/**, **/.git/**`              | never gated, in silence                                                                                       |
| `policy`          | `[]`                                                     | the policy table (`{kind, decision, operation?}`)                                                             |
| `recovery`        | `[]`                                                     | the recovery-table overrides (`{obligation, behavior}`)                                                       |
| `loopBound`       | `4`                                                      | the recursion-prevention loop bound                                                                           |
| `maxDecisions`    | `500`                                                    | the decision ring bound                                                                                       |
| `automation`      | D6 defaults                                              | the per-action allowlist (the shared factory block; keyed `automation` - `policy` is the decision rule table) |

### The policy block (D6) - the `automation` key

The config carries the shared per-action allowlist (`automation: Policy()`, composed from the
factory's block), mapped to `State.Allow`.

The key is `automation`, **not** `policy`, because `policy` is already this hook's decision rule
table (a different contract; the `plugin-dsh-route` precedent):

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

This hook's action class is RECORD (it records a gate decision), and that class is **automatic**.

The hook has **NO gated action** - it never writes a file, commits a batch or spawns an agent - so
the block documents the posture and refuses nothing.

The block is one volatile object, so a policy flip is hot-editable without a remount; a resolved
pack's `policy` section overrides the defaults per action (the wiring is the next refinement).

## The ledger (module-owned, byte-stable)

```text
govern: activated (tools=<n>, policy=<n>)
govern: disabled (enabled=false)
govern: passed <operation> (<kind> <target>)
govern: denied <operation> (<reason>)
govern: escalated <operation> (approval required)
govern: recovery <obligation> (fail-open)
govern: loop <operation> (recursion guard)
govern: observed <operation> (accepted | errored)
```

## The build and the tests

The build is `pnpm prepublishOnly` (Source/prepublishOnly.sh): the plugin build (ESM `Target/`, Test
tree excluded), the Test build, the harness selfcheck, and the Test type-check.

## The plan

- [Workspace-Family/GOVERN](../../../Documentation/Plans/Workspace-Family/GOVERN.md) - the govern
  gate.
- [WORKSPACE-FAMILY-V4-1](../../../Documentation/Plans/WORKSPACE-FAMILY-V4-1.md) - section 3.9, the
  honest-recovery contract.

## License

CC0-1.0.
