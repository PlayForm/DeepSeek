# @playform/hook-dsh-batch-decision

> v0.3.0 - UNPUBLISHED - plan:
> [PASS-ON-AND-INGESTER](../../Documentation/Plans/PASS-ON-AND-INGESTER.md)

## The role

The batch-decision hook: the thin workflow owner between the suggester, the pass-on, the ingester
and the live view.

Plan: `Documentation/Plans/PASS-ON-AND-INGESTER.md` (section 5, the decision workflow).

## The surfaces

- The `batch_decision` tool (the one entry point; no args lists pending proposals, `id` + `approve`
  records the decision).
- The `batch/proposed` event listener (synchronous recorder).
- The `batch/decision` event emission.
- The agent-team inbox handoff (the same channel plugin-dsh-batchstate consumes).
- The ledger (`Source/Variable/Config.ts` `logFile`).

## What it does

- Listens for `batch/proposed` (emit, synchronous recorder) carrying a `BatchProposal`; records it,
  evaluates expiry, and evaluates the auto-approve policy.
- An auto-approval records a `BatchDecision` (`approved`, by `policy`), emits `batch/decision`, and
  logs one ledger line.

- **The handoff**: every recorded decision is ALSO written into the harness agent-team inbox (the
  same channel plugin-dsh-batchstate consumes), so the board's status follows the decision.

    The target is the proposal's `origin`, then the harness initiator, then the first live agent; no
    live agent is an honest ledger line.

- The `batch_decision` tool is the one entry point the user interacts with: no args lists pending
  proposals; `id` + `approve=true|false` records the user's decision; an approved batch is handed to
  the ingester service when one is present (the declared `batchIngester` seam first, then the live
  `ingester` service, which receives the proposal AND the decision).

## The conservative policy (the first-batch rule)

A policy auto-approval requires ALL of: `autoApprove: "on"`, the intent in the allowlist, targets
within `maxAutoTargets`, confidence at or above `minConfidence`, and at least one previous USER
approval of the same intent class.

The first batch of any intent class always requires the user.

The policy never approves an expired proposal - expiry produces the `expired` decision by `policy`
on first touch (lazy; no timers).

### The policy block (D6) - the outer gate

The config carries the shared per-action allowlist (`policy: Policy()`, composed from the factory's
block), mapped to `State.Allow`:

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

The policy is the **outer** gate, `autoApprove` the **inner** one.

An `approve` verdict for `commit`

- the shipped default - refuses the policy auto-approval even with the knob on, and the ledger
  records the byte-exact `decision held <id> (policy commit=approve)` line: the proposal stays
  **pending** and waits for the user's `batch_decision` approval.

The precedence is **policy approve > knob**: the knob can never widen an approve verdict, while a
knob that is off still requires the user and writes no held line.

The block is one volatile object, so a policy flip is hot-editable without a remount; a resolved
pack's `policy` section overrides the defaults per action (the wiring is the next refinement).

## It never writes

The hook does not implement the pass-on or the ingester and never writes files.

Sibling service shapes are declared structurally (`Source/Interface/Siblings.ts`) and resolved via
`Context.get` at use time: the declared seams `batchPassOn`, `batchIngester`, `approval`, then the
live names `passOn`, `ingester`.

## The build and the tests

The build is `pnpm prepublishOnly` (Source/prepublishOnly.sh): the plugin build (ESM `Target/`, Test
tree excluded), the Test build, the harness selfcheck, and the Test type-check.

| Folder                | What it proves                                                     | Count |
| --------------------- | ------------------------------------------------------------------ | ----- |
| `Policy-And-Contract` | the loader contract, the policy gates, the fs purity               | 22    |
| `Gate-Tool-Handoff`   | the recorder, the expiry gate, the tool paths, the ingester seam   | 19    |
| `Inbox-Handoff`       | the decision written into the inbox, the return address, the seams | 7     |
| `Batch-Chain`         | the whole chain end to end (all five packages in one process)      | 9     |
| `Policy-Defaults`     | the D6 block's defaults, the held auto-approval, the precedence    | 7     |

## The ledger

The lines are prefixed `hook-dsh-batch-decision: ` and go to `logFile`:

```text
decision <outcome> <id> (by user)
decision <outcome> <id> (by policy)
decision expired <id> (by policy)
decision held <id> (policy commit=approve)
denied <id>
handoff <id>: applied <n>, conflicts <n>, recovery <n>
handoff <id>: no ingester service present (the batch stays approved)
inbox <id>: delivered to <agent>
inbox <id>: no live agent
```

## The configuration

| Field            | Default                                       | Notes                                       |
| ---------------- | --------------------------------------------- | ------------------------------------------- |
| `enabled`        | `false`                                       | ships disabled (idle-forever posture)       |
| `logFile`        | `~/.dsh/playform/hook-dsh-batch-decision.log` | the workflow ledger                         |
| `autoApprove`    | `off`                                         | the second explicit flip; off = user only   |
| `allowlist`      | `[]`                                          | intent classes eligible for policy approval |
| `maxAutoTargets` | `5`                                           | the bounded-batch rule                      |
| `minConfidence`  | `0.8`                                         | the high-confidence rule                    |
| `pendingTtlMs`   | `3600000`                                     | how long decided entries linger             |
| `policy.*`       | D6 defaults                                   | the per-action allowlist (the outer gate)   |

Every field is a volatile cell: a hot edit lands on the next decision.

## The plan

- [PASS-ON-AND-INGESTER](../../Documentation/Plans/PASS-ON-AND-INGESTER.md) - section 5, the
  decision workflow.

## License

CC0-1.0.
