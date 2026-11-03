# Loader-And-Activation - the loader contract and the activation tests

The loader wiring of the test-suggester: the default object, the cold mount, the activation proof with the `history` segment, the apply-time wiring, the session/event fold, the pass-through discipline, the retired boot projection, the schema fail-loud, and the mount purity.

## Scenarios

- L1: the loader contract, where the default object carries name/apply/Config/inject and `inject` is `["pluginFactory"]`.
- L2: the cold disabled mount, where apply returns NOTHING, the byte-exact `disabled (enabled=false)` line appears (logger and durable ledger), and every listener stays wired on the plugin ctx.
- L3: the enabled mount, where the byte-exact activation line `activated (bundle 0.2.1, history, threshold 0.75)` appears (logger and ledger), along with the listener registration order on the plugin ctx and a distinct root; the `session/event` fold turns one `tool/call` into one normalized touch, skips a non-call event, and parses a JSON-string payload.
- L4: the pass-through discipline, where a non-judged tool returns the decision unchanged, and the boot projection is retired (`State.Rules` is empty, because the candidates come from the session history and only an explicit pack compiles).
- L5: the fail-loud validation, where a non-numeric `threshold` and a non-boolean `enabled` throw at load through the schema.
- L6: the mount purity, where ZERO fs operations happen and the state probe carries the module identity of the factory and the retired projection.

## Fixtures

The shared Harness (fake ctx, real factory, real built Target).

There is no fake clock, because the plugin has no clock dependency.

## Expected ledger strings (byte-exact, `test-suggester: ` prefix)

`disabled (enabled=false)`, `activated (bundle 0.2.1, history, threshold 0.75)`.

## Expected count

16 PASS.
