# Loop-And-Vocabulary

What this test verifies.

## Intent

The trace vocabulary and the detached loop - the pure halves of
`@playform/ets-lib-dsh-trace`. The names are the contract every adapter imports
(one place a new event name is added); the envelope completion is the one rule
that separates an emitter's `Draft` from a complete `Envelope`; the guards are
what an adapter uses to reject a foreign value instead of crashing; and the
loop is the "daemon trace" itself: a coalescing queue keyed by path, ONE
in-flight task per key, no timers, fail-open, a `Flush` promise for
deterministic smokes and a disposer.

## Scenario

- Group: the vocabulary.
    - Check: `Names` - the service name `trace` and the three event names
      (`observe/stamp`, `graph/indexed`, `graph/invalidated`), byte-exact.
    - Check: `Bound` - the fixed ring bound is 256 (no config knob).
- Group: the envelope completion.
    - Check: `Complete` - the bus assigns `trace-<n>` and an `at`; a supplied
      trace id, `at` and actor are preserved; an absent actor stays absent.
- Group: the guards.
    - Check: `IsEnvelope` - a complete envelope passes; null, a missing trace
      id, an empty kind, a non-number `at` and a null payload fail.
    - Check: `IsStamp` - the observe/stamp payload (path/version/origin); an
      empty path, a missing version, a missing origin and a non-object fail.
- Group: the coalescing key.
    - Check: `Key` - the payload's path, else the event name, else `unknown`;
      an empty path falls through to the event name.
- Group: the detached loop.
    - Check: a coalesced pair (three schedules for one key) runs ONCE.
    - Check: two keys run independently and `Flush` awaits both.
    - Check: a throwing run is contained (fail-open) and `Flush` still settles.
    - Check: `Dispose` stops future scheduling; in-flight work still settles.

## Fixtures

None. Pure function calls against the REAL built `Target/Library.js`; no fs, no
ctx, no factory, no fake clock (the loop is a microtask chain; the smoke awaits
`Flush` instead of sleeping).

## Expected ledger strings (byte-exact)

None - the trace library owns no ledger strings and no loader contract.

## Edge cases

- The coalescing drops a schedule while the key is in flight (one run, not a
  queue of runs).
- A failed run never rejects `Flush` (the caller is a synchronous listener).
- `Dispose` does not tear a running task mid-flight; it only stops new work.

## Expected count

10 PASS.
