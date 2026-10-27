---
name: worker-strains
description:
    "The delegation methodology: the four worker strains (explorer, coder, planner, minuteman),
    strain-first selection rule, producer-never-records pairing, formalized delegation loop, and the
    environment and scope discipline every delegated lane follows."
whenToUse:
    Before any subagent delegation, workflow launch, or decision about who should do a task. Load
    with task-routing, which decides the model and effort.
version: 3.1.0
updated: 2026-10-28
---

# Worker Strains

The harness cultivates four worker strains.

A strain is a cultivation site, not a label: choosing it chooses the surfaces the agent may touch,
the protocol it follows, and how its failures are handled.

The model and effort are a separate decision owned by `task-routing`, so this skill answers what
kind of work the task is and what the worker may do, while `task-routing` answers which model and
effort run it.

## When to use

- Before delegating any task to a subagent or a workflow phase.
- When writing the spec for a delegated lane.
- When deciding whether a lane may run concurrently with another.
- Do not use for: model choice (`task-routing`), the parent's queue mechanics
  (`orchestrator-batch`), or an idle child's contract (`idle-agent-protocol`).

## The strains

| Strain    | Work                                                | Surfaces                                                | Failure handling                     |
| --------- | --------------------------------------------------- | ------------------------------------------------------- | ------------------------------------ |
| EXPLORER  | Surveys, research, scans, archaeology               | Read-only; no writes                                    | Free downstream correction           |
| CODER     | Implementation, refactors, features, integration    | Write/edit tool API; its arbiter                        | The attempts ladder (`task-routing`) |
| PLANNER   | Planning, architecture, design, advanced debugging  | The shared facts and the record                         | Owned by the main agent              |
| MINUTEMAN | The reasoning record behind another lane's artifact | Writes only under `Detail/`; reads the producer's trace | Owned by the main agent              |

Route per `task-routing`: exploration is GLM at `low`; coding is GLM at `low` (mechanical) or `high`
(semantic); planning is the DeepSeek lane at `max`, run by the main agent or delegated to it, never
to the GLM tier.

The surfaces are the safety property: an explorer that returns a wrong lead costs a re-read, while
an explorer that edits a file costs a lost update, so the read-only surface is what makes cheap
exploration safe. Running the planner again does not fix a wrong plan; the main agent works the
decision out again from the evidence. The MINUTEMAN never edits the artifact that it describes,
because the record must describe the work rather than repair it.

The MINUTEMAN strain was added to the law on 21 October 2026, after the board demo's closed
vocabulary had already been written, so a board built before that date cannot render it; the lesson
is recorded in the board-triage note as `F-01`, and it shows why the strain must be chosen before
the artifact is produced rather than added afterwards.

## The rules

1. **The strain first.**

    The strain is picked before the model, because the question is "what kind of work is this?",
    then "which route?".

    Choosing the model first routes by habit.

2. **The override.**

    The user's override wins for the task it names.

    It does not become a new default.

3. **The self-contained spec.**

    Every spec is self-contained, because the child does not see this conversation.

    It gets the scope, the surface, the exclusions, the arbiter, the acceptance check, and the laws
    it must follow.

4. **The verification.**

    Every spec carries its verification: the arbiter command, the test cases with expected outputs,
    and the exact `ESCALATION:` instruction the parent greps for (the template is in
    `task-routing`).

5. **The disjointness.**

    Concurrency is earned by disjointness, because two lanes run together only when their file sets
    are provably disjoint.

    Every shared file is a potential lost update.

6. **The arbiter.**

    The orchestrator verifies by arbiters, not by prose.

    It reads the printed totals and runs only free, read-only checks itself.

    It does not execute the lane's work on feedback.

7. **The commit.**

    The commit command is `git gcommit`.

    A lane commits its own files only when its spec says so, the parent commits the integrations,
    and a lane that does not commit ends with READY-TO-COMMIT; the retired variants of the commit
    alias are never used.

8. **The record.**

    A producer never writes its own reasoning record, because one session cannot both produce a
    result and document how it reasoned without turning the record into a summary of a summary.

    Each CODER whose output matters is paired with a MINUTEMAN that runs after it, reads its trace,
    and writes the record; the pairing is in `references/reasoning-record.md`.

9. **The close.**

    A lane closes its own task before it ends, because a result without a state transition leaves
    that lane's own MINUTEMAN blocked on a dependency that is already satisfied.

    On 21 October 2026 a lane finished without closing and its reviewer's claim was rejected.

10. **The tool restriction.**

    Every spec states it: the lane uses only read, write, and edit, and it does not run bash, node,
    git, prettier, python, or any other command; the parent runs the verifiers.

## Size the scope before the delegation

The parent counts the files and the lines in the instructed scope before it writes the spec, because
a scope that is larger than one agent's context window has to be split before any lane starts.

The spec names the batch's file list, and the batch fits one agent.

When the scope is larger than one agent, the batches run as a waterfall: one lane finishes its list,
the parent passes the state and the next list to the next lane, and the next lane starts only after
the previous one stops.

Each file in the scope gets a decision, either changed or left alone with a named reason, and "it
has no numbered rows" is not a reason to skip a file when the task is a prose rewrite.

A partial pass is reported as partial with the exact remaining list, and the parent continues the
waterfall until the scope is covered or the user stops it.

## The delegation loop

1. **The request.**

    The parent receives the request, however fragmentary, and reads it once for the outcome rather
    than for the steps.

2. **The formalization.**

    The parent formalizes the scope, the surface, the exclusions, the sequence, the arbiter, and the
    acceptance check.

    The shared facts the child cannot look up are attached: the current counts, the ledger strings,
    the laws it must follow.

    Ambiguity resolves to the most faithful reading, stated in the spec.

3. **The strain.**

    The parent picks the strain, then the route per `task-routing`.

4. **The delegation.**

    The parent delegates to an active lane, or to an idle lane holding a retained spec
    (`idle-agent-protocol`).

5. **The own work.**

    The parent continues its own work, because the lane is NOT monitored.

    Its report arrives as a message, and a stall is handled when a report says so or when the user
    asks, never by waiting or by inspecting the lane's output.

    Failures are verified from the tree ONCE, before a re-dispatch.

    The full law is `orchestrator-batch` (no-blocking-wait).

6. **The verification.**

    The parent verifies the lane's printed arbiter results, plus its own read-only spot checks.

7. **The report.**

    The parent reports the per-item results, the printed arbiter result, the residuals, and the
    READY-TO-COMMIT list with a suggested message.

    The parent stages the integrations and runs `git gcommit`; the user commits when the spec says
    that the lane does not, and agents never push the work of another lane.

    The result of the delegation is the commit, the printed arbiter, and the residual decisions.

## The environment

- **You are never alone.** Other lanes may edit the same tree at the same time. Read the
  current-state block in your spec; check the tree before and during the work.
- **The tree moves.** The user commits mid-session, so HEAD can change under you. Never assume a
  clean tree or sole ownership.
- **Stay in scope.** Other lanes' surfaces are off-limits. Read before edit; coordinate through the
  report, never by fighting over a file region.
- **Surgical edits.** One logical change per edit call; the tool API only; the relevant arbiter
  passes after each touched file. Never leave the tree broken.

## Decision table

| Situation                                   | Action                                      |
| ------------------------------------------- | ------------------------------------------- |
| Task is a survey or scan                    | EXPLORER, GLM low, read-only spec           |
| Task is a mechanical sweep with a full spec | CODER, GLM low                              |
| Task needs naming or design judgment        | CODER, GLM high                             |
| Task decides architecture or a plan         | Main agent (DeepSeek max), not a GLM child  |
| The artifact needs a reasoning record       | Pair a MINUTEMAN; the coder never writes it |
| Two lanes touch the same file               | Serialize them; do not run concurrently     |
| A lane stalls                               | Nudge with its last verified checkpoint     |
| A lane fails                                | Verify the tree, then apply the ladder      |

## Verification

- Every delegation names a strain, a route, and an arbiter.
- Every concurrency decision cites the disjoint file sets.
- Every accepted result has printed arbiter output, not a prose claim.
- Each lane's task shows `completed` before its record lane is dispatched.
- The artifact has a paired record or a stated reason why it has none.
- The report ends with READY-TO-COMMIT and the residual decisions, or with the commit hash.

## Anti-patterns

| Mistake                               | Cost                                           | Do instead                      |
| ------------------------------------- | ---------------------------------------------- | ------------------------------- |
| Delegating the raw sentence           | The child inherits the ambiguity               | Formalize first                 |
| Picking the model before the strain   | Habit routing; no protocol attaches            | Strain first                    |
| Running lanes "probably disjoint"     | Lost updates, silent collisions                | Prove disjointness or serialize |
| Accepting "all tests pass"            | The tree may be broken                         | Read the printed totals         |
| A lane writing its own record         | The record becomes a summary of a summary      | Pair the lane with a MINUTEMAN  |
| Ending without closing the task       | The next lane blocks on a satisfied dependency | Close and then end              |
| Executing the lane's work on feedback | Duplicates the lane; breaks the role split     | Relay and verify read-only      |

## The pre-supplied spec

A lane that may not run commands cannot discover the compiler's strictness, so the spec supplies it.
On 2026-10-27 two consecutive builds failed on the same class of error - an indexed access that is
`T | undefined` under `noUncheckedIndexedAccess`, and a parameter whose type the caller did not
match - because the spec described the behavior and left the types to the lane's imagination.

The spec for a write-only lane carries, in addition to the six items: the strict flags the project
compiles with, the exact signature of every function the lane must match, the exact strings it must
emit, and the single arbiter command the parent will run. A lane that can run commands discovers all
four by building; a lane that cannot must be told.

The corollary is a limit on lane size: a write-only lane is worth one file that compiles, not ten
that might. Split at the point where a build would have caught the mistake.

## References

| File                             | Covers                                                         | Read when                   |
| -------------------------------- | -------------------------------------------------------------- | --------------------------- |
| `references/strains.md`          | Each strain's surfaces, protocol, and failure path             | Writing a spec for a strain |
| `references/reasoning-record.md` | The `Detail/` mirror, the pairing, the provenance, the coverage | An artifact needs a record |
| `references/delegation-loop.md`  | The seven stages in detail, with the formalization items       | Running a delegation        |
| `references/environment.md`      | Concurrency, tree state, scope, and edit discipline            | Working beside other lanes  |
