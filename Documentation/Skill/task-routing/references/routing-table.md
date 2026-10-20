# The Routing Table (The Complete Policy)

> Source: SKILL.md, section 2 "Routing table" (amended 2026-10-20 with
> the difficulty-first principle) and its closing paragraph about the
> main agent's own lane. The classification philosophy lives in
> ./references/difficulty-first.md.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

THE DIFFICULTY-FIRST PRINCIPLE (user-mandated 2026-10-20, binding): the
effort is INFERRED FROM THE TASK'S ACTUAL DIFFICULTY - absorb the
request, infer the operation's complexity, and derive the model + effort
from that inference. NEVER assume "coding => high" or vice versa (full
derivation and the mechanical/semantic classification:
./references/difficulty-first.md).

The routing table below is the complete policy. Every delegation maps to
exactly one row; the model id and reasoning_effort are copied verbatim.

| Task type                                                                        | Model (exact ID)                         | reasoning_effort                      |
| -------------------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------- |
| Exploration - ANY exploration, ALWAYS                                            | `@cf/zai-org/glm-5.3-flash`              | `low`                                 |
| Coding - trivial, well-specified (spec is complete, no ambiguity) - incl. ALL MECHANICAL lookup-and-replace / rename / pattern-conversion sweeps, EVEN multi-file, with the guarded exceptions list | `@cf/zai-org/glm-5.3-flash`              | `low`                                 |
| Coding - routine / typical (any SEMANTIC feature, refactor, multi-file, integration; naming judgment; authored prose) | `@cf/zai-org/glm-5.3-flash`              | `high`                                |
| Coding - exhaustive verification                                                 | `@cf/zai-org/glm-5.3-flash`              | `max` - ONLY on explicit user request |
| Planning, architecture, design, advanced debugging                               | `@cf/deepseek-ai/deepseek-v4.1-flash-1017` | `max`                                 |
| Deepest reasoning (the ceiling - there is no model above this lane)              | `@cf/deepseek-ai/deepseek-v4.1-flash-1017` | `max`                                 |

> The DeepSeek lane (the two bottom rows) accepts either deepseek id at
> `max`: `deepseek-v4.1-flash-1017` (primary, added 2026-10-20 - cheaper
> than 0731 on every axis) or `deepseek-v4-flash-0731` (fallback).
> The main agent itself runs `deepseek-v4-flash-0731` at `max`
> (`agent-default-model`) - that IS the planning/advanced lane; round 1
> of the 2026-10-20 v4-vs-v4.1 comparison keeps 0731, round 2 flips the
> default to `deepseek-v4.1-flash-1017`, and the comparison's outcome
> settles the primary/fallback order. Planning tasks must never be
> delegated to a GLM flash-tier model.

## Why: The Full Philosophy

1. **The table is total.** There is no row missing and no row optional:
   exploration (any, always), three coding tiers (trivial, routine,
   exhaustive), and the planning/ceiling lane. If a task seems to fit no
   row, the "when in doubt" rule in ./references/operational-rules.md
   resolves it: exploration -> `low`; produces code -> coding ladder;
   decides architecture/plans -> main agent.
2. **The trivial row absorbed mechanical sweeps (2026-10-20 amendment).**
   The trivial row is defined structurally: spec complete, no ambiguity -
   and it explicitly includes ALL MECHANICAL lookup-and-replace /
   rename / pattern-conversion sweeps, EVEN multi-file, when they come
   with the guarded exceptions list. The point: mechanical operations are
   deterministic and the arbiters verify them for free, so file count
   does not raise the effort. The semantic row covers naming judgment,
   authored prose, design decisions, ambiguous refactors - work where
   the judgment is real.
3. **Exploration is pinned to `low` unconditionally.** The ALL-CAPS
   ALWAYS is deliberate: no importance or stakes argument moves it. The
   reason is economic and empirical - see ./references/exploration-
   protocol.md and ./references/benchmark-evidence.md; the adjudication
   protocol is what makes this safe.
4. **Coding splits by the operation's difficulty, not by the task's
   label or size.** Per the difficulty-first principle, the effort is
   inferred from what the operation actually demands: mechanical ->
   trivial row (`low`), semantic -> routine row (`high`). "Trivial" and
   "routine" are classifications made by inference, not keywords.
5. **Coding `max` is gated behind the user.** Exhaustive verification at
   `max` exists in the table but only on an explicit user request - it is
   not a self-service option, because coding `max` measured 6.4x `low`
   for identical correctness (./references/benchmark-evidence.md).
6. **The ceiling is explicit.** The DeepSeek lane at `max` is the top
   of the system; there is no model above it, so no task is "too hard to
   route". The two bottom rows are the same lane on purpose: planning
   and deepest reasoning are the same lane. The lane's primary is now
   `deepseek-v4.1-flash-1017` (2026-10-20), with `deepseek-v4-flash-0731`
   as the fallback until the comparison settles the order.
7. **The main agent's own model is part of the table.** Because the main
   agent runs `agent-default-model` = `deepseek-v4-flash-0731` at `max`
   (round 1 of the 2026-10-20 comparison; round 2 flips it to
   `deepseek-v4.1-flash-1017`),
   planning and architecture decisions should be made (or at least owned)
   by the main agent itself; delegating them to a GLM flash-tier model
   downgrades exactly the lane that model was chosen for.

## Examples

### Good

- "Survey the repo for all TODO comments" -> exploration row:
  glm-5.3-flash, `low`.
- "Fix this typo in a single config line" -> trivial coding row:
  glm-5.3-flash, `low`.
- "Rename `getX` to `fetchX` across 40 files per a complete spec with a
  guarded exceptions list" -> trivial row (MECHANICAL, even multi-file):
  glm-5.3-flash, `low`.
- "Add a rate limiter across three modules" -> routine coding row
  (SEMANTIC): glm-5.3-flash, `high`.
- "Author the design doc's philosophy section" -> routine row (SEMANTIC
  authoring): glm-5.3-flash, `high`.
- "Redesign the plugin event bus" -> planning row: main agent (or a
  deepseek-v4-flash `max` delegate), never GLM.
- User says "run the exhaustive check at max effort" -> exhaustive
  verification row, permitted because the user asked.

### Bad

- Routing a repo survey to deepseek at `max` "because the findings
  matter" - exploration is ALWAYS glm `low`; stakes do not move it.
- Calling a multi-file MECHANICAL sweep "routine" to justify `high` -
  the trivial row explicitly covers mechanical sweeps even multi-file.
- Calling a semantic task (naming judgment, authored prose) "trivial"
  because it is small - classification is by operation difficulty.
- Self-authorizing coding `max` without an explicit user request.
- Delegating an architecture plan to glm-5.3-flash at any effort -
  planning must never land on the GLM flash tier.

## Exceptions

- Coding `max`: ONLY on explicit user request (in the table itself).
- The user's override (non-negotiable 3) can move any single task.
- The one exploration re-run at `high` when a survey comes back unusably
  thin (./references/exploration-protocol.md) - it changes effort, not
  model, and is capped at one re-run, never `max`.
- The mechanical classification of the trivial row requires its
  precondition: complete spec + guarded exceptions list. Without it, a
  multi-file edit falls to the routine row (see
  ./references/difficulty-first.md).

## Failure Modes

- **Category reflex**: assuming "coding => high" (or "multi-file =>
  high") instead of inferring difficulty - the exact prohibition of the
  difficulty-first principle. Cost: mechanical sweeps pay 1.5-3x for no
  correctness gain; occasionally the inverse under-routes semantic work.
- **Lane confusion**: sending planning to GLM (quality loss) or
  exploration to deepseek (5.8x cost for identical correctness).
- **Row invention**: creating a "sensitive exploration" row that does
  not exist. The table is closed; new rows require a policy change, not
  a judgment call.

## Arbiters

- Each subagent's session log records the model and effort actually
  used; the parent audits them against this table (method in
  ./references/adjudication-protocol.md).
- Classification arbiter: every coding delegation shows its difficulty
  inference (mechanical with spec + guarded exceptions list, or
  semantic); keyword reflexes are detectable in the delegation prompt.
- Cross-check: the `agent-loop` pinned roles (coder/explorer/planner)
  must equal the corresponding rows of this table (see
  ./references/operational-rules.md).
