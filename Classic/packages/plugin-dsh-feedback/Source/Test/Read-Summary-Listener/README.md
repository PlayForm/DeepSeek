# Read-Summary-Listener - the delta, the read, the summary and the pickup

The delta append, the recipient's optional read, the council summary, and
the passive inbox-splice pickup.

## Scenarios

- D1: the parent's append - a delta is appended to the stored block (the
  honest content never rewritten), the journal carries one `delta` event, a
  delta on an unknown session/agent is null with no journal line.
- R1: the optional read - `read-at <reader>` is recorded on the block and
  journaled (`restored`); a second read is idempotent with no second
  journal line; a read of an unknown block is null.
- S1: the council summary - blocks/unread counts, the term clusters
  (words shorter than 4 excluded, `harness` first), and an unknown session
  yields the empty aggregate.
- L1: the passive pickup - an `agent/inbox/spliced` event carrying a
  `[HONEST FEEDBACK` block records it unread; a splice without a block,
  other event types, and malformed events (missing data) are ignored or
  swallowed without throwing (fail-open).
- L2: a disabled listener records nothing.

## Fixtures

The shared Harness (fake ctx with the captured session/event listener, the
real built class, a real temp-dir journal file). The splice text is a
hand-written fixture, independent of the plugin's own Render.

## Expected journal events

`recorded` (record, pickup), `restored` (Read), `delta` (Delta).

## Expected count

15 PASS.
