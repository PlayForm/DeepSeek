# Emits

What this test verifies.

## Intent

The pure emission (Source/Function/Emits.ts, the conversation spine's section 3.1): the session
log's records become one envelope per state-changing event - the turn start, the step start, the
assistant message, the tool call, each resolved touch, and the session end - with `Seq` and `At`
copied from the source record and `Kind` from the vocabulary.

## Scenario

- Check: "E1: the emits carry the source event's seq and time" - the session header emits nothing,
  and each of the three envelopes (turn, step, call) copies its source record's seq and time, the
  header's session id, and the turn and step the event belongs to.
- Check: "E2: a tool call with two file arguments emits two touches" - one tool envelope plus one
  touch envelope per file argument, in argument order, each copying the source event's seq and
  time and carrying the resolved path and the interaction kind.
- Check: "E3: the session end emits exactly one end envelope" - both `session/disposed` and
  `turn/end` map to exactly one `conversation/end` envelope.
- Check: "E4: an unknown event shape emits nothing" - a null, a string and an unrecognized record
  type are skipped, never thrown on.

## Fixtures

- Hand-written event arrays only: no ctx, no factory, no fs - the emission is pure.

## Expected count

4 PASS.
