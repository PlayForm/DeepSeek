# @playform/plugin-dsh-feedback

> v0.1.0 - UNPUBLISHED - plan:
> [HONEST-FEEDBACK-PLUGIN](../../Documentation/Plans/HONEST-FEEDBACK-PLUGIN.md)

## The role

The FEEDBACK member (`ctx.feedback`) is the fourth orchestration member
(Documentation/Plans/HONEST-FEEDBACK-PLUGIN.md).

It is a DeepSeek Harness service that collects the honest signals.

Every completion of an agent carries an HONEST feedback block:

```
[HONEST FEEDBACK - <agent id> - <task> - <session>]
LIKED: <the agent's genuine likes - the spec, the environment, the tools>
DISLIKED: <the frictions - the ambiguities, the broken states, the concurrency>
DELTAS: <the parent sessions' appends - the observations the passers added>
TRANSFERRED: <the path: child -> parent -> ... - the mechanical chain>
READ-STATUS: unread / read-at <session>
```

The block transfers through the parentage MECHANICALLY, because it flows up the tree as text through
the inbox splice machinery, one hop per session boundary.

The parent sessions ALWAYS modify it, because the parents APPEND their deltas and never edit or
sanitize the honest content.

The reading is the CHOICE of the recipient, because the transfer never forces the reading.

## The surfaces

The plugin provides one service, `ctx.feedback`, which the table below describes.

It provides no tool and no event listener, and the journal is the in-memory record plus the JSONL
ledger.

## The service surface (`ctx.feedback`)

| Method    | Signature                                                                   | Meaning                                                                                                                                              |
| --------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Record`  | `(block: FeedbackBlock): void`                                              | Store a block in its session's record; journal the event.                                                                                            |
| `Push`    | `(block: FeedbackBlock, parentSession: string): void`                       | The mechanical transfer hop: forward the block to the parent session's record, one hop added to the TRANSFERRED chain. Capped at `maxChain` hops.    |
| `Delta`   | `(session: string, agentId: string, text: string): FeedbackBlock \| null`   | The parent's append: add a delta observation to a stored block.                                                                                      |
| `Read`    | `(session: string, agentId: string, reader: string): FeedbackBlock \| null` | The recipient's optional read: record `read-at <reader>` on a stored block.                                                                          |
| `Summary` | `(session: string): Summary`                                                | The council view: counts, the unread count, the liked/disliked word clusters, and the batch outcomes.                                                |
| `Render`  | `(block: FeedbackBlock): string`                                            | Render one block in the transfer format (the queue integration's footer builder).                                                                    |
| `Outcome` | `(session, agentId, proposal, outcome, detail): Outcome \| null`            | Record one batch outcome (applied / rejected / denied / expired) into the session's journal and summary - the caller-side orchestration integration. |

## The batch outcome

The orchestration layer reports the outcome of the batch to the council, because the ingester, which
owns the apply, calls `Outcome` after every apply, so an `applied` or `rejected` result lands in the
feedback journal as `event: "batch"` and in the summary of the session under `outcomes`, beside the
honest blocks.

The session and the agent come from the `origin` of the proposal.

## The configuration

| Field           | Default                                   | Meaning                                                         |
| --------------- | ----------------------------------------- | --------------------------------------------------------------- |
| `enabled`       | `true`                                    | Master switch (the patch entry ships `enabled: true`).          |
| `logFile`       | `~/.dsh/playform/plugin-dsh-feedback.log` | The durable journal (one log per module).                       |
| `maxBlockBytes` | `4096`                                    | Cap per block's text fields (the marker records a cap).         |
| `maxChain`      | `8`                                       | Maximum TRANSFERRED hops before a block is dropped (journaled). |
| `maxSessions`   | `128`                                     | Sessions kept in the in-memory record.                          |
| `summaryTerms`  | `10`                                      | Terms in one summary's liked/disliked clusters.                 |
| `maxOutcomes`   | `16`                                      | The per-session batch-outcome ring bound.                       |
| `policy.*`      | D6 defaults                               | The per-action allowlist (the shared factory block).            |

### The policy block (D6)

The schema composes the shared block of the factory, `policy: Policy()`, into the `Schema.object`
call of the plugin, and the validated shape is `State.Config.policy`:

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

The member is a passive collector, so `record` and `suggest` are automatic, while the write, commit,
and spawn verdicts are declared for uniformity and stay the shipped `approve`, because the member
never writes, commits, or spawns.

The `policy` section of a resolved pack overrides the defaults per action, and that wiring is the
next refinement.

`Source/Test/Policy-Defaults` arbitrates the defaults in the smoke suite.

## The ledger

The plugin writes one JSONL log at `logFile`, by default `~/.dsh/playform/plugin-dsh-feedback.log`,
and each line is

```text
{"at":<epoch ms>,"event":<event>,"session":<id>,"agentId":<id>,"block":<the stored block>}
```

## The build and the tests

The build is `pnpm prepublishOnly` from Source/prepublishOnly.sh, which runs the plugin build with
the ESM `Target/` and the Test tree excluded, the Test build, the harness selfcheck, and the Test
type-check.

| Folder                  | What it proves                                                        | Count |
| ----------------------- | --------------------------------------------------------------------- | ----- |
| `Record-And-Transfer`   | the constructor wiring, the record, the Push hop, the transfer format | 14    |
| `Read-Summary-Listener` | the delta, the optional read, the summary, the passive pickup         | 15    |
| `Batch-Outcome`         | the batch outcome's journal line, the summary ring, the refusals      | 7     |
| `Policy-Defaults`       | the D6 block's defaults and the passive-collector posture             | 4     |

## The honesty policy

Nothing sanitizes or filters the honest content.

The parents append deltas and NEVER rewrite the signals of the agents.

The read is ALWAYS the choice of the recipient.

The override of the user wins.

## The plan

- [HONEST-FEEDBACK-PLUGIN](../../Documentation/Plans/HONEST-FEEDBACK-PLUGIN.md) covers the honest
  feedback member.

## License

CC0-1.0.
