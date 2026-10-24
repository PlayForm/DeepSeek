# Policy-Defaults

The policy block (D6) on the ingester: the defaults, the built State's
carried block, the override, and the writer's `approve` posture.

## Intent

D6 makes automation a per-plugin allowlist. The ingester is the batch flow's
only writer, so `write` is its own action class - and it stays the shipped
`approve`: the decision's approval IS the gate. This folder pins the shared
block's defaults in the schema and on the built State (`State.Config.policy` -
the class form has no factory State to map) and the documented family posture.

## Scenario

- Check: "P1: the ingester's schema fills the D6 policy defaults" - the
  composed `policy` deep-equals the D6 defaults (read/index/record/suggest/
  message = auto, write/commit/spawn = approve).
- Check: "P1: the built State carries the block on Config.policy" - the
  constructor keeps the validated block.
- Check: "P1: a policy override lands on the built State" - an explicit
  `policy: { write: "auto" }` replaces write and keeps the other seven.
- Check: "P1: the writer's own action class keeps the approve posture" -
  `write` stays `approve` (the decision's approval is the gate); `record`
  stays automatic.

## Fixtures

The shared Harness: the real built `Target/Library.js` class, the fake ctx,
the schema's own validation (`Ingester.Config`), and the `Build` constructor
mount.

## Expected ledger strings (byte-exact)

None new - the block and its mapping log nothing; the defaults are the
contract and are asserted as an object.

## Expected count

4 PASS.
