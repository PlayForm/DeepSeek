# @playform/plugin-dsh-route

> v0.3.0 - UNPUBLISHED - plan:
> [ROUTING-ENFORCER-PLUGIN](../../Documentation/Plans/ROUTING-ENFORCER-PLUGIN.md)

## The role

The routing-enforcer plugin supplies the silent enforcement of the model-route policy for the
DeepSeek Harness.

The user owns the model configuration in his policy files.

The plugin applies that configuration to each subagent launch, independently of the model, and the
orchestrator does not see the work.

Plan: `Documentation/Plans/ROUTING-ENFORCER-PLUGIN.md`.

## What it does

- **Silent resolution.**

    A launch that omits `provider`/`model`/ `reasoningEffort` gets a route from the user's policy,
    and the plugin puts the resolved triple into the launch (`subagent` tool, `tools/pre-execute`
    waterfall).

    The call gives no warning, no error, and no reminder: the orchestrator's call succeeds as if it
    had passed the correct values.

- **Silent correction.**

    The plugin corrects an explicit but wrong route - a model outside the allowed set, or a route
    that contradicts the task-type rules - per the policy, and it logs the correction and never
    shows it.

- **Task-type inference.**

    When the launch declares no role, the plugin derives the role from the spec text through a
    documented keyword table (`explorer`: read-only/survey/research; `coder`:
    fix/implement/restructure; `planner`: design/plan/architecture).

    The user's policy is the final authority.

- **The routing hint (the launch seam).**

    The resolved lane travels into the child as the byte-stable line
    `[route: <taskType> <provider> <model> <effort>]`.

    - **Prompt append.**

        The plugin appends the line to the `subagent` tool's prompt at launch (`tools/pre-execute`).

    - **First-step message.**

        The plugin injects the line as one user message at the first step of a delegated child
        (`agent/pre-step`), the only seam that reaches a child started straight through
        `ctx.subagents.startActivation` (the queue's spawn never passes through a tool).

        The seam is idempotent: a prompt that already carries a hint gets no second hint.

- **Automatic escalation.**

    The plugin selects the escalation rung of the attempts ladder (the planner lane, DeepSeek max,
    with the artifacts) when the launch spec carries the `ESCALATION: <reason>` marker of the
    delegation spec, at most once per chain, when the policy enables it.

    The plugin checks the rung's model against the **live model catalog** - the same data that
    `list_subagent_models` reads (`ctx.llm.listModels`): the model of the planner row when the
    catalog advertises it, else the first advertised model inside `allowedModels`, else the policy's
    rung.

- **The ledger.**

    The plugin records each resolved route as one line
    `route <taskType> <source> <provider> <model> <effort>`, where `source` is
    `resolved | kept | corrected | escalated` - the audit log the user reads when he reviews his
    configuration.

    The plugin records each delivered hint as `hint <taskType> <provider> <model> <effort>`.

## The service

The plugin registers the `dshRoute` service (the factory's class/service pattern):

| Method                  | Meaning                                                                            |
| ----------------------- | ---------------------------------------------------------------------------------- |
| `Resolve(request)`      | The deterministic role resolution (pure; same request + same policy = same route). |
| `Classify(spec)`        | The keyword inference for one spec text (`undefined` = no match).                  |
| `Escalate(escalations)` | The escalation route, or `undefined` when the ladder is exhausted or disabled.     |
| `Policy`                | The policy view (the audit surface).                                               |

The dispatcher of the subagent-queue plugin uses `dshRoute` for the routed dispatch
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
factory's block) and maps it to `State.Allow`.

The key is `automation`, **not** `policy`, because `policy` is already the routing policy of this
plugin (a different contract):

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

The router reads and suggests, so `read` and `suggest` are automatic.

The plugin declares the write, commit, and spawn verdicts for uniformity, and they stay the shipped
`approve` because the router never takes them.

The block is one volatile object, so a policy flip is hot-editable, and the `policy` section of a
resolved pack overrides the defaults for each action (the wiring is the next refinement).

The defaults are smoke-arbitrated in `Source/Test/Policy-Defaults`.

## The plan

The plugin implements the two halves of the launch seam and smoke-arbitrates them
(`Source/Test/Launch-And-Hint`), together with the `ESCALATION:` marker and the catalog-verified
ladder.

The plugin ships disabled.

The remaining option, not this wave, is to enforce the route at `agent/request` so a raw service
spawn gets a correction and not only a hint.

The queue already resolves `dshRoute` before its spawn, so the routed dispatch gets its correction
at the source.

- [ROUTING-ENFORCER-PLUGIN](../../Documentation/Plans/ROUTING-ENFORCER-PLUGIN.md) - the routing
  policy.

## License

CC0-1.0.
