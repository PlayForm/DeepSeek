Wiring-And-Ledger - the wiring and the ledger tests

The edit suggester's loader wiring and its durable proof: the loader
contract, the context-only listener registration, the byte-exact activation
and disabled lines (logger and durable forms), the config fail-loud, the
schema defaults on the built State, and the fs purity.

## Scenarios

- W1: the loader contract - the default object carries name, apply, Config,
  and inject (`["pluginFactory"]`) with the values equal to the named
  exports, and apply returns NOTHING (a returned value silently kills event
  delivery).
- W2: the enabled mount - the two listeners (`tools/post-execute`,
  `agent/pre-step`) plus the factory's `loader/volatile-update` register on
  the plugin context only (never on the root; the fake root is a distinct
  object), the root identity is not the plugin ctx, and the activation line
  `activated (bundle 0.2.0, families 7, threshold 0.75)` is byte-exact in
  the logger form and in the durable `[ISO]` form (exactly one line).
- W3: the disabled mount - `disabled (enabled=false)` is byte-exact in both
  forms, and every call passes through with zero new lines.
- W4: the fail-loud validation - a string `enabled` and a string
  `maxNoteChars` throw at load with the exact schema messages; the schema
  defaults land on the built State (threshold 0.75, the three judged tools,
  maxCompanions 7, maxNoteChars 1200, cooldownCalls 6, maxNotesPerTurn 3,
  the four exclude prefixes, the 7-family pack, the factory assigned).
- W5: the fs purity - the edit suggester is a NON-MANIFEST module: zero
  ctx.fs calls across emit and abstain, and no logger warnings.

## Fixtures

The shared Harness (fake ctx with a DISTINCT root object, the real factory,
the real built Target). No fake clock: the ring and the cooldown are
counters driven by judged calls; the durable ledger's ISO stamps are matched
with an anchored regex.

## Expected ledger strings (byte-exact, `hook-dsh-edit-suggester: ` prefix)

`activated (bundle 0.2.0, families 7, threshold 0.75)`,
`disabled (enabled=false)`.

## Expected count

12 PASS.
