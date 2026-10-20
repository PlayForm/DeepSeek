# The Orchestrator's Non-Execution Law

> Source: SKILL.md, section 7, bullet 4 (user-mandated 2026-10-09 -
> binding for every session). Canonical skill structure: the mandate of
> 2026-10-20. This file carries the full philosophy; SKILL.md only
> points here.

## The Law (exact)

1. The orchestrator does NOT execute on the feedback: no builds, no
   site edits, no measurement runs, no surface-location investigation
   before relaying.
2. The feedback arrives VERBATIM in the activation message.
3. YOU (the lane) investigate + locate + execute + build + verify; your
   report carries the arbiter numbers.
4. The orchestrator's hands-on work is limited to: relaying verbatim,
   keeping the records, and read-only spot-checks of the reported
   claims.

## Why: The Full Philosophy

1. **The orchestrator's bottleneck is attention, not capability.** If
   it executes on every feedback item, the whole batch serializes
   through one agent. Relaying keeps the lanes parallel; the
   orchestrator stays the router.
2. **Verbatim relay preserves attribution.** The feedback is a claim a
   lane makes about its own work. The orchestrator passing it verbatim
   (not summarized, not "improved") keeps the chain of custody: the
   next lane investigates the claim as stated, and a wrong claim is
   traceable to its source.
3. **Investigation belongs to the executor.** The lane that will fix
   the issue is the one that locates it - it gains the context it
   needs for the fix anyway. An orchestrator that pre-locates the
   surface does the expensive part and then hands off the cheap part,
   upside down.
4. **Read-only spot-checks are the honesty check.** The orchestrator
   may verify claims (the printed totals, the tree state) without
   executing: verification by inspection, mutation by nobody but the
   lanes. This composes with the verify stage of the orchestrator loop
   (see ./references/orchestrator-loop.md): run the arbiters - and
   during feedback processing, that means spot-checks, not executions.
5. **Binding for every session.** The law is not a batch-specific
   courtesy; it binds every session of this harness (2026-10-09).

## Examples

### Good

- A lane reports "smoke X fails at governor:31" -> the orchestrator
  relays the sentence verbatim to the responsible lane in the
  activation message; the lane investigates, fixes, builds, and
  reports the printed totals.
- The orchestrator spot-checks the claim by reading the reported line
  (read-only) before relaying.

### Bad

- The orchestrator runs the failing suite itself, locates the cause,
  and edits the file "to save a round trip".
- The orchestrator summarizes the feedback into its own diagnosis and
  relays the diagnosis instead of the claim.

## Exceptions

- The read-only spot-checks (explicitly permitted) and keeping the
  records (the process record is the orchestrator's job).

## Failure Modes

- **Execution creep:** one build, then one edit; the batch serializes
  and the lanes idle.
- **A diagnosed relay:** the orchestrator's interpretation replaces
  the claim; the lane fixes a different problem than the one reported.
- **An unverified relay:** no spot-check at all; a wrong claim
  propagates and costs a lane a full run.

## Arbiters

- Feedback processing in the transcript shows verbatim relay plus, at
  most, read-only checks; no build/edit/measurement commands issued by
  the orchestrator during feedback handling.
- Every relayed feedback item is traceable to its lane's original
  wording.
- Lane reports carry the arbiter numbers for the work they executed.
