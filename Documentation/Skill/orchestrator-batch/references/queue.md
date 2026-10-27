# The Queue: Two Active, Pair Release, Re-Pause

The queue is the mechanism of the parent for keeping several lanes alive at once without letting
them collide or overwhelm the provider.

A small number of rules governs it, and they appear here in the order in which a parent meets them.

## Two active, always

Exactly two lanes are active at any moment.

Every other lane is paused with a retained spec.

The cap is the measured API throttle: more than two concurrent lanes multiply the model provider's
rate-limit errors, and every error costs a retry cycle.

The budget is two, not a multiple of two.

If one lane of the pair finishes early, one more may be activated to keep two total.

The parent does not activate a third lane just because the work seems small.

## The pair queue

1. **The launch.**

    Lanes launch idle with a complete retained spec.

2. **The activation.**

    Activation is "ACTIVATE" plus the current-state block.

3. **The release.**

    The next pair is released only when the current pair has delivered both reports.

    "Mostly done" is not done.

## Idle means no work

An idle lane does no work and ends its turn, and an amendment replaces the conflicting part of its
spec.

There is no acknowledgment step, so the parent does not wait for a status line and the lane does not
produce one.

The absence of an acknowledgment is deliberate, because the acknowledgment was never work and the
parent can tell that a lane is idle from the fact that no result has arrived.

## Pause on feedback

Every feedback delivery pauses the receiving lane first:

```text
RE-PAUSE - the feedback delivery: STOP all work NOW
```

The lane does no work while it is paused.

It executes only when its slot opens.

The pause exists so that the lane never builds new work on a spec that is about to change, and the
amendment is attached after the pause rather than before it.

## The re-pause

```text
RE-PAUSE - the batch runs 2 at a time only. STOP all work NOW
```

The lane's partial state persists in its session; the resume continues from real progress.

The re-pause is a stop rather than a cancellation, so the lane does not discard its work and the
parent does not have to re-dispatch from the beginning.

## Stalls

A lane that has gone quiet is nudged with its last verified checkpoint: the files it reported, the
arbiter it last printed.

The recovery resumes from evidence, not from a guess about what the lane was doing.

Going quiet is not the cue of the parent to wait, because the parent does not block on a lane, sleep
on it, or poll for it.

The result of the lane arrives as a message, and the parent sends a nudge when it has evidence of a
stall, such as a task that is still open or a surface that is untouched after the expected window,
never on a timer.

On 22 October 2026 the user reported that blocking waits on subagents read as stress.

The wait bought no information that the message would not have delivered, and it cost the parent its
own turn, which is why the no-blocking-wait law exists.

The second incident, on 25 October 2026: the Lead dispatched three lanes, then called `wait_agent`
twice and inspected the lanes' output paths between waits while its own code work sat undone; the
user stopped it with "STOP WAITING FOR AGENTS".

## Dead lanes

Before re-dispatching a failed lane, verify the tree for partial edits.

A fresh run over a dirty tree fails differently and doubles the damage.

Then re-dispatch with the corrected spec and the failure summary, rather than with the same spec and
the hope that the failure was transient.

## The queue record

The record shows, at every moment:

- the active lanes and their tasks (at most two);
- the paused lanes and their retained specs;
- the queued lanes;
- the reports delivered.

The record lives in the active plan or the process record, not in a temporary handoff.

## Failure modes

- **Flood**: three or more active lanes; rate-limit errors cascade.
- **Early release**: overlapping surfaces, interleaved reports, a throttle violation in one move.
- **Feedback without pause**: the lane builds on a stale spec and reworks.
