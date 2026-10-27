# Launch-And-Hint - the launch seam and the routing hint

This is the completion wave's arbiter for `plugin-dsh-route`.

The routing hint reaches a spawned child's prompt through the harness's own `agent/pre-step` waterfall, the tool path appends the same hint at launch, the `ESCALATION:` marker picks the ladder, and the live model catalog decides the rung's model.

## Scenarios

- H1: THE SERVICE-SPAWNED CHILD - a delegated child (depth 1) at its first
  step gets one extra user message carrying
  `[route: coder cloudflare-workers-ai @cf/zai-org/glm-5.3-flash high]` (the
  id `route-hint-1`, role `user`, source `{ kind: "user" }`), the original
  prompt untouched, and the byte-exact ledger line
  `hint coder cloudflare-workers-ai @cf/zai-org/glm-5.3-flash high`.
- H2: THE MAIN CONVERSATION - depth 0 is never touched and never logged.
- H3: THE IDEMPOTENCE - a prompt that already carries a hint (the tool path
  annotated it at launch) gets no second hint and no second line.
- H4: THE CHILD'S OWN ROUTE - the hint names the triple the child actually
  runs on (`agent.options`) with the role classified from its prompt.
- H5: THE TOOL PATH - the `subagent` tool's `args.prompt` gains the hint at
  launch, the `agentOptions` injection is unchanged, and the audit line is the
  unchanged `route coder resolved ...`.
- H6: THE ESCALATION MARKER - a launch whose spec carries `ESCALATION: ...`
  resolves to the planner rung (DeepSeek max), and the prompt's hint names it.
- H7: THE LIVE CATALOG - when the provider no longer advertises the rung's
  model, the first advertised model inside `policy.allowedModels` is used
  (`deepseek-v4-flash-0731`), the effort staying `max`.
- H8: THE DISABLED MOUNT - a full passthrough: no hint, only the byte-exact
  `disabled (enabled=false)` line.
- H9: A REJECTED STEP - returned unchanged and unlogged.

## Fixtures

The harness is the shared Harness: the real built `Target/Library.js` apply, the real factory instance, the fake ctx, `FireStep` (the `agent/pre-step` waterfall), `Child` (the depth accounting), `Prompt` (an offered step message), and the `llm` catalog seam attached through `Make`'s pre-apply hook.

## Expected ledger strings (byte-exact, `plugin-dsh-route: ` prefix)

`hint <taskType> <provider> <model> <effort>`,
plus the unchanged `route <taskType> <source> <provider> <model> <effort>`.

## Expected count

10 PASS.
