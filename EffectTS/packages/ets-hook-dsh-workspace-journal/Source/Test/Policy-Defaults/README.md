# Policy-Defaults

The policy block (D6) on the journal hook: the defaults, the State mapping, the two ways of the revert gate, and the rule that only the `write` key opens it.

## Intent

D6 makes automation a per-plugin allowlist.

The ONE gated action of the journal is the revert, which writes the pre-images back, so the `write` verdict of the shared block is the gate in front of the whole replay pass.

This folder proves the block is real config, not dead text: an `approve` verdict refuses the revert with the documented line, **zero writes**, an unchanged batch state, and no record, while an `auto` verdict replays the batch.

It also pins that an override of a different action never widens the revert gate.

## Scenario

- Group P1: the schema and the State mapping.
    - Check: "P1: the hook's schema fills the D6 policy defaults" - the composed `policy` cell deep-equals the D6 defaults (read/index/record/suggest/message = auto, write/commit/spawn = approve).
    - Check: "P1: the built State carries the block on Allow" - the apply maps `policy` to `State.Allow` with the same defaults.
    - Check: "P1: a policy override lands on the built State" - an explicit `policy: { write: "auto" }` replaces write and keeps the other seven.
- Group P2: the approve verdict HOLDS the revert.
    - Check: "P2: an approve verdict refuses the revert with the exact line" - `revert held (2 files) (policy write=approve)` and the documented `batch b1 is held by the policy (write=approve)` refusal.
    - Check: "P2: ZERO writes, no state change and no revert record" - no write, no resolved target, the batch stays `applying`, and no `reverted ...` line.
- Group P3: the auto verdict proceeds.
    - Check: "P3: an auto verdict replays the batch backward" - with `policy.write: auto` the absent pre-image is removed, the present one is restored through the fenced write, the summary line is byte-exact, and there is no held line.
- Group P4: only the write key opens this gate.
    - Check: "P4: a commit override never opens the revert gate" - with `policy.commit: auto` the revert is still held with the documented line and still writes nothing.

## Fixtures

The shared Harness: the real built `Target/Library.js` apply, the real factory instance, the fake ctx, the fake fs (one seeded file), the `Boot` join point (the boot recovery pass), and the `Mount` helper (enabled + the given config overrides).

The mount keeps the shipped `write: approve`, and a scenario opens the gate explicitly with `policy: { write: "auto" }`.

## Expected ledger strings (byte-exact, `journal: ` prefix)

`revert held (<n> files) (policy write=approve)`, `reverted <batchId> (<n> files)`, `reverted <batchId> <path> (removed)`, `reverted <batchId> <path> (fence ok)`.

## Expected count

7 PASS.
