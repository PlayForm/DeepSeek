# Policy-Defaults

This folder covers the policy block (D6) on the pass-on: the defaults, the built State's carried block, the override, and the read-only posture.

## Intent

D6 makes automation a per-plugin allowlist.

The pass-on is read-only: it reads the targets and suggests a proposal, and it never writes, commits, or spawns.

This folder pins the shared block's defaults in the schema and on the built State (`State.Config.policy` - the class form has no factory State to map).

It also pins the documented family posture for the actions the pass-on never takes.

## Scenario

- Check: "P1: the pass-on's schema fills the D6 policy defaults" - the
  composed `policy` deep-equals the D6 defaults (read/index/record/suggest/
  message = auto, write/commit/spawn = approve).
- Check: "P1: the built State carries the block on Config.policy" - the
  constructor keeps the validated block.
- Check: "P1: a policy override lands on the built State" - an explicit
  `policy: { suggest: "approve" }` replaces suggest and keeps the other seven.
- Check: "P1: the pass-on's own action classes are automatic" - `read` and
  `suggest` are `auto`; `write` stays the shipped `approve` (the pass-on never
  writes).

## Fixtures

The harness is the shared Harness: the real built `Target/Library.js` class, the fake ctx, the schema's own validation (`Validate`), and the `Make` constructor mount.

## Expected ledger strings (byte-exact)

This folder adds none, because the block and its mapping log nothing and the defaults are the contract, asserted as an object.

## Expected count

4 PASS.
