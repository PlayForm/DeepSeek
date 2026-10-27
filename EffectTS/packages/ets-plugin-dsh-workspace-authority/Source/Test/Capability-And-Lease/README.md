# Capability-And-Lease - the capability and the lease records

The suite covers the WHAT and the HOW LONG records: the grant, the revoke, the authorize, the acquire with the TTL ladder, the lazy expiry sweep, the release, and the statistics.

## Scenarios

- **C1.**

    The grant stamps the exact record, with no weight and no priority (the license/weight separation).

    The delegation rule is the record's own, the exact line is `granted cap:1 (alice -> /r/a.ts, read,write)`, and an invalid specification is refused with the exact line.

- **C2.**

    The per-holder capability ceiling refuses with the exact line.

- **C3.**

    The revoke marks the record permanently, and a second revoke or an unknown capability is reported honestly with the exact lines.

- **C4.**

    The authorize path authorizes the held operation with the exact line, and a revoked capability denies immediately (the grace is for the shield, never for the authorization).

    Unheld operations and resources deny.

- **C5.**

    An expired capability denies.

- **C6.**

    The `*` wildcard operation authorizes everything.

- **L1.**

    In the TTL ladder the explicit TTL wins over the per-kind override of the policy, which wins over the config default, and the exact line is `leased lease:1 (alice -> /r/a.ts, expires <epoch>)`.

- **L2.**

    The per-holder lease ceiling refuses with the exact line.

- **L3.**

    The lazy expiry sweep closes an expired lease on touch with the exact `expired lease:1` line.

- **L4.**

    The release path gives the exact `released lease:1` line, and a second release or an unknown lease is reported honestly.

- **S1.**

    The statistics report the exact counts.

## Fixtures

The shared Harness supplies the real built Target, and the test mutates the `expiresAt` of the stored record to test expiry, so it waits on no wall clock.

## Expected ledger strings (byte-exact, `authority: ` prefix)

`granted cap:N (...)`, `refused grant (...)`, `revoked cap:N`,
`revoke ignored/failed ...`, `authorized/denied ...`,
`leased lease:N (...)`, `refused lease (...)`, `expired lease:N`,
`released lease:N`, `release ignored/failed ...`.

## Expected count

20 PASS.
