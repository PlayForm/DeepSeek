# Policy-Defaults

The policy block (D6) on the workspace-operate hook: the defaults, the State mapping on `Allow`, the override, the no-gated-action posture of the package, and the suggest action still proceeding with zero file writes.

## Intent

D6 makes automation a per-plugin allowlist.

The operate hook has ONE action class, SUGGEST (it records a typed proposal and never applies it), and that class is automatic.

The hook never writes a file, commits a batch, or spawns an agent, so it has NO gated action and no verdict can refuse it.

This folder pins the defaults of the shared block in the schema and on the built State (mapped to `Allow`, because the shared State of the factory already owns `Policy`, the global policy file path), the per-action override, the absence of a gate, and the fact that the proposal path still proceeds under the shipped defaults.

## Scenario

- Check: "P1: the hook's schema fills the D6 policy defaults" - the composed `policy` cell deep-equals the D6 defaults (read/index/record/suggest/message = auto, write/commit/spawn = approve).
- Check: "P1: the built State carries the block on Allow" - the apply maps `policy` to `State.Allow` with the same defaults.
- Check: "P1: a policy override lands on the built State" - an explicit `policy: { read: "approve" }` replaces read and keeps the other seven.
- Check: "P2: the hook has no gated action (suggest is automatic)" - the `Decide(State.Allow, "suggest")` of the factory answers `auto`, and the ledger of the mount carries no line containing `policy` or `held`.
- Check: "P3: the suggestion proceeds under the defaults and writes no file" - a `proposeRename` call (with a fake graph and the version fence) returns `proposed`, no refusal line appears, and the fake fs recorded zero writes.

## Fixtures

The shared Harness: the real built `Target/Library.js` apply, the real factory instance, the fake ctx (with the functional fake fs whose `writeText` throws), the own validation of the schema (`Validate`), and the fake `workspaceGraph` seam (the symbol + file nodes the rename rule reads).

The `Decide` of the factory is imported from its built Target.

The override scenario passes `policy` through the config of the mount.

## Expected ledger strings (byte-exact, `operate: ` prefix)

None new, because the block and its mapping log nothing.

The enabled mount's only apply-time line is the unchanged `operate: activated (domain=workspace_operate)`, and the absence of a `policy`/`held`/refused line is itself the assertion.

## Expected count

5 PASS.
