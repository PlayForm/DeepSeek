---
name: worker-strains
description:
    "The delegation methodology: the three worker strains (explorer, coder, planner), the
    strain-first selection rule, the formalized delegation loop, and the environment and scope
    discipline that every delegated lane follows."
whenToUse:
    Before any subagent delegation, workflow launch, or decision about who should do a task. Load it
    together with task-routing, which decides the model and effort.
version: 2.0.0
updated: 2026-10-20
---

# Worker Strains

The harness cultivates three worker strains. A strain is a cultivation site, not a label: choosing
it chooses the surfaces the agent may touch, the protocol it follows, and how its failures are
handled. The model and effort are a separate decision owned by `task-routing`.

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

1. **Pick the strain before the model.** The question is "what kind of work is this?", then "which
   route?". Choosing the model first routes by habit.
2. **The user's override wins for the task it names.** It does not become a new default.
3. **Every spec is self-contained.** The child does not see this conversation. It gets the scope,
   the surface, the exclusions, the arbiter, the report format, and the laws it must follow.
4. **Every spec carries its verification.** The build command, the test cases with expected outputs,
   and the exact `ESCALATION:` instruction (the template is in `task-routing`).
5. **Concurrency is earned by disjointness.** Two lanes run together only when their file sets are
   provably disjoint. Every shared file is a potential lost update.
6. **The orchestrator verifies by arbiters, not by prose.** Read the printed totals; run only free,
   read-only checks yourself. Do not execute the lane's work on feedback.
7. **The user commits.** Agents never commit; the report is READY-TO-COMMIT.

## The delegation loop

1. **Receive** the request, however fragmentary.
2. **Formalize** it: scope, surface, exclusions, sequence, arbiter, report format, shared facts.
   Ambiguity resolves to the most faithful reading, stated in the spec.
3. **Pick the strain**, then the route per `task-routing`.
4. **Delegate**: an active lane, or an idle lane holding a retained spec (`idle-agent-protocol`).
5. **Continue your own work**: the lane is NOT monitored. Its report arrives as a message; a stall
   is handled when a report says so or when the user asks, never by waiting or by inspecting the
   lane's output. Failures are verified from the tree ONCE, before a re-dispatch. The full law is
   `orchestrator-batch` (no-blocking-wait).
6. **Verify**: the lane's printed arbiter results, plus your own read-only spot checks.
7. **Report**: results, residuals, decisions for the user, and the READY-TO-COMMIT list.

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

## References

| File                            | Covers                                                   | Read when                   |
| ------------------------------- | -------------------------------------------------------- | --------------------------- |
| `references/strains.md`         | Each strain's surfaces, protocol, and failure path       | Writing a spec for a strain |
| `references/delegation-loop.md` | The seven stages in detail, with the formalization items | Running a delegation        |
| `references/environment.md`     | Concurrency, tree state, scope, and edit discipline      | Working beside other lanes  |
