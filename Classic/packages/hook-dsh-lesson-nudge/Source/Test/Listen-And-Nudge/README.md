# Listen-And-Nudge

The idle edge, the four gates, and the fail-open posture.

## Intent

The hook is small and almost every branch is a way to NOT review. That is the
point: a status listener that throws breaks the harness's status publication,
and a listener that reviews on every idle edge turns a mis-set interval into a
model call per turn. This folder pins each gate in order, then the one path that
does review - asserting that the review ran inside `runMaintenance`, with the
service's own snapshot and the maintenance signal.

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

The shared Harness: the REAL built `apply` from `Target/Library.js`, the fake
ctx with the listener capture, the fake plugin factory (the State builder + the
ledger), `FakeLesson` (recorded Tick/Snapshot/Review calls, a settable `due`) and
`FakeAgent` (a session id and a `runMaintenance` that records then runs the task
on the microtask queue). `Settle()` is the whole waiting story.

## Expected ledger strings (byte-exact)

- `hook-dsh-lesson-nudge: activated (bundle=0.2.0, cap=<n>)`
- `hook-dsh-lesson-nudge: disabled (enabled=false)`
- `hook-dsh-lesson-nudge: reviewed <outcome> (<a> applied, <q> queued)`
- `hook-dsh-lesson-nudge: cap reached (<n> reviews)`
- `hook-dsh-lesson-nudge: skipped (agent cannot run maintenance)`

The factory's `Append` prefixes `<module>: `; the harness's fake factory does the
same, so the assertions are on the whole line.

## Expected count

10 PASS.
