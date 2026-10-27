# Policy-Defaults

This folder covers the policy block (D6) on the audit hook: the defaults, the State mapping, and the proof that the package has no gated action.

## Intent

D6 makes automation a per-plugin allowlist.

The audit hook's actions are record (every traceability line and every assessment is recorded), all AUTOMATIC, so the shared block documents the posture and refuses nothing: there is no gated action (no file write, no batch commit, no spawn).

This folder proves the block is real config, not dead text: the schema fills the D6 defaults, the apply maps them to `State.Allow`, and an override replaces exactly its key.

It also pins the no-gate posture: `Decide(State.Allow, "record")` is `auto`, the mount writes no `policy`/`held` line, and a representative line still proceeds and writes no file.

## Scenario

- Group P1: the schema and the State mapping.
    - Check: "P1: the hook's schema fills the D6 policy defaults" - the composed `policy` cell deep-equals the D6 defaults (read/index/record/suggest/message = auto, write/commit/spawn = approve).
    - Check: "P1: the built State carries the block on Allow" - the apply maps `policy` to `State.Allow` with the same defaults.
    - Check: "P1: a policy override lands on the built State" - an explicit `policy: { read: "approve" }` replaces read and keeps the other seven.
- Group P2: the package has no gated action.
    - Check: "P2: the record verdict is auto and the mount writes no policy line" - `Decide(Run.State.Allow, "record")` is `auto`, and the mount's ledger has no line containing `policy` or `held`.
- Group P3: a record action still proceeds.
    - Check: "P3: the line records under the defaults, refuses nothing and writes no file" - `line()` returns the first audit line, the byte-exact `audit commitment op1 (pending) /repo/a.ts` line is present, no refusal line appears, and the fake fs recorded zero writes.

## Fixtures

The fixtures use the shared Harness: the real built `Target/Library.js` apply, the real factory instance, the fake ctx, and the fake fs recorder (`writes` stays empty).

The `Mount` helper enables the plugin with the given config overrides, and the policy defaults are the shipped ones.

## Expected ledger strings (byte-exact, `audit: ` prefix)

`audit commitment <operation> (<outcome>) <path>` (the record action);
no `policy`/`held` line exists for this package.

## Expected count

5 PASS.
