# @playform/plugin-dsh-route

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
- **Automatic escalation.** The attempts ladder's escalation rung (the planner lane, DeepSeek max,
  with the artifacts) is resolved by the same service, at most once per chain, when the policy
  enables it.
- **The ledger.** Every resolved route is recorded as one line
  `route <taskType> <source> <provider> <model> <effort>` where `source` is
  `resolved | kept | corrected | escalated` - the audit log the user reads when he reviews his
  configuration.

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

## Configuration (all volatile)

| Field             | Default                | Meaning                                                                                                               |
| ----------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `enabled`         | `false`                | Master switch (ships disabled; the IDLE-forever posture).                                                             |
| `log` / `logFile` | - / `~/.dsh/route.log` | The plugin's own ledger.                                                                                              |
| `defaultRole`     | `explorer`             | The role used when neither a declared type nor a keyword match exists (the cheap lane is the safe default).           |
| `policy`          | the task-routing table | `coder`/`explorer`/`planner` route triples, `allowedModels` (the three-model catalog), `escalation { enabled, max }`. |
| `keywords`        | the shipped table      | The inference table; merged over the shipped defaults (user keywords add triggers).                                   |

## Status

PoC: the source is complete; the build, the smoke suite and the live wiring are the end-phase
(`Documentation/Plans/POC-BRIEF.md` section 8). The launch-path interception point is a documented
fallback: the `subagent` tool's `pre-execute` waterfall is the launch path in the current harness;
the plan's open probe (the agent-loop's role mapping vs the parent-inheritance) remains for the
end-phase.
