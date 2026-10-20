# The Policy Scope (Single Source of Truth)

> Source: SKILL.md, title section, intro paragraph. Mandate derived from
> 27 benchmark runs, 3 rounds, 2026-10.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

This skill (the SKILL.md plus every file under `references/`) is the
single source of truth for how this harness spends tokens on delegation.
Every agent - parent, child, or workflow phase - MUST follow it. The
policy was derived from 27 benchmark runs across 3 rounds (2026-10), all
independently adjudicated. Deviating without a user instruction is a
policy violation.

## Why: The Full Philosophy

1. **One policy, one place.** Before this policy existed, each
   conversation picked models ad hoc, and the choice depended on who
   wrote the delegation prompt that day. A single written policy makes
   the spend auditable: any future run can be checked against these
   tables, and any deviation is visible.
2. **The derivation is evidence-based, not taste.** The routing table
   was not invented; it fell out of 27 benchmark runs across 3 rounds
   (2026-10), each independently adjudicated (see
   ./references/benchmark-evidence.md). That is why the numbers
   (cost multipliers, hallucination counts, the 6.4x and 5.8x findings)
   are quoted in the references - they are the load-bearing facts.
3. **"Every agent" includes the children.** A parent that routes itself
   correctly but lets a child delegate with defaults has not applied the
   policy. The obligation propagates: parent, child, workflow phase.
4. **Deviating without a user instruction is a violation, not a
   judgment call.** The user's explicit override is the only escape
   hatch (see ./references/non-negotiables.md, rule 3). "It felt
   important" is not an override; the exploration protocol has exactly
   one built-in exception and it is narrow (see
   ./references/exploration-protocol.md).

## Examples

### Good

- Parent delegates a repo survey: `provider: cloudflare-workers-ai`,
  `model: @cf/zai-org/glm-5.3-flash`, `reasoning_effort: low` - exactly
  per the routing table.
- A child agent, before spawning its own grandchild, reads this skill
  first and routes per the tables.
- The user says "use the biggest model for this one"; the parent uses
  the override for that task and quotes it as the justification.

### Bad

- "This survey looks tricky, I'll use `max` to be safe" - no built-in
  exception allows it; the adjudication protocol is what makes `low`
  safe.
- A workflow phase omits `reasoning_effort` and inherits a default -
  the non-negotiables forbid implicit routing.
- A parent reuses last week's remembered model list instead of the
  catalog in ./references/model-catalog.md.

## Exceptions

- The user's explicit instruction overrides the policy for the task it
  names (and nothing beyond it). This is the only standing exception.
- Documented in-skill exceptions: the single exploration re-run at
  `high` (exploration-protocol) and explicit-user-request coding `max`
  (routing table). Both are policy-internal, not deviations.

## Failure Modes

- **Policy drift by memory**: an agent "remembers" the policy wrong
  (e.g. routing planning to GLM). Cost: planning quality collapse; the
  fix is to read the routing table, not recall it.
- **Scope creep of exceptions**: one "just this once" becomes a habit.
  Cost: the benchmark economics (./references/benchmark-evidence.md)
  stop applying and spend balloons.
- **Silent inheritance**: omitting explicit route fields so children run
  on defaults that do not match the policy. Cost: untraceable routing.

## Arbiters

- Any session that delegates can be checked after the fact: each
  subagent's session log records the model and effort actually used
  (path and fields in ./references/adjudication-protocol.md).
- Cross-check: `agent-loop` pinned roles must equal this policy (see
  ./references/operational-rules.md); a mismatch is a policy bug.
