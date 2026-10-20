# The Idle-Amendment Law

> Source: SKILL.md, "THE FORMALIZED ORCHESTRATION MODEL", point 11
> (THE IDLE-AMENDMENT LAW, user-mandated 2026-10-19). Mandate date:
> 2026-10-20 (canonical restructure).
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

Suggestions, improvements, and subsequent ideas NEVER amend a working lane
mid-flight - a mid-flight amendment makes the lane focus on too many things
and limits its execution. Instead:

1. Every new idea lands as a NEW IDLE lane: a fully self-contained spec +
   the "<NAME> SPEC RETAINED - IDLE" retention line + the activation rules.
2. NEVER as a message to a running agent.
3. The orchestrator folds the landed improvement reports into the
   SUBSEQUENT dispatches.
4. The spec-reconfiguration authority (see
   spec-reconfiguration-authority.md) applies to the not-yet-started lanes
   only - the running lanes keep their single mandates.
5. The 2-3-at-a-time active regime drains the idle queue until all is met.
6. The idle-queue inventory lives in the process record
   (Documentation/Plans/TOMORROW-REVIEW.md) so the state survives restarts.

## Why: The Full Philosophy

1. **Why mid-flight amendment hurts:** a working lane is a context window
   with a plan. Injecting a new objective mid-execution forces the lane to
   interleave two mental models - the original mandate and the new idea -
   and both suffer: the original gets executed with divided attention, the
   new one gets executed without the preparation a fresh spec would have.
   The observed result was lanes that did both things poorly.
2. **Why a new idle lane is better:** a new lane starts with a clean,
   single-purpose, self-contained spec. It inherits nothing (except what
   the orchestrator deliberately writes into it), its scope is sharp, and
   it enters the same queue discipline (retention line, activation rules,
   the active budget) as every other lane.
3. **Why improvement reports fold into subsequent dispatches:** lanes
   finish and produce improvement ideas. Those ideas are durable inputs -
   they belong to the NEXT dispatch's briefs, where they can be integrated
   coherently, not squeezed into a lane whose plan is already running.
4. **Why the running lanes keep single mandates:** "one lane, one mandate"
   is the invariant that makes verification simple: the lane's report is
   about exactly one task, so the arbiters' numbers map to exactly one
   change.
5. **Why the inventory lives in TOMORROW-REVIEW.md:** idle lanes exist as
   retained specs in agent sessions, which die. The process record is the
   durable inventory: after a restart, the orchestrator reads it and knows
   which ideas are seated, waiting, and in what order.

## Examples

### Good

- Mid-batch, the user suggests a new feature -> the orchestrator writes a
  fully self-contained spec, launches it idle ("ACK: SPEC RETAINED -
  IDLE"), records it in TOMORROW-REVIEW.md, and it activates when the
  budget allows (2-3 at a time).
- Lane A finishes and its report contains "while in there, the X could
  also be improved" -> the orchestrator notes it and folds it into the
  next dispatch's brief or creates a new idle lane for it.

### Bad

- send_message to running lane A: "also add a search box while you're in
  that file" - the forbidden mid-flight idea injection.
- Letting a running lane "quickly handle" a suggestion because it seems
  small - size is irrelevant; the focus split is the harm.
- Keeping the idle-queue inventory only in the agent sessions - a restart
  erases it.

## Exceptions

- Compatible CORRECTIVE changes to a working lane (a fix to a detail of
  its own current task) may go as a checkpoint message - that is the
  spec-reconfiguration authority's remaining mid-flight power (see
  spec-reconfiguration-authority.md). New ideas, however, never qualify.
- If the user explicitly addresses a running lane's task and says "tell
  lane A to do X now", the orchestrator surfaces the conflict (budget,
  focus split) and asks/decides per the user's explicit instruction -
  explicit user overrides beat the standing law for that instance.

## Failure Modes

- The split-focus lane: a working lane receives an idea mid-flight,
  attempts both, and delivers a degraded original plus a half-baked
  addition - the exact failure that prompted the law.
- Inventory loss: new idle lanes launched but not recorded - after a
  restart the batch forgets ideas the user already invested in.
- Queue starvation: the idle queue grows faster than the 2-3-at-a-time
  regime drains it; the inventory must show the backlog honestly so the
  user can reprioritize.

## Arbiters

- Audit: no send_message to a running lane carries a NEW objective - only
  compatible corrections or queue-control messages (ACTIVATE, RE-PAUSE,
  nudges).
- Every new idea has a record: either a TOMORROW-REVIEW.md entry with its
  idle lane, or its explicit folding into a subsequent dispatch's brief.
- The idle-queue inventory in TOMORROW-REVIEW.md is current at every
  report: ideas seated, order, and which dispatch will consume them.
