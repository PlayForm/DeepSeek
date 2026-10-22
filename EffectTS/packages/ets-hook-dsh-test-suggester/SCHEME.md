# SCHEME - @playform/hook-dsh-test-suggester

The complete scheme: every config field, every surface, every ledger string.

## Config (Schemastery, validated at load)

| Field             | Type     | Default                                   | Volatile | Notes                                                                                                   |
| ----------------- | -------- | ----------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------- |
| `log`             | boolean  | `true`                                    | yes      | The shared universal cell (the factory's minimal block).                                                |
| `logFile`         | string   | `~/.dsh/test-suggester.log`               | yes      | The hook's OWN ledger, one log per module.                                                              |
| `enabled`         | boolean  | `true`                                    | yes      | `false` logs `disabled (enabled=false)` and every listener passes through. The patch row ships `false`. |
| `threshold`       | number   | `0.75`                                    | yes      | The default confidence gate; per-intent thresholds may raise it, never lower it.                        |
| `maxCandidates`   | number   | `7`                                       | yes      | The note's candidate cap (the plan §3.7).                                                               |
| `maxNoteChars`    | number   | `1200`                                    | yes      | Hard character cap on the note text.                                                                    |
| `cooldownCalls`   | number   | `6`                                       | yes      | No second note for the same intent within this many judged calls, per agent.                            |
| `maxNotesPerTurn` | number   | `3`                                       | yes      | Reset per user turn (`agent/pre-step`).                                                                 |
| `intents`         | string[] | `[]` (all pack intents enabled)           | yes      | The enabled intent ids; unknown ids are ignored.                                                        |
| `emitOn`          | string[] | `["bash","glob","grep","read"]`           | yes      | The judged tool names.                                                                                  |
| `exclude`         | string[] | `["node_modules","Target",".git","dist"]` | yes      | Substrings; a candidate whose path matches one is never suggested.                                      |

## Surfaces

| Surface              | Mode                          | What it does                                                                                                                                                                          |
| -------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tools/post-execute` | waterfall, plain registration | `next()` first; detect → gate → prepend ONE labeled `additionalContexts` notice (source `{kind: 'test-suggester', form: 'notice', summary: '<Intent> <k>'}`); never replaces content. |
| `agent/pre-step`     | waterfall, plain              | Pure observer: resets the per-turn note counter when the step ends with a user message.                                                                                               |

## The embedded pack (`Source/Variable/Defaults.ts`, pack `test` v1)

| Intent   | Priority | Threshold | Signals (weight)                                     | Targets                                                                                                |
| -------- | -------- | --------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `Suite`  | 1        | 0.6       | test-shape (0.5), path-shape (0.4), loop-shape (0.3) | `Source/Test/<Suite>/Test.ts`, `Source/Test/<Suite>/README.md`, `Maintain/Run-Smokes.mjs`, `README.md` |
| `Counts` | 2        | 0.5       | count-shape (0.5), doc-shape (0.3)                   | `README.md`, `SCHEME.md`, `Site/Source/Library/Content.ts`                                             |

Confidence: `k = sigmoid(Σ weights − 0.6)`; the note emits iff `k ≥ gate`, the candidate set
survives the cap and the exclusion, and the cooldown/cap allow it. The pack's per-intent thresholds
(0.6 / 0.5) are set so that only full-evidence probes cross them (Suite needs all three signals: k
0.65; Counts needs both: k 0.55) - the config `threshold` may raise the gate, never lower it below
the pack floor.

## Ledger strings (byte-exact, module-owned)

```
test-suggester: activated (bundle 0.1.0, intents <n>, threshold <t>)
test-suggester: disabled (enabled=false)
test-suggester: suggest <Intent> <k> <n> candidates call <tool>
test-suggester: abstained ambiguous <Intent> <k>
test-suggester: suppressed cooldown <Intent>
test-suggester: suppressed cap <Intent>
```

## Identity (the four agreeing places)

1. Package name: `@playform/hook-dsh-test-suggester`.
2. The `name` export: `test-suggester`.
3. The State build's `module:` option: `test-suggester`.
4. The ledger `logFile` default: `~/.dsh/test-suggester.log`.
