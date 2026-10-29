# Policy-Defaults

This folder covers the policy block (D6) on the ingester: the defaults, the carried block of the
built State, the override, and the `approve` posture of the writer.

## Intent

D6 makes automation a per-plugin allowlist.

The ingester is the only writer of the batch flow, so `write` is its own action class, and that
class stays the shipped `approve` because the approval of the decision IS the gate.

This folder pins the defaults of the shared block in the schema and on the built State, at
`State.Config.policy`, because the class form has no factory State to map, and it pins the
documented posture of the family.

## Scenario

- Check: "P1: the ingester's schema fills the D6 policy defaults" - the
  composed `policy` deep-equals the D6 defaults (read/index/record/suggest/
  message = auto, write/commit/spawn = approve).
- Check: "P1: the built State carries the block on Config.policy" - the
  constructor keeps the validated block.
- Check: "P1: a policy override lands on the built State" - an explicit
  `policy: { write: "auto" }` replaces write and keeps the other seven.
- Check: "P1: the writer's own action class keeps the approve posture" -
  `write` stays `approve`, because the approval of the decision is the gate,
  and `record` stays automatic.

## Fixtures

The fixtures are the shared Harness with the real built `Target/Library.js` class, the fake ctx, the
own validation of the schema (`Ingester.Config`), and the `Build` constructor mount.

## Expected ledger strings (byte-exact)

None are new, because the block and its mapping log nothing, and the defaults are the contract that
the checks assert as an object.

## Expected count

4 PASS.
