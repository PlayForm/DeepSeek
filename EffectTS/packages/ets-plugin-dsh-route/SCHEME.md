# SCHEME - @playform/plugin-dsh-route

The routing-enforcer plugin's scheme covers the modules, the contracts, and the ledger strings.

Plan: `Documentation/Plans/ROUTING-ENFORCER-PLUGIN.md`.

## 1. The module map

```
Source/
  Library.ts            the entry: name, apply, Config, inject (the loader contract)
  Function/
    Apply.ts            validation, State build, activation proof, service + the two launch listeners
    Enforcer.ts         the `dshRoute` service (class form; delegates to the pure cores)
    Resolve.ts          the deterministic resolver (Routing(request, policy) -> route)
    Classify.ts         the keyword inference (planner -> coder -> explorer scan order)
    Escalate.ts         the attempts ladder's escalation route (at most once)
    Ladder.ts           the escalation rung's model, verified against the live catalog
    Catalog.ts          the live model-catalog probe (`ctx.llm.listModels`)
    Marker.ts           the `ESCALATION:` marker detector (the ladder's failure signal)
    Hint.ts             the routing hint's byte-stable template (`[route: ...]`)
    Inject.ts           the tools/pre-execute listener (silent injection + prompt hint + ledger)
    Launch.ts           the agent/pre-step listener (the hint for service-spawned children)
    Validate.ts         the fail-loud composition checks (allowedModels, keywords keys)
  Interface/
    Policy.ts           Role / RoleSpec / PolicyShape / KeywordTable
    Request.ts          the launch request (every field optional - the omission is normal)
    Route.ts            the resolved route + the source classification
    Catalog.ts          the self-contained `ctx.llm` shape (listModels)
    Config.ts           the config shape
    State.ts            the State (the factory's shared shape + the plugin fields)
    Service.ts          the `dshRoute` declaration merging on Context
  Variable/
    Config.ts           the Schemastery schema (every knob volatile)
    Policy.ts           the shipped default policy (the task-routing table)
    Keywords.ts         the shipped keyword table
```

## 2. The contracts

- **Loader contract.**

    `name` = `plugin-dsh-route` in the four agreeing places: the package name, the `name` export,
    the `module:` option of the State build, and the `logFile` default
    `~/.dsh/playform/ets-plugin-dsh-route.log`.

    `apply` returns nothing, and `inject = ["pluginFactory"]`.

- **The determinism contract.**

    `Resolve` is pure, so the same request and the same policy always produce the same route.

    The resolver uses no LLM, has no ambiguity, and reads no clock.

- **The silence contract.**

    The orchestrator is never bothered.

    The plugin logs corrections and resolutions to its own ledger and never surfaces them.

    Both listeners are fail-open: a routing failure logs a warning and passes the launch or the step
    through untouched.

- **The policy law.**

    The plugin enforces the user's policy and never writes or decides it.

    `defaultRole` is the fallback for an omission (the cheap lane).

- **The policy block (D6).**

    The `automation` key of the config carries the shared per-action allowlist
    (`automation: Policy()`, mapped to `State.Allow`).

    The key is `automation` because the `policy` of this plugin is the ROUTING policy.

    The read, index, record, suggest, and message actions are automatic, and the write, commit, and
    spawn actions stay the shipped `approve` because the router never takes them.

    The `policy` section of a resolved pack overrides the defaults for each action (the wiring is
    the next refinement, and the type already exists in `@playform/ets-lib-dsh-pack`).

    The defaults are smoke-arbitrated in `Source/Test/Policy-Defaults`.

- **The launch seam (the completion wave).**

    The seam has two halves and one hint.

    - **The tool half.**

        `tools/pre-execute` (the model-facing `subagent` tool) puts the route into `agentOptions`
        (or the top-level spelling) and appends the resolved hint to `args.prompt`.

    - **The step half.**

        `agent/pre-step` (the harness waterfall, payload `{ agent, messages, turn, step, signal }`,
        decision `{ kind: "enter", messages }`) gives a DELEGATED child (depth >= 1, read from
        `agent.options.subagentDepth` / `session.header.delegationDepth`) the hint as one extra user
        message at its first step.

        This seam is the only one that reaches a child started straight through
        `ctx.subagents.startActivation` (the queue's spawn), which never passes through a tool.

    - **The idempotence rule.**

        The seam is IDEMPOTENT: a prompt that already carries `[route: ` is left alone, so one
        prompt never carries two hints.

- **The hint contract.**

    The hint is `[route: <taskType> <provider> <model> <effort>]` - the lane the child ACTUALLY runs
    on (`agent.options`), with the role classified from its prompt.

    It is model-facing context and never a ledger line.

- **The escalation ladder (the completion wave).**

    A launch whose spec carries the `ESCALATION: <reason>` marker of the delegation spec resolves to
    the planner rung (DeepSeek max) instead of the cheap lane.

    The plugin checks the MODEL of the rung against the LIVE catalog - the same data that
    `list_subagent_models` reads (`ctx.llm.listModels`) - through `Function/Ladder`: the model of
    the planner row when the catalog advertises it, else the first advertised model inside
    `policy.allowedModels`, else the policy's rung.

    An absent catalog is fail-open to the policy.

- **The service contract.**

    The plugin registers `dshRoute` at apply (constructor registration, removed with the owning
    fiber) and publishes it through the declaration merging of `Interface/Service.ts`.

## 3. The ledger strings (module-owned, byte-stable)

| Event                     | Line                                                                                                            |
| ------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Cold mount                | `disabled (enabled=false)`                                                                                      |
| Activation                | `Activate([...])` -> `bundle 0.2.1`, `defaultRole <role>`, `models <n>`                                         |
| A routed launch           | `route <taskType> <source> <provider> <model> <effort>` (`source` in `resolved`/`kept`/`corrected`/`escalated`) |
| The hint delivered        | `hint <taskType> <provider> <model> <effort>`                                                                   |
| A fail-open routing error | `plugin-dsh-route: <error>; the launch passes through unrouted`                                                 |
| A fail-open step error    | `plugin-dsh-route: <error>; the step continues unhinted`                                                        |

The activation line is UNCHANGED (the byte-exact contract), because the two listeners are the seam
and not a new activation fact.

## 4. The decisions recorded for the end-phase

- **The launch path.**

    The launch path is BOTH halves of the seam: the `tools/pre-execute` waterfall of the `subagent`
    tool and the `agent/pre-step` waterfall of the child.

    The plan's shared probe (the role mapping of the agent loop against parent inheritance) stays
    open, and the resolver and the classifier are point-agnostic.

- **The disabled default.**

    The shipped `enabled` default is `false` (the IDLE-forever posture, like the live-containers
    hook), and the patch row ships `enabled: false`.

- **The scan order.**

    The keyword scan order is planner -> coder -> explorer, so a later scan never downgrades an
    earlier match.

    "fix the docs" classifies as coding.

- **The escalation marker.**

    The plugin detects the escalation marker on the LAUNCH spec (the re-dispatch prompt carries the
    report of the failed run).

    Counting the escalations of the chain stays the caller's work (`Escalate(escalations)`), and the
    `max` of the policy is the gate.

- **The outside child.**

    A child started outside the tool gets the hint but NOT a policy correction, because the route is
    fixed at creation.

    The queue is the enforcement point for service spawns (its routed dispatch resolves `dshRoute`
    before the spawn).

    Enforcing at `agent/request` is the remaining option if a raw service spawn must get a
    correction too.
