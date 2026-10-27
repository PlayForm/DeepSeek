# SCHEME - @playform/plugin-dsh-feedback

The FEEDBACK member collects the honest signals, moves the transfer hop, performs the optional read,
and builds the council summary, and it provides the service `feedback` on the context.

## 1. The block contract

`FeedbackBlock` (Interface/Block.ts) follows the section 1 format of the plan, with one field per
line:

| Field         | Meaning                                                   |
| ------------- | --------------------------------------------------------- |
| `agentId`     | The producing agent.                                      |
| `task`        | The task label.                                           |
| `session`     | The session the block currently sits in.                  |
| `liked`       | The genuine likes.                                        |
| `disliked`    | The frictions.                                            |
| `deltas`      | The parents' appends (append-only, never edited).         |
| `transferred` | The mechanical chain `child -> parent -> ...`.            |
| `readStatus`  | `unread` or `read-at <session>` (the recipient's choice). |

## 2. The service surface

- `Record(block)` stores and journals the block; oversized fields are capped with a visible
  `[capped]` marker, and a newer block from the same agent replaces the older one in place.
- `Push(block, parentSession)` moves the block one mechanical hop, takes the destination session id
  from the caller because the queue integration knows the parentage, and bounds the upward flow with
  the chain cap `maxChain`, so a capped block is dropped with a journal line and never silently.
- `Delta(session, agentId, text)` appends the delta of the parent.
- `Read(session, agentId, reader)` performs the optional read of the recipient.
- `Summary(session)` builds the council view.
- `Outcome(session, agentId, proposal, outcome, detail)` records the batch outcome for the
  caller-side orchestration integration that the plan defers, where the ingester is the caller that
  owns the result of the apply, appends it to the outcome ring of the session bounded by
  `maxOutcomes`, journals it, and carries it in the summary beside the blocks, while a disabled
  service or an empty proposal id records nothing.

## 3. The journal

`logFile` holds one JSON line per event, in two shapes:

- the block events: `{ at, event, session, agentId, block }`;
- the batch outcome: `{ at, event: "batch", session, agentId, proposal, outcome, detail }`.

The journal is append-only and best-effort, because a ledger failure never breaks the service.

It is the diagnostic log of the plugin itself, appended with a plain `appendFileSync`, which is the
documented exemption of the factory: the governed-write path does not apply to the own log of a
plugin.

## 4. Config

The table in README.md lists the knobs.

All knobs are read at construction, because the class form has no factory State to hot-refresh, and
a config edit reloads the plugin.

### 4.1 The policy block (D6)

The schema composes the shared block of the factory, `policy: Policy()`, into the `Schema.object`
call of the plugin, and the validated shape is `State.Config.policy`, because the class form has no
factory State mapping:

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

The feedback member is a PASSIVE collector: it records outcomes and suggests summaries through
`record` and `suggest`, both automatic, and it never writes, commits, or spawns, so those verdicts
are declared for uniformity with the block of the family and stay the shipped `approve`.

The `policy` section of a resolved pack overrides the defaults per action, that wiring is the next
refinement, and the type already exists in `@playform/lib-dsh-pack`.

`Source/Test/Policy-Defaults` arbitrates the defaults in the smoke suite.

## 5. The transfer semantics

- The block travels as TEXT, and the passive pickup listener records any `[HONEST FEEDBACK` block
  that it finds in an `agent/inbox/spliced` event into the record of the receiving session.
- The transfer NEVER forces the reading, because nothing in the pipeline surfaces a block into the
  conversation.
- The honesty invariant holds: the parents append deltas and never edit, the `liked`/`disliked` text
  of the block is immutable once recorded, and the cap marker is the only allowed mutation, which is
  visible.

## 6. The integration points (end-phase)

- The batch-state plugin surfaces the summary in the compiled context when the recipient opts in.
- The subagent-queue plugin attaches the rendered block to the completion reports and calls `Push`
  with the id of the parent session.
- The routing-enforcer uses the DISLIKED routing signals as review material.
