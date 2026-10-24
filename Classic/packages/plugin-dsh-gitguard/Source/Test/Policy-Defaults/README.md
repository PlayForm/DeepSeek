# Policy-Defaults

The policy block (D6) on the git guard: the defaults, the State mapping on
`Verdicts`, the override, and the guard's read-only posture.

## Intent

D6 makes automation a per-plugin allowlist. The guard classifies and ledgers
and never writes, commits or spawns, so its own action classes are `read` and
`record` - both automatic. This folder pins the shared block's defaults in the
schema and on the built State (mapped to `Verdicts`, because `Allow` is
already the git allow-list) and the documented family posture for the actions
the guard never takes.

## Scenario

- Check: "P1: the guard's schema fills the D6 policy defaults" - the composed
  `policy` cell deep-equals the D6 defaults (read/index/record/suggest/message
  = auto, write/commit/spawn = approve).
- Check: "P1: the built State carries the block on Verdicts" - the apply maps
  `policy` to `State.Verdicts` with the same defaults.
- Check: "P1: a policy override lands on the built State" - an explicit
  `policy: { record: "approve" }` replaces record and keeps the other seven.
- Check: "P1: the guard's own action classes are automatic" - `read` and
  `record` are `auto`; `write` stays the shipped `approve` (the guard never
  writes).

## Fixtures

The shared Harness: the real built `Target/Library.js` apply, the real factory
instance, the fake ctx, and the schema's own validation (`Validate`).

## Expected ledger strings (byte-exact)

None new - the block and its mapping log nothing; the defaults are the
contract and are asserted as an object.

## Expected count

4 PASS.
