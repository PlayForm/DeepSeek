# SCHEME - @playform/plugin-dsh-feedback

The FEEDBACK member: the honest-signal collector, the transfer hop, the optional read, and the
council summary.

The service is `feedback` on the context.

## 1. The block contract

`FeedbackBlock` (Interface/Block.ts) - the plan's section 1 format, one field per line:

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

- `Record(block)` - store + journal.

    Oversized fields are capped with a visible `[capped]` marker, and a newer block from the same
    agent replaces the older one in place.

- `Push(block, parentSession)` - one mechanical hop.

    The destination session id comes from the caller (the queue integration knows the parentage).

    The chain cap (`maxChain`) bounds the upward flow, and a capped block is dropped with a journal
    line, never silently.

- `Delta(session, agentId, text)` - the parent's append.
- `Read(session, agentId, reader)` - the recipient's optional read.
- `Summary(session)` - the council view.
- `Outcome(session, agentId, proposal, outcome, detail)` - the batch outcome's record (the
  caller-side orchestration integration that the plan defers; the ingester is the caller that owns
  the apply's result).

    It is appended to the session's outcome ring (bounded by `maxOutcomes`) and journaled, and the
    summary carries it beside the blocks.

    A disabled service or an empty proposal id records nothing.

## 3. The journal

`logFile` - one JSON line per event, in two shapes:

- the block events: `{ at, event, session, agentId, block }`;
- the batch outcome: `{ at, event: "batch", session, agentId, proposal, outcome, detail }`.

Append-only, best-effort (a ledger failure never breaks the service).

The journal is the plugin's own diagnostic log, appended with a plain `appendFileSync` (the
factory's documented exemption - the governed-write path does not apply to a plugin's own log).

## 4. Config

See README.md's table.

All knobs are read at construction (the class form has no factory State to hot-refresh), and a
config edit reloads the plugin.

### 4.1 The policy block (D6)

The schema composes the factory's shared block (`policy: Policy()`) into the plugin's own
`Schema.object` call, and the validated shape is `State.Config.policy` (the class form has no
factory State mapping):

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

The feedback member is a PASSIVE collector: it records outcomes and suggests summaries (`record` and
`suggest`, both automatic) and never writes, commits, or spawns - those verdicts are declared for
uniformity with the family's block and stay the shipped `approve`.

A resolved pack's `policy` section overrides the defaults per action (the wiring is the next
refinement; the type already exists in `@playform/ets-lib-dsh-pack`).

The defaults are smoke-arbitrated in `Source/Test/Policy-Defaults`.

## 5. The transfer semantics

- The block travels as TEXT, and the passive pickup listener records any `[HONEST FEEDBACK` block
  found in an `agent/inbox/spliced` event into the receiving session's record.
- The transfer NEVER forces the reading: nothing in the pipeline surfaces a block into the
  conversation.
- The honesty invariant: the parents append deltas, never edit; the block's `liked`/`disliked` text
  is immutable once recorded (the cap marker is the only allowed mutation, and it is visible).

## 6. The integration points (end-phase)

- The batch-state plugin surfaces the summary in the compiled context when the recipient opts in.
- The subagent-queue plugin attaches the rendered block to completion reports and calls `Push` with
  the parent session id.
- The routing-enforcer consumes the DISLIKED routing signals as review material.
