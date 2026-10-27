# Policy-Defaults

The policy block (D6) on the authority service covers the defaults, the State mapping on `Allow`, the override, and the read-only/record posture of the service.

## Intent

D6 makes automation a per-plugin allowlist.

The authority service grants, leases, evicts, and reads, and it never writes a file, commits a batch, or spawns an agent, so its own action classes are `read` and `record`, both automatic.

This folder proves the block is real config and not dead text: the schema fills the D6 defaults, the apply maps them to `State.Allow`, an explicit override replaces exactly one key, and the package has NO gated action.

No verdict can refuse a call, and a representative record still proceeds and touches no file content.

The D6 key is `automation`, NOT `policy`, because the `policy` of this package is already the residency RULE TABLE (`{kind, disposition, ...}`), a different contract (the `plugin-dsh-route` precedent).

The test therefore reads `Config.automation.get()` and overrides with `automation: { ... }`.

## Scenario

- **Group P1: the schema and the State mapping.**

    - **Check: "P1: the authority schema fills the D6 policy defaults".**

        The composed `automation` cell deep-equals the D6 defaults (read/index/record/suggest/message = auto, write/commit/spawn = approve).

    - **Check: "P1: the built State carries the block on Allow".**

        The apply maps `automation` to `State.Allow` with the same defaults.

    - **Check: "P1: a policy override lands on the built State".**

        An explicit `automation: { read: "approve" }` replaces read and keeps the other seven.

- **Group P2: the package has NO gated action.**

    - **Check: "P2: the package has no gated action".**

        `Decide(State.Allow, "read")` and `Decide(State.Allow, "record")` are both `auto`, and the ledger of the mount carries no line containing `policy` or `held`.

        The mount here is the COLD one: the ENABLED activation line legitimately carries `policy=<n>` (the residency rule count), so the test checks the refusal markers on the enabled mount in P3.

- **Group P3: a representative record action proceeds.**

    - **Check: "P3: grant records under the shipped defaults and writes no file".**

        The `grant` of the enabled mount returns `cap:1`, `authorize` serves the read judgment, no refusal or held line appears, and the fake fs recorded zero writes.

## Fixtures

The shared Harness supplies the real built `Target/Library.js` apply, the real factory instance, the fake ctx, the fake fs (a write records and throws), and the schema's own validation (`Validate`).

The test imports the `Decide` verdict lookup of the factory from the built `Target/Library.js` of the factory, the same helper that a gate of a consumer would call.

## Expected ledger strings (byte-exact)

The block and its mapping add no line, because the only lines of the mount are the unchanged `authority: activated (ttl=300000, policy=0)` (enabled) and `authority: disabled (enabled=false)` (cold).

The defaults are the contract, and the test asserts them as an object.

## Expected count

5 PASS.
