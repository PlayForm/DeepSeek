# The Operational Rules (Workflow Scripts, Pinned Roles, Anti-Overreach, Ties)

> Source: SKILL.md, section 8 "Operational rules", all four bullets.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

- The same routing applies inside `workflow` scripts: every `agent()`
  call passes `provider`/`model`/`reasoning_effort` explicitly per phase.
- `agent-loop` pinned roles (from the profile patch): `coder` ->
  glm-5.3-flash `high`, `explorer` -> glm-5.3-flash `low`, `planner` ->
  deepseek-v4-flash `max` (the deepseek lane; `deepseek-v4.1-flash-1017`
  is the lane's primary candidate and the pin moves to the winner of the
  2026-10-20 comparison). These match this policy.
- Do not "helpfully" escalate a task that succeeded. Do not re-run
  completed work. Do not use `max` to compensate for a vague prompt -
  fix the prompt instead.
- When in doubt about which lane a task belongs to: exploration ->
  `low`; anything that produces code -> coding ladder; anything that
  decides architecture/plans -> main agent (a deepseek model at `max`).

## Why: The Full Philosophy

1. **Workflow scripts are not exempt.** The non-negotiables bind every
   `subagent` call AND every workflow `agent()` call; inside a
   multi-phase workflow the explicit route is set per phase, because a
   workflow can legitimately mix lanes (an exploration phase at `low`
   feeding a coding phase per the ladder). Implicit routing inside a
   phase would hide lane changes from the audit trail.
2. **The pinned roles are the policy's mirror.** The `agent-loop`
   profile patch pins `coder` -> glm-5.3-flash `high`, `explorer` ->
   glm-5.3-flash `low`, `planner` -> a deepseek model at `max` (today
   `deepseek-v4-flash-0731`; the lane's primary candidate is
   `deepseek-v4.1-flash-1017`). These are
   not separate rules to remember; they are the routing table rows
   encoded as defaults. That is why the check "these match this policy"
   matters: if the patch and the table drift apart, one of them is
   wrong, and the table is the source of truth.
3. **Anti-overreach, three prohibitions.** Do not escalate a task that
   succeeded ("helpfully" re-running a fine result spends tokens and
   risks replacing a good artifact with a worse one). Do not re-run
   completed work (completed runs' artifacts persist; re-running is
   waste - the crash-recovery rule in ./references/non-negotiables.md
   says the same from the failure side). Do not use `max` to compensate
   for a vague prompt: effort is not a spec-repair tool; fix the prompt
   (a vague prompt routed to `max` produces confident expensive noise).
4. **The tie-breaker rule closes the classification gap.** When the
   lanes are unclear: exploration -> `low`; anything that produces code
   -> coding ladder; anything that decides architecture/plans -> main
   agent (a deepseek model at `max`). It resolves doubt into the three
   lanes of the routing table instead of inventing a fourth.

## Examples

### Good

- A workflow with phases "survey" (glm `low`), "implement" (glm `high`
  per the ladder), "plan review" (deepseek `max`) - each `agent()` call
  carries all three fields explicitly.
- A delegation prompt is vague -> the parent rewrites the prompt with a
  verification protocol (see ./references/spec-writing.md) instead of
  bumping effort to `max`.
- A task could be "exploration" or "coding" -> produces code, so it
  enters the coding ladder.

### Bad

- A workflow phase that omits `reasoning_effort` and inherits a default.
- Re-delegating an already-successful task "just to be sure".
- `max` "because the prompt is ambiguous" - the prohibition names this
  exact misuse.
- Inventing a "medium reasoning" lane for uncertain tasks - the
  tie-breaker maps doubt onto existing lanes only.

## Exceptions

- None to the four bullets. The user's override can direct a specific
  choice for a specific task; the standing policy is unchanged for
  everything else.

## Failure Modes

- **Workflow blind spots**: explicit routes on `subagent` calls but
  implicit ones inside `workflow` scripts. Cost: untraceable lane
  changes mid-run.
- **Patch/table drift**: editing the `agent-loop` pinned roles without
  reconciling them with this policy (or vice versa). Cost: defaults
  route differently from the documented policy, and nobody notices.
- **Compensatory escalation**: `max` as a substitute for a clear spec.
  Cost: expensive noise and the vague prompt survives to fail again.
- **Doubt paralysis or lane invention**: neither escalating the tie-break
  nor inventing lanes. Cost: stalled or mispriced delegations.

## Arbiters

- Workflow audit: every `agent()` call site shows the three explicit
  fields; a call site without them is a violation (same rule as
  ./references/non-negotiables.md).
- Config check: the `agent-loop` pinned roles in the profile patch are
  compared against this file's role list; a mismatch is a policy bug to
  reconcile with the routing table as the source of truth.
- Behavior review: escalations and re-runs must trace to a failure
  signal (./references/failure-signals.md); any without one is
  overreach.
