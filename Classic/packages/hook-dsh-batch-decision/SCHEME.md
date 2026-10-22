# SCHEME - @playform/hook-dsh-batch-decision

## Identity

| Place | Value |
| --- | --- |
| Package name | `@playform/hook-dsh-batch-decision` |
| `name` export | `hook-dsh-batch-decision` |
| Patch entry id | `hook-dsh-batch-decision` |
| Ledger logFile default | `~/.dsh/batch-decision.log` |

Loader contract: `name`, `apply`, `Config`, `inject` on the default object;
`inject = ["pluginFactory", "tools"]`. The sibling services (pass-on,
ingester, approval) are NOT injected - they are optional seams resolved via
`Context.get` at use time.

## The batch contract (`Source/Interface/Batch.ts`)

`BatchProposal { id, intent, targets[], operations[], preview, digest,
revision, expiresAt, confidence? }` ->
`BatchDecision { proposal, outcome: approved|denied|expired, by: user|policy,
at }` -> `BatchResult { proposal, perTarget[], applied, conflicts, recovery }`.

The digest is the fence (the ingester's business); the revision is the
decision's fence (a re-proposal at a lower-or-equal revision is ignored).

## Events

| Event | Mode | Direction |
| --- | --- | --- |
| `batch/proposed` | emit | consumed (the synchronous recorder) |
| `batch/decision` | emit | produced (the ingester and the live view listen) |

Both names are registered structurally (`Context.on("batch/proposed", ...)`)
- no Events-interface augmentation, since the owning packages are not in
the workspace.

## The tool

`batch_decision` (`Source/Function/Tool.ts`): no args = list; `id` +
`approve=true|false` = the user decision; an approved decision is handed to
the `batchIngester` seam when present. One canonical JSON result; pure
renderer.

## Ledger strings (module-owned, byte-stable)

- `disabled (enabled=false)`
- `bundle 0.1.0 autoApprove <off|on> allowlist <n>` (the Activate line)
- `proposal <id> recorded (intent <intent>, targets <n>, rev <n>)`
- `proposal <id> ignored (revision not newer)`
- `decision <outcome> <id> (by <user|policy>)`
- `handoff <id>: no ingester service present (the batch stays approved)`
- `handoff <id>: applied <n>, conflicts <n>, recovery <n>`

## State probe

The smoke harness reads the built State through
`ctx.__hookDshBatchDecisionState` (never a return value from `apply`).
