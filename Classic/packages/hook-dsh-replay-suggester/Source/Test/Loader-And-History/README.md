# Loader-And-History - the loader contract and the history store tests

The replay-suggester's loader wiring and the history store reader cover the missing, loaded, and corrupt store outcomes, all byte-exact.

## Scenarios

- L1: the loader contract, where the default object carries name/apply/Config/inject and `inject` is `["pluginFactory"]`.
- L2: the cold disabled mount, where apply returns NOTHING, the byte-exact `disabled (enabled=false)` line appears in the logger and the durable ledger, and both listeners stay wired on the plugin ctx.
- L3: the enabled mount with a MISSING store, where the byte-exact activation line `activated (bundle 0.2.1, intents 1, threshold 0.75, history 0)` and the byte-exact `history missing (starting empty)` degradation appear and the records stay empty.
- L4: the loaded store, where `history loaded 2 records` is byte-exact with invalid records (an empty probe, a missing probe) filtered, and a record with an empty verification still fires the note.
- L5: the corrupt store, where unparseable JSON, a wrong schema version, and a `null` store all degrade with the byte-exact `history corrupt (starting empty)` line and never a throw.
- L6: the fail-loud validation, where a non-numeric `threshold` and a non-boolean `enabled` throw at load through the schema.
- L7: the listener registration order on the plugin ctx and a distinct root object.

## Fixtures

The fixtures use the shared Harness plus `WriteStore` (the history JSON writer) and `rmStore`.

There is no fake clock, because the plugin has no clock dependency.

## Expected ledger strings (byte-exact, `replay-suggester: ` prefix)

`disabled (enabled=false)`,
`activated (bundle 0.2.1, intents 1, threshold 0.75, history 0)`,
`history missing (starting empty)`,
`history loaded 2 records`,
`history corrupt (starting empty)` (+ the `<reason>` variant).

## Expected count

18 PASS.
