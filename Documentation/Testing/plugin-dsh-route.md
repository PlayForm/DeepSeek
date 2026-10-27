# plugin-dsh-route - the live test plan

## Identity

- Package: `@playform/plugin-dsh-route` (Classic/packages/plugin-dsh-route).
- Profile row id: `plugin-dsh-route` (bundled in the desktop profile).
- Exposes the `dshRoute` service (`export default class Enforcer extends Service` with
  `super(Context_, "dshRoute")`), with `Resolve(request)` / `Classify(spec)` /
  `Escalate(escalations)` / `Policy`. It is the routing policy enforcer for the delegation surface:
  it classifies tasks (planner → coder → explorer keyword scan order) and enforces the model-routing
  rules silently, with no warning and no error, so the orchestrator is never bothered.
- The launch seam (SCHEME "the launch seam", two halves and one hint):
    - `tools/pre-execute` (the `subagent` tool): the route is injected into `agentOptions` (or the
      top-level spelling) AND the byte-stable hint
      `` `[route: <taskType> <provider> <model> <effort>]` `` is appended to `args.prompt`.
    - `agent/pre-step` (payload `{ agent, messages, turn, step, signal }`, decision
      `{ kind: "enter", messages }`): a DELEGATED child (depth ≥ 1, from
      `agent.options.subagentDepth` / `session.header.delegationDepth`) receives the hint as one
      extra user message at its first step, which is the only seam that reaches a child started
      straight through `ctx.subagents.startActivation` (the spawn of the queue).
    - Idempotent: a prompt that already carries `[route: ` gets no second hint, and both halves fail
      open.
- The escalation ladder (SCHEME "the escalation ladder"): a launch spec carrying the
  `ESCALATION: <reason>` marker of the delegation spec resolves to the planner rung (at most once
  per chain), with the model of the rung verified against the live catalog (`ctx.llm.listModels`):
  the model of the planner row when advertised, else the first advertised model in
  `policy.allowedModels`, else the rung of the policy. An absent catalog fails open to the policy.
- Ledger lines (SCHEME §3, byte-stable): `disabled (enabled=false)`; `bundle 0.1.0`,
  `defaultRole <role>`, `models <n>` (the activation, unchanged);
  `route <taskType> <source> <provider> <model> <effort>` (source in
  `resolved`/`kept`/`corrected`/`escalated`); `hint <taskType> <provider> <model> <effort>`;
  `` `plugin-dsh-route: <error>; the launch passes through unrouted` ``; logFile
  `~/.dsh/playform/plugin-dsh-route.log`.
- The policy block (D6): keyed `automation`, NOT `policy`, because the `policy` of this plugin is
  the routing policy. `automation: Policy()` maps to `State.Allow` (read/suggest +
  message/index/record = `auto`; write/commit/spawn = `approve`, which the router never takes). One
  volatile object.

## Activation checks

1. **The Config.**

    Inspect the Config with `cordis_inspect_query` host/Config/listConfigs
    `{"name": "@playform/plugin-dsh-route"}` for one entry with status schema (defaults: enabled
    false, defaultRole `explorer`, `policy` the task-routing table, `keywords` the shipped table,
    `automation.*` D6 defaults).

2. **The service check.**

    `cordis_inspect_query` host/Service/listService `dshRoute` resolves.

3. **The ledger line.**

    The activated line appears in `~/.dsh/playform/plugin-dsh-route.log`, and a cold mount logs
    `disabled (enabled=false)`.

## Test cases

| # | Trigger | Expected | Pass criteria | | T1 | listConfigs query above | one entry,
`status: "schema"` | the defaults match | | T1 | `listService dshRoute` | the enforcer is registered
| construction-time registration | | T2 | Classify a trivial task through the enforcer | the
low-cost route | the policy's difficulty-first classification holds | | T2 | A launch that violates
the policy | the route is silently corrected per the policy | ledgered as
`route <taskType> corrected <provider> <model> <effort>`, never surfaced | | T2 | A delegated child
launch with no route | the hint `[route: ...]` arrives at its first step | one user message only;
the same prompt again adds no second hint (idempotent) | | T2 | A launch spec carrying
`ESCALATION: <reason>` | the planner rung, model verified against the live catalog | the catalog
absent → fail-open to the policy's rung |

## Known live gaps

- Not dogfooded yet, so watch for the enforcer blocking legitimate delegations when the policy table
  is empty, and for stale policy after a hot config edit. A child started outside the tool gets the
  hint but NOT a policy correction, because the queue is the enforcement point for service spawns;
  enforcing at `agent/request` is the remaining (not this wave) option.

## Fix loop

- Fix files: `Source/Library.ts`, `Source/Function/Enforcer.ts`, `Source/Function/Inject.ts` (the
  `tools/pre-execute` listener), `Source/Function/Launch.ts` (the `agent/pre-step` listener),
  `Source/Function/Ladder.ts`, `Source/Variable/Config.ts`.
- Rebuild:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/plugin-dsh-route run prepublishOnly`
- Smokes: `node Classic/packages/plugin-dsh-route/Target/Test/<Folder>/Test.js` per folder under
  `Source/Test/`, then restart the app.

## Report stub

- Plugin: `@playform/plugin-dsh-route`
- Tests run: T1 config - / T1 service - / T2 classify - / T2 enforcement - / T2 hint - / T2
  escalation -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
