# Policy-Defaults

The policy block (D6) on the workspace-govern hook: the defaults under the `automation` key, the State mapping on `Allow`, the override, the no-gated-action posture of the package, and the gate decision still proceeding with zero file writes.

## Intent

D6 makes automation a per-plugin allowlist.

The govern hook has ONE action class, RECORD (it records a gate decision and never writes, commits, or spawns), and that class is automatic.

The hook never writes a file, commits a batch, or spawns an agent, so it has NO gated action and no verdict can refuse it.

This folder pins the defaults of the shared block in the schema and on the built State (mapped to `Allow`, because the shared State of the factory already owns `Policy`, the global policy file path), the per-action override, the absence of a gate, and the fact that the gate decision still proceeds under the shipped defaults.

The key is `automation`, **not** `policy`, because the `policy` of this hook is already the decision rule table (rules per proposal kind, mapped to `State.PolicyRules`), a different contract with the `plugin-dsh-route` precedent.

The override scenario therefore passes `automation` through the config of the mount.

## Scenario

- Check: "P1: the hook's schema fills the D6 policy defaults on automation" - the composed `automation` cell deep-equals the D6 defaults (read/index/record/suggest/message = auto, write/commit/spawn = approve), and the decision `policy` key is still an empty array and separate.
- Check: "P1: the built State carries the block on Allow" - the apply maps `automation` to `State.Allow` with the same defaults.
- Check: "P1: a policy override lands on the built State" - an explicit `automation: { read: "approve" }` replaces read and keeps the other seven.
- Check: "P2: the hook has no gated action (record is automatic)" - the `Decide(State.Allow, "record")` of the factory answers `auto`, the ledger of the mount carries no line containing `held`, and its only line containing `policy` is the unchanged activation proof `govern: activated (tools=4, policy=0)` (the count of the decision rule table, not a verdict).
- Check: "P3: the gate proceeds under the defaults and writes no file" - a default `Proposal()` through `workspaceGovern.gate` returns `pass`, no denial/refusal line appears, and the fake fs recorded zero writes.

## Fixtures

The shared Harness: the real built `Target/Library.js` apply, the real factory instance, the fake ctx (with the throwing fs, so a write would fail loud), the own validation of the schema (`Validate`), and the gate driven through the real `workspaceGovern` service.

The `Decide` of the factory is imported from its built Target.

The override scenario passes `automation` through the config of the mount.

## Expected ledger strings (byte-exact, `govern: ` prefix)

None new, because the block and its mapping log nothing.

The enabled mount's only apply-time line is the unchanged `govern: activated (tools=4, policy=0)` (its `policy=0` is the count of the decision rule table), and the absence of a `held`/denied/refused line is itself the assertion.

## Expected count

5 PASS.
