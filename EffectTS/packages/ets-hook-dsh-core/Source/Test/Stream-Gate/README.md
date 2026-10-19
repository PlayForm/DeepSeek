# Stream-Gate

What this test verifies.

## Intent

`StreamGate` is the ETS-only stream transformer (the shared
`@playform/ets-base-dsh` base's R1 addition): it wraps an upstream `Stream` and
applies the SAME injected-transform gate matrix as the reducer-level `Chunk`
dispatch, but per stream materialization. It is its own folder because it is the
ETS tree's additive stream-boundary coverage - the reducer equivalence plus the
state machine that only exists at the stream level (per-call raw-marker state,
completion-only count summary, fresh state per materialization, error
propagation). There is NO Classic twin for this folder: it is re-homed from the
ETS core smoke's section 10 (R1 additive), which the L6 lane (ets-base-dsh)
completes later by giving the base its own test tree.

## Scenario

- Group: Gate - the stream transformer (EffectTS additive).
    - Check (one source ok group; the branches below are nested inside it):
        - Branch: reducer equivalence - the gate stream's output deepEquals the
          reducer-level Chunk dispatch of the same chunks, in order; usage
          passes through BY IDENTITY through the stream.
        - Branch: the completion-only count summary - the count callback
          receives the stream's total (1) after a NORMAL completion.
        - Branch: the per-call RAW-marker state machine - the raw-marked call's
          first delta is stripped and UNNORMALIZED; a later delta of the SAME
          raw call passes through BY IDENTITY; the NEXT call id resets the raw
          state so its arguments normalize.
        - Branch: error propagation - an upstream failure propagates through
          the gate stream untouched (assert.rejects with the same Error object).
        - Branch: abandoned stream - a stream abandoned mid-flight never
          reaches the count summary (stays 0).
        - Branch: fresh state per materialization - two materializations of the
          gate produce identical output with the same count (the
          CurrentCall/RawCall state is never shared).

## Fixtures

- `Replay(Chunks)`: a replayable async iterable over the chunk list (the
  reducer-level contract: Stream.flatMap is sequential by default, one in - one
  out).
- `Collect(Chunks, ToolArgs, OnCount)`: builds the gate with
  `Stream.fromAsyncIterable` and drains it with `Array.fromAsync(
  Stream.toAsyncIterable(...))`.
- `ToDash`: the injected transform over the real exported Dashes table.
- `Boom`: a dedicated upstream error object for the propagation branch.

## Expected ledger strings (byte-exact)

None. The core owns no ledger strings; the count summary is delivered through
the OnCount callback, not a log line.

## Edge cases

- Usage chunks pass through BY IDENTITY (reference equality through the stream).
- A raw-marked call with the tool-args flag ON is still unnormalized (strip is
  not normalization) and the next call id resets the state.
- Abandoned mid-flight: no count summary is written.
- Two materializations never share state (Stream.suspend).

## Expected count

1 PASS.
