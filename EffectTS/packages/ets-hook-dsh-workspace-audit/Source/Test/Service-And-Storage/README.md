# Service-And-Storage - the service surface and the storage domain

The manual line recording, the IntentAssessment loop closer, the chain and
ring views, the ring cap with its byte-exact drop line, the domain spec, the
persistence, the restart recovery with the continued sequence, the absent
facility (silent skip), the loud open failure, and the effect's disposer.

## Scenarios

- S1: the service is the apply-registered instance with the full surface;
  line() records with the exact shape and byte-exact ledger line;
  assessment() closes the loop with `(satisfied)` / `(unsatisfied: ...)`;
  chain() and lines() read the ring and chain views; the statistics triple
  is exact.
- S2: the ring caps at maxLines; the drop is ledgered byte-exactly
  (`capped a1 (maxLines 2)`).
- S3: the domain spec is name/version/layout/invalidRecords and the two
  tables (lines, ring); the line lands keyed by id; the ring snapshot lands
  under the meta key `__ring`.
- S4: the restart recovery rebuilds the chains and the ring; the sequence
  continues at the recovered maximum (`a4`), never a wall clock.
- S5: with no facility the effect is a silent skip; a failed open logs the
  byte-exact `storage open failed: storage unavailable` and degrades.
- S6: the effect's disposer closes the open handle and clears it.

## Expected ledger strings (byte-exact, `audit: ` prefix)

`audit commitment op1 (pending) /repo/a.ts`,
`audit intent-assessment op1 (satisfied) `,
`audit intent-assessment op2 (unsatisfied: spec unmet) `,
`capped a1 (maxLines 2)`,
`storage open failed: storage unavailable`.

## Expected count

13 PASS.
