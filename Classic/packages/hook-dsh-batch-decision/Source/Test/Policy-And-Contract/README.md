# Policy-And-Contract - the loader contract and the policy tests

The loader contract, the IDLE-forever cold mount, the byte-exact activation
line, the listener/tool registration shape, the fail-loud validation, the
conservative auto-approve policy's every gate, and the fs purity invariant.

## Scenarios

- P1: the default export carries name/apply/Config/inject; the identity is
  the package name; the siblings are NOT injected; apply returns nothing.
- P2: a disabled mount logs the byte-exact
  `hook-dsh-batch-decision: disabled (enabled=false)` line (logger and
  durable file); the disabled listener is a full passthrough.
- P3: the enabled mount's activation line is byte-exact
  (`activated (bundle 0.1.0, autoApprove=on, allowlist=1)`); the
  batch/proposed listener sits on the ctx; no root listeners; the
  batch_decision tool registers once; the State probe carries the knobs.
- P4: bad autoApprove, missing allowlist, pendingTtlMs < 1000,
  minConfidence out of range and maxAutoTargets < 1 all fail loud at load.
- P5: the policy gates - autoApprove off, non-allowlisted intent, too many
  targets, low/missing confidence, and the first-batch rule (the
  SeenIntents counter only moves on a USER approval) all require the user;
  every gate passed yields auto-approve.
- P6: the decision path never touches the fs seam.

## Expected count

22 PASS.
