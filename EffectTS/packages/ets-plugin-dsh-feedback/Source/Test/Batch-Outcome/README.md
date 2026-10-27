# Batch-Outcome - the batch outcome's journal and summary

The caller-side orchestration integration that the plan defers: a batch outcome (applied / rejected /
denied / expired) feeds the feedback journal and the session's summary.

## Scenarios

- O1: the outcome is appended to the session's ring, the journal carries its own byte-exact line
  shape
  (`{"at":<epoch>,"event":"batch","session":<s>,"agentId":<a>,"proposal":<id>,"outcome":<o>,"detail":<d>}`),
  and the summary carries the outcome beside the blocks.
- O2: the ring keeps the newest `maxOutcomes` outcomes (the oldest drop), and the journal keeps
  every line.
- O3: the sessions are isolated - each summary carries only its own outcomes, and an unknown
  session is the empty aggregate.
- O4: a proposal-less report records nothing (never invents a batch).
- O5: a disabled service records no outcome and journals nothing.

## Fixtures

The shared Harness (the real built class over a temp-dir journal; the outcome ring is read through
the service's own `Summary`).

## Expected journal strings (byte-exact, JSON lines)

`{"at":<epoch>,"event":"batch","session":"session-child","agentId":"agent-a","proposal":"p1","outcome":"applied","detail":"applied 1, conflicts 0, recovery 0"}`.

## Expected count

7 PASS.
