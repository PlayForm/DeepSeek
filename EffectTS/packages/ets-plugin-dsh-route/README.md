# @playform/plugin-dsh-route

> v0.1.0 - UNPUBLISHED - plan:
> [ROUTING-ENFORCER-PLUGIN](../../Documentation/Plans/ROUTING-ENFORCER-PLUGIN.md)

## The role

The routing-enforcer plugin: the **silent model-route policy enforcement** for the DeepSeek Harness.
The user owns the model configuration (his policy files); the plugin enforces it on every subagent
launch, model-independently - and the orchestrator is **not even bothered**.

Plan: `Documentation/Plans/ROUTING-ENFORCER-PLUGIN.md`.

## What it does

- **Silent resolution.** A launch that omits `provider`/`model`/ `reasoningEffort` is resolved per
  the user's policy and the resolved triple is injected into the launch (`subagent` tool,
  `tools/pre-execute` waterfall). No warning, no error, no reminder: the orchestrator's call
  succeeds exactly as if it had passed the right values.
- **Silent correction.** An explicit-but-wrong route (a model outside the allowed set, a route
  contradicting the task-type rules) is silently corrected per the policy and logged - never
  surfaced.
- **Task-type inference.** When the launch declares no role, the plugin derives it from the spec
  text through a documented keyword table (`explorer`: read-only/survey/research; `coder`:
  fix/implement/restructure; `planner`: design/plan/architecture). The user's policy is the final
  authority.
- **The routing hint (the launch seam).** The resolved lane travels into the child as the
  byte-stable line `[route: <taskType> <provider> <model> <effort>]`:
    - appended to the `subagent` tool's prompt at launch (`tools/pre-execute`), and
    - injected as one user message at a delegated child's first step (`agent/pre-step`), which is
      the only seam that reaches a child started straight through `ctx.subagents.startActivation`
      (the queue's spawn never passes through a tool). The seam is idempotent - a prompt that
      already carries a hint gets no second one.
- **Automatic escalation.** The attempts ladder's escalation rung (the planner lane, DeepSeek max,
  with the artifacts) is selected when the launch spec carries the delegation spec's
  `ESCALATION: <reason>` marker, at most once per chain, when the policy enables it. The rung's
  model is verified against the **live model catalog** - the same data `list_subagent_models` reads
  (`ctx.llm.listModels`): the planner row's model when advertised, else the first advertised model
  inside `allowedModels`, else the policy's rung.
- **The ledger.** Every resolved route is recorded as one line
  `route <taskType> <source> <provider> <model> <effort>` where `source` is
  `resolved | kept | corrected | escalated` - the audit log the user reads when he reviews his
  configuration. Every delivered hint is recorded as `hint <taskType> <provider> <model> <effort>`.

## The service

The plugin registers the `dshRoute` service (the factory's class/service pattern):

| Method                  | Meaning                                                                            |
| ----------------------- | ---------------------------------------------------------------------------------- |
| `Resolve(request)`      | The deterministic role resolution (pure; same request + same policy = same route). |
| `Classify(spec)`        | The keyword inference for one spec text (`undefined` = no match).                  |
| `Escalate(escalations)` | The escalation route, or `undefined` when the ladder is exhausted or disabled.     |
| `Policy`                | The policy view (the audit surface).                                               |

The subagent-queue plugin's dispatcher consumes `dshRoute` for the routed dispatch
(`SUBAGENT-QUEUE-PLUGIN.md` section 2.4).

## The configuration (all volatile)

| Field             | Default                                        | Meaning                                                                                                               |
| ----------------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `enabled`         | `false`                                        | Master switch (ships disabled; the IDLE-forever posture).                                                             |
| `log` / `logFile` | - / `~/.dsh/playform/ets-plugin-dsh-route.log` | The plugin's own ledger.                                                                                              |
| `defaultRole`     | `explorer`                                     | The role used when neither a declared type nor a keyword match exists (the cheap lane is the safe default).           |
| `policy`          | the task-routing table                         | `coder`/`explorer`/`planner` route triples, `allowedModels` (the three-model catalog), `escalation { enabled, max }`. |
| `keywords`        | the shipped table                              | The inference table; merged over the shipped defaults (user keywords add triggers).                                   |
| `automation`      | D6 defaults                                    | The per-action allowlist (the shared factory block; keyed `automation` - `policy` is the routing policy).             |

### The policy block (D6)

The config carries the shared per-action allowlist (`automation: Policy()`, composed from the
factory's block), mapped to `State.Allow`. The key is `automation`, **not** `policy`, because
`policy` is already this plugin's routing policy (a different contract):

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

The router reads and suggests - `read` and `suggest` are automatic; the write/commit/spawn verdicts
are declared for uniformity and stay the shipped `approve` (the router never takes them).

The block is one volatile object (a policy flip is hot-editable), and a resolved pack's `policy`
section overrides the defaults per action (the wiring is the next refinement). The defaults are
smoke-arbitrated in `Source/Test/Policy-Defaults`.

## The plan

The two halves of the launch seam are implemented and smoke-arbitrated
(`Source/Test/Launch-And-Hint`), together with the `ESCALATION:` marker and the catalog-verified
ladder. The plugin ships disabled. The remaining option (not this wave) is enforcing the route at
`agent/request` so a raw service spawn is CORRECTED, not only hinted - the queue already resolves
`dshRoute` before its spawn, so the routed dispatch is corrected at the source.

- [ROUTING-ENFORCER-PLUGIN](../../Documentation/Plans/ROUTING-ENFORCER-PLUGIN.md) - the routing
  policy.

## License

CC0-1.0.
