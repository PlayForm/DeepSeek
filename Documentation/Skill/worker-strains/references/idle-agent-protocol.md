# The Idle-Agent Protocol

> Source: SKILL.md, section 3, methodology 3 (THE IDLE-AGENT PROTOCOL -
> the paused strain). Canonical skill structure: the mandate of
> 2026-10-20. This file carries the full philosophy; SKILL.md only
> points here.

## The Protocol (exact steps)

1. LAUNCH with a fully self-contained spec + the activation rules.
2. The agent RETAINS the spec verbatim, does NO work, and replies
   "<NAME> SPEC RETAINED - IDLE".
3. It WAITS for the activation message.
4. On activation it EXECUTES exactly, with the arbiter.
5. AMENDMENTS arrive via messages and override the base spec where
   they conflict.
6. Idle agents cost ZERO wall-clock time and fire when their surface
   frees up - the incremental, synchronous, wall-clock-ordered regime.

## Why: The Full Philosophy

1. **Pre-positioning beats just-in-time dispatch.** Launching an idle
   agent costs no wall-clock time; when the lane's surface frees up,
   the agent fires immediately. The batch runs as an incremental,
   synchronous, wall-clock-ordered pipeline instead of a queue that
   waits for the orchestrator to notice and then to write a prompt
   from scratch.
2. **The spec is self-contained because the agent starts blind.** An
   idle agent may be activated in a later session, by a different
   orchestrator message stream; it cannot rely on the launch
   conversation's context. The spec carries everything: the scope,
   the surface, the exclusions, the arbiter, the report format, the
   shared facts, the activation rules.
3. **"Retained verbatim" is the contract.** The acknowledgment
   "<NAME> SPEC RETAINED - IDLE" certifies that the agent holds the
   spec exactly and has done nothing. An agent that starts working
   before activation has violated the regime - it may act on a spec
   that is about to be amended.
4. **Amendments override the base spec where they conflict.** The idle
   agent is a holding pattern; the latest message wins. This is what
   makes pre-positioning safe: the spec can be corrected for free
   before any work exists.
5. **Execution is "exactly, with the arbiter".** On activation there
   is no re-interpretation and no scope drift: the retained spec, as
   amended, is executed against its named arbiter.

## Examples

### Good

- Twelve idle explorers queued at the batch start, each with a
  self-contained spec; each replies "<NAME> SPEC RETAINED - IDLE";
  each fires as its surface frees.
- An amendment lands: "skip subsection 4, the ledger covers it" ->
  the idle agent acknowledges "AMENDED - IDLE" and the change enters
  the process record.
- Activation: "You are EXPLORER-7. Activate. Your spec, as amended, is
  authoritative. The current state block follows."

### Bad

- An idle agent that starts exploring "to warm up" before activation.
- A spec that says "as discussed" - not self-contained; the agent
  cannot retain what it was never told.
- Activation without the arbiter named - execution without a verdict
  criterion.

## Exceptions

- None to the no-work-before-activation rule. The only state change an
  idle agent may report is an amendment acknowledgment.

## Failure Modes

- **Premature work:** the agent burns tokens before the surface is
  free, on a spec that may be amended. Cost: the work is done twice.
- **A non-self-contained spec:** the agent acknowledges but cannot
  execute correctly at activation. Cost: a wasted lane slot and a
  relaunch.
- **An amendment lost in transit:** the agent executes the base spec;
  the change is discovered in its report and the work is re-run.
- **Activation without the state block:** the agent lacks the current
  batch state (see ./references/you-are-never-alone.md) and may
  duplicate another lane's surface.

## Arbiters

- The acknowledgment strings "<NAME> SPEC RETAINED - IDLE" and
  "<NAME> SPEC AMENDED - IDLE" appear in the transcript for each idle
  agent.
- The lane's first post-activation work output matches the retained
  spec's scope and arbiter.
- The process record lists every idle agent with its spec version.
