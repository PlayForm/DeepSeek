# SCHEME - @playform/plugin-dsh-route

The routing-enforcer plugin's scheme: the modules, the contracts, the ledger strings. Plan:
`Documentation/Plans/ROUTING-ENFORCER-PLUGIN.md`.

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

- **Loader contract:** `name` = `plugin-dsh-route` (the four agreeing places: the package name, the
  `name` export, the State build's `module:` option, the `logFile` default
  `~/.dsh/playform/ets-plugin-dsh-route.log`); `apply` returns nothing; `inject = ["pluginFactory"]`.
- **The determinism contract:** `Resolve` is pure - the same request and the same policy always
  produce the same route. No LLM involvement, no ambiguity, no clock reads.
- **The silence contract:** the orchestrator is never bothered. Corrections and resolutions are
  logged to the plugin's own ledger and never surfaced. Both listeners are fail-open: a routing
  failure logs a warning and passes the launch/step through untouched.
- **The policy law:** the plugin enforces the user's policy and never writes or decides it.
  `defaultRole` is the omission's fallback (the cheap lane).
- **The policy block (D6):** the config's `automation` key carries the shared per-action allowlist
  (`automation: Policy()`, mapped to `State.Allow`); it is keyed `automation` because this plugin's
  `policy` is the ROUTING policy. read/index/record/suggest and message are automatic;
  write/commit/spawn stay the shipped `approve` (the router never takes them). A resolved pack's
  `policy` section overrides the defaults per action (the wiring is the next refinement; the type
  already exists in `@playform/ets-lib-dsh-pack`). The defaults are smoke-arbitrated in
  `Source/Test/Policy-Defaults`.
- **The launch seam (the completion wave) - two halves, one hint:**
    - `tools/pre-execute` (the model-facing `subagent` tool): the route is injected into
      `agentOptions` (or the top-level spelling) AND the resolved hint is appended to `args.prompt`.
    - `agent/pre-step` (the harness waterfall, payload `{ agent, messages, turn, step, signal }`,
      decision `{ kind: "enter", messages }`): a DELEGATED child (depth >= 1, read from
      `agent.options.subagentDepth` / `session.header.delegationDepth`) receives the hint as one
      extra user message at its first step. This is the only seam that reaches a child started
      straight through `ctx.subagents.startActivation` (the queue's spawn), which never passes
      through a tool.
    - The seam is IDEMPOTENT: a prompt that already carries `[route: ` is left alone, so one prompt
      never carries two hints.
- **The hint contract:** `[route: <taskType> <provider> <model> <effort>]` - the lane the child
  ACTUALLY runs on (`agent.options`) with the role classified from its prompt. Model-facing context,
  never a ledger line.
- **The escalation ladder (the completion wave):** a launch whose spec carries the delegation spec's
  `ESCALATION: <reason>` marker resolves to the planner rung (DeepSeek max) instead of the cheap
  lane. The rung's MODEL is verified against the LIVE catalog - the same data `list_subagent_models`
  reads (`ctx.llm.listModels`) - through `Function/Ladder`: the planner row's model when advertised,
  else the first advertised model inside `policy.allowedModels`, else the policy's rung. An absent
  catalog is fail-open to the policy.
- **The service contract:** `dshRoute` is registered at apply (constructor registration, removed
  with the owning fiber) and published through `Interface/Service.ts`'s declaration merging.

## 3. The ledger strings (module-owned, byte-stable)

| Event                     | Line                                                                                                            |
| ------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Cold mount                | `disabled (enabled=false)`                                                                                      |
| Activation                | `Activate([...])` -> `bundle 0.1.0`, `defaultRole <role>`, `models <n>`                                         |
| A routed launch           | `route <taskType> <source> <provider> <model> <effort>` (`source` in `resolved`/`kept`/`corrected`/`escalated`) |
| The hint delivered        | `hint <taskType> <provider> <model> <effort>`                                                                   |
| A fail-open routing error | `plugin-dsh-route: <error>; the launch passes through unrouted`                                                 |
| A fail-open step error    | `plugin-dsh-route: <error>; the step continues unhinted`                                                        |

The activation line is UNCHANGED (the byte-exact contract): the two listeners are the seam, not a
new activation fact.

## 4. The decisions recorded for the end-phase

- The launch path is BOTH halves of the seam: the `subagent` tool's `tools/pre-execute` waterfall
  and the child's `agent/pre-step` waterfall. The plan's shared probe (the agent-loop's role mapping
  vs parent-inheritance) stays open; the resolver/classifier are point-agnostic.
- The shipped `enabled` default is `false` (the IDLE-forever posture, like the live-containers
  hook); the patch row ships `enabled: false`.
- The keyword scan order is planner -> coder -> explorer so a later scan never downgrades an earlier
  match; "fix the docs" classifies as coding.
- The escalation marker is detected on the LAUNCH spec (the re-dispatch prompt carries the failed
  run's report). Counting the chain's escalations stays the caller's (`Escalate(escalations)`); the
  policy's `max` is the gate.
- A child started outside the tool gets the hint but NOT a policy correction: the route is fixed at
  creation, and the queue is the enforcement point for service spawns (its routed dispatch resolves
  `dshRoute` before the spawn). Enforcing at `agent/request` is the remaining option if a raw
  service spawn must be corrected too.
