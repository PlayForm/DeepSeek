# Policy-Defaults

This folder covers the policy block (D6) on the git guard: the defaults, the State mapping onto
`Verdicts`, the override, and the read-only posture of the guard.

## Intent

D6 makes automation a per-plugin allowlist.

The guard classifies and ledgers and never writes, commits, or spawns, so its own action classes are
`read` and `record`, both automatic.

This folder pins the defaults of the shared block in the schema and on the built State, which maps
to `Verdicts` because `Allow` is already the git allow-list, and it pins the documented posture of
the family for the actions that the guard never takes.

## Scenario

- Check: "P1: the guard's schema fills the D6 policy defaults" - the composed
  `policy` cell deep-equals the D6 defaults (read/index/record/suggest/message
  = auto, write/commit/spawn = approve).
- Check: "P1: the built State carries the block on Verdicts" - the apply maps
  `policy` to `State.Verdicts` with the same defaults.
- Check: "P1: a policy override lands on the built State" - an explicit
  `policy: { record: "approve" }` replaces record and keeps the other seven.
- Check: "P1: the guard's own action classes are automatic" - `read` and
  `record` are `auto`, while `write` stays the shipped `approve` because the
  guard never writes.

## Fixtures

The fixtures are the shared Harness with the real built `Target/Library.js` apply, the real factory
instance, the fake ctx, and the own validation of the schema (`Validate`).

## Expected ledger strings (byte-exact)

None are new, because the block and its mapping log nothing, and the defaults are the contract that
the checks assert as an object.

## Expected count

4 PASS.
