# Policy-Defaults

The policy block (D6) on the routing enforcer covers the defaults under the `automation` key, the State mapping on `Allow`, the override, and the read/suggest posture of the router.

## Intent

D6 makes automation a per-plugin allowlist.

The router reads and suggests: it classifies the task type and resolves the route, and it never writes, commits, or spawns.

This folder pins the defaults of the shared block in the schema and on the built State.

It also pins the KEY `automation`, because the `policy` of this plugin is already the routing policy (roles, allowed models, escalation) - a different contract that must stay untouched.

## Scenario

- **Check: "P1: the router's schema fills the D6 policy defaults on automation".**

    The composed `automation` cell deep-equals the D6 defaults (read/index/record/suggest/message = auto, write/commit/spawn = approve), and the routing `policy` key is still present and separate.

- **Check: "P1: the built State carries the block on Allow".**

    The apply maps `automation` to `State.Allow` with the same defaults.

- **Check: "P1: a policy override lands on the built State".**

    An explicit `automation: { suggest: "approve" }` replaces suggest and keeps the other seven.

- **Check: "P1: the router's own action classes are automatic".**

    `read` and `suggest` are `auto`, and `write` stays the shipped `approve` because the router never writes.

## Fixtures

The shared Harness supplies the real built `Target/Library.js` apply, the real factory instance, the fake ctx, the schema's own validation (`Validate`), and the State of the `dshRoute` service (the enforcer holds it, and the test reads it through a cast).

## Expected ledger strings (byte-exact)

The block and its mapping add no line, because the defaults are the contract and the test asserts them as an object.

## Expected count

4 PASS.
