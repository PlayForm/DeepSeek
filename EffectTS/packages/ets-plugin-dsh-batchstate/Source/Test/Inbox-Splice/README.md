# Inbox-Splice - the inbox splice, the Gates block and the queue projection

The harness agent-team inbox channel: a batch proposal (and a decision) delivered as an inbox
message is projected onto the board.

The arbiter gates and the queue projection render in the compiled block, and the board survives a
restart.

## Scenarios

- I1: the proposal splice through the DURABLE channel (`session/event` / `agent/inbox/spliced`) -
  the byte-exact `proposal prop-1 spliced (intent version-bump, targets 1, rev 1, origin agent-a)`
  line, the `batch/state-change` event kind `proposal`, the service's `getProposals()` /
  `getState().proposals` read-back, and the rule that the DELIVERING session is the return address
  (the payload's own origin never overrides it).
- I2: the LIVE channel (`agent/inbox/inserted`) is the same delivery - de-duplicated on the message
  id (one splice line), a re-delivery of the same revision logs
  `proposal prop-1 skipped (revision not newer)`, and a revision bump replaces in place.
- I3: the refusals - an unparseable body (`proposal prop-broken rejected (malformed payload)`), a
  payload without an id (`proposal rejected (malformed payload)`), and an ordinary message
  (silence: no line, no state).
- I4: the decision splice - `proposal prop-1 decided approved (by user)`, the status, and the
  `decision` event; an unknown proposal (`decision prop-ghost ignored (unknown proposal)`); a
  decision outside the closed outcome vocabulary (`decision rejected (malformed payload)`).
- G1: the Gates block - the byte-exact `gate build: green` and `gate smokes: red (owner coder-a)`
  lines, the sorted compiled `GATES: build green, smokes red (owner coder-a)` line, and the
  fail-loud vocabulary/name validation.
- Q1: the queue projection - `QUEUE: none` and a silent block without the queue service, the
  queue's OWN compiled line verbatim when it is present, and a broken queue that never breaks the
  compile.
- X1: the new knob's fail-loud validation - `maxProposals` below 1 throws
  `batchstate: maxProposals must be an integer >= 1` at load.
- R1: the restart - the state file carries the proposals and the gates back on the next mount, and
  the recovered line stays byte-exact.

## Fixtures

The shared Harness (the fake ctx's captured `session/event` and `agent/inbox/inserted` listeners,
the real built plugin, the real factory, a fresh temp state file).

The inbox fixtures mirror the harness's own splice payload (`packages/core/agent/src/types.ts:96`)
and message shape.

## Expected ledger strings (byte-exact, `batchstate: ` prefix)

`proposal <id> spliced (intent <intent>, targets <n>, rev <n>, origin <origin|->)`,
`proposal <id> skipped (revision not newer)`,
`proposal <id> rejected (malformed payload)`,
`proposal rejected (malformed payload)`,
`proposal <id> decided <outcome> (by <by>)`,
`decision <id> ignored (unknown proposal)`,
`decision rejected (malformed payload)`,
`gate <name>: <state>`, `gate <name>: <state> (owner <owner>)`.

## Expected count

22 PASS.
