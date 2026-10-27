# Policy-Defaults

The suite covers the policy block (D6) on the batch-decision hook, which means the
defaults, the State mapping, the two ways of the auto-approval gate, and its precedence
over `autoApprove`.

## Intent

D6 makes automation a per-plugin allowlist.

The gated action of the hook is the batch commit, so the `commit` verdict of the shared
block is the OUTER gate in front of the conservative `autoApprove` policy, which is the
INNER one.

This folder proves that the block is real config and not dead text, because an `approve`
verdict holds the policy auto-approval with the documented line and an `auto` verdict
proceeds to the decision.

It also pins the precedence: policy approve beats an enabled knob, while a knob that is
off still requires the user on its own.

## Scenario

- Group P1: the schema and the State mapping.
    - Check: "P1: the hook's schema fills the D6 policy defaults" - the
      composed `policy` cell deep-equals the D6 defaults
      (read/index/record/suggest/message = auto, write/commit/spawn =
      approve).
    - Check: "P1: the built State carries the block on Allow" - the apply maps
      `policy` to `State.Allow` with the same defaults.
    - Check: "P1: a policy override lands on the built State" - an explicit
      `policy: { commit: "auto" }` replaces commit and keeps the other seven.
- Group P2: the approve verdict HOLDS the auto-approval.
    - Check: "P2: an approve verdict records the held line and no decision" -
      `decision held prop-1 (policy commit=approve)`, no `decision approved`
      line, nothing emitted on `batch/decision`, and the proposal stays
      undecided.
    - Check: "P2: the proposal is still recorded and listable for the user" -
      the recorder still writes its byte-exact line, and the pending map holds
      the proposal.
- Group P3: the auto verdict proceeds.
    - Check: "P3: an auto verdict proceeds to the policy approval" - with
      `policy.commit: auto` the policy approves (`decision approved prop-1
      (by policy)`), emits on the bus, and marks the proposal decided, with no
      held line.
- Group P4: the precedence.
    - Check: "P4: a knob that is off requires the user silently, even with the
      gate open" - `autoApprove: "off"` refuses first, so no held line is
      written, nothing appears on the bus, and the proposal waits.

## Fixtures

The shared Harness supplies the real built `Target/Library.js` apply, the real factory
instance, the fake ctx, and the `Setup` mount, which is enabled, has the auto-approve
knobs on, and seeds the intent class once in `SeenIntents`, so the conservative policy
itself says "auto-approve".

The default mount keeps the shipped `commit: approve`, and a scenario opens the gate
explicitly.

## Expected ledger strings (byte-exact, `hook-dsh-batch-decision: ` prefix)

`decision held <id> (policy commit=approve)`,
`decision approved <id> (by policy)`,
`proposal <id> recorded (intent <intent>, targets <n>, rev <n>)`.

## Expected count

7 PASS.
