# @playform/plugin-dsh-feedback

> v0.1.0 - UNPUBLISHED - plan:
> [HONEST-FEEDBACK-PLUGIN](../../Documentation/Plans/HONEST-FEEDBACK-PLUGIN.md)

## The role

The FEEDBACK member (ctx.feedback) - the fourth orchestration member
(Documentation/Plans/HONEST-FEEDBACK-PLUGIN.md).

A DeepSeek Harness service that collects the honest signals.

Every agent's completion carries an HONEST feedback block:

```
[HONEST FEEDBACK - <agent id> - <task> - <session>]
LIKED: <the agent's genuine likes - the spec, the environment, the tools>
DISLIKED: <the frictions - the ambiguities, the broken states, the concurrency>
DELTAS: <the parent sessions' appends - the observations the passers added>
TRANSFERRED: <the path: child -> parent -> ... - the mechanical chain>
READ-STATUS: unread / read-at <session>
```

The block is transferred through the parentage MECHANICALLY: the block flows up the tree as text
(the inbox splice machinery), one hop per session boundary, and the parent sessions ALWAYS modify
it.

The parents APPEND their deltas, and they never edit or sanitize the honest content.

The reading is the recipient's CHOICE - the transfer never forces the reading.

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

The orchestration layer reports the batch's outcome to the council: the ingester (the apply's owner)
calls `Outcome` after every apply, so a batch's `applied` / `rejected` result lands in the feedback
journal (`event: "batch"`) and in the session's summary (`outcomes`), beside the honest blocks.

The session and the agent are the proposal's `origin`.

## The configuration

| Field           | Default                                       | Meaning                                                         |
| --------------- | --------------------------------------------- | --------------------------------------------------------------- |
| `enabled`       | `true`                                        | Master switch (the patch entry ships `enabled: true`).          |
| `logFile`       | `~/.dsh/playform/ets-plugin-dsh-feedback.log` | The durable journal (one log per module).                       |
| `maxBlockBytes` | `4096`                                        | Cap per block's text fields (the marker records a cap).         |
| `maxChain`      | `8`                                           | Maximum TRANSFERRED hops before a block is dropped (journaled). |
| `maxSessions`   | `128`                                         | Sessions kept in the in-memory record.                          |
| `summaryTerms`  | `10`                                          | Terms in one summary's liked/disliked clusters.                 |
| `maxOutcomes`   | `16`                                          | The per-session batch-outcome ring bound.                       |
| `policy.*`      | D6 defaults                                   | The per-action allowlist (the shared factory block).            |

### The policy block (D6)

The schema composes the factory's shared block (`policy: Policy()`) into the plugin's own
`Schema.object` call, and the validated shape is `State.Config.policy`:

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

The member is a passive collector - `record` and `suggest` are automatic, and the write/commit/spawn
verdicts are declared for uniformity and stay the shipped `approve` (the member never writes,
commits, or spawns).

A resolved pack's `policy` section overrides the defaults per action (the wiring is the next
refinement).

The defaults are smoke-arbitrated in `Source/Test/Policy-Defaults`.

## The smokes

| Folder                  | What it proves                                                        | Count |
| ----------------------- | --------------------------------------------------------------------- | ----- |
| `Record-And-Transfer`   | the constructor wiring, the record, the Push hop, the transfer format | 14    |
| `Read-Summary-Listener` | the delta, the optional read, the summary, the passive pickup         | 15    |
| `Batch-Outcome`         | the batch outcome's journal line, the summary ring, the refusals      | 7     |
| `Policy-Defaults`       | the D6 block's defaults and the passive-collector posture             | 4     |

## The honesty policy

The honest content is NEVER sanitized or filtered.

The parents append deltas, and they NEVER rewrite the agents' signals.

The read is ALWAYS the recipient's choice.

The user's override wins.

## The plan

- [HONEST-FEEDBACK-PLUGIN](../../Documentation/Plans/HONEST-FEEDBACK-PLUGIN.md) - the honest
  feedback member.

## License

CC0-1.0.
