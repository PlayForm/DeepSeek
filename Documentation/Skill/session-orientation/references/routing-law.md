# THE ROUTING LAW (Every Subagent = GLM-5.3-Flash / low)

> Source: SKILL.md, section 2 ("THE ROUTING LAW (non-negotiable)") and the
> loading order step 3. User-mandated; non-negotiable. Converted to the
> canonical skill structure on 2026-10-20.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

Every subagent delegation runs:

- provider: `cloudflare-workers-ai`
- model: `@cf/zai-org/glm-5.3-flash`
- reasoningEffort: `low`

No exceptions without the user's explicit instruction. The explicit triple is
ALWAYS passed - never rely on the child defaults. The `task-routing` skill
(repo copy first, see ./references/repo-skills-first.md) carries the full
policy; this line is the enforcement floor.

## Why: The Full Philosophy

1. **Omission is not neutrality - it is the expensive lane.** When a
   delegation omits the explicit triple, the child inherits or defaults to a
   route that is the expensive lane (e.g. a heavier model or a higher
   reasoning effort). "I didn't specify, so it used something reasonable"
   actually means "it used the most expensive reasonable thing." Passing the
   triple explicitly is the only way the route is what was intended.
2. **Uniform routing makes cost and behavior predictable.** When every
   subagent runs the same provider/model/effort, exploration costs are
   consistent, results are consistent across sessions, and any anomaly is
   attributable to the task rather than to a hidden route difference.
3. **Low effort is sufficient for the delegated lanes.** The routing policy
   (task-routing skill) assigns effort per lane; the floor here is `low`
   because the delegation lanes used at scale (exploration, routine coding
   passes) do not need higher effort - and higher effort multiplies cost
   across every subagent in a batch.
4. **"Non-negotiable" means no silent exceptions.** The only exception path
   is the user's explicit instruction, which creates a documented, one-off
   deviation. Anything else - "it seemed harder than usual", "the child
   defaults looked fine" - is a violation, not a judgment call.
5. **Enforcement floor vs. full policy.** This reference and the SKILL.md
   bullet are the floor: the minimum that must hold in every session. The
   full policy (lane assignments, escalation paths, failover rules) lives in
   the `task-routing` skill - and per the truth ordering, the repo's
   `Documentation/Skill/` copy of it is read first.

## Examples

### Good

- A delegation passes, explicitly:
  provider `cloudflare-workers-ai`, model `@cf/zai-org/glm-5.3-flash`,
  reasoningEffort `low` - even when the delegation feels trivial and the
  defaults "would probably be the same".
- A session needs a different route, asks the user, and proceeds only with
  the user's explicit instruction, recording the deviation.

### Bad

- A delegation omits provider/model/effort because "the configured child
  defaults are fine" - the child then inherits the parent's route (the
  expensive lane).
- A session escalates one subagent to a heavier model because the task
  "seemed hard" - without the user's explicit instruction, that is a
  violation of the floor.
- A session assumes the routing law from memory and passes only the model,
  omitting provider or effort - a partial triple is not the explicit triple.

## Exceptions

- The user's explicit instruction, and nothing else. An instruction like
  "use DeepSeek for this one" or "run this batch at high effort" is a
  documented one-off deviation; it does not amend the law for later
  delegations.

## Failure Modes

- Inherited-route drift: omitting the triple; the child silently runs the
  parent's expensive route. Cost multiplies across a batch, and no log line
  announces it.
- Partial-triple drift: passing model but not effort (or provider but not
  model); the unspecified fields default, which reintroduces the same
  inheritance problem one field at a time.
- Uninstructed escalation: raising effort or model tier without the user's
  explicit instruction "because the task deserves it". The floor admits no
  self-authorized exceptions.

## Arbiters

- Every delegation's parameters are visible in the transcript: provider,
  model, and reasoningEffort on every subagent call must read
  `cloudflare-workers-ai` / `@cf/zai-org/glm-5.3-flash` / `low`, unless a
  user instruction for that specific delegation is present in the session.
- Batch audits: in any batch of delegations, all entries must carry the
  explicit triple; a single defaulted entry is a violation, not a rounding
  error.
- The `task-routing` skill (repo copy first) is the full policy this floor
  enforces; discrepancies are resolved in favor of the stricter rule.
