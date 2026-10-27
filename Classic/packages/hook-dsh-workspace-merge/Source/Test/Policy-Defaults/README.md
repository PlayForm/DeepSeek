# Policy-Defaults

This folder covers the policy block (D6) on the merge hook: the defaults, the State mapping, and the commit gate's two ways plus the rule that only the `commit` key opens it.

## Intent

D6 makes automation a per-plugin allowlist.

The merge's ONE gated action is the commit: the shared block's `commit` verdict is the OUTER gate in front of the atomic gates and the write executor.

This folder proves the block is real config, not dead text: an `approve` verdict holds the whole batch with the documented line, the rejected commit shape, and **zero writes**, while an `auto` verdict proceeds to the gates and the commits.

It also pins that a different action's override never widens the commit gate.

## Scenario

- Group P1: the schema and the State mapping.
    - Check: "P1: the hook's schema fills the D6 policy defaults" - the composed `policy` cell deep-equals the D6 defaults (read/index/record/suggest/message = auto, write/commit/spawn = approve).
    - Check: "P1: the built State carries the block on Allow" - the apply maps `policy` to `State.Allow` with the same defaults.
    - Check: "P1: a policy override lands on the built State" - an explicit `policy: { commit: "auto" }` replaces commit and keeps the other seven.
- Group P2: the approve verdict HOLDS the whole batch.
    - Check: "P2: an approve verdict refuses the merge with the exact line" - `merge held (2 files) (policy commit=approve)`, and no `batch ... started` line at all (the batch never starts, nothing is persisted).
    - Check: "P2: the refusal is the rejected commit shape, never a guess" - the reply is `{ id, status: "rejected", reason: "the policy holds the commit (commit=approve)", replies: [rejected per file] }`.
    - Check: "P2: ZERO writes, zero reads and no recorded batch" - the fs records no write, no read and no stat (the gates never ran), the batch list is empty, and the statistics stay honest.
- Group P3: the auto verdict proceeds.
    - Check: "P3: an auto verdict proceeds to the gates and the commits" - with `policy.commit: auto` both files apply through the write executor, the started/applied/complete lines are byte-exact, and there is no held line.
- Group P4: only the commit key opens this gate.
    - Check: "P4: a write override never opens the commit gate" - with `policy.write: auto` the commit is still held with the documented line and still writes nothing.

## Fixtures

The fixtures use the shared Harness: the real built `Target/Library.js` apply, the real factory instance, the fake ctx, the functional fake fs (three seeded files at version `v1`), and the `Mount` helper (enabled + the given config overrides).

The mount keeps the shipped `commit: approve`, and a scenario opens the gate explicitly with `policy: { commit: "auto" }`.

## Expected ledger strings (byte-exact, `merge: ` prefix)

`merge held (<n> files) (policy commit=approve)`,
`batch <id> started (<n> files, <bytes> bytes)`,
`applied <path> version <version> (batch <id>)`,
`batch <id> complete (applied <a>, conflict <c>, denied <d>, recovery <r>, unknown <u>)`.

## Expected count

8 PASS.
