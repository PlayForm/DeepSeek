# Policy-Defaults

This folder covers the policy block (D6) on the workspace-observe hook: the defaults, the State mapping on `Allow`, the override, the package's no-gated-action posture, and the record action still proceeding with zero file writes.

## Intent

D6 makes automation a per-plugin allowlist.

The observe hook has ONE action class, RECORD (it records one observation stamp per `fs/observed` event), and that class is automatic.

The hook never writes a file, commits a batch, or spawns an agent, so it has NO gated action and no verdict can refuse it.

This folder pins the shared block's defaults in the schema and on the built State (mapped to `Allow`, because the factory's shared State already owns `Policy`, the global policy file path), the per-action override, the absence of a gate, and the fact that the recorder still proceeds under the shipped defaults.

## Scenario

- Check: "P1: the hook's schema fills the D6 policy defaults" - the composed `policy` cell deep-equals the D6 defaults (read/index/record/suggest/message = auto, write/commit/spawn = approve).
- Check: "P1: the built State carries the block on Allow" - the apply maps `policy` to `State.Allow` with the same defaults.
- Check: "P1: a policy override lands on the built State" - an explicit `policy: { read: "approve" }` replaces read and keeps the other seven.
- Check: "P2: the hook has no gated action (record is automatic)" - the factory's `Decide(State.Allow, "record")` answers `auto`, and the mount's ledger carries no line containing `policy` or `held`.
- Check: "P3: the record proceeds under the defaults and writes no file" - a fired `fs/observed` event records the stamp, no refusal line appears, and the fake fs recorded zero writes.

## Fixtures

The fixtures use the shared Harness: the real built `Target/Library.js` apply, the real factory instance, the fake ctx (with the throwing fs, so a write would fail loud), the schema's own validation (`Validate`), and `Fire` (one root `fs/observed` event).

The factory's `Decide` is imported from its built Target, and the override scenario passes `policy` through the mount's config.

## Expected ledger strings (byte-exact, `observe: ` prefix)

None new - the block and its mapping log nothing.

The enabled mount's only line is the unchanged `observe: activated (domain=workspace_observe)`, and the absence of a `policy`/`held`/refused line is itself the assertion.

## Expected count

5 PASS.
