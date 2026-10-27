# Residency-And-Eviction - the residency record and the disposition pass

The suite covers the WHAT STAYS record and the five dispositions: the weight-only-ranks rule, the policy table, the shields, and the purity.

## Scenarios

- **R1.**

    The residency carries the weight in its own field, and a touch updates the weight but never the `since`.

    An invalid resource is refused with the exact line.

- **R2.**

    An unconfigured policy keeps the record, because the license decides conservatively.

- **R3.**

    `evict` moves the record to the graveyard, so the record stays recoverable, and `discard` erases it.

    The weight only ranks, so the heavier record is decided first.

    The named subset evicts only the named resources.

- **R4.**

    `promote` marks the record protected, and `defer` postpones within the residency limit and evicts past it.

- **R5.**

    Two shields force `keep` over the policy: an open, non-expired lease and an active capability.

- **R6.**

    A revoked capability shields within the grace, and the policy decides outside the grace.

## Fixtures

The shared Harness supplies the real built Target, and the test mutates `State.RevocationGraceMs` to test the grace boundary, so it waits on no wall clock.

## Expected ledger strings (byte-exact, `authority: ` prefix)

`residency <resource> (weight <w>)`, `refused residency (...)`,
`evicted <resource> (<disposition>)`.

## Expected count

14 PASS.
