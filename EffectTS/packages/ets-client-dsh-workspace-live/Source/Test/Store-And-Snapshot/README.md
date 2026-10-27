# Store-And-Snapshot - the stable-until-event presentation store

The test covers the store of the live view, loaded from the real built `Target/Function/Store.js`: the stable-until-event contract, the ingest fold, the bounded tail and representation set, the refresh replacement, and the emit discipline.

## Scenarios

- S1: `getSnapshot()` returns the same object reference across reads, and the initial snapshot is exactly `{ sequence: 0, representations: [], events: [] }`.
- S2: a real 50 ms quiet wait with no event produces NO notification and NO new snapshot, because the presentation is stable until an event and there is no polling (the timer belongs to the test, never to the store).
- S3: an ingest with a path creates the `file:<path>` representation (kind "file", the path as label, version "unknown", the sequence of the event) and moves the sequence of the snapshot.
- S4: a second event on the same path updates `lastSequence` in place.
- S5: the sequence of the snapshot takes the running maximum, so an out-of-order event never rolls it back.
- S6: the event tail is bounded by `maxEvents`, so the oldest drops (5 events into a tail of 3 leaves [3, 4, 5]).
- S7: the representations are bounded by `maxRepresentations`, so the oldest drops.
- S8: `refresh(graph)` replaces the representation set from the nodes of the graph: `DocSection` maps to "doc", other kinds go lowercase, the label prefers the node name over the path, and `lastSequence` is the sequence of the current snapshot.
- S9: refresh keeps the sequence and the event tail.
- S10: each emit notifies each subscriber exactly once and yields a NEW snapshot object, never a mutation in place.
- S11: the built store source has no `setInterval`/`setTimeout`, no `node:` import and no `require(`, so no timer machinery exists anywhere.

## Fixtures

The shared Harness (the real built Target), where the store is the real built default export constructed with explicit bounds.

No fake clock is needed, because the contract is event-driven and the only timer in the suite belongs to the own quiet-wait probe of the test.

## Expected count

11 PASS.
