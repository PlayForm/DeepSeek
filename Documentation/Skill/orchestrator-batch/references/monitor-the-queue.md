# Monitor the Queue

> Source: SKILL.md, section "The loop (incremental + synchronous in
> wall-clock time)", step 4 (MONITOR). Mandate date: 2026-10-20
> (canonical restructure).
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

While lanes run, the orchestrator MONORS - it runs five monitoring
disciplines continuously:

1. **The queue bookkeeping**: maintain the queue's three states at all
   times - active / paused (idle, spec retained) / queued - so the batch's
   position is always known and reportable.
2. **The SURFACE-CONFLICT analysis**: decide which agents may run
   concurrently. Two lanes may run at the same time ONLY when their files
   are provably disjoint; everything else is serialized.
3. **The activation cascade**: idle agents fire as their surfaces free up -
   when an active lane finishes and its surface clears, the next queued or
   idle lane whose surface is disjoint from all remaining active lanes is
   activated.
4. **The stall recovery**: no file activity from a lane -> send a checkpoint
   nudge: "report your state; STOP reading; move to the ACTION phase"; if
   the lane still does not move, send a hard deadline nudge.
5. **The failure handling**: an agent that died - FIRST verify the tree for
   partial edits (the lane may have written half a change), THEN re-dispatch
   with the same or a corrected spec.

## Why: The Full Philosophy

1. **Bookkeeping is the batch's memory.** The queue's three states are the
   difference between steering a batch and guessing at one: every
   activation, report, and handoff decision reads from it. The two-active
   regime (see the-two-active-regime.md) is enforced through this record.
2. **Surface-conflict analysis is the concurrency license.** "Provably
   disjoint" is a high bar: the surfaces must be compared as file sets, not
   assumed from task wording. Two lanes both "doing docs" but touching
   different files may run together; two lanes in one directory may not.
   Serialization is the default; concurrency is the exception that must be
   proven.
3. **The activation cascade turns completion into progress.** An idle lane
   is pre-loaded context; firing it the moment its surface frees removes
   the gap between "lane finished" and "next lane started". Without the
   cascade, slots idle while work waits.
4. **Stall recovery has two stages because stalls have two causes.** The
   common one: the lane is stuck in exploration - reading files forever
   without acting; the checkpoint nudge ("STOP reading; move to the ACTION
   phase") targets exactly that. The harder one: the lane is genuinely
   blocked; the hard deadline nudge forces either a result or an honest
   report of the blocker.
5. **Failure handling checks the tree first** because a dead agent's last
   action may be a half-applied edit. Re-dispatching without inspecting the
   tree hands the successor a corrupted starting state and doubles the
   damage.

## Examples

### Good

- Lane A (docs CSS) and lane B (Rust parser) have provably disjoint file
  sets -> both active; the queue record shows two active, three idle, one
  queued.
- Lane A silent for a long stretch -> orchestrator sends: "Checkpoint:
  report your state; STOP reading; move to the ACTION phase." Lane answers
  with its state and proceeds.
- Lane C died mid-edit -> orchestrator inspects the tree, finds the partial
  edit, reverts or notes it, re-dispatches lane C with the spec amended to
  account for the partial state.

### Bad

- Activating two lanes whose surfaces "shouldn't overlap" without comparing
  the file sets.
- Interpreting silence as progress and waiting indefinitely without a
  checkpoint nudge.
- Re-dispatching a dead lane without checking for its partial edits - the
  new lane then edits atop a half-applied change.

## Exceptions

- A lane that reports honestly that it is blocked (not stalled) does not get
  the hard-deadline nudge; its blocker becomes a residual for the user or a
  spec amendment decision.
- During a pure read-only phase (investigation lanes), "file activity" is
  not the stall signal; the stall signal is no REPORT activity instead.

## Failure Modes

- Serializing everything out of caution: the batch crawls; provable
  disjointness exists precisely so parallelism can be used safely.
- The cascade firing an idle lane whose surface overlaps a still-active
  lane: interleaved edits in one directory, unattributable diffs.
- Stall nudges sent so often they interrupt real work: the nudge is for
  silence, not for slow progress - distinguish the two from the lane's
  reports.

## Arbiters

- The queue record is the arbiter for bookkeeping: at any moment it must
  show every lane's state (active / paused / queued) and each active lane's
  current task.
- The surface-disjointness claim must be checkable: the file sets compared
  are recorded with the activation decision.
- Every dead lane's re-dispatch must show the tree-verification step
  happened first (its result noted in the record).
