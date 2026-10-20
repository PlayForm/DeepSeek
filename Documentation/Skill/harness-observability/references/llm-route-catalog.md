# The LLM Route Catalog (list_subagent_models)

> Source: SKILL.md, section 3, rule 2. Documented from the live harness, 2026-10-08.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

list_subagent_models discovers the delegation routes without changing the
current Agent:

- no arguments - the registered LLM providers;
- provider - that provider's advertised models;
- provider and model - that exact model and its reasoning efforts.

This harness's catalog: the cloudflare-workers-ai provider with exactly three
models - @cf/zai-org/glm-5.3-flash,
@cf/deepseek-ai/deepseek-v4-flash-0731 and
@cf/deepseek-ai/deepseek-v4.1-flash-1017 (added 2026-10-20; the deepseek
lane's primary candidate, cheaper than 0731 on every axis).

The routing POLICY - which strain gets which model at which effort - lives in
the task-routing and worker-strains skills; load BOTH before delegating.

The binding law: ALWAYS pass provider, model, and reasoning_effort explicitly
on every delegation call. Catalog membership is advisory: an adapter may
accept an unlisted model id - which is exactly why the explicitly passed
route, not the default, is the contract.

## Why: The Full Philosophy

1. **Omission is inheritance, and inheritance is invisible.** When
   provider/model/effort are omitted, the delegation inherits the parent
   route (or the configured child defaults) silently. The caller never sees
   which route fired; the first symptom is a wrong cost, a wrong latency, or
   a wrong quality class. See ./references/honest-limits.md - the
   role-routing internals are explicitly NOT observable.
2. **The catalog says what exists; the policy says what to use.** The
   catalog is inventory: three models on one provider, with the efforts each
   advertises. The policy is a decision: exploration always GLM-5.3-Flash at
   low, coding GLM-5.3-Flash low then high, planning and advanced tasks
   the deepseek lane at max (deepseek-v4.1-flash-1017 primary,
   deepseek-v4-flash-0731 fallback), escalation on explicit ESCALATION
   markers or verification failures. Confusing the two produces arguments
   like "the catalog has only one provider, so the default is fine" - which
   ignores the effort half of the contract entirely.
3. **Advisory membership is a trap as much as a freedom.** Because an
   adapter may accept an unlisted id, "it was accepted" proves nothing about
   correctness. The explicit pass is the only evidence of intent.
4. **The catalog can be listed without side effects.** Calling
   list_subagent_models changes nothing - it exists precisely so a
   delegation can be prepared with verified ids instead of remembered ones.

## Examples

### Good

- Before delegating: list_subagent_models (no args) to confirm the provider,
  then pass provider: cloudflare-workers-ai, model:
  @cf/zai-org/glm-5.3-flash, reasoning_effort: low on an explorer run.
- An unfamiliar provider named in a task: list its advertised models first,
  then pass the exact ids returned.

### Bad

- Omitting the route because "the default is probably right" - the child
  silently inherits the parent's route and effort.
- Citing the catalog as justification for a routing choice - the catalog is
  inventory; the task-routing skill is the decision.
- Inventing a model id not returned by the list and hoping the adapter
  accepts it.

## Exceptions

- An unlisted model id may still be accepted by an adapter (advisory
  membership). The exception covers the catalog's completeness, never the
  explicit-pass law: the accepted id must still be passed explicitly, with
  the user's awareness when it deviates from the policy.

## Failure Modes

- A delegation lands on the parent's route at the parent's effort: wrong
  cost and quality, silently - this is the exact failure the always-explicit
  rule exists to prevent.
- Treating catalog membership as a guarantee: an accepted-but-unlisted id
  behaves as written, not as hoped.
- Delegating without loading task-routing + worker-strains: the strain
  methodology and the effort mapping are skipped, and the effort argument
  defaults to whatever inheritance provides.

## Arbiters

- list_subagent_models is the arbiter of what routes exist (providers,
  models, advertised efforts).
- The task-routing skill is the arbiter of which route a task takes; the
  worker-strains skill is the arbiter of the strain methodology.
- The delegation call itself is the arbiter of compliance: the
  provider/model/reasoning_effort fields present or absent is the whole
  audit.
