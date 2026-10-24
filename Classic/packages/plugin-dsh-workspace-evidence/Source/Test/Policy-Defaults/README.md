# Policy-Defaults

The policy block (D6) on the evidence service: the defaults, the State mapping
on `Allow`, the override, and the service's read-only posture.

## Intent

D6 makes automation a per-plugin allowlist. The evidence service validates and
records and never writes, commits or spawns, so its own action classes are
`read` and `record` - both automatic. This folder proves the block is real
config, not dead text: the schema fills the D6 defaults, the apply maps them to
`State.Allow`, an explicit override replaces exactly one key, and the package
has NO gated action - no verdict can refuse a call, and a representative
`validate` still proceeds and touches no file content.

## Scenario

- Group P1: the schema and the State mapping.
    - Check: "P1: the evidence schema fills the D6 policy defaults" - the
      composed `policy` cell deep-equals the D6 defaults
      (read/index/record/suggest/message = auto, write/commit/spawn =
      approve).
    - Check: "P1: the built State carries the block on Allow" - the apply maps
      `policy` to `State.Allow` with the same defaults.
    - Check: "P1: a policy override lands on the built State" - an explicit
      `policy: { read: "approve" }` replaces read and keeps the other seven.
- Group P2: the package has NO gated action.
    - Check: "P2: the package has no gated action" - `Decide(State.Allow,
      "read")` and `Decide(State.Allow, "record")` are both `auto`, and the
      mount's ledger carries no line containing `policy` or `held`.
- Group P3: a representative record action proceeds.
    - Check: "P3: validate records under the shipped defaults and writes no
      file" - the enabled mount's `validate` returns the fresh record, no
      refusal line appears, and the fake fs recorded zero writes.

## Fixtures

The shared Harness: the real built `Target/Library.js` apply, the real factory
instance, the fake ctx, the fake fs (a write records and throws), and the
schema's own validation (`Validate`). The factory's own `Decide` verdict
lookup is imported from the factory's built `Target/Library.js` - the same
helper a consumer's gate would call.

## Expected ledger strings (byte-exact)

None new - the block and its mapping log nothing; the mount's only line is the
unchanged `evidence: activated (domain=workspace_evidence)`. The defaults are
the contract and are asserted as an object.

## Expected count

5 PASS.
