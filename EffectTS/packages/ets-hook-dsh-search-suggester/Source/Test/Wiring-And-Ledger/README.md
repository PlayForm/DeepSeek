Wiring-And-Ledger - the wiring and the ledger tests

The loader wiring of the search suggester and its durable proof: the loader contract, the four-listener registration, the byte-exact activation and disabled lines (logger and durable forms), the config fail-loud, the schema defaults and the cold knowledge load on the built State, and the fs purity.

## Scenarios

- W1: the loader contract, where the default object carries name, apply, Config, and inject (`["pluginFactory"]`) with the values equal to the named exports, and apply returns NOTHING (a returned value silently kills event delivery).
- W2: the enabled mount, where the four listeners (`tools/post-execute`, `agent/pre-step`, `system-prompt/assemble`, `tools/change`) plus the `loader/volatile-update` of the factory register on the plugin context only (never on the root, because the fake root is a distinct object), and the activation line `activated (bundle 0.3.0, intents 10, threshold 0.75)` is byte-exact in the logger form and in the durable `[ISO]` form (exactly one line).
- W3: the disabled mount, where `disabled (enabled=false)` is byte-exact in both forms and every call passes through with zero new lines.
- W4: the fail-loud validation, where a string `maxCandidates` and a string `intents` throw at load with the exact schema messages; the schema defaults land on the built State (threshold 0.75, maxCandidates 7, maxNoteChars 1200, cooldownCalls 6, maxNotesPerTurn 3, learn true, learnWindow 2, sectionMode "off", sectionTtl 20, the four judged tools, the ten intents in priority order, the five exclude entries, the 10-intent pack, and the factory assigned); and the knowledge loads cold (zeroed stats) from a missing file.
- W5: the fs purity, where the suggester writes its knowledge through its own node:fs channel and never through ctx.fs: zero ctx.fs calls across emit and abstain, and no logger warnings.

## Fixtures

The shared Harness (fake ctx with a DISTINCT root object, the real factory, the real built Target, a temp knowledge file).

There is no fake clock, because every timing assertion is on the counters of the ring and the learning window.

## Expected ledger strings (byte-exact, `hook-dsh-search-suggester: ` prefix)

`activated (bundle 0.3.0, intents 10, threshold 0.75)`, `disabled (enabled=false)`.

## Expected count

13 PASS.
