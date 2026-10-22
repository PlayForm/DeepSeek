# SCHEME - @playform/plugin-dsh-route

The routing-enforcer plugin's scheme: the modules, the contracts, the ledger
strings. Plan: `Documentation/Plans/ROUTING-ENFORCER-PLUGIN.md`.

## 1. The module map

```
Source/
  Library.ts            the entry: name, apply, Config, inject (the loader contract)
  Function/
    Apply.ts            validation, State build, activation proof, service + listener
    Enforcer.ts         the `dshRoute` service (class form; delegates to the pure cores)
    Resolve.ts          the deterministic resolver (Routing(request, policy) -> route)
    Classify.ts         the keyword inference (planner -> coder -> explorer scan order)
    Escalate.ts         the attempts ladder's escalation route (at most once)
    Inject.ts           the tools/pre-execute listener (the silent injection + the ledger line)
    Validate.ts         the fail-loud composition checks (allowedModels, keywords keys)
  Interface/
    Policy.ts           Role / RoleSpec / PolicyShape / KeywordTable
    Request.ts          the launch request (every field optional - the omission is normal)
    Route.ts            the resolved route + the source classification
    Config.ts           the config shape
    State.ts            the State (the factory's shared shape + the plugin fields)
    Service.ts          the `dshRoute` declaration merging on Context
  Variable/
    Config.ts           the Schemastery schema (every knob volatile)
    Policy.ts           the shipped default policy (the task-routing table)
    Keywords.ts         the shipped keyword table
```

## 2. The contracts

- **Loader contract:** `name` = `plugin-dsh-route` (the four agreeing places:
  the package name, the `name` export, the State build's `module:` option,
  the `logFile` default `~/.dsh/route.log`); `apply` returns nothing;
  `inject = ["pluginFactory"]`.
- **The determinism contract:** `Resolve` is pure - the same request and the
  same policy always produce the same route. No LLM involvement, no
  ambiguity, no clock reads.
- **The silence contract:** the orchestrator is never bothered. Corrections
  and resolutions are logged to the plugin's own ledger and never surfaced.
  The listener is fail-open: a routing failure logs a warning and passes the
  launch through unrouted.
- **The policy law:** the plugin enforces the user's policy and never writes
  or decides it. `defaultRole` is the omission's fallback (the cheap lane).
- **The service contract:** `dshRoute` is registered at apply (constructor
  registration, removed with the owning fiber) and published through
  `Interface/Service.ts`'s declaration merging.

## 3. The ledger strings (module-owned, byte-stable)

| Event | Line |
| --- | --- |
| Cold mount | `disabled (enabled=false)` |
| Activation | `Activate([...])` → `bundle 0.1.0`, `defaultRole <role>`, `models <n>` |
| A routed launch | `route <taskType> <source> <provider> <model> <effort>` (`source` ∈ `resolved`/`kept`/`corrected`/`escalated`) |
| A fail-open routing error | `plugin-dsh-route: <error>; the launch passes through unrouted` |

## 4. The decisions recorded for the end-phase

- The launch path is the `subagent` tool's `tools/pre-execute` waterfall; the
  plan's shared probe (the agent-loop's role mapping vs parent-inheritance)
  may move the injection point - the resolver/classifier are point-agnostic.
- The shipped `enabled` default is `false` (the IDLE-forever posture, like the
  live-containers hook); the patch row ships `enabled: false`.
- The keyword scan order is planner → coder → explorer so a later scan never
  downgrades an earlier match; "fix the docs" classifies as coding.
- The escalation surface is `Escalate(escalations)`; the automatic trigger
  (detecting the `ESCALATION:` marker in agent reports) is end-phase work
  together with the batch-state integration.
