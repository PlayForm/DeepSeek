Wiring-And-Ledger - the wiring and the ledger tests

The loader wiring of the search suggester and its durable proof: the loader contract, the five-listener registration, the byte-exact activation and disabled lines (logger and durable forms), the config fail-loud, the schema defaults and the cold knowledge load on the built State, and the fs purity.

## Scenarios

- W1: the loader contract, where the default object carries name, apply, Config, and inject (`["pluginFactory"]`) with the values equal to the named exports, and apply returns NOTHING (a returned value silently kills event delivery).
- W2: the enabled mount, where the five listeners (`session/event`, `tools/post-execute`, `agent/pre-step`, `system-prompt/assemble`, `tools/change`) plus the `loader/volatile-update` of the factory register on the plugin context only (never on the root, because the fake root is a distinct object), and the activation line `activated (bundle 0.2.1, history, threshold 0.75)` is byte-exact in the logger form and in the durable `[ISO]` form (exactly one line).
- W3: the disabled mount, where `disabled (enabled=false)` is byte-exact in both forms and every call passes through with zero new lines.
- W4: the fail-loud validation, where a string `maxCandidates` and a string `intents` throw at load with the exact schema messages; the schema defaults land on the built State (threshold 0.75, maxCandidates 7, maxNoteChars 1200, cooldownCalls 6, maxNotesPerTurn 3, learn true, learnWindow 2, sectionMode "off", sectionTtl 20, the four judged tools, the ten configurable kinds in priority order, the five exclude entries, an EMPTY `State.Pack`, the per-session `State.History` WeakMap, and the factory assigned); and the knowledge loads cold (zeroed stats) from a missing file.
- W5: the fs purity, where the suggester writes its knowledge through its own node:fs channel and never through ctx.fs: zero ctx.fs calls across a history emit and a no-history abstain, and no logger warnings.

## The history model

The activation's second segment is `history`, `State.Pack` is empty at apply (the built-in pack is retired), and the candidates come from the seeded session history.

## Expected ledger strings (byte-exact, `hook-dsh-search-suggester: ` prefix)

`activated (bundle 0.2.1, history, threshold 0.75)`, `disabled (enabled=false)`.

## Expected count

13 PASS.
