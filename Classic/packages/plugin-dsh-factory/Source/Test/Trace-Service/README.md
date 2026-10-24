# Trace-Service

What this test verifies.

## Intent

The factory's trace service (`ctx.trace`) - the ONE bus of the workspace
family (D5: the indexer is inferred from the event bus; no separate process,
no separate indexer plugin). The service lives in the factory because the
factory is the family's shared-machinery owner; the vocabulary and the
detached loop live in `@playform/lib-dsh-trace`. This folder pins the
registration, the emit/on round-trip, the ring, the disposer and the
fail-open/unload postures.

## Scenario

- Group: the registration.
    - Check: the constructor provides exactly one `ctx.trace`, the same
      instance the factory holds; emit/on/flush/ring/dispose are functions.
- Group: the emit/on round-trip.
    - Check: an emit reaches the named listener; the bus completes `trace-1`
      and a numeric `at`; the payload is verbatim.
    - Check: an emitter-supplied `trace` and `at` are preserved.
    - Check: the disposer stops delivery.
- Group: the ring.
    - Check: the ring is newest first, bounded at 256, and `ring(limit)` slices
      the head.
- Group: the fail-open containment.
    - Check: a throwing listener never reaches the caller and never silences
      the rest.
    - Check: a malformed draft is ignored (no ring entry, no dispatch).
- Group: the flush and the unload path.
    - Check: `flush()` settles deterministically (no timer).
    - Check: the constructor's unload effect disposes the bus; a late emit and
      a late subscription are contained no-ops.

## Fixtures

The fake ctx from `../Harness.js` (with the `provide` seam the trace
registration uses) + the REAL factory class from the built Target. No clock
assertion: `at` is only asserted to be a number, and the ring/`flush` seams are
deterministic.

## Expected ledger strings (byte-exact)

None - the trace service owns no ledger strings (the factory's existing lines
are untouched).

## Edge cases

- A second factory instance in the same scope would find `trace` already
  provided; the constructor contains that (no throw).
- A listener may throw; the bus swallows it per listener.
- After the unload effect, emit is a no-op and `on` returns a no-op disposer.

## Expected count

9 PASS.
