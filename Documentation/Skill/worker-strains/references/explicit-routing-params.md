# Explicit Routing Parameters - Non-Negotiable 1

> Source: SKILL.md, the non-negotiables rule 1 and section 7 (THE
> ROUTING is the law). Mandates: the original rule and the 2026-10-09
> re-statement. Canonical skill structure: the mandate of 2026-10-20.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

1. ALWAYS pass `provider`, `model`, and `reasoning_effort` EXPLICITLY
   on every subagent call and every workflow `agent()` call.
2. NEVER rely on child defaults, inheritance, or "the configured
   default".
3. The parent-inherited default silently resolves to the planner lane
   and wastes tokens - a MEASURED policy violation.
4. (The 2026-10-09 re-statement.) THE ROUTING is the law: every launch
   passes provider/model/effort EXPLICITLY. The omission inherits the
   parent route - the DeepSeek - and that is a violation.
5. The routing-enforcer plugin automates this silently later; until it
   covers a surface, the discipline is manual.

## Why: The Full Philosophy

1. **Silence is not neutrality - it is the most expensive route.** The
   inherited default is the planner lane (DeepSeek max). An exploration
   that "just worked" without parameters may have burned planner-price
   tokens on a survey. This violation was MEASURED, not feared - which
   is why it is non-negotiable 1.
2. **Explicitness makes the route a decision.** Writing the three
   parameters forces the strain question to be answered. The act of
   typing `reasoning_effort: low` is the moment the routing policy is
   applied.
3. **Defaults are invisible in the transcript.** An explicit route is
   auditable line by line; an inherited one leaves no trace of a
   decision (because there was none) - the audit cannot distinguish
   intent from accident.
4. **Both surfaces are covered.** The rule names the subagent tool AND
   every `agent()` call inside a workflow script: a workflow that
   loops over thirty items multiplies the error thirty times.

## Examples

### Good

- subagent(..., provider: "cloudflare-workers-ai", model:
  "@cf/zai-org/glm-5.3-flash", reasoning_effort: "low")
- Inside a workflow: every agent(prompt, { provider, model,
  reasoning_effort }) call carries all three parameters.

### Bad

- subagent(..., prompt) with no route - it inherits the parent's
  DeepSeek route.
- "The child defaults are fine for this one" - never.
- A workflow helper that sets provider and model but omits the effort.

## Exceptions

- None. The rule has no exception; the user's override changes WHAT is
  passed, never WHETHER it is passed.

## Failure Modes

- **The silent planner burn:** many small delegations all inheriting
  max. Cost: the measured violation - tokens at planner price for
  explorer work.
- **Partial explicitness:** provider and model set, the effort omitted
  - the effort default is then unpredictable per surface.
- **Workflow mass-inheritance:** one unset parameter inside a loop
  becomes N off-policy launches.

## Arbiters

- Every subagent and agent() call in the transcript shows all three
  parameters, string-exact (the set itself is defined in
  ./references/allowed-models.md).
- The 2026-10-09 law: any launch missing a parameter is a violation by
  inspection - no evidence-gathering needed.
- The routing-enforcer plugin, once active on a surface, enforces this
  automatically and silently.
