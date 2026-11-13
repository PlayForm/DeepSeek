# Stream

This test verifies the following behavior.

## Intent

`Stream` is the llm-stream arm factory every normalization flavor mounts: it owns the per-invocation state machine of one stream (the current tool-call id, the raw marker, the replaced-character count) and the one settle line, while the flavor injects its transform, its line and its sink.

It is its own folder because the state machine is shared by six packages, where a change here silently changes every flavor's stream behavior at once.

## Scenario

- Group: Stream - the llm-stream arm factory (state, count, settle).
    - Check (three ok groups): the passthrough and settle, the per-call raw flag, the failed stream.
        - Leaf: every upstream chunk is yielded once, the order is preserved, and one settle line plus one journal record are written when the count is above zero.
        - Leaf: the raw marker on the FIRST delta of a call turns the transform's Raw flag on for that call, and the next call starts unmarked.
        - Leaf: an upstream throw propagates and writes no ledger line.

## Fixtures

None.

The test calls the REAL built `Target/Library.js` with in-memory async generators, no fs, no ctx, and no factory.

## Expected ledger strings (byte-exact)

- `normalized 2 dash char(s) in one stream` (the test's own line composer)

## Edge cases

- A zero count writes nothing.
- The raw flag is per call: a later delta of the same call keeps the flag, a new call resets it.
- A failed stream writes nothing.

## Expected count

3 PASS.
