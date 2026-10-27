# Policy-Defaults

This folder covers the policy block (D6) on the feedback member: the defaults, the carried block of
the built State, the override, and the passive-collector posture.

## Intent

D6 makes automation a per-plugin allowlist.

The feedback member is a passive collector that records outcomes and suggests summaries, and it
never writes, commits, or spawns.

This folder pins the defaults of the shared block in the schema and on the built State, at
`State.Config.policy`, because the class form has no factory State to map, and it pins the
documented posture of the family for the actions that the member never takes.

## Scenario

- Check: "P1: the member's schema fills the D6 policy defaults" - the
  composed `policy` deep-equals the D6 defaults (read/index/record/suggest/
  message = auto, write/commit/spawn = approve).
- Check: "P1: the built State carries the block on Config.policy" - the
  constructor keeps the validated block.
- Check: "P1: a policy override lands on the built State" - an explicit
  `policy: { suggest: "approve" }` replaces suggest and keeps the other seven.
- Check: "P1: the member's own action classes are automatic" - `record` and
  `suggest` are `auto`, while `write` stays the shipped `approve` because the
  member never writes.

## Fixtures

The fixtures are the shared Harness with the real built `Target/Library.js` class, the fake ctx, the
own validation of the schema (`Validate`), and the `Make` constructor mount.

## Expected ledger strings (byte-exact)

None are new, because the block and its mapping log nothing, and the defaults are the contract that
the checks assert as an object.

## Expected count

4 PASS.
