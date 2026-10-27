# Listen-And-Nudge

The idle edge, the four gates, and the fail-open posture.

## Intent

The hook is small, and almost every branch is a way to NOT review.

That is the point: a status listener that throws breaks the status publication of the harness, and a
listener that reviews on every idle edge turns a mis-set interval into a model call per turn.

This folder pins each gate in order, and then the one path that does review, where it asserts that the
review ran inside `runMaintenance` with the snapshot of the service and the maintenance signal.

## Scenario

- "L1: a `running` transition never ticks the service".
- "L2: an idle transition ticks, and an early turn stops there" - the cadence is
  asked, the answer is not due, no maintenance task is claimed.
- "L3: a due transition reviews INSIDE runMaintenance" - one task claimed, one
  review, the service's snapshot, the session id, the abort signal, and the
  `reviewed <outcome> (...)` ledger line.
- "L4: a missing lesson service is ONE warn, not a throw per transition".
- "L5: the per-session cap stops further reviews" - `maxReviewsPerSession: 1`,
  two idle edges, one task, `cap reached (1 reviews)` in the ledger.
- "L6: an agent that cannot run maintenance is skipped, not crashed".
- "L7: a throwing service never breaks the status emit" - fail-open.
- "L8: a disabled hook stays registered but never nudges" - the listener is
  registered unconditionally (the volatile-cell hot-flip pattern); the switch is
  the first gate inside the body.
- "L9: the activation line is byte-exact".
- "L10: two agents keep separate caps".

## Fixtures

The shared Harness supplies the REAL built `apply` from `Target/Library.js`, the fake ctx with the
listener capture, and the fake plugin factory with the State builder and the ledger.

`FakeLesson` records the Tick, Snapshot, and Review calls and offers a settable `due`, and `FakeAgent`
carries a session id and a `runMaintenance` that records the task and then runs it on the microtask
queue.

`Settle()` is the whole waiting story.

## Expected ledger strings (byte-exact)

- `hook-dsh-lesson-nudge: activated (bundle=0.3.0, cap=<n>)`
- `hook-dsh-lesson-nudge: disabled (enabled=false)`
- `hook-dsh-lesson-nudge: reviewed <outcome> (<a> applied, <q> queued)`
- `hook-dsh-lesson-nudge: cap reached (<n> reviews)`
- `hook-dsh-lesson-nudge: skipped (agent cannot run maintenance)`

The `Append` of the factory prefixes `<module>: `, and the fake factory of the harness does the same,
so the assertions are on the whole line.

## Expected count

10 PASS.
