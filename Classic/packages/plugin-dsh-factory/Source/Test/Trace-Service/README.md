# Trace-Service

This file states what the test verifies.

## Intent

This folder covers the trace service of the factory (`ctx.trace`), the ONE bus of the workspace
family, which follows D5: the indexer comes from the event bus, so no separate process and no
separate indexer plugin exist.

The service lives in the factory because the factory owns the shared machinery of the family, while
the vocabulary and the detached loop live in `@playform/lib-dsh-trace`.

This folder pins the registration, the emit/on round-trip, the ring, the disposer, and the
fail-open and unload postures.

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
    - Check: a malformed draft is ignored, with no ring entry and no dispatch.
- Group: the flush and the unload path.
    - Check: `flush()` settles deterministically, without a timer.
    - Check: the unload effect of the constructor disposes the bus, and a late
      emit and a late subscription are contained no-ops.

## Fixtures

The fixtures are the fake ctx from `../Harness.js`, with the `provide` seam that the trace
registration uses, and the REAL factory class from the built Target.

No clock assertion exists, because `at` is only asserted to be a number and the ring and `flush`
seams are deterministic.

## Expected ledger strings (byte-exact)

None, because the trace service owns no ledger strings and the existing lines of the factory stay
untouched.

## Edge cases

- A second factory instance in the same scope would find `trace` already
  provided, and the constructor contains that case without a throw.
- A listener may throw, and the bus swallows the throw per listener.
- After the unload effect, emit is a no-op and `on` returns a no-op disposer.

## Expected count

9 PASS.
