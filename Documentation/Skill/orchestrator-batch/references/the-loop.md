# The Loop: Incremental and Synchronous in Wall-Clock Time

> Source: SKILL.md, section "The loop (incremental + synchronous in wall-clock time)",
> section heading, step 1 (RECEIVE) and step 6 (REPORT). Mandate date: 2026-10-20
> (canonical restructure); the loop itself predates it, with amendments recorded
> 2026-10-09 and 2026-10-10.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

The batch runs as a six-phase loop that is INCREMENTAL and SYNCHRONOUS in
wall-clock time. Each user thought enters the loop at phase 1 and is driven
through the phases in order, while the work is actually running - not batched
up for later:

```
1. RECEIVE   -> take the user's thought, however fragmentary
2. FORMALIZE -> structure it into a brief (see formalize-the-brief.md)
3. DELEGATE  -> start or wake agents (see delegate-active-or-idle.md)
4. MONITOR   -> bookkeep the queue live (see monitor-the-queue.md)
5. VERIFY    -> the agents' own arbiters (see arbiters-are-the-lanes-own.md)
6. REPORT    -> per-agent results, residuals, next steps (this file)
```

- Phase 1, RECEIVE: accept the user's thought or instruction in ANY form -
  a complete spec, a one-line correction, a stray idea, a complaint about
  rendered output. The orchestrator never asks the user to pre-structure it;
  structuring is phase 2's job, not the user's.
- Phase 6, REPORT: after each verification round the orchestrator reports to
  the user:
  - the per-agent results (what each lane did, with its printed numbers),
  - the residuals plus the decisions the user must make,
  - the queue's next steps (which lanes remain, what activates next).
  The user decides the commit protocol - the orchestrator never commits on
  its own authority and never assumes a commit policy.
- The loop repeats: the user's next thought re-enters at phase 1 while lanes
  are running, and phases 2-5 are re-executed for the delta.

## Why: The Full Philosophy

1. **Incremental** means the user's input is processed as it arrives, not
   accumulated. If corrections were stockpiled, a lane could finish work that
   a sentence spoken two minutes earlier had already invalidated - wasted
   compute and a stale report.
2. **Synchronous in wall-clock time** means the orchestrator is coupled to the
   lanes' real progress: it monitors while they run, reports as results land.
   The alternative - fire a batch of agents, walk away, read everything at the
   end - loses the ability to steer mid-flight, which is exactly what the
   spec-reconfiguration authority (see spec-reconfiguration-authority.md)
   exists to do.
3. The phases are ordered because each consumes the previous phase's output:
   you cannot delegate before formalizing (an unstructured thought delegates
   as confusion), you cannot verify without monitoring (you need to know which
   lanes claim what), you cannot report without verifying (unverified results
   are prose, not results).
4. The user-facing side of the loop is trust: the user speaks, sees it
   formalized, sees lanes pick it up, sees verified numbers come back. The
   REPORT phase closes that circle every iteration - the user is never left
   wondering what happened to their sentence.

## Examples

### Good

- User says: "the pause cursor looks wrong" - the orchestrator receives it
  (phase 1), formalizes it into a lane assignment (phase 2), and the lane
  investigates; the result comes back verified and is reported (phase 6).
- A mid-flight correction ("actually also fix the mobile nav") re-enters at
  phase 1 and is routed through formalize/delegate again without stopping the
  running lanes.
- The report lists: "Lane A: 733/733 printed, done. Lane B: investigate the
  nav, active. Residual: the export button - your call on placement."

### Bad

- Collecting three user corrections and passing them to a lane in one message
  three tasks later (violates incremental).
- Firing four agents and only checking their output when all report done
  (violates synchronous).
- Reporting "everything looks good" without per-lane numbers or residuals.

## Exceptions

- A thought that needs no delegation (a pure question about state) still
  traverses the loop, but phases 3-5 collapse: the orchestrator answers from
  the records and reports immediately.
- A one-lane change of course can run phases 2-6 inside a single message
  exchange with that lane; the loop's shape holds even when compressed.

## Failure Modes

- Skipping FORMALIZE because the thought "seems clear": the lane then
  interprets scope itself, and two interpretations diverge silently.
- Reporting before verification: the user acts on prose, not printed numbers.
- Treating the loop as one-shot: after REPORT, the orchestrator goes idle
  while lanes still run and misses the next wall-clock event (a stall, a
  completion, a new user thought).

## Arbiters

- The SKILL.md phase list must stay one-to-one with this file's diagram.
- Every REPORT to the user must name: per-agent results, residuals + decisions,
  queue next steps. A report missing any of the three is non-compliant.
- The commit protocol appears in reports only as "your decision" - never as a
  completed action; any commit by the orchestrator is a violation of the
  non-execution law (see arbiters-are-the-lanes-own.md).
