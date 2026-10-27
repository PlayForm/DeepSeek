# Read-Summary-Listener - the delta, the read, the summary and the pickup

This folder covers the delta append, the optional read of the recipient, the council summary, and
the passive pickup of an inbox splice.

## Scenarios

- D1: the append of the parent adds a delta to the stored block, the honest
  content is never rewritten, the journal carries one `delta` event, and a
  delta on an unknown session or agent gives null with no journal line.
- R1: the optional read records `read-at <reader>` on the block and journals it
  as `restored`; a second read is idempotent with no second journal line, and a
  read of an unknown block gives null.
- S1: the council summary counts blocks and unread entries, builds the term
  clusters with words shorter than 4 excluded and `harness` first, and gives
  the empty aggregate for an unknown session.
- L1: the passive pickup records a `[HONEST FEEDBACK` block that arrives in an
  `agent/inbox/spliced` event as unread, while a splice without a block, other
  event types, and malformed events with missing data are ignored or swallowed
  without a throw, which is the fail-open posture.
- L2: a disabled listener records nothing.

## Fixtures

The fixtures are the shared Harness with the fake ctx that captures the session and event
listener, the real built class, and a real journal file in the temp dir.

The splice text is a hand-written fixture that does not depend on the own Render of the plugin.

## Expected journal events

`recorded` (record, pickup), `restored` (Read), `delta` (Delta).

## Expected count

15 PASS.
