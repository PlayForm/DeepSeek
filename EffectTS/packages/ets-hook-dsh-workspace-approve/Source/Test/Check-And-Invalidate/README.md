# Check-And-Invalidate - the exactness check and the invalidation tests

The merge/execute side of the exact-approval contract and the fs/observed listener that keeps it honest over time.

## Scenarios

- C1: an unbound change set is never approved (`unbound`, bound false, byte-exact `checked /repo/a.ts (unbound)` line).
- C2: a different fingerprint is a DIFFERENT candidate, so it is unbound and never matched by path alone.
- C3: a pending binding checks as `pending` with its id, a denied one as `denied`, and a revoked one as `revoked`, each with the honest `binding ap-N is not approved` reason.
- C4: an approved binding with the unchanged version approves (`approved`, reason ""), while an approved binding whose version moved is `stale` ("candidate changed after the approval", because an intent must not authorize its own means); the checked lines are byte-exact in order.
- I1: a same-version `present` event is a no-op (no line, no state change), and an `absent`-kind event is a no-op too.
- I2: a version change invalidates the binding (decision `invalidated`, byte-exact `invalidated ap-2 (version changed)` line), and the invalidated binding checks as `invalidated`.
- I3: an own-actor event (the own `Self` marker of the hook) never invalidates.
- I4: a malformed event never throws; it is ledgered byte-exactly as `failed unknown (malformed event: displayPath is not a string)`, and the listener keeps working after it.

## Fixtures

The shared Harness (fake ctx with the real factory, the real built Target, the root-captured `fs/observed` listener).

Every scenario starts from an empty ledger.

## Expected ledger strings (byte-exact, `approve: ` prefix)

`checked <path> (unbound)`, `checked <path> (pending)`, `checked <path> (denied)`, `checked <path> (revoked)`, `checked <path> (approved)`, `checked <path> (stale)`, `checked <path> (invalidated)`, `invalidated <id> (version changed)`, `failed unknown (malformed event: displayPath is not a string)`.

## Expected count

16 PASS.
