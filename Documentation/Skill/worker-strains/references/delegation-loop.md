# The Delegation Loop

The loop is the parent's discipline. It turns a request into a spec, a
spec into a verified result, and a result into a report the user can act
on.

## Stage 1: Receive

Accept the request as it arrives. Structuring it is the parent's job, not
the user's. Do not delegate the raw sentence: the child would inherit the
ambiguity.

## Stage 2: Formalize

Write the spec with six items:

| Item          | The question it answers                                  |
| ------------- | -------------------------------------------------------- |
| Scope         | What exactly is in and out of the task                   |
| Surface       | Which files, packages, or pages may be touched           |
| Exclusions    | What must not change, and the known traps                |
| Sequence      | The order of the steps, and what depends on what         |
| Arbiter       | The command that decides success, and its expected output|
| Report format | The shape of the answer, with `file:line` anchors        |

Attach the shared facts the child cannot look up: the current counts, the
ledger strings, the laws it must follow. Ambiguity resolves to the most
faithful reading, stated in the spec as an assumption.

## Stage 3: Pick the strain and the route

Pick the strain (`strains.md`), then the model and effort
(`task-routing`). Pass the route explicitly: provider, model, effort.

## Stage 4: Delegate

- **Active**: the lane starts now and takes its queue slot.
- **Idle**: the lane retains the spec and waits for an activation message
  (`idle-agent-protocol`).

The spec is self-contained in both cases.

## Stage 5: Monitor

- **Queue**: know which lanes are active, paused, or queued.
- **Surface conflicts**: concurrency only when the file sets are provably
  disjoint.
- **Stalls**: nudge with the lane's last verified checkpoint, not with a
  guess about what it was doing.
- **Failures**: verify the tree for partial edits before re-dispatching;
  a fresh run over a dirty tree fails differently and doubles the damage.

## Stage 6: Verify

Read the lane's printed arbiter results. Run your own free, read-only
checks on surprising claims (`task-routing`'s adjudication protocol).
Trust printed totals over prose: a report that says "all tests pass"
without the printed count is not evidence.

## Stage 7: Report

The report contains:

- per-item results: before, after, `file:line`;
- the printed arbiter result;
- the residuals and the decisions the user must make;
- the READY-TO-COMMIT list with a suggested message.

The user commits. Agents never do.

## The non-execution boundary

The parent does not execute the lane's work while processing feedback: no
builds, no edits, no measurement runs. It relays the feedback verbatim,
keeps the record, and spot-checks read-only. The lane investigates,
executes, and reports its own numbers.

This boundary is what keeps the roles distinct: a parent that starts
editing becomes a second, uncoordinated coder.

## Failure modes

- **Unformalized delegation**: the result cannot be adjudicated; rework.
- **Optimistic concurrency**: two lanes share a file; one loses.
- **Prose verification**: a broken tree reported as done.
- **Dirty-tree re-dispatch**: the new run inherits the old run's partial
  edits.
- **Parent execution**: the parent duplicates the lane and loses the
  overview.
