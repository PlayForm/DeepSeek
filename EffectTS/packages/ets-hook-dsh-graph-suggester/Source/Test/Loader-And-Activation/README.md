# Loader-And-Activation - the loader contract and the activation tests

The loader wiring of the graph-suggester: the default object, the cold mount, the activation proof,
the apply-time wiring, the pass-through discipline, the schema fail-loud, the anchor exclusion at the
mount seam, and the mount purity.

## Scenarios

- L1: the loader contract - the default object carries
  name/apply/Config/inject; `inject` is `["pluginFactory", "workspaceGraph"]`.
- L2: the cold disabled mount - apply returns NOTHING, the state probe
  exists with `On: false`, the byte-exact `disabled (enabled=false)` line
  (logger and durable ledger), and both listeners are still wired on the
  plugin ctx.
- L3: the enabled mount - the byte-exact activation line
  `activated (bundle 0.2.1, graph, threshold 0.75)` (logger and ledger),
  the listener registration order on the plugin ctx
  (`loader/volatile-update`, `tools/post-execute`, `agent/pre-step`), and a
  distinct root object. The second segment is `graph`, not an intent count:
  there is no boot pack.
- L4: the pass-through discipline - a non-judged tool returns the
  downstream decision UNCHANGED; the boot rule set is EMPTY (the graph
  intents are synthesized per call) and the `intents` config list survives
  on the state for that synthesis.
- L5: the fail-loud validation - a non-numeric `threshold` and a
  non-boolean `enabled` throw at load through the schema.
- L6: the mount purity - ZERO fs operations; the state probe carries the
  factory's module identity, the empty boot rule set and the gate.
- L7: the anchor exclusion at the mount seam - a mounted run whose fake
  component carries the anchor plus one importer prepends a note naming only
  the importer (`targets (1)`, `suggest Neighborhood 0.87 1 candidates call
  read`), so the file the agent just read is never named back.

## Fixtures

The shared Harness (fake ctx, real factory, real built Target).

No fake clock is needed, because the plugin has no clock dependency.

## Expected ledger strings (byte-exact, `graph-suggester: ` prefix)

`disabled (enabled=false)`,
`activated (bundle 0.2.1, graph, threshold 0.75)`.

## Expected count

16 PASS.
