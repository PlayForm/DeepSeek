# Store-And-Snapshot - the stable-until-event presentation store

The live view's store, loaded from the real built
`Target/Function/Store.js`: the stable-until-event contract, the ingest
fold, the bounded tail and representation set, the refresh replacement, and
the emit discipline.

## Scenarios

- S1: `getSnapshot()` returns the same object reference across reads, and
  the initial snapshot is exactly `{ sequence: 0, representations: [],
  events: [] }`.
- S2: a real 50 ms quiet wait with no event produces NO notification and
  NO new snapshot - the presentation is stable until an event, with no
  polling (the timer is the test's, never the store's).
- S3: an ingest with a path creates the `file:<path>` representation
  (kind "file", the path as label, version "unknown", the event's
  sequence) and moves the snapshot's sequence.
- S4: a second event on the same path updates `lastSequence` in place.
- S5: the snapshot's sequence takes the running maximum (an out-of-order
  event never rolls it back).
- S6: the event tail is bounded by `maxEvents` - the oldest drops
  (5 events into a tail of 3 leaves [3, 4, 5]).
- S7: the representations are bounded by `maxRepresentations` - the
  oldest drops.
- S8: `refresh(graph)` replaces the representation set from the graph
  nodes: `DocSection` maps to "doc", other kinds lowercase, the label
  prefers the node name over the path, and `lastSequence` is the current
  snapshot's sequence.
- S9: refresh keeps the sequence and the event tail.
- S10: each emit notifies each subscriber exactly once and yields a NEW
  snapshot object (never a mutation in place).
- S11: the built store source has no `setInterval`/`setTimeout`, no
  `node:` import and no `require(` - no timer machinery anywhere.

## Fixtures

The shared Harness (real built Target). The store is the real built
default export constructed with explicit bounds; no fake clock is needed -
the contract is event-driven, and the only timer in the suite belongs to
the test's own quiet-wait probe.

## Expected count

11 PASS.
