# Residency-And-Eviction - the residency record and the disposition pass

This folder covers the WHAT STAYS record and the five dispositions: the weight-only-ranks rule, the policy table, the shields, and the purity.

## Scenarios

- R1: the residency carries the weight in its own field; touching updates
  the weight but never the `since`; an invalid resource is refused with
  the exact line.
- R2: an unconfigured policy keeps the record (the license decides
  conservatively).
- R3: `evict` moves the record to the graveyard (recoverable), `discard`
  erases it; the weight only ranks - the heavier record is decided
  first; the named subset evicts only the named resources.
- R4: `promote` marks the record protected; `defer` postpones within the
  residency limit and evicts past it.
- R5: the shields - an open, non-expired lease and an active capability
  each force `keep` over the policy.
- R6: the revocation grace - a revoked capability shields within the
  grace; outside the grace the policy decides.

## Fixtures

The harness is the shared Harness with the real built Target, and it tests the grace boundary by mutating `State.RevocationGraceMs`, with no wall clock waits.

## Expected ledger strings (byte-exact, `authority: ` prefix)

`residency <resource> (weight <w>)`, `refused residency (...)`,
`evicted <resource> (<disposition>)`.

## Expected count

14 PASS.
