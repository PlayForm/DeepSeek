# Launch-And-Hint - the launch seam and the routing hint

The completion wave's arbiter for `plugin-dsh-route` checks four facts: the routing hint reaches a spawned child's prompt through the harness's own `agent/pre-step` waterfall, the tool path appends the same hint at launch, the `ESCALATION:` marker picks the ladder, and the live model catalog decides the rung's model.

## Scenarios

- **H1: THE SERVICE-SPAWNED CHILD.**

    A delegated child (depth 1) at its first step gets one extra user message carrying `[route: coder cloudflare-workers-ai @cf/zai-org/glm-5.3-flash high]` (the id `route-hint-1`, role `user`, source `{ kind: "user" }`), with the original prompt untouched, and the byte-exact ledger line `hint coder cloudflare-workers-ai @cf/zai-org/glm-5.3-flash high`.

- **H2: THE MAIN CONVERSATION.**

    Depth 0 is never touched and never logged.

- **H3: THE IDEMPOTENCE.**

    A prompt that already carries a hint (the tool path annotated it at launch) gets no second hint and no second line.

- **H4: THE CHILD'S OWN ROUTE.**

    The hint names the triple the child actually runs on (`agent.options`) with the role classified from its prompt.

- **H5: THE TOOL PATH.**

    The `args.prompt` of the `subagent` tool gains the hint at launch, the `agentOptions` injection is unchanged, and the audit line is the unchanged `route coder resolved ...`.

- **H6: THE ESCALATION MARKER.**

    A launch whose spec carries `ESCALATION: ...` resolves to the planner rung (DeepSeek max), and the prompt's hint names it.

- **H7: THE LIVE CATALOG.**

    When the provider no longer advertises the model of the rung, the plugin uses the first advertised model inside `policy.allowedModels` (`deepseek-v4-flash-0731`), and the effort stays `max`.

- **H8: THE DISABLED MOUNT.**

    The mount is a full passthrough: no hint, only the byte-exact `disabled (enabled=false)` line.

- **H9: A REJECTED STEP.**

    The plugin returns the step unchanged and does not log it.

## Fixtures

The shared Harness supplies the real built `Target/Library.js` apply, the real factory instance, the fake ctx, `FireStep` (the `agent/pre-step` waterfall), `Child` (the depth accounting), `Prompt` (an offered step message), and the `llm` catalog seam attached through the pre-apply hook of `Make`.

## Expected ledger strings (byte-exact, `plugin-dsh-route: ` prefix)

The expected lines are `hint <taskType> <provider> <model> <effort>`, plus the unchanged `route <taskType> <source> <provider> <model> <effort>`.

## Expected count

10 PASS.
