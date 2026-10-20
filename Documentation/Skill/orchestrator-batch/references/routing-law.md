# The Routing Law (Non-Negotiable)

> Source: SKILL.md, "The session-resume protocol", step 3 (THE ROUTING
> NON-NEGOTIABLE - the slip lesson + the user's amendment, binding) and
> "THE FORMALIZED ORCHESTRATION MODEL", point 10 (THE ROUTING). User's
> amendment 2026-10-09. Mandate date: 2026-10-20 (canonical restructure).
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

EVERY subagent launch passes:

```
provider      = cloudflare-workers-ai
model         = @cf/zai-org/glm-5.3-flash
reasoningEffort = low
```

- This is the coder route, ALWAYS, no exceptions.
- The user's amendment (2026-10-09): "the agents you're launching must
  always be coder glm 5.3 low - always". The DeepSeek-max planning clause
  is RETIRED - the planning lanes also run GLM flash low.
- The OMISSION inherits the parent route - an omission IS the violation.
  It slipped once; the cost was sunk.
- The routing-enforcer plugin (Documentation/Plans/ROUTING-ENFORCER-PLUGIN.md)
  will automate this silently - until then, the explicit routing is the law.
- (Model point 10:) the DeepSeek-high coder route applies ONLY when the
  user names it explicitly.

## Why: The Full Philosophy

1. **Why explicit routing beats defaults:** an omitted provider/model field
   does not produce an error - it silently inherits the parent's route.
   The result LOOKS successful while running the wrong model at the wrong
   effort: slower, costlier, and inconsistent with the batch's uniform
   behavior. Silence is the failure mode, which is why the law treats
   omission as violation.
2. **Why uniform low-effort GLM flash:** the batch's lanes are execution
   lanes with self-contained specs (see delegate-active-or-idle.md). The
   intelligence lives in the spec, not in the lane's improvisation; low
   effort keeps lanes fast, cheap, and focused. The API-limit economics
   reinforce it: higher effort at batch scale multiplies throttling (see
   the-two-active-regime.md).
3. **Why the planning clause was retired (2026-10-09):** the original
   design allowed DeepSeek-max for planning lanes. The user's experience
   showed the distinction added a decision point (and thus an omission
   risk) without adding value - planning quality comes from the formalized
   brief and the self-contained spec. The retirement makes the rule
   one-line simple: always GLM flash low.
4. **Why the enforcer plugin is the end state:** a law enforced by memory
   fails at human/agent fatigue - the slip happened once already. The
   plugin makes the correct route the path of least resistance (silent
   enforcement); until it ships, the discipline is explicit fields on
   every launch.

## Examples

### Good

- Launch call carries all three fields explicitly:
  provider=cloudflare-workers-ai, model=@cf/zai-org/glm-5.3-flash,
  reasoningEffort=low - for a coding lane, a planning lane, a doc lane,
  every lane.
- The user says "use DeepSeek high for this one" - the explicit naming
  switches that one launch to the high route.

### Bad

- A launch with only a prompt, relying on "it should default correctly" -
  the omission inherits the parent route and IS the violation.
- Keeping a "planning lane gets DeepSeek-max" habit after the 2026-10-09
  retirement.
- Setting effort high "to be safe" without the user naming it.

## Exceptions

- The single exception: the user explicitly names the route for a specific
  launch ("DeepSeek high for this one") - the user's explicit instruction
  overrides the standing law for that launch. It must be explicit; silence
  never qualifies.
- The routing-enforcer plugin, once active, automates the default - but
  until then no automation exists to rely on.

## Failure Modes

- The slip: one omitted launch inherited the parent route - the cost was
  sunk (the lane ran on the wrong route); the lesson is that omission is
  invisible at launch time and visible only in the bill/behavior.
- Route drift within a batch: some lanes explicit, some omitted - the
  batch becomes non-uniform and reports/behavior diverge.
- Reviving the retired planning clause: re-introduces a decision point and
  the omission risk that came with it.

## Arbiters

- Every launch record must show the three routing fields explicitly; a
  launch record without them is a violation.
- Batch audits: check the launch calls (or the enforcer plugin's log, once
  shipped) for the uniform route across all lanes.
- The enforcer plugin plan lives in Documentation/Plans/ROUTING-ENFORCER-PLUGIN.md;
  its presence is tracked there, its absence means the explicit law rules.
