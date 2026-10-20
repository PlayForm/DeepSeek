# The Three Strains - the Strain-First Selection Rule

> Source: SKILL.md, the opening paragraph (before section 1) and the
> non-negotiables rule 3 (the user's override). Canonical skill
> structure: the mandate of 2026-10-20.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

1. This harness cultivates THREE worker strains: EXPLORER, CODER,
   PLANNER.
2. Every delegation picks a strain FIRST; the model and the reasoning
   effort follow from the strain per the task-routing policy.
3. The full routing policy lives in the task-routing skill - load BOTH
   skills (this manual and task-routing) before delegating.
4. The strains are the cultivation sites: each has its own operating
   conditions, its own protocols, and its own failure handling.
5. The user's explicit override always wins - for the task it names.

## Why: The Full Philosophy

1. **A strain is a cultivation site, not a label.** Picking the strain
   picks three things at once: the environment the agent runs in
   (read-only surfaces for the EXPLORER, arbiter-bound implementation
   for the CODER, the shared-facts design lane for the PLANNER), the
   protocols that bind it (the report format, never-commit, the
   escalation marker), and the failure handling (the attempts ladder
   for the CODER, the free downstream correction for the EXPLORER).
   Naming the strain names all three.
2. **Strain-first blocks route drift.** If the model is chosen before
   the strain, the choice comes from habit - the default route, the
   last route used - not from the task. Strain-first forces the
   question "what kind of work is this?" before "which model and
   effort?".
3. **The routing law lives in one home.** The strain table in this
   skill is the per-strain summary of the route; the task-routing
   skill is the law itself (failovers, escalation triggers, the
   exploration-always-low default). Two skills, no contradiction: the
   table defers to the law.
4. **The override is scoped, not global.** The strains encode the
   harness's default judgment on how to spend tokens and attention.
   The user may override that judgment for the task they name (for
   example: "run this exploration at high", "use the planner for
   this"). The override wins for that task; it does not rewrite the
   skill, and the next unnamed delegation returns to the strain
   defaults.

## Examples

### Good

- "Read-only survey - EXPLORER strain, @cf/zai-org/glm-5.3-flash,
  low."
- "The user explicitly asked for a high-effort exploration here -
  EXPLORER with reasoning_effort high; their override wins for this
  task, quoted in the delegation note."
- "Planning task - the PLANNER lane; the main agent runs it itself on
  the agent default model; nothing is delegated."

### Bad

- Picking the model first ("I always route glm low") and noticing only
  afterwards that the task was planning.
- Treating a one-task override as a permanent configuration change
  ("the user once asked for high, so exploration runs high now").
- Delegating by habit without naming a strain - no cultivation rules,
  no protocols, no failure handling attach to the run.

## Exceptions

- The user's explicit override (rule 5) wins for the task it names;
  the strain defaults resume for every other task.

## Failure Modes

- **Strain skipped:** the delegation carries a model but no strain -
  no cultivation rules, no protocols, no failure handling. The agent
  flails; the orchestrator cannot predict its behavior.
- **Override creep:** a one-task override quietly becomes the new
  default; the routing policy erodes round by round.
- **Policy split-brain:** citing the strain table against the
  task-routing skill when they appear to disagree. The arbiter: the
  task-routing skill is the law; the strain table is its per-strain
  view.

## Arbiters

- Every delegation note names the strain before the model and effort.
- The user's override, when used, is quoted verbatim and scoped to the
  named task.
- A non-default route is cross-checked against the task-routing skill
  before launch.
