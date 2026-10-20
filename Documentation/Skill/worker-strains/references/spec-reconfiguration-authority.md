# The Spec-Reconfiguration Authority

> Source: SKILL.md, section 3, methodology 2 (THE SPEC-RECONFIGURATION
> AUTHORITY - user-granted). Canonical skill structure: the mandate of
> 2026-10-20. This file carries the full philosophy; SKILL.md only
> points here.

## The Rule (exact)

The authority is USER-GRANTED: as requirements come in and change, and
as the other agents report feedback, the orchestrator re-configures the
specs:

1. Idle agents are amended via messages; they acknowledge with
   "<NAME> SPEC AMENDED - IDLE".
2. Working agents are amended mid-flight WHEN COMPATIBLE.
3. The changed requirements are re-applied to the not-yet-started
   prompts.
4. Failed agents are re-dispatched with corrected specs.
5. The durable queue + the new agents are recorded in the process
   record so the state survives connectivity losses and session
   switches.

## Why: The Full Philosophy

1. **Requirements change faster than lanes drain.** A batch runs for
   hours; the user learns things mid-batch. Killing and relaunching
   every lane on every change would discard paid-for progress; the
   authority amends in place instead.
2. **The amendment ladder matches the agent's state.** Idle: amend by
   message - cheap, since the spec is retained verbatim. Working:
   amend mid-flight only when compatible - an incompatible amendment
   to a working agent creates a split-brain run. Not-yet-started: the
   prompt itself is edited before launch - the cleanest amendment.
   Failed: re-dispatch with the corrected spec, after the tree check
   for partial edits.
3. **Acknowledgments close the loop.** The string "<NAME> SPEC
   AMENDED - IDLE" proves the idle agent received and retained the
   amendment. An unacknowledged amendment is a hope, not a fact.
4. **Durability is part of the authority.** The queue and the new
   agents are recorded in the process record precisely so that a
   connectivity loss or a session switch does not silently forget an
   amendment. The record is the authority's memory.

## Examples

### Good

- The user narrows a requirement -> the idle agent's spec is amended
  by message; it replies "EXPLORER-3 SPEC AMENDED - IDLE"; the queue
  record is updated in the process record.
- A working coder's change is compatible (same files, same arbiters)
  -> it is amended mid-flight with the delta stated explicitly.
- A failed lane -> the spec is corrected (the failure summary
  attached) and it is re-dispatched as a new record in the queue.

### Bad

- Amending a working agent with a change that contradicts its
  in-flight edits ("now do it in a different directory").
- Amending an idle agent and moving on without its acknowledgment.
- Reconfiguring the specs during a connectivity loss and trusting
  memory instead of the process record.

## Exceptions

- The mid-flight amendment is conditional by definition: compatible
  changes only. An incompatible change waits for the lane to finish
  (or be stopped cleanly) and is applied as a re-dispatch.

## Failure Modes

- **Unacknowledged amendments:** the agent executes the stale spec;
  the work is wasted or must be redone.
- **Incompatible mid-flight edits:** the agent holds two contradictory
  instructions; its output is a mix that neither spec describes.
- **Amendments not recorded:** a session switch forgets the change;
  the relaunched lane runs the old spec.

## Arbiters

- Every amendment appears as three things: the message, the
  acknowledgment (or the prompt edit), and the process-record update.
- The process record's queue matches the live set of lanes after
  every reconfiguration.
