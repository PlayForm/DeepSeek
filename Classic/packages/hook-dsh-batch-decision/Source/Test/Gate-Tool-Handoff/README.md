# Gate-Tool-Handoff - the integrated decision flow tests

The suite covers the record and revision paths of the batch/proposed listener with their
byte-exact lines, the expiry-first gate, the policy auto-approval emitted on the
batch/decision bus, every path of the batch_decision tool, and the ingester handoff
through the Context.get seam.

## Scenarios

- G1: a proposal is recorded with the byte-exact
  `proposal prop-1 recorded (intent version-bump, targets 1, rev 1)` line, a
  same-or-lower revision is ignored with the byte-exact ignored line, a revision bump
  replaces in place, and malformed payloads never throw.
- G2: the gate evaluates expiry first, so an expired proposal is decided `expired` by
  `policy` whatever was requested, an unknown proposal is never decided silently, and a
  live proposal records the requested decision.
- G3: an auto-approved proposal emits `batch/decision` with the policy decision and logs
  `decision approved prop-1 (by policy)`, and a require-user proposal emits nothing.
- G4: the list, unknown, missing-approve, approve, already-decided, and deny paths of the
  tool each give their exact detail string with byte-exact decision and handoff lines,
  SeenIntents moves exactly once per user approval, and the list path sweeps expired
  proposals with the byte-exact expired line.
- G5: a present ingester receives the decision through Context.get and never through
  injection, its result is logged byte-exactly, and a failing ingester never throws into
  the caller.

## Expected count

19 PASS.
