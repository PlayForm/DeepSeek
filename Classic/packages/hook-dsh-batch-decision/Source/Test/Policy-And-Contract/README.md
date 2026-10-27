# Policy-And-Contract - the loader contract and the policy tests

The suite covers the loader contract, the IDLE-forever cold mount, the byte-exact
activation line, the shape of the listener and tool registration, the fail-loud
validation, every gate of the conservative auto-approve policy, and the fs purity
invariant.

## Scenarios

- P1: the default export carries name/apply/Config/inject, the identity is the package
  name, the siblings are NOT injected, and apply returns nothing.
- P2: a disabled mount logs the byte-exact
  `hook-dsh-batch-decision: disabled (enabled=false)` line to the logger and to the
  durable file, and the disabled listener is a full passthrough.
- P3: the activation line of the enabled mount is byte-exact
  (`activated (bundle 0.3.0, autoApprove=on, allowlist=1)`), the batch/proposed listener
  sits on the ctx, no root listeners exist, the batch_decision tool registers once, and
  the State probe carries the knobs.
- P4: a bad autoApprove, a missing allowlist, pendingTtlMs < 1000, minConfidence out of
  range, and maxAutoTargets < 1 all fail loud at load.
- P5: the policy gates all require the user, which covers autoApprove off, a
  non-allowlisted intent, too many targets, low or missing confidence, and the first-batch
  rule where the SeenIntents counter only moves on a USER approval, and every gate passed
  yields auto-approve.
- P6: the decision path never touches the fs seam.

## Expected count

22 PASS.
