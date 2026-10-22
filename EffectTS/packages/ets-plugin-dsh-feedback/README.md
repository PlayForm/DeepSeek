# @playform/plugin-dsh-feedback

The FEEDBACK member (ctx.feedback) - the fourth orchestration member
(Documentation/Plans/HONEST-FEEDBACK-PLUGIN.md). A DeepSeek Harness service that collects the honest
signals.

Every agent's completion carries an HONEST feedback block:

```
[HONEST FEEDBACK - <agent id> - <task> - <session>]
LIKED: <the agent's genuine likes - the spec, the environment, the tools>
DISLIKED: <the frictions - the ambiguities, the broken states, the concurrency>
DELTAS: <the parent sessions' appends - the observations the passers added>
TRANSFERRED: <the path: child -> parent -> ... - the mechanical chain>
READ-STATUS: unread / read-at <session>
```

The block is transferred through the parentage MECHANICALLY - the block flows up the tree as text
(the inbox splice machinery), one hop per session boundary, and it is ALWAYS modified in the parent
sessions: the parents APPEND their deltas, they never edit or sanitize the honest content. The
reading is the recipient's CHOICE - the transfer never forces the reading.

## The service surface (`ctx.feedback`)

| Method    | Signature                                                                   | Meaning                                                                                                                                           |
| --------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Record`  | `(block: FeedbackBlock): void`                                              | Store a block in its session's record; journal the event.                                                                                         |
| `Push`    | `(block: FeedbackBlock, parentSession: string): void`                       | The mechanical transfer hop: forward the block to the parent session's record, one hop added to the TRANSFERRED chain. Capped at `maxChain` hops. |
| `Delta`   | `(session: string, agentId: string, text: string): FeedbackBlock \| null`   | The parent's append: add a delta observation to a stored block.                                                                                   |
| `Read`    | `(session: string, agentId: string, reader: string): FeedbackBlock \| null` | The recipient's optional read: record `read-at <reader>` on a stored block.                                                                       |
| `Summary` | `(session: string): Summary`                                                | The council view: counts, the unread count, the liked/disliked word clusters.                                                                     |
| `Render`  | `(block: FeedbackBlock): string`                                            | Render one block in the transfer format (the queue integration's footer builder).                                                                 |

## Config

| Field           | Default                        | Meaning                                                         |
| --------------- | ------------------------------ | --------------------------------------------------------------- |
| `enabled`       | `true`                         | Master switch (the patch entry ships `enabled: true`).          |
| `logFile`       | `~/.dsh/feedback/feedback.log` | The durable journal (one log per module).                       |
| `maxBlockBytes` | `4096`                         | Cap per block's text fields (the marker records a cap).         |
| `maxChain`      | `8`                            | Maximum TRANSFERRED hops before a block is dropped (journaled). |
| `maxSessions`   | `128`                          | Sessions kept in the in-memory record.                          |
| `summaryTerms`  | `10`                           | Terms in one summary's liked/disliked clusters.                 |

## The honesty policy

The honest content is NEVER sanitized or filtered. The parents append deltas, NEVER rewrite the
agents' signals. The read is ALWAYS the recipient's choice. The user's override wins.
