# Policy-Defaults

This folder covers the policy block (D6) on the authority service: the defaults, the State mapping on `Allow`, the override, and the service's read-only/record posture.

## Intent

D6 makes automation a per-plugin allowlist.

The authority service grants, leases, evicts, and reads, and it never writes a file, commits a batch, or spawns an agent, so its own action classes are `read` and `record`, both automatic.

This folder proves the block is real config, not dead text: the schema fills the D6 defaults, the apply maps them to `State.Allow`, an explicit override replaces exactly one key, and the package has NO gated action.

No verdict can refuse a call, and a representative record still proceeds and touches no file content.

The D6 key is `automation`, NOT `policy`, because this package's `policy` is already the residency RULE TABLE (`{kind, disposition, ...}`), a different contract (the `plugin-dsh-route` precedent).

The test therefore reads `Config.automation.get()` and overrides with `automation: { ... }`.

## Scenario

- Group P1: the schema and the State mapping.
    - Check: "P1: the authority schema fills the D6 policy defaults" - the
      composed `automation` cell deep-equals the D6 defaults
      (read/index/record/suggest/message = auto, write/commit/spawn =
      approve).
    - Check: "P1: the built State carries the block on Allow" - the apply maps
      `automation` to `State.Allow` with the same defaults.
    - Check: "P1: a policy override lands on the built State" - an explicit
      `automation: { read: "approve" }` replaces read and keeps the other
      seven.
- Group P2: the package has NO gated action.
    - Check: "P2: the package has no gated action" - `Decide(State.Allow,
      "read")` and `Decide(State.Allow, "record")` are both `auto`, and the
      mount's ledger carries no line containing `policy` or `held`. The mount
      here is the COLD one: the ENABLED activation line legitimately carries
      `policy=<n>` (the residency rule count), so the refusal markers are
      checked on the enabled mount in P3.
- Group P3: a representative record action proceeds.
    - Check: "P3: grant records under the shipped defaults and writes no
      file" - the enabled mount's `grant` returns `cap:1`, `authorize`
      serves the read judgment, no refusal or held line appears, and the fake
      fs recorded zero writes.

## Fixtures

The harness is the shared Harness: the real built `Target/Library.js` apply, the real factory instance, the fake ctx, the fake fs (a write records and throws), and the schema's own validation (`Validate`).

The factory's own `Decide` verdict lookup is imported from the factory's built `Target/Library.js`, which is the same helper a consumer's gate would call.

## Expected ledger strings (byte-exact)

This folder adds none, because the block and its mapping log nothing.

The mount's only lines are the unchanged `authority: activated (ttl=300000, policy=0)` (enabled) and `authority: disabled (enabled=false)` (cold).

The defaults are the contract and are asserted as an object.

## Expected count

5 PASS.
