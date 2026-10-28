# Loader-And-Activation - the loader contract and the activation tests

The loader wiring of the graph-suggester: the default object, the cold mount, the activation proof,
the apply-time wiring, the pass-through discipline, the schema fail-loud, and the mount purity.

## Scenarios

- L1: the loader contract - the default object carries
  name/apply/Config/inject; `inject` is `["pluginFactory", "workspaceGraph"]`.
- L2: the cold disabled mount - apply returns NOTHING, the state probe
  exists with `On: false`, the byte-exact `disabled (enabled=false)` line
  (logger and durable ledger), and both listeners are still wired on the
  plugin ctx.
- L3: the enabled mount - the byte-exact activation line
  `activated (bundle 0.2.1, intents 2, threshold 0.75)` (logger and ledger),
  the listener registration order on the plugin ctx
  (`loader/volatile-update`, `tools/post-execute`, `agent/pre-step`), and a
  distinct root object.
- L4: the pass-through discipline - a non-judged tool returns the
  downstream decision UNCHANGED; the `intents` config filter removes the
  pack intent from the compiled rules (and the activation line says so).
- L5: the fail-loud validation - a non-numeric `threshold` and a
  non-boolean `enabled` throw at load through the schema.
- L6: the mount purity - ZERO fs operations; the state probe carries the
  factory's module identity and the compiled pack.

## Fixtures

The shared Harness (fake ctx, real factory, real built Target).

No fake clock is needed, because the plugin has no clock dependency.

## Expected ledger strings (byte-exact, `graph-suggester: ` prefix)

`disabled (enabled=false)`,
`activated (bundle 0.2.1, intents 2, threshold 0.75)`,
`activated (bundle 0.2.1, intents 1, threshold 0.75)`.

## Expected count

15 PASS.
