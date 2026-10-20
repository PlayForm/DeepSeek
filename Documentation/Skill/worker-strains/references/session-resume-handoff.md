# Session-Resume Awareness - the Handoff Files

> Source: SKILL.md, section 7, bullets 1 and 3 (user-mandated
> 2026-10-09). Canonical skill structure: the mandate of 2026-10-20.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

1. A multi-session batch can resume in a NEW conversation.
2. The starting brief lives in
   Documentation/Handoff/BATCH-HANDOFF-<date>.md: the project state,
   the idle lanes, the feedback ledger, the decisions.
3. The per-task files live in Documentation/Handoff/Tasks/ - each one
   with the temporary current state.
4. READ the latest handoff before resuming the queue.
5. The environment discipline rebinds at resume: the user commits
   mid-session; the concurrent lanes edit the same tree; read-before-
   edit always; the surgical-edit and build-verified rules bind every
   lane.

## Why: The Full Philosophy

1. **A resumed session starts with no memory by design.** The new
   conversation has the skills and the user, but not the batch's live
   state. The handoff files are the state's persistence layer: the
   project state, the idle lanes, the feedback ledger, the decisions -
   everything the new session needs to continue instead of restart.
2. **The latest handoff is the entry point; the per-task files are the
   detail.** The brief (BATCH-HANDOFF-<date>.md) orients; the Tasks/
   files carry each task's temporary current state (what was done,
   what is partial, what is next). Resuming from the brief alone loses
   the partial work; resuming from the task files alone misses the
   decisions.
3. **Resume re-binds the disciplines.** A fresh session is exactly
   when discipline slips - the tree looks quiet and the habits are
   cold. The recap re-asserts the concurrency and editing rules before
   the first edit (see ./references/verify-the-environment.md and
   ./references/surgical-edit-discipline.md).
4. **Dates in the filenames make "the latest" findable.**
   BATCH-HANDOFF-<date>.md sorts naturally; "read the latest" is
   mechanical, not a judgment call.

## Examples

### Good

- New session -> read the latest BATCH-HANDOFF-<date>.md -> read the
  Tasks/ files for the lanes it will resume -> verify the environment
  -> resume the queue.
- A lane's task file shows its work is half-applied -> the session
  re-dispatches with the corrected spec, per the file's stated next
  step.

### Bad

- Resuming and dispatching from memory of a previous conversation.
- Writing a handoff that says "continue as before" without the
  per-task states.

## Exceptions

- No handoff exists (a fresh batch, no prior session) -> the session
  creates the first one before its first pause.

## Failure Modes

- **Resume amnesia:** the queue is restarted from scratch; paid-for
  progress is discarded.
- **A stale handoff:** an older handoff file is read; the decisions of
  the latest session are missed.
- **Invisible partial work:** the per-task files are not consulted; a
  half-applied change is overwritten.

## Arbiters

- Every resumed session's transcript shows the handoff read before the
  first dispatch.
- The handoff files follow the BATCH-HANDOFF-<date>.md + Tasks/
  structure.
- The resumed lanes' states match their per-task files' stated states.
