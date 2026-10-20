# The Allowed Models - the Exact Set

> Source: SKILL.md, section 1 (the allowed-models paragraph after the
> strains table) and the non-negotiables rule 2. Canonical skill
> structure: the mandate of 2026-10-20.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule (exact)

Allowed models - exactly these two, never invent others:

| Model (exact string) | Lane |
|---|---|
| @cf/zai-org/glm-5.3-flash | EXPLORER (low); CODER (high / low-trivial) |
| @cf/deepseek-ai/deepseek-v4-flash-0731 | PLANNER (max); CODER escalation rung (max) |

- Provider: `cloudflare-workers-ai`.
- reasoning_effort values: `low` | `high` | `max` - exact strings.
- Never use a model outside the allowed set (non-negotiable 2).

## Why: The Full Philosophy

1. **The set is closed because the routing is auditable.** With two
   models and three effort strings, every launch in every transcript
   can be checked mechanically against the policy. An open set makes
   the routing unauditable - "which model did you use and why" becomes
   a story instead of a lookup.
2. **Invented models are usually inherited mistakes.** A model string
   that is not in the set almost always comes from a hallucinated
   name, a stale example, or a silent default - each worse than a
   policy violation because it is also a bug.
3. **Exact strings matter mechanically.** The provider resolves the
   model id literally; a near-miss string ("glm-5.3", "deepseek-v4")
   either fails at launch or resolves to something unintended. Copy
   the strings; never type them from memory.

## Examples

### Good

- provider: cloudflare-workers-ai, model: @cf/zai-org/glm-5.3-flash,
  reasoning_effort: low
- provider: cloudflare-workers-ai, model:
  @cf/deepseek-ai/deepseek-v4-flash-0731, reasoning_effort: max

### Bad

- model: glm-5.3-flash (missing the @cf/ prefix - not the exact
  string)
- model: deepseek-v4 (invented)
- reasoning_effort: medium (not in low | high | max)
- A third model "that might be better" - outside the set; rejected.

## Exceptions

- None. The set is closed. The only lever is the user's explicit
  override for the named task, and even that directs effort and strain
  choices within these two models unless the user names a model
  explicitly.

## Failure Modes

- **A typo'd model string:** a launch failure or an unintended
  resolution.
- **An invented effort string:** silently accepted or rejected - either
  way the route is off-policy.
- **The provider omitted:** the launch inherits or guesses the
  provider; see ./references/explicit-routing-params.md.

## Arbiters

- Every launch record carries provider + model + reasoning_effort, and
  all three match the set above, string-exact.
- A scan of the delegation notes finds no model string outside the
  two.
