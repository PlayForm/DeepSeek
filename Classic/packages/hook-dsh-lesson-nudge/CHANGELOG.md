# CHANGELOG - @playform/hook-dsh-lesson-nudge

## 0.2.0

The first cut of the post-turn nudge, in the family's 0.2.0 wave.

- `agent/status` listener on the `idle` edge; the review runs inside `agent.runMaintenance`, never
  beside the live turn.
- The four gates: the switch, the edge, the service probe (`lesson`, warned once when absent), the
  cadence plus the per-session `maxReviewsPerSession` cap.
- Fail-open throughout: a throwing service or a rejected maintenance task warns and passes the
  transition unnudged.
- The factory's State builder and ledger; the D6 policy block; the idle-forever default
  (`enabled: false`).
- `Source/Test/Listen-And-Nudge`: 10 checks over every gate and the one review path.
