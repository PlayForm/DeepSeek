# SCHEME - @playform/hook-dsh-batch-decision

## Identity

| Place                  | Value                                         |
| ---------------------- | --------------------------------------------- |
| Package name           | `@playform/hook-dsh-batch-decision`           |
| `name` export          | `hook-dsh-batch-decision`                     |
| Patch entry id         | `hook-dsh-batch-decision`                     |
| Ledger logFile default | `~/.dsh/playform/hook-dsh-batch-decision.log` |

The loader contract carries `name`, `apply`, `Config`, and `inject` on the default object, with
`inject = ["pluginFactory", "tools"]`.

The sibling services (pass-on, ingester, approval) are NOT injected, because they are optional seams
that the hook resolves through `Context.get` at use time.

## The batch contract (`Source/Interface/Batch.ts`)

`BatchProposal { id, intent, targets[], operations[], preview, digest, revision, expiresAt, confidence?, origin? }`
-> `BatchDecision { proposal, outcome: approved|denied|expired, by: user|policy, at }` ->
`BatchResult { proposal, perTarget[], applied, conflicts, recovery }`.

The digest is the fence of the ingester, and the revision is the fence of the decision, so a
re-proposal at a lower-or-equal revision is ignored.

The operations carry the literal `find`/`replace` of the apply path beside the declarative
`kind`/`value`, and `origin` is the agent whose inbox carried the proposal, which is the return
address of the decision.

## Events

| Event            | Mode | Direction                                        |
| ---------------- | ---- | ------------------------------------------------ |
| `batch/proposed` | emit | consumed (the synchronous recorder)              |
| `batch/decision` | emit | produced (the ingester and the live view listen) |

Both names are registered structurally through `Context.on("batch/proposed", ...)`, and neither
needs an Events-interface augmentation, because the owning packages are not in the workspace.

## The handoff (the inbox write)

Every recorded decision, whether approved, denied, or expired, is ALSO written into the agent-team
inbox of the harness, which is the same channel that plugin-dsh-batchstate consumes, so the status
of the board follows the decision and the bus is not the only wire.

The delivery is `agent.inject(message)`, the read-only pre-step context splice at
`packages/core/agent/src/runtime-types.ts:241` that commits the durable `agent/inbox/spliced` event,
and it carries

```
[BATCH DECISION - <id>]
<the canonical decision JSON>
```

The target resolves `origin` to `currentInitiator()` (`packages/core/agent/src/index.ts:297`) and
then to the first live agent (`:588`), and no live agent gives the honest
`inbox <id>: no live agent` line, while the bus emission still carries the decision.

The tool path also emits `batch/decision`, so the consumer of the ingester and the live view see a
USER decision too.

## The tool

`batch_decision` (`Source/Function/Tool.ts`) lists the proposals with no args, makes the user
decision with `id` plus `approve=true|false`, and hands an approved decision to the ingester seam.

It returns one canonical JSON result and it is a pure renderer.

## The sibling seams

The hook probes the declared seam names (`batchPassOn`, `batchIngester`, `approval`) FIRST and then
the LIVE service names that the sibling packages register (`passOn`, `ingester`), so it works
against a seam of the host and against the real packages without importing them.

The ingester handoff prefers the live `Apply(proposal, decision)`, which is the proposal the hook
recorded plus the decision, and it falls back to the declared `apply(decision)`.

## The policy gate (D6)

The config carries the shared per-action allowlist (`policy: Policy()`, the block of the factory),
mapped to `State.Allow`.

It is the **OUTER** gate in front of `autoApprove`, which is the **INNER** one:

- `Policy(State, Proposal) !== "auto-approve"` makes the proposal wait for the user, with no line,
  because the knob is off or the conservative rules refuse.
- `Decide(State.Allow, "commit") !== "auto"` closes the policy gate, so the policy auto-approval is
  refused and the byte-exact `decision held <id> (policy commit=approve)` line is recorded, and the
  proposal stays pending for the `batch_decision` approval of the user.
- with both open the auto-approval proceeds as documented, with the
  `decision approved <id> (by policy)` line, the bus emit, and the inbox write.

The precedence is **policy approve > knob**: `commit: approve` is the shipped default, so a policy
auto-approval never happens until the user opens the gate, whatever `autoApprove` says, and a knob
that is off still requires the user on its own and writes no held line.

The block is one volatile object, so a policy flip is hot-editable, and the `policy` section of a
resolved pack overrides the defaults per action, with the wiring left as the next refinement.

## Ledger strings (module-owned, byte-stable)

- `disabled (enabled=false)`
- `bundle 0.2.1 autoApprove <off|on> allowlist <n>` (the Activate line)
- `proposal <id> recorded (intent <intent>, targets <n>, rev <n>)`
- `proposal <id> ignored (revision not newer)`
- `decision <outcome> <id> (by <user|policy>)`
- `decision held <id> (policy commit=approve)`
- `inbox <id>: delivered to <agent>`
- `inbox <id>: no live agent`
- `handoff <id>: no ingester service present (the batch stays approved)`
- `handoff <id>: applied <n>, conflicts <n>, recovery <n>`

## State probe

The smoke harness reads the built State through `ctx.__hookDshBatchDecisionState` and never through
a return value from `apply`.
