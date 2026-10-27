# Policy-Defaults

This folder covers the policy block (D6) on the routing enforcer: the defaults under the `automation` key, the State mapping on `Allow`, the override, and the router's read/suggest posture.

## Intent

D6 makes automation a per-plugin allowlist.

The router reads and suggests, because it classifies the task type and resolves the route, and it never writes, commits, or spawns.

This folder pins the shared block's defaults in the schema and on the built State.

It also pins the KEY: `automation`, because this plugin's `policy` is already the routing policy (roles, allowed models, escalation), a different contract that must stay untouched.

## Scenario

- Check: "P1: the router's schema fills the D6 policy defaults on automation"
  - the composed `automation` cell deep-equals the D6 defaults
  (read/index/record/suggest/message = auto, write/commit/spawn = approve);
  the routing `policy` key is still present and separate.
- Check: "P1: the built State carries the block on Allow" - the apply maps
  `automation` to `State.Allow` with the same defaults.
- Check: "P1: a policy override lands on the built State" - an explicit
  `automation: { suggest: "approve" }` replaces suggest and keeps the other
  seven.
- Check: "P1: the router's own action classes are automatic" - `read` and
  `suggest` are `auto`; `write` stays the shipped `approve` (the router never
  writes).

## Fixtures

The harness is the shared Harness: the real built `Target/Library.js` apply, the real factory instance, the fake ctx, the schema's own validation (`Validate`), and the `dshRoute` service's own State, which the enforcer holds and the test reads through a cast.

## Expected ledger strings (byte-exact)

This folder adds none, because the block and its mapping log nothing and the defaults are the contract, asserted as an object.

## Expected count

4 PASS.
