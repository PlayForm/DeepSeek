# The Two-Active Regime (Pair Queue, Ack Trap, Pause on Feedback, Re-Pause)

> Source: SKILL.md, "THE FORMALIZED ORCHESTRATION MODEL (user-mandated
> 2026-10-10 - the Aphrodite-batch behavior, save it)", points 1, 2, 3
> (including the pause-on-feedback rule, the user's amendment 2026-10-10,
> binding) and 4 (the re-pause). Mandate date: 2026-10-20 (canonical
> restructure).
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

### 1. Two active, always

The orchestrator keeps EXACTLY 2 lanes active at any moment; all others are
PAUSED (retained specs, no work); only the pair's work is tracked. A flood
(more than 2 working at once) multiplies the GLM flash API-limit errors -
the 2-at-a-time IS the throttle.

### 2. The pair queue

Lanes launch IDLE with the comprehensive retained spec (confirm
"<NAME> SPEC RETAINED - IDLE"); activation is via "ACTIVATE" plus the
CURRENT STATE block; when the active pair is COMPLETELY done (the reports
delivered), release the next pair - NEVER before.

### 3. The ack trap

An amendment acknowledgment ("<NAME> SPEC AMENDED - ACK") is NOT work - the
lane must then DO the mandate; a lane whose turn ends after the ACK gets a
"CONTINUE + deliver the report" nudge; the urgent form: "do not acknowledge
without the work".

### 4. The pause-on-feedback rule (the user's amendment, 2026-10-10 - binding)

EVERY feedback delivery INCLUDES the pause: the receiving lane (active or
seated) is paused BEFORE/WHILE it receives the feedback ("RE-PAUSE - the
feedback delivery: STOP all work NOW" -> the lane acknowledges
"<NAME> PAUSED - IDLE" with the amendment attached); the lane does NO work
while paused; it executes ONLY when its pair slot opens within the
2-active budget. At any point in time there are at most 2 agents/tasks
active (the API throttle). Under this rule the amendment-ACK is the CORRECT
form (the lane pauses with the spec updated) - the work happens at the
ACTIVATE, not at the amendment; the "EXECUTE NOW" form applies at the
ACTIVATE only.

### 5. The re-pause

The command: "RE-PAUSE - the batch runs 2 at a time only. STOP all work
NOW" - the lane acknowledges "<NAME> PAUSED - IDLE"; the partial state
persists in the session for the resume with the fresh state.

## Why: The Full Philosophy

1. **Why exactly 2:** the GLM flash API rate limits are the binding
   constraint. Each active lane is a stream of model calls; more than 2
   concurrent lanes multiply the API-limit errors, and every error costs a
   retry cycle. The cap is not a preference - it is the measured throttle
   point, which is why it is absolute.
2. **Why the pair queue releases only on COMPLETE done:** releasing the
   next pair when the current pair is "mostly done" overlaps three lanes'
   work and breaks the throttle; "COMPLETELY done (the reports delivered)"
   is the only unambiguous trigger. The pair is the unit of progress, not
   the individual lane.
3. **Why the ack trap exists:** acknowledgment and execution are different
   events. A lane that ends its turn at the ACK produces a batch that looks
   scheduled but does nothing. The trap converts a silent stall into a
   visible one: the missing follow-up work triggers the "CONTINUE + deliver
   the report" nudge.
4. **Why pause-on-feedback is binding:** feedback arrives while lanes run.
   If a lane keeps working while the feedback about its very surface is
   being attached, it builds on a spec that is about to change - wasted
   work and a rework cycle. Pausing first guarantees the lane executes
   against the amended spec, and only when its slot within the 2-active
   budget opens. This also resolves the ack-trap tension: after this rule,
   the amendment-ACK (pause with spec updated) is the CORRECT behavior -
   execution happens at the ACTIVATE.
5. **Why the re-pause preserves partial state:** pausing is not canceling.
   The lane's partial state persists in its session so the resume continues
   from real progress with the fresh state block, instead of restarting
   from zero.

## Examples

### Good

- Four lanes needed; two activated, two seated idle with retained specs
  acknowledging "<NAME> SPEC RETAINED - IDLE"; the pair finishes and both
  report -> the next pair is released.
- Feedback arrives for seated lane D -> orchestrator sends the feedback
  with "RE-PAUSE - the feedback delivery: STOP all work NOW" attached;
  D acknowledges "<NAME> PAUSED - IDLE" with the amendment; D executes
  later at its ACTIVATE.
- A lane acknowledges "SPEC AMENDED - ACK" and stops -> orchestrator sends
  "CONTINUE + deliver the report".

### Bad

- Activating a third lane because "it's just a small task" - the throttle
  does not care about task size.
- Releasing the next pair while the current pair is still reporting.
- Delivering feedback to a working lane without the pause, letting it
  continue on the stale spec.
- Treating an amendment ACK as completion.

## Exceptions

- A lane finishing early leaves a temporarily single-active batch; the
  next pair member may be activated solo to keep 2 total - the budget is
  2, not a multiple of 2.
- The urgent "do not acknowledge without the work" form applies to lanes
  that repeatedly end turns at ACKs; a first-time ACK stop gets the
  standard nudge.

## Failure Modes

- Flood: 3+ active lanes -> API-limit errors multiply, retries cascade,
  the batch slows below the 2-at-a-time pace.
- Early pair release: overlapping surfaces, interleaved reports, and a
  throttle violation in one move.
- The ack-as-work illusion: the queue looks busy while nothing executes;
  discovered only when no report ever arrives.
- Feedback without pause: the lane works on the old spec, the amendment
  lands mid-flight, the work is done twice.

## Arbiters

- The queue record must show, at every moment, exactly 2 active lanes
  maximum (with their current tasks) and every other lane paused/queued.
- Pair release happens only after both lanes' reports are delivered; the
  record shows the reports before the next activation.
- Every feedback delivery in the record must show the pause sequence
  (RE-PAUSE -> "<NAME> PAUSED - IDLE") before or with the amendment.
- Every ACK-stop lane must be followed by either the "CONTINUE + deliver
  the report" nudge or its activation - no ACK left unanswered.
