---
name: worker-strains
description:
    "The delegation methodology: the four worker strains (explorer, coder, planner, minuteman),
    strain-first selection rule, producer-never-records pairing, formalized delegation loop, and the
    environment and scope discipline every delegated lane follows."
whenToUse:
    Before any subagent delegation, workflow launch, or decision about who should do a task. Load
    with task-routing, which decides the model and effort.
version: 2.0.0
updated: 2026-10-20
---

# Worker Strains

The harness cultivates three worker strains.

A strain is a cultivation site, not a label: choosing it chooses the surfaces the agent may touch,
the protocol it follows, and how its failures are handled.

The model and effort are a separate decision owned by `task-routing`.

## When to use

- Before delegating any task to a subagent or a workflow phase.
- When writing the spec for a delegated lane.
- When deciding whether a lane may run concurrently with another.
- Do not use for: model choice (`task-routing`), the parent's queue mechanics
  (`orchestrator-batch`), or an idle child's contract (`idle-agent-protocol`).

## The strains

| Strain   | Work                                               | Surfaces                         | Failure handling                     |
| -------- | -------------------------------------------------- | -------------------------------- | ------------------------------------ |
| EXPLORER | Surveys, research, scans, archaeology              | Read-only; no writes             | Free downstream correction           |
| CODER    | Implementation, refactors, features, integration   | Write/edit tool API; its arbiter | The attempts ladder (`task-routing`) |
| PLANNER  | Planning, architecture, design, advanced debugging | The shared facts and the record  | Owned by the main agent              |

Route per `task-routing`: exploration is GLM at `low`; coding is GLM at `low` (mechanical) or `high`
(semantic); planning is the DeepSeek lane at `max`, run by the main agent or delegated to it, never
to the GLM tier.

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

    It gets the scope, the surface, the exclusions, the arbiter, the report format, and the laws it
    must follow.

4. **The verification.**

    Every spec carries its verification: the build command, the test cases with expected outputs,
    and the exact `ESCALATION:` instruction (the template is in `task-routing`).

5. **The disjointness.**

    Concurrency is earned by disjointness, because two lanes run together only when their file sets
    are provably disjoint.

    Every shared file is a potential lost update.

6. **The arbiter.**

    The orchestrator verifies by arbiters, not by prose.

    It reads the printed totals and runs only free, read-only checks itself.

    It does not execute the lane's work on feedback.

7. **The commit.**

    The user commits, so agents never commit and the report is READY-TO-COMMIT.

## The delegation loop

1. **The request.**

    The parent receives the request, however fragmentary.

2. **The formalization.**

    The parent formalizes the scope, the surface, the exclusions, the sequence, the arbiter, the
    report format, and the shared facts.

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

    The parent reports the results, the residuals, the decisions for the user, and the
    READY-TO-COMMIT list.

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

| Situation                                   | Action                                     |
| ------------------------------------------- | ------------------------------------------ |
| Task is a survey or scan                    | EXPLORER, GLM low, read-only spec          |
| Task is a mechanical sweep with a full spec | CODER, GLM low                             |
| Task needs naming or design judgment        | CODER, GLM high                            |
| Task decides architecture or a plan         | Main agent (DeepSeek max), not a GLM child |
| Two lanes touch the same file               | Serialize them; do not run concurrently    |
| A lane stalls                               | Nudge with its last verified checkpoint    |
| A lane fails                                | Verify the tree, then apply the ladder     |

## Verification

- Every delegation names a strain, a route, and an arbiter.
- Every concurrency decision cites the disjoint file sets.
- Every accepted result has printed arbiter output, not a prose claim.
- The report ends with READY-TO-COMMIT and the residual decisions.

## Anti-patterns

| Mistake                               | Cost                                       | Do instead                      |
| ------------------------------------- | ------------------------------------------ | ------------------------------- |
| Delegating the raw sentence           | The child inherits the ambiguity           | Formalize first                 |
| Picking the model before the strain   | Habit routing; no protocol attaches        | Strain first                    |
| Running lanes "probably disjoint"     | Lost updates, silent collisions            | Prove disjointness or serialize |
| Accepting "all tests pass"            | The tree may be broken                     | Read the printed totals         |
| Executing the lane's work on feedback | Duplicates the lane; breaks the role split | Relay and verify read-only      |

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

| File                            | Covers                                                   | Read when                   |
| ------------------------------- | -------------------------------------------------------- | --------------------------- |
| `references/strains.md`         | Each strain's surfaces, protocol, and failure path       | Writing a spec for a strain |
| `references/delegation-loop.md` | The seven stages in detail, with the formalization items | Running a delegation        |
| `references/environment.md`     | Concurrency, tree state, scope, and edit discipline      | Working beside other lanes  |
