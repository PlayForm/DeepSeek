# SCHEME - @playform/hook-dsh-convention-suggester

The complete scheme: every config field, every surface, every ledger string.

## Config (Schemastery, validated at load)

| Field             | Type     | Default                                   | Volatile | Notes                                                                                                   |
| ----------------- | -------- | ----------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------- |
| `log`             | boolean  | `true`                                    | yes      | The shared universal cell (the factory's minimal block).                                                |
| `logFile`         | string   | `~/.dsh/convention-suggester.log`         | yes      | The hook's OWN ledger, one log per module.                                                              |
| `enabled`         | boolean  | `true`                                    | yes      | `false` logs `disabled (enabled=false)` and every listener passes through. The patch row ships `false`. |
| `threshold`       | number   | `0.75`                                    | yes      | The default confidence gate; per-intent thresholds may raise it, never lower it.                        |
| `maxCandidates`   | number   | `7`                                       | yes      | The note's candidate cap (the plan §3.7).                                                               |
| `maxNoteChars`    | number   | `1200`                                    | yes      | Hard character cap on the note text.                                                                    |
| `cooldownCalls`   | number   | `6`                                       | yes      | No second note for the same intent within this many judged calls, per agent.                            |
| `maxNotesPerTurn` | number   | `3`                                       | yes      | Reset per user turn (`agent/pre-step`).                                                                 |
| `intents`         | string[] | `[]` (all pack intents enabled)           | yes      | The enabled intent ids; unknown ids are ignored.                                                        |
| `emitOn`          | string[] | `["edit","raw-write","write"]`            | yes      | The judged tool names (the modification family).                                                        |
| `exclude`         | string[] | `["node_modules","Target",".git","dist"]` | yes      | Substrings; a candidate whose path matches one is never suggested.                                      |

## Surfaces

| Surface              | Mode                          | What it does                                                                                                                                                                                |
| -------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tools/post-execute` | waterfall, plain registration | `next()` first; detect → gate → prepend ONE labeled `additionalContexts` notice (source `{kind: 'convention-suggester', form: 'notice', summary: '<Intent> <k>'}`); never replaces content. |
| `agent/pre-step`     | waterfall, plain              | Pure observer: resets the per-turn note counter when the step ends with a user message.                                                                                                     |

## The embedded pack (`Source/Variable/Defaults.ts`, pack `convention` v1)

| Intent   | Priority | Threshold | Signals (weight)                                        | Targets                                                                                                    |
| -------- | -------- | --------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `Layout` | 1        | 0.75      | layout-shape (2.0), entry-shape (1.5), test-shape (1.5) | `Source/Library.ts`, `Source/Function/<Name>.ts`, `README.md`, `SCHEME.md`                                 |
| `Naming` | 2        | 0.75      | source-shape (2.0), identifier-shape (1.5)              | `Source/Function/*.ts`, `Source/Interface/*.ts`, `Source/Variable/*.ts`                                    |
| `Docs`   | 3        | 0.75      | pkg-shape (2.0), source-shape (1.5)                     | `README.md`, `SCHEME.md`, `cordis.patch.yml`                                                               |
| `Ledger` | 4        | 0.85      | ledger-shape (2.5), identity-shape (1.5)                | `Source/Function/Apply.ts`, `Source/Variable/Config.ts`, `cordis.patch.yml`, `Source/Test/<Suite>/Test.ts` |

Confidence: `k = sigmoid(Σ weights − 0.6)`; the note emits iff `k ≥ gate`, the candidate set
survives the cap and the exclusion, and the cooldown/cap allow it.

## Ledger strings (byte-exact, module-owned)

```
convention-suggester: activated (bundle 0.1.0, intents <n>, threshold <t>)
convention-suggester: disabled (enabled=false)
convention-suggester: suggest <Intent> <k> <n> candidates call <tool>
convention-suggester: abstained ambiguous <Intent> <k>
convention-suggester: suppressed cooldown <Intent>
convention-suggester: suppressed cap <Intent>
```

## Identity (the four agreeing places)

1. Package name: `@playform/hook-dsh-convention-suggester`.
2. The `name` export: `convention-suggester`.
3. The State build's `module:` option: `convention-suggester`.
4. The ledger `logFile` default: `~/.dsh/convention-suggester.log`.
