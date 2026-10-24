# Policy-Defaults

The policy block (D6) on the feedback member: the defaults, the built State's
carried block, the override, and the passive-collector posture.

## Intent

D6 makes automation a per-plugin allowlist. The feedback member is a passive
collector: it records outcomes and suggests summaries, and it never writes,
commits or spawns. This folder pins the shared block's defaults in the
schema and on the built State (`State.Config.policy` - the class form has no
factory State to map) and the documented family posture for the actions the
member never takes.

## Scenario

- Check: "P1: the member's schema fills the D6 policy defaults" - the
  composed `policy` deep-equals the D6 defaults (read/index/record/suggest/
  message = auto, write/commit/spawn = approve).
- Check: "P1: the built State carries the block on Config.policy" - the
  constructor keeps the validated block.
- Check: "P1: a policy override lands on the built State" - an explicit
  `policy: { suggest: "approve" }` replaces suggest and keeps the other seven.
- Check: "P1: the member's own action classes are automatic" - `record` and
  `suggest` are `auto`; `write` stays the shipped `approve` (the member never
  writes).

## Fixtures

The shared Harness: the real built `Target/Library.js` class, the fake ctx,
the schema's own validation (`Validate`), and the `Make` constructor mount.

## Expected ledger strings (byte-exact)

None new - the block and its mapping log nothing; the defaults are the
contract and are asserted as an object.

## Expected count

4 PASS.
