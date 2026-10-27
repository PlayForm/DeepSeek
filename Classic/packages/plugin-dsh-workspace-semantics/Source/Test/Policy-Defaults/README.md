# Policy-Defaults

The policy block (D6) on the semantics service, which covers the defaults, the State mapping on `Allow`, the override, and the read-only posture of the service.

## Intent

D6 makes automation a per-plugin allowlist.

The semantics service resolves, reads and indexes and never writes, commits or spawns, because the rename plan goes to the operate proposals, so its own action classes are `read` and `index`, both automatic.

This folder proves that the block is real config and not dead text: the schema fills the D6 defaults, the apply maps them to `State.Allow`, an explicit override replaces exactly one key, and the package has NO gated action, so no verdict can refuse a call and a representative read still proceeds and touches no file content.

## Scenario

- Group P1: the schema and the State mapping.
    - Check: "P1: the semantics schema fills the D6 policy defaults" - the composed `policy` cell deep-equals the D6 defaults (read/index/record/suggest/message = auto, write/commit/spawn = approve).
    - Check: "P1: the built State carries the block on Allow" - the apply maps `policy` to `State.Allow` with the same defaults.
    - Check: "P1: a policy override lands on the built State" - an explicit `policy: { read: "approve" }` replaces read and keeps the other seven.
- Group P2: the package has NO gated action.
    - Check: "P2: the package has no gated action" - `Decide(State.Allow, "read")` and `Decide(State.Allow, "index")` are both `auto`, and the mount's ledger carries no line that contains `policy` or `held`.
- Group P3: a representative read action proceeds.
    - Check: "P3: a read proceeds under the shipped defaults and writes no file" - `statistics()` returns the triple and `references("/a.ts")` answers honestly with an empty list on the enabled mount, no refusal line appears, and the fake fs recorded zero writes.

## Fixtures

The shared Harness supplies the real built `Target/Library.js` apply, the real factory instance, the fake ctx, the fake fs (where a write records and throws), and the validation of the schema itself (`Validate`).

The test imports the `Decide` verdict lookup of the factory from the built `Target/Library.js` of the factory, which is the same helper that a gate of a consumer would call.

## Expected ledger strings (byte-exact)

None is new, because the block and its mapping log nothing, and the only lines of the mount are the unchanged `semantics: adapters registered (7 extensions)` and `semantics: activated (domain=workspace_semantics)`.

The defaults are the contract and are asserted as an object.

## Expected count

5 PASS.
