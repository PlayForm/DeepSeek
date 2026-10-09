# ROUTING-ENFORCER PLUGIN - the silent auto-routing plan (dedicated 2026-10-09)

> The user's mandate: prevent the orchestrator from slipping out of the model-routing
> discipline - but SILENTLY: the plugin automatically chooses the behavior, so the
> orchestrator is not even bothered and does not have to know about the model
> configuration. The model configuration is the USER's responsibility - he configures
> it in ~/.dsh - the plugin enforces his configuration, model-independently.
> Sits NEXT TO the BATCH-STATE plugin (Documentation/Plans/BATCH-STATE-PLUGIN.md) -
> both contribute to the orchestration layer.

## 0. The problem (the incident)

The task-routing skill mandates: ALWAYS pass `provider`/`model`/`reasoning_effort`
explicitly; never rely on the child defaults - because the harness's omission
behavior inherits the PARENT route (the DeepSeek V4 Flash - the expensive lane).
The orchestrator applied the explicit routing to one wave of launches, then SLIPPED
back to the omission on the next wave - the recent idle lanes ran on the DeepSeek
route (the sunk cost). The behavioral discipline (the skills, the prompts) CAN slip -
the prevention must be SYSTEMIC + SILENT.

## 1. The design principle (the user's words)

- The plugin CHOOSES THE BEHAVIOR AUTOMATICALLY - no prompting, no reminder, no
  orchestrator awareness. The launch's omission is not an error to surface - it is
  the DEFAULT the plugin resolves.
- The user OWNS the configuration (the ~/.dsh task-routing policy - the roles, the
  models, the efforts, the allowed set). The plugin reads HIS config + enforces it.
- The orchestrator is not bothered: the launch works the same; the plugin silently
  routes it per the user's policy.

## 2. The architecture: `@playform/plugin-dsh-route` (a new family plugin)

### 2.1 The role-resolution service (the deterministic core)

```
Routing(launchRequest, UserPolicy) -> { provider, model, reasoningEffort }
```

- The input: the launch request (the task type - or the omission), the USER POLICY
  (the agent-loop config: coder = GLM-5.3-Flash high, explorer = GLM-5.3-Flash low,
  planner = DeepSeek V4 Flash max; the allowed set; the task-type rules from the
  task-routing skill: exploration always GLM low; coding GLM high; planning/advanced
  DeepSeek max).
- The resolution is DETERMINISTIC + pure: the same request + the same policy = the
  same route - no LLM involvement, no ambiguity.
- The task-type inference (when the orchestrator does not declare it): the plugin
  derives the role from the task's shape (the spec's keywords: "read-only",
  "survey", "research" -> explorer; "fix", "implement", "restructure" -> coder;
  "design", "plan", "architecture" -> planner - a documented keyword table, the
  user's policy the final authority).

### 2.2 The silent injection (the "not even bothered" part)

- The plugin sits on the LAUNCH path (the agent-loop's territory - the dsh-agent-loop
  already routes the roles - the plugin EXTENDS it or rides it): when a launch omits
  the provider/model/effort, the plugin RESOLVES the route per the user's policy +
  INJECTS it into the launch - the orchestrator's call succeeds exactly as if it had
  passed the right values - no warning, no error, no reminder. The orchestrator
  never sees the model configuration.
- The explicit launches (the orchestrator passes the values): the plugin VALIDATES
  them against the user's policy (the allowed set + the task-type rules) - a
  violation is not surfaced to the orchestrator either: the plugin CORRECTS it
  silently per the policy (the user's configuration is the law - the orchestrator's
  explicit-but-wrong values are overridden by the policy, logged to the plugin's
  own ledger, never bothering anyone).
- The ESCALATION path (the task-routing skill's attempts ladder): the plugin
  knows the policy's escalation rules (GLM attempts -> DeepSeek max with the
  artifacts, at most once) - the escalation is ALSO automatic + silent.

### 2.3 The state + the ledger

- Every resolved route recorded in the plugin's ledger (the launch, the task type,
  the resolved provider/model/effort, the explicit-or-resolved flag, the
  corrected-or-kept flag) - the record for the user's audit (he owns the
  configuration - he can review the ledger + adjust the policy).
- The ledger rides the family's conventions (the journal domain, the byte-integrity,
  the tabs).

### 2.4 The integration with the BATCH-STATE plugin

- The routing ledger feeds the BATCH-STATE compiler's Gates: the pre-baked context
  block's Gates section carries the routing truth (the resolved routes per lane) -
  the orchestration layer's context is the complete picture: the state + the gates +
  the routing - all compiled, all pre-baked, all silent.
- The batch-state plugin's queue + pair orchestration consumes the resolved routes
  (the queue's next pairs already routed per the policy).

## 3. The user's configuration surface (his responsibility)

- The policy lives in ~/.dsh (the agent-loop config's roles + the task-routing
  skill's rules + the allowed-models set) - the user edits HIS files; the plugin
  reads them (the config hot-reload or the restart).
- The plugin NEVER writes the policy; it only enforces it. The user's override
  always wins (his explicit configuration is the plugin's law).

## 4. The exploration items

1. The launch-path interception: where exactly the harness decides the route for a
   subagent launch (the agent-loop's role mapping vs the parent-inheritance - the
   probe: the same probe as the batch-state plan's inbox mechanics - the two
   plugins share the investigation).
2. The task-type inference's accuracy: the keyword table's precision (the false
   positives - a "fix the docs" task is coding, not exploration - the table +
   the user's policy overrides).
3. The explicit-launch correction: the silent override vs the user's "his
   responsibility" - if the orchestrator explicitly passes a WRONG route, the
   plugin corrects it (the policy is the law) + the ledger notes it.
4. The escalation automation: the attempts ladder's automatic triggering (the
   ESCALATION: marker detection in the agent reports + the automatic DeepSeek
   re-dispatch with the artifacts).
5. The user's review surface: the ledger's format (the audit log the user reads
   when he reviews his configuration).

## 5. The implementation phases

1. The probe (shared with the batch-state plugin): the launch-path interception
   point + the route-resolution hook.
2. The resolver (the pure function + the keyword table + the policy reader).
3. The silent injection (the launch path + the explicit-launch validation/correction).
4. The ledger (the family conventions).
5. The batch-state integration (the routing gates in the compiled context block).
6. The escalation automation.

## 6. The safety + the compatibility

- The user's configuration is the law - the plugin enforces, never decides the
  policy itself.
- The silent-by-design: the orchestrator's workflow unchanged (the launches succeed
  the same); the corrections logged, never surfaced.
- The family's plugin discipline (the smokes, the loader contract, the no-commit).
- The fallbacks: if the launch-path hook is not exposed, the plugin sits as a
  pre-launch validation service the orchestrator's tooling consults (the
  subagent-model-selection-settings the profile patch already defines - the plugin
  ensures the catalog + the policy agree).

## 7. The deliverables

- The plugin source + the smokes (the resolver's determinism smoke-asserted).
- The policy reader + the keyword table.
- The ledger + the audit format.
- The batch-state integration (the routing gates).
- The probe's findings (the launch-path mechanics).