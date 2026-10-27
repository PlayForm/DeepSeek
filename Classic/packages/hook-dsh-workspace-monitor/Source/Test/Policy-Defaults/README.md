# Policy-Defaults

This folder covers the policy block (D6) on the monitor hook: the defaults, the State mapping, and the proof that the package has no gated action.

## Intent

D6 makes automation a per-plugin allowlist.

The monitor hook's actions are record (every watch entry and every sweep decision is recorded), all AUTOMATIC, so the shared block documents the posture and refuses nothing: there is no gated action (no file write, no batch commit, no spawn).

This folder proves the block is real config, not dead text: the schema fills the D6 defaults, the apply maps them to `State.Allow`, and an override replaces exactly its key.

It also pins the no-gate posture: `Decide(State.Allow, "record")` is `auto`, the mount writes no `policy`/`held` line, and a representative watch still proceeds and writes no file.

## Scenario

- Group P1: the schema and the State mapping.
    - Check: "P1: the hook's schema fills the D6 policy defaults" - the composed `policy` cell deep-equals the D6 defaults (read/index/record/suggest/message = auto, write/commit/spawn = approve).
    - Check: "P1: the built State carries the block on Allow" - the apply maps `policy` to `State.Allow` with the same defaults.
    - Check: "P1: a policy override lands on the built State" - an explicit `policy: { read: "approve" }` replaces read and keeps the other seven.
- Group P2: the package has no gated action.
    - Check: "P2: the record verdict is auto and the mount writes no policy line" - `Decide(Run.State.Allow, "record")` is `auto`, and the mount's ledger has no line containing `policy` or `held`.
- Group P3: a record action still proceeds.
    - Check: "P3: the watch records under the defaults, refuses nothing and writes no file" - one `fs/observed` event records the watch entry, the byte-exact `watch /repo/src/a.ts version 1 (tsc,format)` line is present, no refusal line appears, and the fake fs recorded zero writes.

## Fixtures

The fixtures use the shared Harness: the real built `Target/Library.js` apply, the real factory instance, the fake ctx, the fake fs recorder (`writes` stays empty), and the `Fire` helper (one present `fs/observed` event through the ROOT listener).

The `Mount` helper enables the plugin with the given config overrides, the policy defaults are the shipped ones, and a high debounce keeps the sweep quiet.

## Expected ledger strings (byte-exact, `monitor: ` prefix)

`watch <path> version <version> (<sets>)` (the record action);
no `policy`/`held` line exists for this package.

## Expected count

5 PASS.
