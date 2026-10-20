---
name: orchestrator-batch
description: "The parent's batch orchestration: the incremental delegation loop, the two-active queue regime, the spec-reconfiguration authority, the idle-amendment law, verification by the lanes' own arbiters, and the resume protocol."
whenToUse: When running a multi-agent batch in this repository, when deciding the order or concurrency of lanes, when the user gives feedback that amends a lane's spec, or when resuming a batch in a new session.
version: 2.0.0
updated: 2026-10-20
---

# Orchestrator Batch

The parent's discipline for running several lanes without losing control
of the tree. The core split: the lanes execute and verify their own work;
the parent formalizes, dispatches, relays, and spot-checks read-only.

## When to use

- A request that lands as several delegated tasks (site work, docs,
  corrections, scans).
- The user asks to launch, pause, re-pause, or amend an idle lane.
- A batch resumes in a new session.
- Do not use for: a single delegation (`worker-strains`), the child's
  idle contract (`idle-agent-protocol`), or the route itself
  (`task-routing`).

## The loop

1. **Receive** the request as it arrives.
2. **Formalize** the brief: scope, surface, exclusions, sequence, arbiter,
   report format, shared facts.
3. **Pick the strain and the route** (`worker-strains`, `task-routing`).
4. **Delegate**: an active lane, or an idle lane with a retained spec.
5. **Monitor** the queue, the surface conflicts, stalls, and failures.
6. **Verify** the lanes' printed arbiter results; run only read-only spot
   checks yourself.
7. **Report** results, residuals, decisions, and READY-TO-COMMIT.

## The two-active regime

- Exactly two lanes are active at any moment; all others are paused with
  retained specs. The cap is the API throttle, not a preference.
- The next pair releases only when the current pair has delivered both
  reports.
- Every feedback delivery pauses the receiving lane first. It executes
  only when its slot opens.
- An amendment ACK is not work. A lane that stops at the ACK gets a
  "CONTINUE + deliver the report" nudge.
- "RE-PAUSE" stops all work now; partial state persists for the resume.

## Spec reconfiguration

The parent may amend an idle lane's spec ("SPEC AMENDED - IDLE"), amend a
working lane mid-flight only when the change is compatible, re-apply
changed requirements to lanes that have not started, and re-dispatch a
failed lane. Amendments override the base spec where they conflict.

**The idle-amendment law:** a new idea, suggestion, or improvement never
amends a working lane mid-flight. It becomes a new idle lane, and the
improvement folds into a later dispatch. Working lanes finish against the
spec they started with.

## Verification and the non-execution law

- Each lane runs its own arbiter and reports the printed numbers. The
  counts live in `smoke-writing`, not here.
- The parent does not execute the project: no builds, no site edits, no
  measurement runs, no pre-investigation of feedback surfaces.
- The parent's hands-on work is limited to relaying feedback verbatim,
  keeping the records, and read-only spot checks over committed or built
  output.
- Printed totals beat prose. A claim that contradicts the printed result
  is wrong.

## Resume

The durable record is `Documentation/Plans/` (the active plan and the
process record), not a handoff file. Handoff documents are temporary and
may be erased at the session's close. On resume:

1. Read the active plan and the queue record.
2. Check the tree state in the root and in `Site/`.
3. Re-verify every count before repeating it.
4. Re-read the owner skill for any law that changed.

## Decision table

| Situation                              | Action                                        |
| -------------------------------------- | --------------------------------------------- |
| More than two lanes ready              | Seat the rest idle; release as a pair         |
| Feedback for a working lane            | Pause first, then attach the amendment        |
| A new idea mid-batch                   | New idle lane, not a mid-flight amendment     |
| A lane stalls                          | Nudge with its last verified checkpoint       |
| A lane fails                           | Verify the tree, then re-dispatch with the fix|
| The pair finishes                      | Release the next pair only after both reports |
| A resumed session                      | Read the plan and the queue, re-verify counts |

## Verification

- The queue record shows at most two active lanes at every point.
- Every feedback delivery shows the pause before the amendment.
- Every relayed report cites printed totals.
- No build, edit, or measurement run appears under the parent's name.
- The resume starts from the durable plan, not from a deleted handoff.

## Anti-patterns

| Mistake                                 | Cost                                        | Do instead                          |
| --------------------------------------- | ------------------------------------------- | ----------------------------------- |
| Activating a third lane "because small" | API-limit errors multiply; the batch slows  | Hold the two-active cap             |
| Releasing the next pair early           | Overlapping surfaces and interleaved reports| Wait for both reports               |
| Feedback without the pause              | The lane builds on a spec about to change   | Pause, amend, execute at ACTIVATE   |
| Amending a working lane with a new idea | Rework and a lost spec boundary             | New idle lane                       |
| Paraphrasing feedback                   | The lane fixes something the user did not say | Relay verbatim                    |
| Accepting prose "all pass"              | A broken tree reported as done              | Read the printed totals             |

## References

| File                                  | Covers                                                | Read when                        |
| ------------------------------------- | ----------------------------------------------------- | -------------------------------- |
| `references/loop.md`                  | The seven stages, formalization, and the report shape | Running or reviewing a batch     |
| `references/queue.md`                 | Two-active, pair release, ack trap, re-pause, stalls  | Managing active and idle lanes   |
| `references/verification.md`          | The lanes' arbiters, the non-execution law, spot checks | Verifying a report              |
| `references/reconfiguration-and-resume.md` | Spec amendments, the idle-amendment law, the resume | Feedback arrives, or a new session |
