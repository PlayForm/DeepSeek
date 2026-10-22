# Gate-Tool-Handoff - the integrated decision flow tests

The batch/proposed listener's record and revision paths with their
byte-exact lines, the expiry-first gate, the policy auto-approval emitted on
the batch/decision bus, the batch_decision tool's every path, and the
ingester handoff through the Context.get seam.

## Scenarios

- G1: a proposal is recorded with the byte-exact
  `proposal prop-1 recorded (intent version-bump, targets 1, rev 1)` line;
  a same-or-lower revision is ignored with the byte-exact ignored line; a
  revision bump replaces in place; malformed payloads never throw.
- G2: the gate evaluates expiry first - an expired proposal is decided
  `expired` by `policy` whatever was requested; an unknown proposal is never
  decided silently; a live proposal records the requested decision.
- G3: an auto-approved proposal emits `batch/decision` with the policy
  decision and logs `decision approved prop-1 (by policy)`; a require-user
  proposal emits nothing.
- G4: the tool's list/unknown/missing-approve/approve/already-decided/deny
  paths, each with its exact detail string and byte-exact decision and
  handoff lines; SeenIntents moves exactly once per user approval; the list
  path sweeps expired proposals with the byte-exact expired line.
- G5: a present ingester receives the decision through Context.get (never
  injected) and its result is logged byte-exactly; a failing ingester never
  throws into the caller.

## Expected count

19 PASS.
