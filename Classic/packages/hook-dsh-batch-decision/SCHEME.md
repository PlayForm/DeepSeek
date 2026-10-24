# SCHEME - @playform/hook-dsh-batch-decision

## Identity

| Place                  | Value                                         |
| ---------------------- | --------------------------------------------- |
| Package name           | `@playform/hook-dsh-batch-decision`           |
| `name` export          | `hook-dsh-batch-decision`                     |
| Patch entry id         | `hook-dsh-batch-decision`                     |
| Ledger logFile default | `~/.dsh/playform/hook-dsh-batch-decision.log` |

Loader contract: `name`, `apply`, `Config`, `inject` on the default object;
`inject = ["pluginFactory", "tools"]`. The sibling services (pass-on, ingester, approval) are NOT
injected - they are optional seams resolved via `Context.get` at use time.

## The batch contract (`Source/Interface/Batch.ts`)

`BatchProposal { id, intent, targets[], operations[], preview, digest, revision, expiresAt, confidence?, origin? }`
-> `BatchDecision { proposal, outcome: approved|denied|expired, by: user|policy, at }` ->
`BatchResult { proposal, perTarget[], applied, conflicts, recovery }`.

The digest is the fence (the ingester's business); the revision is the decision's fence (a
re-proposal at a lower-or-equal revision is ignored). The operations carry the apply path's literal
`find`/`replace` beside the declarative `kind`/`value`; `origin` is the agent whose inbox carried
the proposal - the decision's return address.

## Events

| Event            | Mode | Direction                                        |
| ---------------- | ---- | ------------------------------------------------ |
| `batch/proposed` | emit | consumed (the synchronous recorder)              |
| `batch/decision` | emit | produced (the ingester and the live view listen) |

Both names are registered structurally (`Context.on("batch/proposed", ...)`)

- no Events-interface augmentation, since the owning packages are not in the workspace.

## The handoff (the inbox write)

Every recorded decision - approved, denied and expired alike - is ALSO written into the harness
agent-team inbox (the same channel plugin-dsh-batchstate consumes), so the board's status follows
the decision without the bus being the only wire. The delivery is `agent.inject(message)`
(`packages/core/agent/src/runtime-types.ts:241` - the read-only pre-step context splice that commits
the durable `agent/inbox/spliced` event), carrying

```
[BATCH DECISION - <id>]
<the canonical decision JSON>
```

The target resolves `origin` -> `currentInitiator()` (`packages/core/agent/src/index.ts:297`) -> the
first live agent (`:588`); no live agent is the honest `inbox <id>: no live agent` line (the bus
emission still carries the decision). The tool path also emits `batch/decision` so the ingester's
consumer and the live view see a USER decision too.

## The tool

`batch_decision` (`Source/Function/Tool.ts`): no args = list; `id` + `approve=true|false` = the user
decision; an approved decision is handed to the ingester seam. One canonical JSON result; pure
renderer.

## The sibling seams

The declared seam names (`batchPassOn`, `batchIngester`, `approval`) are probed FIRST, then the LIVE
service names the sibling packages register (`passOn`, `ingester`) - so the hook works against a
host's seam and against the real packages without importing them. The ingester handoff prefers the
live `Apply(proposal, decision)` (the proposal the hook recorded + the decision) and falls back to
the declared `apply(decision)`.

## The policy gate (D6)

The config carries the shared per-action allowlist (`policy: Policy()`, the factory's block), mapped
to `State.Allow`. It is the **OUTER** gate in front of `autoApprove` (the **INNER** one):

- `Policy(State, Proposal) !== "auto-approve"` -> the proposal waits for the user (no line; the knob
  is off or the conservative rules refuse).
- `Decide(State.Allow, "commit") !== "auto"` -> the policy gate is closed: the policy auto-approval
  is refused and the byte-exact `decision held <id> (policy commit=approve)` line is recorded; the
  proposal stays pending for the user's `batch_decision` approval.
- both open -> the auto-approval proceeds as documented (the `decision approved <id> (by policy)`
  line, the bus emit, the inbox write).

The precedence is **policy approve > knob**: `commit: approve` is the shipped default, so a policy
auto-approval never happens until the user opens the gate, whatever `autoApprove` says; a knob that
is off still requires the user on its own and writes no held line. The block is one volatile object
(a policy flip is hot-editable), and a resolved pack's `policy` section overrides the defaults per
action (the wiring is the next refinement).

## Ledger strings (module-owned, byte-stable)

- `disabled (enabled=false)`
- `bundle 0.1.0 autoApprove <off|on> allowlist <n>` (the Activate line)
- `proposal <id> recorded (intent <intent>, targets <n>, rev <n>)`
- `proposal <id> ignored (revision not newer)`
- `decision <outcome> <id> (by <user|policy>)`
- `decision held <id> (policy commit=approve)`
- `inbox <id>: delivered to <agent>`
- `inbox <id>: no live agent`
- `handoff <id>: no ingester service present (the batch stays approved)`
- `handoff <id>: applied <n>, conflicts <n>, recovery <n>`

## State probe

The smoke harness reads the built State through `ctx.__hookDshBatchDecisionState` (never a return
value from `apply`).
