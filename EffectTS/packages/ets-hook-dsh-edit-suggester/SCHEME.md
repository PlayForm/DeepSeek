# SCHEME.md - @playform/hook-dsh-edit-suggester (v0.1.0, TypeScript, function plugin)

Status: **IMPLEMENTED (PoC phase)** - the Source is complete; the build, the tsc check, and the
smoke suites are the end-phase (POC-BRIEF.md section 8).

## 0. What this plugin is

The modification-intent **companion suggester**: when a `write`/`edit`/ `raw-write` call lands on a
path matching one of the seven convention families, the plugin prepends ONE labeled
`additionalContexts` note on the `tools/post-execute` waterfall naming the standard companions the
model has not touched yet. Deterministic path rules, no LLM, gated hard, fail-open, and silent by
default (ships `enabled: false`). It is the second consumer of the search-suggester's pattern
algebra and the two-consumer extraction trigger.

Source of truth: `Documentation/Plans/SEARCH-SUGGESTER-PLUGIN.md` (sections 1.4, 8, and the shared
algebra of section 3).

## 1. The surfaces

| Surface              | Mode                          | What it does                                                                              |
| -------------------- | ----------------------------- | ----------------------------------------------------------------------------------------- |
| `tools/post-execute` | waterfall, plain registration | the note: `next()` first, then detect, gate, and prepend one `additionalContexts` message |
| `agent/pre-step`     | plain                         | the per-turn reset (touched paths, cooldowns, dedupe, counters)                           |
| `tools/pre-execute`  | NOT used                      | a suggestion cannot rewrite arguments; a deny would be a coach, not a suggester           |

## 2. The config schema (Variable/Config.ts)

| Field             | Type     | Default                                   | Volatile | Meaning                                                          |
| ----------------- | -------- | ----------------------------------------- | -------- | ---------------------------------------------------------------- |
| `log`             | boolean  | `true`                                    | yes      | Ledger enabled                                                   |
| `logFile`         | string   | `~/.dsh/edit-suggester.log`               | yes      | The suggester's own ledger (one log per module)                  |
| `enabled`         | boolean  | `true` (patch ships `false`)              | yes      | The master switch                                                |
| `threshold`       | number   | `0.75`                                    | yes      | The default confidence gate (Version: 0.85 in the pack)          |
| `tools`           | string[] | `["write","edit","raw-write"]`            | yes      | The judged modification tools                                    |
| `maxCompanions`   | number   | `7`                                       | yes      | Maximum companions in one note                                   |
| `maxNoteChars`    | number   | `1200`                                    | yes      | Hard character cap on the note text                              |
| `cooldownCalls`   | number   | `6`                                       | yes      | No second note for the same family within this many judged calls |
| `maxNotesPerTurn` | number   | `3`                                       | yes      | Maximum notes per turn, per agent                                |
| `exclude`         | string[] | `["node_modules","Target",".git","dist"]` | yes      | The excluded directories                                         |

## 3. The ledger (byte-stable strings, Function-owned)

```
edit-suggester: disabled (enabled=false)
edit-suggester: activated (bundle 0.1.0, families 7, threshold 0.75)
edit-suggester: suggest <Family> <k> <n> companions <edited path>
edit-suggester: abstained low-confidence <Family> <k>
edit-suggester: abstained ambiguous-target <Family> <k>
edit-suggester: abstained already-touched <Family> <k>
edit-suggester: abstained no-signal <Family> <k>
edit-suggester: suppressed cooldown <Family>
edit-suggester: suppressed dedupe <Family>
edit-suggester: suppressed cap <Family>
```

The activation line uses the core's `Activate` composer and the module's own field list; every other
string is composed in Function/Apply.

## 4. The architecture

```
Source/
  Library.ts            the entry: name, apply, Config, inject (pluginFactory)
  Function/
    Apply.ts            the wiring: the State build, the activation, the 2 listeners
    Pack.ts             the embedded CONVENTION pack: 7 families, path rules, companions
    Detect.ts           the deterministic path classifier, pure, no LLM
    Score.ts            k = sigmoid(sum - 0.6); the companion scoring; the gate
    Note.ts             the labeled additionalContexts message + the 120-char summary
    Ring.ts             the per-agent state: touched paths, cooldowns, dedupe, cap
  Interface/
    Config.ts           the validated config shape
    Execution.ts        the family/detection/verdict types
    Factory.ts          the factory service's structural view + the Context augmentation
    State.ts            the per-apply state
  Variable/
    Config.ts           the Schemastery schema
```

## 5. The end-phase

The smoke suites (Path-Classification, Threshold-And-Cooldown, Delivery-And-Label, Noise, Ledger),
the learned layer (the Laplace history and the journal, ported from the search consumer's Persist),
the replay benchmark on the recorded lanes, and the ETS twin
(`@playform/ets-hook-dsh-edit-suggester`) - POC-BRIEF.md section 8.
