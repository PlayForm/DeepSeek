Wiring-And-Ledger - the wiring and the ledger tests

The loader wiring of the convention suggester and its durable proof: the loader contract, the
context-only listener registration, the byte-exact activation and disabled lines (logger and durable
forms), the config fail-loud, the schema defaults and the compiled pack on the built State, and the
fs purity.

## Scenarios

- W1: the loader contract - the default object carries name, apply, Config,
  and inject (`["pluginFactory"]`) with the values equal to the named
  exports, and apply returns NOTHING (a returned value silently kills event
  delivery).
- W2: the enabled mount - the two listeners (`tools/post-execute`,
  `agent/pre-step`) plus the factory's `loader/volatile-update` register on
  the plugin context only (never on the root; the fake root is a distinct
  object), the root identity is not the plugin ctx, and the activation line
  `activated (bundle 0.2.1, intents 4, threshold 0.75)` is byte-exact in
  the logger form and in the durable `[ISO]` form (exactly one line).
- W3: the disabled mount - `disabled (enabled=false)` is byte-exact in both
  forms, and every call passes through with zero new lines.
- W4: the fail-loud validation - a string `cooldownCalls` and a string
  `exclude` throw at load with the exact schema messages; the schema
  defaults land on the built State (threshold 0.75, maxCandidates 7,
  maxNoteChars 1200, cooldownCalls 6, maxNotesPerTurn 3, the empty intent
  list, the three judged tools, the four exclude prefixes, the factory
  assigned); the pack is compiled once at apply (all four intents in
  priority order, the Ledger threshold raised to max(0.85, 0.75), every
  signal a RegExp); a configured intent list filters the pack and prints
  `intents 1` in the activation line.
- W5: the fs purity - the convention suggester is a NON-MANIFEST module:
  zero ctx.fs calls across emit and silence, and no logger warnings.

## Fixtures

The shared Harness (fake ctx with a DISTINCT root object, the real factory, the real built Target).

No fake clock is needed, because the per-agent memory is a call counter and a map, and the ISO
stamps of the durable ledger are matched with an anchored regex.

## Expected ledger strings (byte-exact, `convention-suggester: ` prefix)

`activated (bundle 0.2.1, intents 4, threshold 0.75)`,
`activated (bundle 0.2.1, intents 1, threshold 0.75)`,
`disabled (enabled=false)`.

## Expected count

14 PASS.
