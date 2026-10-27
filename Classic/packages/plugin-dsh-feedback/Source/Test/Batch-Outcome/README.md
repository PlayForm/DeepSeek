# Batch-Outcome - the batch outcome's journal and summary

This folder covers the caller-side orchestration integration that the plan defers, where a batch
outcome of applied, rejected, denied, or expired feeds the feedback journal and the summary of the
session.

## Scenarios

- O1: the outcome is appended to the ring of the session, the journal carries
  its own byte-exact line shape
  (`{"at":<epoch>,"event":"batch","session":<s>,"agentId":<a>,"proposal":<id>,"outcome":<o>,"detail":<d>}`),
  and the summary carries the outcome beside the blocks.
- O2: the ring keeps the newest `maxOutcomes` outcomes and drops the oldest,
  while the journal keeps every line.
- O3: the sessions are isolated, so each summary carries only its own outcomes,
  and an unknown session gives the empty aggregate.
- O4: a report without a proposal records nothing and never invents a batch.
- O5: a disabled service records no outcome and journals nothing.

## Fixtures

The fixtures are the shared Harness with the real built class over a temp-dir journal, and the
outcome ring is read through the `Summary` method of the service itself.

## Expected journal strings (byte-exact, JSON lines)

`{"at":<epoch>,"event":"batch","session":"session-child","agentId":"agent-a","proposal":"p1","outcome":"applied","detail":"applied 1, conflicts 0, recovery 0"}`.

## Expected count

7 PASS.
