# SuggestStore

This test verifies the following behavior.

## Intent

`SuggestStore` is the suggester learning store: the per-mount machine behind the suggester family's learned layer. The outcome of a note's follow-through moves a candidate's confidence toward or away from the floor (the neutral Laplace prior 1/3, accept +0.1, reject -0.2, clamped into 0..1), the shared pattern service is probed once per read/write and a bounded map is the fallback when the probe answers undefined, and the decision records ride the same two backends. The probe and the state are the caller's: the factory takes the caller's probe, the module id, the memory bound, the table composer and the stamp, and returns the six methods (`Store`, `Rate`, `Move`, `Remember`, `Resolve`, `Recent`).

It is its own folder because the store is the learning machinery the doc and edit suggesters share, where a drift between the family's copies silently changes which candidate is learned, ranked or forgotten.

## Scenario

- Group: SuggestStore - the learning store (the probe and the bounded map, the caller's).
    - Check (one ok group): the six-method contract over the store's own probe, bound and stamp.
        - Leaf: a probe that answers undefined is the memory fallback (the backend reads "memory") and an unobserved rate answers the neutral 1/3.
        - Leaf: an accepted outcome raises the candidate's confidence by the accept bonus, and the family's row moves with the outcome.
        - Leaf: a rejected outcome lowers the candidate's confidence by the reject penalty.
        - Leaf: the clamp keeps the floor from ever being crossed (repeated rejections stop at zero) and the ceiling too (repeated accepts stop at one).
        - Leaf: a second mount in the same process starts neutral and leaves the first mount's rows untouched (the maps are per factory call).
        - Leaf: a probe that answers the whole Get/Put/Record contract flips the backend to "pattern"; the absent service rows answer the neutral rate (the record is seeded, the service owns the move).

## Fixtures

None.

The test makes pure function calls against the REAL built `Target/Library.js`, with no fs, no ctx, and no factory. The probe, the table composer and the stamp are the test's own tiny closures.

## Expected ledger strings (byte-exact)

None. The store writes no line.

## Edge cases

- A probe that answers undefined (no service, or a partial one the caller rejects) is simply the memory fallback, never a crash.
- The clamp is the confidence domain: the floor 0 and the ceiling 1 are never crossed, however many outcomes arrive.
- The store is per mount: every factory call builds fresh maps, so two stores in one process never share rows.

## Expected count

1 PASS.
