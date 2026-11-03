Wiring-And-Ledger - the wiring and the ledger tests

The loader wiring of the convention suggester and its durable proof: the loader contract, the
context-only listener registration, the byte-exact activation and disabled lines (logger and durable
forms), the config fail-loud, the schema defaults and the empty boot compile on the built State, and
the fs purity.

## Scenarios

- W1: the loader contract - the default object carries name, apply, Config,
  and inject (`["pluginFactory"]`) with the values equal to the named
  exports, and apply returns NOTHING (a returned value silently kills event
  delivery).
- W2: the enabled mount - the three listeners (`session/event`,
  `tools/post-execute`, `agent/pre-step`) plus the factory's
  `loader/volatile-update` register on the plugin context only (never on the
  root; the fake root is a distinct object), the root identity is not the
  plugin ctx, and the activation line
  `activated (bundle 0.2.1, history, threshold 0.75)` is byte-exact in the
  logger form and in the durable `[ISO]` form (exactly one line).
- W3: the disabled mount - `disabled (enabled=false)` is byte-exact in both
  forms, and every call passes through with zero new lines.
- W4: the fail-loud validation - a string `cooldownCalls` and a string
  `exclude` throw at load with the exact schema messages; the schema
  defaults land on the built State (threshold 0.75, maxCandidates 7,
  maxNoteChars 1200, cooldownCalls 6, maxNotesPerTurn 3, the empty intent
  list, the three judged tools, the four exclude prefixes, the factory
  assigned); the boot compile is EMPTY (the candidates come from the session
  history, so no literal pack is compiled at apply) and both the agent and
  the history maps are WeakMaps; a configured intent list lands on the State
  and the boot line still reads `history`.
- W5: the fs purity - the convention suggester is a NON-MANIFEST module:
  zero ctx.fs calls across emit and silence, and no logger warnings.

## Fixtures

The shared Harness (fake ctx with a DISTINCT root object, the real factory, the real built Target).

No fake clock is needed, because the per-agent memory is a call counter and a map, and the ISO
stamps of the durable ledger are matched with an anchored regex.

## Expected ledger strings (byte-exact, `convention-suggester: ` prefix)

`activated (bundle 0.2.1, history, threshold 0.75)`,
`disabled (enabled=false)`.

## Expected count

14 PASS.
