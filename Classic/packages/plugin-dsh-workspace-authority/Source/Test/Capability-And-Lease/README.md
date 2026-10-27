# Capability-And-Lease - the capability and the lease records

This folder covers the WHAT and the HOW LONG records: the grant, the revoke, the authorize, the acquire with the TTL ladder, the lazy expiry sweep, the release, and the statistics.

## Scenarios

- C1: the grant stamps the exact record - no weight, no priority (the
  license/weight separation); the delegation rule is the record's own;
  the exact `granted cap:1 (alice -> /r/a.ts, read,write)` line; an
  invalid specification is refused with the exact line.
- C2: the per-holder capability ceiling refuses with the exact line.
- C3: the revoke marks the record permanently; revoking again or an
  unknown capability is reported honestly with the exact lines.
- C4: the authorize path - the held operation is authorized with the
  exact line; a revoked capability denies immediately (the grace is for
  the shield, never for the authorization); unheld operations and
  resources deny.
- C5: an expired capability denies.
- C6: the `*` wildcard operation authorizes everything.
- L1: the TTL ladder - the explicit TTL wins over the policy's per-kind
  override, which wins over the config default; the exact
  `leased lease:1 (alice -> /r/a.ts, expires <epoch>)` line.
- L2: the per-holder lease ceiling refuses with the exact line.
- L3: the lazy expiry sweep - an expired lease closes on touch with the
  exact `expired lease:1` line.
- L4: the release path - the exact `released lease:1` line; releasing
  again or an unknown lease is reported honestly.
- S1: the statistics report the exact counts.

## Fixtures

The harness is the shared Harness with the real built Target, and it tests expiry by mutating the stored record's `expiresAt`, with no wall clock waits.

## Expected ledger strings (byte-exact, `authority: ` prefix)

`granted cap:N (...)`, `refused grant (...)`, `revoked cap:N`,
`revoke ignored/failed ...`, `authorized/denied ...`,
`leased lease:N (...)`, `refused lease (...)`, `expired lease:N`,
`released lease:N`, `release ignored/failed ...`.

## Expected count

20 PASS.
