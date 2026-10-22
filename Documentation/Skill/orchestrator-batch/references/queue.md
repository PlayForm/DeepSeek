# The Queue: Two Active, Pair Release, Ack Trap, Re-Pause

## Two active, always

Exactly two lanes are active at any moment. Every other lane is paused with a retained spec. The cap
is the measured API throttle: more than two concurrent lanes multiply the model provider's
rate-limit errors, and every error costs a retry cycle.

The budget is two, not a multiple of two. If one lane of the pair finishes early, one more may be
activated to keep two total.

## The pair queue

1. Lanes launch idle with a comprehensive retained spec.
2. Activation is "ACTIVATE" plus the current-state block.
3. The next pair is released only when the current pair has delivered both reports. "Mostly done" is
   not done.

## The ack trap

An amendment acknowledgment (`"<NAME> SPEC AMENDED - ACK"`) is not work. A lane that ends its turn
at the ACK gets a "CONTINUE + deliver the report" nudge. The urgent form for a repeat offender: "do
not acknowledge without the work".

## Pause on feedback

Every feedback delivery pauses the receiving lane first:

```text
RE-PAUSE - the feedback delivery: STOP all work NOW
```

The lane answers `"<NAME> PAUSED - IDLE"` with the amendment attached. It does no work while paused.
It executes only when its slot opens. The amendment ACK is therefore correct behavior under this
rule; the work happens at ACTIVATE.

## The re-pause

```text
RE-PAUSE - the batch runs 2 at a time only. STOP all work NOW
```

The lane acknowledges `"<NAME> PAUSED - IDLE"`. Its partial state persists in its session; the
resume continues from real progress.

## Stalls

A lane that has gone quiet is nudged with its last verified checkpoint: the files it reported, the
arbiter it last printed. The recovery resumes from evidence, not from a guess about what the lane
was doing.

## Dead lanes

Before re-dispatching a failed lane, verify the tree for partial edits. A fresh run over a dirty
tree fails differently and doubles the damage. Then re-dispatch with the corrected spec and the
failure summary.

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
- **Ack-as-work**: the queue looks busy while nothing executes.
- **Feedback without pause**: the lane builds on a stale spec and reworks.
