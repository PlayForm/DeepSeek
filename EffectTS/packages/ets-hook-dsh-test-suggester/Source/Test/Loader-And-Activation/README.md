# Loader-And-Activation - the loader contract and the activation tests

The test-suggester's loader wiring: the default object, the cold mount, the
activation proof, the apply-time wiring, the pass-through discipline, the
schema fail-loud, and the mount purity.

## Scenarios

- L1: the loader contract - the default object carries
  name/apply/Config/inject; `inject` is `["pluginFactory"]`.
- L2: the cold disabled mount - apply returns NOTHING, the byte-exact
  `disabled (enabled=false)` line (logger and durable ledger), and both
  listeners still wired on the plugin ctx.
- L3: the enabled mount - the byte-exact activation line
  `activated (bundle 0.1.0, intents 2, threshold 0.75)` (logger and ledger),
  the listener registration order on the plugin ctx, and a distinct root.
- L4: the pass-through discipline - a non-judged tool returns the decision
  unchanged; the `intents` config filter keeps only `Counts` (and the
  activation line says `intents 1`).
- L5: the fail-loud validation - a non-numeric `threshold` and a
  non-boolean `enabled` throw at load through the schema.
- L6: the mount purity - ZERO fs operations; the state probe carries the
  factory's module identity and the compiled pack.

## Fixtures

The shared Harness (fake ctx, real factory, real built Target). No fake
clock: the plugin has no clock dependency.

## Expected ledger strings (byte-exact, `test-suggester: ` prefix)

`disabled (enabled=false)`,
`activated (bundle 0.1.0, intents 2, threshold 0.75)`,
`activated (bundle 0.1.0, intents 1, threshold 0.75)`.

## Expected count

15 PASS.
