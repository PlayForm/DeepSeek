# The Batch Loop

The batch runs incrementally and synchronously in wall-clock time.

The parent does not queue a dozen tasks and then wait for all of them.

It dispatches a pair, verifies what comes back, commits the verified work, and releases the next
pair against a tree that is now greener than it was before.

This file describes the loop stage by stage so that a parent can follow it without deriving the
order again from the shorter summary in the skill body.

The emphasis throughout is on the actions of the parent rather than on the internal work of the
lanes, because the lanes own their execution and the parent owns the sequence.

## Stage 1: Read the request once

The parent reads the request once and reads it for the outcome that the user wants, rather than
re-reading it repeatedly while planning.

Accept the request as it arrives, however fragmentary.

Structuring it is the parent's job: the parent does not ask the user to restate the request in a
cleaner form when the parent can do the structuring itself.

## Stage 2: Write the spec

The spec is the single most important artifact in the batch, because every later verification is a
comparison against it.

Six items, all in the spec:

| Item             | The question it answers                         |
| ---------------- | ----------------------------------------------- |
| Scope            | What is in and out of the batch                 |
| Surface          | Which files, packages, or pages the lanes touch |
| Exclusions       | What must not change, and the known traps       |
| Sequence         | The order, and what depends on what             |
| Arbiter          | The command that decides each lane's success    |
| Acceptance check | The printed result that proves the lane is done |

Attach the shared facts the lane cannot look up: the current counts, the ledger strings, and the
laws that apply.

Resolve ambiguity to the most faithful reading and state it as an assumption in the spec, because an
unrecorded assumption becomes a disagreement later.

## Stage 3: Pick the strain and the route

`worker-strains` decides the kind of worker; `task-routing` decides the model and effort.

Pass the route explicitly in the spec as the provider, the model, and the effort, because a lane
that is not told its route inherits the route of the parent, and the route of the parent is the
expensive one.

## Stage 4: Delegate

- **Active** lanes take the two slots.
- **Idle** lanes retain their spec and do no work until activated; they produce no status line,
  because the acknowledgment is not work.

In both cases the spec must be self-contained, because the child does not see the conversation of
the parent.

## Stage 5: Track the queue

The parent tracks the queue rather than the individual lane: it knows which lanes are active, which
are paused, and which are queued.

- Surface conflicts: concurrency only with a disjointness proof.
- Stalls: nudge with the lane's last verified checkpoint, not with a guess about what the lane did.
- Failures: verify the tree for partial edits before re-dispatching, because a fresh run over a
  dirty tree fails differently and doubles the damage.

## Stage 6: Verify

Read the printed arbiter results.

Run read-only spot checks on surprising claims.

Do not run the lane's build or measurement.

The verification of the parent is a comparison of the printed result against the acceptance check in
the spec, plus a grep of the artifact for every remediation that the result claims, because a result
is a claim rather than evidence.

## Stage 7: Commit

The parent stages the integrations and runs `git gcommit`.

The parent stages only the files that belong to the verified step, never uses `git add -A`, and
never commits the work of another lane.

The retired variants of the commit alias must never be used.

The outcome of the batch is the commits, the printed arbiters, and the residuals rather than a
narrative about them.

The batch report contains:

- per lane: the result, the before/after anchors, the printed arbiter;
- the residuals and the decisions the user must make;
- the queue's next step;
- READY-TO-COMMIT with the file list and a suggested message.

## The record

The durable record is `Documentation/Plans/`: the active plan and the process record.

Handoff documents are temporary; they may be erased at the session's close.

Anything that must survive a session goes in the plan or the report, not in a handoff, because a
handoff that disappears takes the reasoning with it and the next session has to reconstruct the
reasoning from the artifacts alone.

## Failure modes

- **Unformalized spec**: the lanes guess the scope; the reports cannot be adjudicated.
- **Overlapping surfaces**: two lanes touch one file; one loses.
- **Prose verification**: a broken tree reported as done.
- **Handoff as the only record**: the record disappears with the session.
