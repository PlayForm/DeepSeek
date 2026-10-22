# @playform/hook-dsh-batch-decision

The batch-decision hook: the thin workflow owner between the suggester, the
pass-on, the ingester and the live view. Plan:
`Documentation/Plans/PASS-ON-AND-INGESTER.md` (section 5, the decision
workflow).

## What it does

- Listens for `batch/proposed` (emit, synchronous recorder) carrying a
  `BatchProposal`; records it, evaluates expiry, and evaluates the
  auto-approve policy.
- An auto-approval records a `BatchDecision` (`approved`, by `policy`),
  emits `batch/decision`, and logs one ledger line.
- The `batch_decision` tool is the one entry point the user interacts with:
  no args lists pending proposals; `id` + `approve=true|false` records the
  user's decision; an approved batch is handed to the ingester service when
  one is present at the `batchIngester` seam.

## The conservative policy (the first-batch rule)

A policy auto-approval requires ALL of: `autoApprove: "on"`, the intent in
the allowlist, targets within `maxAutoTargets`, confidence at or above
`minConfidence`, and at least one previous USER approval of the same intent
class. The first batch of any intent class always requires the user. The
policy never approves an expired proposal - expiry produces the `expired`
decision by `policy` on first touch (lazy; no timers).

## It never writes

The hook does not implement the pass-on or the ingester and never writes
files. Sibling service shapes are declared structurally
(`Source/Interface/Siblings.ts`) and resolved via `Context.get` at use
time: `batchPassOn`, `batchIngester`, `approval`.

## Configuration

| Field | Default | Notes |
| --- | --- | --- |
| `enabled` | `false` | ships disabled (idle-forever posture) |
| `logFile` | `~/.dsh/batch-decision.log` | the workflow ledger |
| `autoApprove` | `off` | the second explicit flip; off = user only |
| `allowlist` | `[]` | intent classes eligible for policy approval |
| `maxAutoTargets` | `5` | the bounded-batch rule |
| `minConfidence` | `0.8` | the high-confidence rule |
| `pendingTtlMs` | `3600000` | how long decided entries linger |

Every field is a volatile cell: a hot edit lands on the next decision.
