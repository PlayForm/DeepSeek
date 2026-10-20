# The Failure Signals (What Counts as a Failed Attempt)

> Source: SKILL.md, section 4 "Coding protocol", "Failure signals" list.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

Failure signals - any of these means the attempt failed (and triggers
the next ladder step, see ./references/coding-ladder.md):

- The subagent ended its report with `ESCALATION: <concrete reason>` (the
  mandated marker; reasons: build error, context overflow, spec
  contradiction, repeated verification failure).
- The subagent gave up WITHOUT the marker (missing build, failing tests,
  missing artifacts, empty workspace).
- The parent's own verification of the artifacts failed (see
  ./references/adjudication-protocol.md).

## Why: The Full Philosophy

1. **The marker is the designed hand-off.** `ESCALATION: <concrete
   reason>` at the end of a report is a machine-checkable string that
   converts a child's honest "I can't finish" into a clean failover
   trigger. The mandated reasons are the four real failure classes:
   build error, context overflow, spec contradiction, repeated
   verification failure.
2. **Silent give-up is the failure mode the marker exists to prevent.**
   A subagent that stops without the marker and without finishing
   (missing build, failing tests, missing artifacts, empty workspace)
   is a failed attempt just the same - the parent must not mistake a
   quiet stop for success. This is why the parent checks for deliverable
   artifacts, not just for a report's tone.
3. **Parent verification is the third, independent signal.** A child can
   believe it succeeded; the parent's own build/test/edge-case run is
   the arbiter (see ./references/adjudication-protocol.md). If the
   parent's verification fails, the attempt failed regardless of what
   the child reported - including with no marker present.
4. **Why an explicit list at all.** Without it, "failure" is a feeling,
   and feelings escalate tasks that succeeded (over-spend) or accept
   tasks that failed (broken deliverables). The list makes the trigger
   objective and auditable after the fact.

## Examples

### Good

- Report ends: `ESCALATION: build error - cargo build fails with
  E0432 unresolved import in src/lib.rs` -> attempt failed, move to
  attempt 2 (or escalation if attempt 2 already used).
- No marker, but the workspace has no built binary and tests were never
  run -> silent give-up; treat as failed.
- Child reports success; parent's own build fails -> parent verification
  failure; treat the attempt as failed and trigger failover.

### Bad

- Treating a report as successful because it sounds confident while the
  workspace is empty.
- Escalating because the result "felt weak" though the build passes and
  the test battery is green - no signal fired; do not escalate a
  success (see ./references/operational-rules.md).
- Reading the marker as rude or as a child's excuse and "giving it
  another chance" at the same tier instead of moving up the ladder.

## Exceptions

- None: any one of the three signals is sufficient; there is no
  combination of mitigating context that un-fails a triggered signal.
- The user's override can instruct accepting a result the parent would
  otherwise fail (e.g. "ship it as-is"); that is user authority, not an
  in-skill exception.

## Failure Modes

- **Marker-only blindness**: only checking for the ESCALATION string and
  missing silent give-ups (empty workspaces, missing artifacts). Cost:
  broken deliverables accepted.
- **Verification skipped**: trusting the child's self-report and not
  building/testing. Cost: the third signal never fires; ladder never
  triggers when it should.
- **Signal inflation**: treating stylistic dissatisfaction as a failure
  signal. Cost: pointless escalations and re-runs of successful work.

## Arbiters

- The three signals are themselves the arbiter list; compliance is
  checked by (a) searching the child report's tail for
  `ESCALATION:`, (b) checking the workspace for the expected artifacts,
  (c) the parent's own deterministic verification runs (build + test
  battery + edge cases, see ./references/adjudication-protocol.md).
- Post-hoc: session logs show whether an escalation followed a triggered
  signal; escalations with no logged signal are violations.
