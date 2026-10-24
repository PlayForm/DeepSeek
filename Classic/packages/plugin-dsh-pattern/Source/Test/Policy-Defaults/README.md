# Policy-Defaults

The policy block (D6) on the pattern service: the defaults in the schema and
in the service's knobs, the override, and the registry's read/record posture.

## Intent

D6 makes automation a per-plugin allowlist. The pattern service matches,
records and decays - it never writes files, commits or spawns. This folder
pins the shared block's defaults in the schema and in the service's knobs
(`Knobs.policy`, including the bare-construction fallback that a
`new PatternService(ctx)` mount uses) and the documented family posture.

## Scenario

- Check: "P1: the service's schema fills the D6 policy defaults" - the
  composed `policy` cell deep-equals the D6 defaults (read/index/record/
  suggest/message = auto, write/commit/spawn = approve).
- Check: "P1: a bare construction carries the D6 block in the knobs" - the
  fixture mount's `Knobs.policy` is the same table.
- Check: "P1: a policy override lands in the knobs" - an explicit
  `policy: { record: "approve" }` replaces record and keeps the other seven.
- Check: "P1: the registry's own action classes are automatic" - `read` and
  `record` are `auto`; `write` stays the shipped `approve` (the service never
  writes).

## Fixtures

The shared Harness: the real built `Target/Library.js` class, the fake ctx,
the schema's own validation (`PatternService.Config`), and the `Make`
constructor mount.

## Expected ledger strings (byte-exact)

None new - the block and its mapping log nothing; the defaults are the
contract and are asserted as an object.

## Expected count

4 PASS.
