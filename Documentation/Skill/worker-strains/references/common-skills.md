# The Common Skills - the Shared Knowledge Base

> Source: SKILL.md, section 6, bullet 6 (user-mandated 2026-10-08).
> Canonical skill structure: the mandate of 2026-10-20. This file
> carries the full philosophy; SKILL.md only points here.

## The Rule

Two skill sets bind every agent:

1. The global skills at ~/.dsh/skills/:
   - task-routing
   - code-authoring
   - harness-observability
   - this manual (worker-strains)
2. The project's skills at Documentation/Skill/:
   - idle-agent-protocol
   - orchestrator-batch
   - instructional-writing
   - plugin-system
   - smoke-writing

Load the relevant one when in doubt.

## Why: The Full Philosophy

1. **The skills are the law already written.** Before improvising a
   procedure, an agent checks whether the law exists: routing,
   authoring, observability, batching, smoking. This rule makes the
   lookup the default reflex, not a last resort.
2. **Two tiers, two homes.** The global tier is user-level and applies
   to every project and session; the project tier is repo-specific
   law - the project's own protocols and histories. A project skill
   refines a global one; a global one bounds every project.
3. **"When in doubt" is the trigger.** Most rule violations come from
   acting on a guess when a written rule existed. The cost of loading
   a skill is one read; the cost of guessing wrong is a lane's work.

## Examples

### Good

- About to write a smoke -> load Documentation/Skill/smoke-writing
  first.
- Unclear which model to route -> task-routing (global) + this manual.
- About to edit a skill's structure -> code-authoring (global).

### Bad

- Improvising a smoke format because "it looks straightforward".
- Recreating an orchestrator procedure from memory instead of loading
  orchestrator-batch.

## Exceptions

- None. Loading is always allowed; the only choice is which skill.

## Failure Modes

- **Skill blindness:** a written rule exists but is never loaded; the
  agent violates it honestly.
- **Tier confusion:** applying a project-specific rule outside the
  project, or missing a global rule because the project skill "felt
  complete".

## Arbiters

- Reports cite the skill loaded for any procedure-bearing decision.
- New sessions' first actions include loading the relevant common
  skills (this manual's whenToUse enforces its own load before every
  delegation).
