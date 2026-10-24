# Policy-Defaults

The policy block (D6) on the batch-state board: the defaults, the State
mapping on `Allow`, the override, and the recorder posture.

## Intent

D6 makes automation a per-plugin allowlist. The board is a recorder and a
projection: it reads the members, records the state changes and suggests the
compiled block, and it never writes files, commits or spawns. This folder
pins the shared block's defaults in the schema and on the built State (mapped
to `Allow`, because the factory's shared State already owns `Policy` - the
global policy file path) and the documented family posture for the actions
the board never takes.

## Scenario

- Check: "P1: the board's schema fills the D6 policy defaults" - the composed
  `policy` cell deep-equals the D6 defaults (read/index/record/suggest/message
  = auto, write/commit/spawn = approve).
- Check: "P1: the built State carries the block on Allow" - the apply maps
  `policy` to `State.Allow` with the same defaults.
- Check: "P1: a policy override lands on the built State" - an explicit
  `policy: { suggest: "approve" }` replaces suggest and keeps the other seven.
- Check: "P1: the board's own action classes are automatic" - `read` and
  `record` are `auto`; `write` stays the shipped `approve` (the board never
  writes).

## Fixtures

The shared Harness: the real built `Target/Library.js` apply, the real factory
instance, the fake ctx, the schema's own validation (`Validate`), and a temp
state file (the JSON fallback store) so the mount never touches the user's
home.

## Expected ledger strings (byte-exact)

None new - the block and its mapping log nothing; the defaults are the
contract and are asserted as an object.

## Expected count

4 PASS.
