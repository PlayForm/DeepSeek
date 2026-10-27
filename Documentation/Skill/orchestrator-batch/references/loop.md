# The Batch Loop

The batch runs incrementally and synchronously in wall-clock time.

The parent does not queue a dozen tasks and wait; it dispatches, observes, verifies, and reports.

## Stage 1: Receive

Accept the request as it arrives, however fragmentary.

Structuring it is the parent's job.

## Stage 2: Formalize

Six items, all in the brief:

| Item          | The question it answers                                  |
| ------------- | -------------------------------------------------------- |
| Scope         | What is in and out of the batch                          |
| Surface       | Which files, packages, or pages the lanes may touch      |
| Exclusions    | What must not change, and the known traps                |
| Sequence      | The order, and what depends on what                      |
| Arbiter       | The command that decides each lane's success             |
| Report format | The shape: per item, before, after, `file:line`, arbiter |

Attach the shared facts the lanes cannot look up.

Resolve ambiguity to the most faithful reading and state it as an assumption in the brief.

## Stage 3: Pick the strain and the route

`worker-strains` decides the kind of worker; `task-routing` decides the model and effort.

Pass the route explicitly.

## Stage 4: Delegate

- **Active** lanes take the two slots.
- **Idle** lanes retain their spec and confirm `"<NAME> SPEC RETAINED - IDLE"`; they do no work
  until activated.

## Stage 5: Monitor

- The queue state: active, paused, queued.
- Surface conflicts: concurrency only with a disjointness proof.
- Stalls: nudge with the lane's last verified checkpoint.
- Failures: verify the tree for partial edits before re-dispatching.

## Stage 6: Verify

Read the printed arbiter results.

Run read-only spot checks on surprising claims.

Do not run the lane's build or measurement.

## Stage 7: Report

The report contains:

- per lane: the result, the before/after anchors, the printed arbiter;
- the residuals and the decisions the user must make;
- the queue's next step;
- READY-TO-COMMIT with the file list and a suggested message.

## The record

The durable record is `Documentation/Plans/`: the active plan and the process record.

Handoff documents are temporary; they may be erased at the session's close.

Anything that must survive a session goes in the plan or the report, not in a handoff.

## Failure modes

- **Unformalized brief**: the lanes guess the scope; the reports cannot be adjudicated.
- **Overlapping surfaces**: two lanes touch one file; one loses.
- **Prose verification**: a broken tree reported as done.
- **Handoff as the only record**: the record disappears with the session.
