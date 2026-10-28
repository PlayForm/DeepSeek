# Loader-And-Activation - the loader contract and the activation tests

The loader wiring of the test-suggester: the default object, the cold mount, the activation proof, the apply-time wiring, the pass-through discipline, the schema fail-loud, and the mount purity.

## Scenarios

- L1: the loader contract, where the default object carries name/apply/Config/inject and `inject` is `["pluginFactory"]`.
- L2: the cold disabled mount, where apply returns NOTHING, the byte-exact `disabled (enabled=false)` line appears (logger and durable ledger), and both listeners stay wired on the plugin ctx.
- L3: the enabled mount, where the byte-exact activation line `activated (bundle 0.2.1, intents 2, threshold 0.75)` appears (logger and ledger), along with the listener registration order on the plugin ctx and a distinct root.
- L4: the pass-through discipline, where a non-judged tool returns the decision unchanged, the `intents` config filter keeps only `Counts`, and the activation line says `intents 1`.
- L5: the fail-loud validation, where a non-numeric `threshold` and a non-boolean `enabled` throw at load through the schema.
- L6: the mount purity, where ZERO fs operations happen and the state probe carries the module identity of the factory and the compiled pack.

## Fixtures

The shared Harness (fake ctx, real factory, real built Target).

There is no fake clock, because the plugin has no clock dependency.

## Expected ledger strings (byte-exact, `test-suggester: ` prefix)

`disabled (enabled=false)`, `activated (bundle 0.2.1, intents 2, threshold 0.75)`, `activated (bundle 0.2.1, intents 1, threshold 0.75)`.

## Expected count

15 PASS.
