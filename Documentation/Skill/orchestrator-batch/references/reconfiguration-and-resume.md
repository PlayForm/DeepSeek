# Spec Reconfiguration and Resume

## The reconfiguration authority

The parent may:

1. **The idle amendment.**

    The amendment is sent; the lane answers `"<NAME> SPEC AMENDED - IDLE"` and retains the new spec.

2. **The mid-flight amendment.**

    A working lane is amended only when the change is compatible with the work already done.

    The message is a checkpoint: state what changed and what must be re-verified.

3. **The re-application.**

    Changed requirements are re-applied to lanes that have not started.

4. **The re-dispatch.**

    A failed lane is re-dispatched with the corrected spec and the failure summary.

An amendment overrides the base spec where the two conflict.

The lane keeps the rest.

## The idle-amendment law

A new idea, suggestion, or improvement never amends a working lane mid-flight.

It becomes a new idle lane.

The working lane finishes against the spec it started with, and the improvement folds into a later
dispatch.

The reason is the spec boundary: a lane working against spec A, amended to spec B mid-flight, has to
re-verify work it already did and may be unable to tell which parts of the tree belong to which
spec.

The new-lane rule keeps every report attributable.

## Resume

The durable record is `Documentation/Plans/`:

- the active plan (status `active`);
- the process record;
- the queue state.

Handoff documents are temporary.

They may be erased at the session's close; anything that must survive goes in the plan or the
report.

On resume:

1. **The plan.**

    The active plan and the queue record are read.

2. **The tree.**

    The tree state is checked in the root and in `Site/`: `git status --short`,
    `git log --oneline -5`.

3. **The counts.**

    Every count is re-verified before it is repeated; the tree may have moved.

4. **The law.**

    The owner skill is re-read for any law that changed since the last session.

5. **The queue.**

    The queue is restored: active, paused, queued.

    Finished lanes are not re-run.

## The resume failure modes

- **Handoff as the only record**: the resume has nothing to read.
- **Stale counts**: the new session repeats numbers the tree no longer supports.
- **Re-running finished work**: the parent did not check the persisted artifacts.
- **Losing the queue**: lanes are re-dispatched in a different order and collide.

## The report after resume

The first report after a resume states:

- what the previous session left unfinished;
- what was verified since the resume;
- the queue state now;
- the next action.

That report is the new session's orientation for the batch.
