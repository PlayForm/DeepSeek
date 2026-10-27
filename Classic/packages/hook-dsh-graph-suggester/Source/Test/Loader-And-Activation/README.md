# Loader-And-Activation - the loader contract and the activation tests

The suite covers the loader wiring of the graph-suggester: the default object, the cold mount, the
activation proof, the apply-time wiring, the pass-through discipline, the schema fail-loud, and the
mount purity.

## Scenarios

- L1: the loader contract - the default object carries name/apply/Config/inject, and `inject` is
  `["pluginFactory", "workspaceGraph"]`.
- L2: the cold disabled mount - apply returns NOTHING, the state probe exists with `On: false`, the
  `disabled (enabled=false)` line is byte-exact in the logger and the durable ledger, and both
  listeners are still wired on the plugin ctx.
- L3: the enabled mount - the activation line
  `activated (bundle 0.3.0, intents 2, threshold 0.75)` is byte-exact in the logger and the ledger, the
  listener registration order on the plugin ctx is `loader/volatile-update`, then
  `tools/post-execute`, then `agent/pre-step`, and the root object is distinct.
- L4: the pass-through discipline - a non-judged tool returns the downstream decision UNCHANGED, and
  the `intents` config filter removes the pack intent from the compiled rules, which the activation
  line also states.
- L5: the fail-loud validation - a non-numeric `threshold` and a non-boolean `enabled` throw at load
  through the schema.
- L6: the mount purity - ZERO fs operations run, and the state probe carries the module identity of the
  factory and the compiled pack.

## Fixtures

The shared Harness supplies the fake ctx, the real factory, and the real built Target.

No fake clock runs, because the plugin has no clock dependency.

## Expected ledger strings (byte-exact, `graph-suggester: ` prefix)

`disabled (enabled=false)`,
`activated (bundle 0.3.0, intents 2, threshold 0.75)`,
`activated (bundle 0.3.0, intents 1, threshold 0.75)`.

## Expected count

15 PASS.
