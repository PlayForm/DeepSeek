# @playform/hook-dsh-workspace-govern

The workspace-govern hook: the governance gate of the workspace family's invisible flow - operate
proposes → **the govern gates** → the authority licenses → the approve binds. On every gated
`tools/pre-execute` call, and for every proposal handed to the `workspaceGovern` service, the hook
runs the four **independent means-checks** on the ProposedChange before any AuthorizationDecision
downstream. An intent must not authorize its own means: the gate checks the means; the intent is
never the permission.

The plugin ships **disabled** (the idle-forever posture) and enables only by an explicit ACTIVATE.

## The four independent checks

| Obligation      | Semantics                                                          | Failure behavior (recovery table) |
| --------------- | ------------------------------------------------------------------ | --------------------------------- |
| `contributes`   | The proposal declares a non-empty contribution to the operation    | fail-open                         |
| `scope`         | The target matches the authorized-scope allowlist                  | **fail-closed**                   |
| `policy`        | The policy table lookup by proposal kind (allow / deny / escalate) | fail-open (a table read failure)  |
| `preconditions` | The proposal's declared preconditions are satisfied                | fail-open                         |

The fail-open recovery table is the honest-recovery contract
(`Documentation/Plans/WORKSPACE-FAMILY-V4-1.md` section 3.9): per-obligation failure behavior, never
a silent default. An override list in the config replaces rows.

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

## Config (all volatile)

| Field             | Default                                     | Meaning                                                 |
| ----------------- | ------------------------------------------- | ------------------------------------------------------- |
| `enabled`         | `false`                                     | the master switch                                       |
| `log` / `logFile` | `true` / `~/.dsh/govern.log`                | the durable ledger (one log per module)                 |
| `tools`           | `write, edit, bash, applyPatch`             | the gated tool names                                    |
| `scope`           | `[]` (unrestricted)                         | the authorized-scope allowlist (globs)                  |
| `exclude`         | `node_modules/**, **/Target/**, **/.git/**` | never gated, in silence                                 |
| `policy`          | `[]`                                        | the policy table (`{kind, decision, operation?}`)       |
| `recovery`        | `[]`                                        | the recovery-table overrides (`{obligation, behavior}`) |
| `loopBound`       | `4`                                         | the recursion-prevention loop bound                     |
| `maxDecisions`    | `500`                                       | the decision ring bound                                 |

## Service

`ctx.workspaceGovern` (registered from apply):

- `gate(proposal)` - run the four checks on one proposal record, get the gate decision.
- `decisions(limit?)` - the decision ring, newest first.
- `statistics()` - `{ decisions, sequence }`.

## Ledger lines (module-owned, byte-stable)

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
