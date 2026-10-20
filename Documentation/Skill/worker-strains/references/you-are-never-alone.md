# You Are Never Alone - the Batch Concurrency Fact

> Source: SKILL.md, section 6, bullet 1 (user-mandated 2026-10-08).
> Canonical skill structure: the mandate of 2026-10-20. This file
> carries the full philosophy; SKILL.md only points here.

## The Rule

1. The batch runs MANY agents at once - lanes activate in pairs, and a
   dozen more idle agents wait in the queue.
2. The parent's activation message carries the CURRENT STATE BLOCK:
   the running lanes + their tasks, the pending count, the scope
   reminder. Read it and treat it as part of the spec.
3. The subagent tooling has NO batch-state broadcast - the parent's
   messages + the process records (Documentation/Plans/
   TOMORROW-REVIEW.md) are the runtime facts.

## Why: The Full Philosophy

1. **Assuming solitude is the root concurrency error.** An agent that
   believes it is the only writer takes the tree for granted: stale
   reads, overwriting edits, "fixing" files another lane just changed.
   The mandate exists because that assumption was observed to fail.
2. **The state block is the agent's only window.** The subagent
   tooling has no broadcast of the batch state; if the parent did not
   say it, the agent does not know it. The activation message's state
   block (the running lanes + their tasks, the pending count, the
   scope reminder) IS the batch context - treat it with the same
   authority as the spec.
3. **The process records are the durable state.** Documentation/
   Plans/TOMORROW-REVIEW.md (and the Plans/ + Reports/ records
   generally) persist across sessions and connectivity losses; the
   parent's messages cover the live window, the records cover the
   rest.
4. **Pairs and a dozen idles are the designed shape.** Concurrency is
   not an accident to tolerate but a regime to navigate: know which
   lanes are live, which surfaces they own, and where your lane sits
   in the queue.

## Examples

### Good

- On activation, the lane reads the state block first and orders its
  work to avoid a surface another live lane owns.
- A lane finds an unexpected modification in a file it needs -> it
  checks the state block and the process record for the owning lane
  before touching anything.
- The lane's report names the lanes it shared a surface boundary with,
  so the orchestrator can sequence the next pair.

### Bad

- A lane starts editing immediately because "my spec says this file is
  mine" without reading the current state block.
- An agent assumes a quiet file region is unclaimed.
- An agent re-derives the batch state from guesses instead of asking
  the parent or reading the record.

## Exceptions

- A single-lane session (no batch running) still reads the state block
  when one is provided; the rule relaxes only when the parent states
  that no other lanes exist.

## Failure Modes

- **Blind writes:** a lane edits a file another lane holds; the second
  writer's change silently wins or loses.
- **A stale state block:** the lane treats an outdated block as
  current, but the surfaces have since been reassigned. Mitigation:
  re-check with the parent before touching contested surfaces.
- **Record drift:** the process record lags the live state; the lane
  trusts the record for live facts. Mitigation: the messages are the
  live window, the records are the durable one.

## Arbiters

- Every activated lane's transcript shows it read the state block
  before its first write.
- Reports acknowledge the concurrency context (which surfaces were
  shared, which were exclusive).
- The process record's queue is reconciled against the live lanes at
  each batch checkpoint.
