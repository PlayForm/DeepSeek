# The PLANNER Strain

> Source: SKILL.md, section 1 (the strains table, PLANNER row) and
> section 5 (the cultivation sites, PLANNER bullet). Canonical skill
> structure: the mandate of 2026-10-20.
> This file carries the full philosophy; SKILL.md only points here.

## The Strain (the table row, exact)

| Field | Value |
|---|---|
| Strain | PLANNER |
| What it is for | planning, architecture, design, advanced debugging, the deepest reasoning |
| Model (exact) | @cf/deepseek-ai/deepseek-v4-flash-0731 |
| Effort | max |

## The Lane Rule (exact)

- The main agent itself runs this lane (the agent-default-model).
- Planning tasks are NEVER delegated to a GLM flash-tier model.

## Why: The Full Philosophy

1. **Planning is the highest-leverage token spend.** A plan is
   executed many times over - by the coders and explorers it directs.
   A wrong plan multiplies its error across every downstream lane.
   That is why the deepest reasoning (`max`) is spent HERE, once,
   rather than spread thin everywhere.
2. **The main agent runs the lane itself.** The agent-default-model IS
   the planner lane. Delegating it would put a wall between the
   planner and the orchestrator's context - the one agent that already
   holds the shared facts, the process record, and the user's intent.
   Planning in place keeps the context integral.
3. **Never delegate planning to a GLM flash-tier model.** A flash-tier
   model asked to architect produces a plausible-shaped plan with
   unpriced risks; the failure surfaces downstream as wasted coder
   runs, which cost more than the planner run ever would.
4. **The planner is the correction lane too.** It designs, corrects
   (via the spec-reconfiguration authority), and escalates. It is not
   a one-shot document generator; it owns the loop's intelligence.

## The Cultivation Site

- The PLANNER is cultivated with the shared facts (see
  ./references/shared-facts-monorepo.md) - a plan that contradicts the
  monorepo's truth (the smoke totals, the factory surface, the
  releases) is wrong by construction.
- It is cultivated with the process record
  (Documentation/Plans/ + Reports/) - plans land in the record so the
  state survives session switches.
- It is cultivated with the spec-reconfiguration authority (see
  ./references/spec-reconfiguration-authority.md) - the planner is the
  lane that re-formalizes specs as requirements change.
- It designs, corrects, and escalates - the three verbs of the lane.

## Examples

### Good

- An architecture question -> answered in place by the main agent on
  the agent default model at max, grounded in the shared facts.
- A plan that cites the smoke totals and the factory surface it builds
  on, and lands in Documentation/Plans/.

### Bad

- Delegating "design the module layout" to a glm-5.3-flash subagent.
- Planning without the shared facts - the plan invents totals, names,
  or versions that contradict the monorepo's truth.
- A plan that lives only in the chat and never reaches the process
  record.

## Exceptions

- The user's explicit override for the named task (for example, the
  user asks for a quick sketch at low effort - their call, scoped to
  the task).

## Failure Modes

- **Planning delegated to a flash-tier model:** plausible plans,
  unpriced risks; the cost reappears as repeated coder failures.
- **Plans detached from the shared facts:** invented totals or
  surfaces; downstream work builds on fiction.
- **Plans not recorded:** a session switch loses the plan; the next
  session re-plans from scratch.
- **The planner drifting into execution:** the main agent starts
  building instead of designing - this violates the orchestrator's
  non-execution law (see
  ./references/orchestrator-non-execution.md).

## Arbiters

- Every planning decision traces to the main agent (no planner
  delegation to a GLM flash-tier model anywhere in the transcript).
- Plans cite the shared facts they depend on and land in the process
  record.
- The routing check: @cf/deepseek-ai/deepseek-v4-flash-0731 + max for
  the lane; the delegation-level arbiter is
  ./references/explicit-routing-params.md.
