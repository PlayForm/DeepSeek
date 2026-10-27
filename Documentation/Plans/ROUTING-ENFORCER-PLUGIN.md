---
title: The Routing-Enforcer Plugin - the silent auto-routing plan
category: Plans
kind: queued-plan
date: 2026-10-09
status: implemented (PoC)
registry: Documentation/Plans/ROUTING-ENFORCER-PLUGIN.md
index: Documentation/INDEX.md
statuses:
    - name: the routing-enforcer plugin (the silent auto-routing)
      state: implemented (PoC)
      evidence:
          plugin-dsh-route under Classic/packages/ (with its ets-plugin-dsh-route twin); the
          PoC-vs-plan grades in Documentation/Reports/POC-GAP-ANALYSIS.md
    - name: the policy reader and keyword table
      state: implemented (PoC)
      evidence:
          the resolver in plugin-dsh-route; the grades in Documentation/Reports/POC-GAP-ANALYSIS.md
    - name: the manual routing discipline (the interim)
      state: implemented
      evidence: the task-routing skill - enforced by convention
---

# ROUTING-ENFORCER PLUGIN - the silent auto-routing plan (dedicated 2026-10-09)

> The mandate of the user: prevent the orchestrator from slipping out of the model-routing
> discipline. The choice happens SILENTLY, the plugin automatically chooses the behavior, and the
> orchestrator is not even bothered and does not have to know about the model configuration. The
> model configuration is the responsibility of the USER, who configures it in ~/.dsh, and the plugin
> enforces that configuration model-independently. It sits NEXT TO the BATCH-STATE plugin
> (Documentation/Plans/BATCH-STATE-PLUGIN.md), and BOTH contribute to the orchestration layer.

## 0. The problem (the incident)

The task-routing skill mandates that every launch pass `provider`, `model`, and `reasoning_effort`
explicitly and NEVER rely on the child defaults.

The omission behavior of the harness inherits the PARENT route, which is the DeepSeek V4 Flash and
the expensive lane.

The orchestrator applied the explicit routing to ONE wave of launches and then SLIPPED back to the
omission on the next wave, so the recent idle lanes ran on the DeepSeek route at the sunk cost.

The behavioral discipline of the skills and the prompts CAN slip, so the prevention must be SYSTEMIC
and SILENT.

## 1. The design principle (the user's words)

- The plugin CHOOSES THE BEHAVIOR AUTOMATICALLY with NO prompting, NO reminder, and NO orchestrator
  awareness, because the omission of the launch is NOT an error to surface but the DEFAULT that the
  plugin resolves.
- The user OWNS the configuration in the `~/.dsh` task-routing policy with the roles, the models,
  the efforts, and the allowed set, and the plugin reads HIS config and enforces it.
- The orchestrator is NOT bothered, because the launch works the same and the plugin silently routes
  it per the policy of the user.

## 2. The architecture: `@playform/plugin-dsh-route` (a new family plugin)

### 2.1 The role-resolution service (the deterministic core)

```
Routing(launchRequest, UserPolicy) -> { provider, model, reasoningEffort }
```

- The input is the launch request with the task type or the omission, plus the USER POLICY. The
  policy covers the agent-loop config, where the coder is GLM-5.3-Flash high, the explorer is
  GLM-5.3-Flash low, and the planner is DeepSeek V4 Flash max, together with the allowed set and the
  task-type rules of the task-routing skill: exploration ALWAYS GLM low, coding GLM high, and
  planning or advanced work DeepSeek max.
- The resolution is DETERMINISTIC and pure, because the same request and the same policy give the
  same route, with NO LLM involvement and NO ambiguity.
- The task-type inference applies when the orchestrator does NOT declare the type, and the plugin
  derives the role from the shape of the task through the keywords of the spec: "read-only",
  "survey", and "research" mean explorer, "fix", "implement", and "restructure" mean coder, and
  "design", "plan", and "architecture" mean planner, all under a documented keyword table where the
  policy of the user is the final authority.

### 2.2 The silent injection (the "not even bothered" part)

- The plugin sits on the LAUNCH path in the territory of the agent-loop, which already routes the
  roles, and it EXTENDS that loop or rides it. When a launch omits the provider, model, or effort,
  the plugin RESOLVES the route per the policy of the user and INJECTS it into the launch, so the
  call of the orchestrator succeeds exactly as if it had passed the right values, with NO warning,
  NO error, and NO reminder, and the orchestrator NEVER sees the model configuration.
- The explicit launches, where the orchestrator passes the values, are VALIDATED against the policy
  of the user with the allowed set and the task-type rules, and a violation is NOT surfaced to the
  orchestrator either. The plugin CORRECTS it silently per the policy, because the configuration of
  the user is the law and the explicit but wrong values of the orchestrator are overridden, logged
  to the own ledger of the plugin, and never bother anyone.
- The ESCALATION path of the attempts ladder is ALSO automatic and silent, because the plugin knows
  the escalation rules of the policy, where the GLM attempts lead to DeepSeek max with the artifacts
  at most once.

### 2.3 The state and the ledger

- EVERY resolved route is recorded in the ledger of the plugin with the launch, the task type, the
  resolved provider, model, and effort, the explicit-or-resolved flag, and the corrected-or-kept
  flag, and the record serves the audit of the user, who owns the configuration and can review the
  ledger and adjust the policy.
- The ledger rides the conventions of the family: the journal domain, the byte integrity, and the
  tabs.

### 2.4 The integration with the BATCH-STATE plugin

- The routing ledger feeds the Gates of the BATCH-STATE compiler, and the Gates section of the
  pre-baked context block carries the routing truth of the resolved routes per lane. The context of
  the orchestration layer is the complete picture of the state, the gates, and the routing, ALL
  compiled, ALL pre-baked, and ALL silent.
- The queue and pair orchestration of the batch-state plugin consumes the resolved routes, so the
  next pairs of the queue are already routed per the policy.

## 3. The user's configuration surface (his responsibility)

- The policy lives in `~/.dsh` with the roles of the agent-loop config, the rules of the
  task-routing skill, and the allowed-models set. The user edits HIS files, and the plugin reads
  them through the config hot-reload or the restart.
- The plugin NEVER writes the policy and ONLY enforces it, and the override of the user ALWAYS wins,
  because his explicit configuration is the law of the plugin.

## 4. The exploration items

1. **The launch-path interception.**

    The open question is where exactly the harness decides the route for a subagent launch, between
    the role mapping of the agent-loop and the parent inheritance, and the probe is the same probe
    as the inbox mechanics of the batch-state plan, so the TWO plugins share the investigation.

2. **The accuracy of the task-type inference.**

    The risk is the precision of the keyword table and its false positives, because a "fix the docs"
    task is coding and NOT exploration, and the answer is the table plus the policy override of the
    user.

3. **The explicit-launch correction.**

    The question is the silent override against the "his responsibility" of the user. If the
    orchestrator explicitly passes a WRONG route, the plugin corrects it because the policy is the
    law, and the ledger notes it.

4. **The escalation automation.**

    It covers the automatic triggering of the attempts ladder, the detection of the `ESCALATION:`
    marker in the agent reports, and the automatic DeepSeek re-dispatch with the artifacts.

5. **The review surface of the user.**

    The format of the ledger is the audit log that the user reads when he reviews his configuration.

## 5. The implementation phases

1. **The probe.**

    The probe is shared with the batch-state plugin and covers the interception point of the launch
    path and the hook of the route resolution.

2. **The resolver.**

    The pure function, the keyword table, and the policy reader.

3. **The silent injection.**

    The launch path and the validation and correction of an explicit launch.

4. **The ledger.**

    The ledger under the conventions of the family.

5. **The batch-state integration.**

    The routing gates in the compiled context block.

6. **The escalation automation.**

    The automatic ladder of attempts.

## 6. The safety and the compatibility

- The configuration of the user is the law, and the plugin enforces it and NEVER decides the policy
  itself.
- The design is silent by default, because the workflow of the orchestrator is unchanged and the
  launches succeed the same, while the corrections are logged and NEVER surfaced.
- The plugin discipline of the family holds: the smokes, the loader contract, and the no-commit
  rule.
- The fallbacks: if the launch-path hook is NOT exposed, the plugin sits as a pre-launch validation
  service that the tooling of the orchestrator consults. It covers the
  subagent-model-selection-settings that the profile patch already defines, and the plugin ensures
  that the catalog and the policy agree.

## 7. The deliverables

- The source of the plugin and the smokes, where the determinism of the resolver is smoke-asserted.
- The policy reader and the keyword table.
- The ledger and the audit format.
- The batch-state integration with the routing gates.
- The findings of the probe on the mechanics of the launch path.
