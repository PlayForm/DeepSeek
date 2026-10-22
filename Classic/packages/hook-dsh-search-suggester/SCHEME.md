# SCHEME.md - @playform/hook-dsh-search-suggester (v0.1.0, TypeScript, function plugin)

Status: **IMPLEMENTED (PoC phase)** - the Source is complete; the build, the tsc check, and the
smoke suites are the end-phase (POC-BRIEF.md section 8).

## 0. What this plugin is

The search-intent **target suggester**: when a search-class tool call (`grep`, `glob`, `read`,
search-shaped `bash`) matches one of the ten intent kinds, the plugin prepends ONE labeled
`additionalContexts` note on the `tools/post-execute` waterfall naming the likely target set - the
standard locations where that intent lives - before the model finishes searching. Deterministic (no
LLM in the hot path), gated hard, fail-open, and silent by default (ships `enabled: false`).

Source of truth: `Documentation/Plans/SEARCH-SUGGESTER-PLUGIN.md`.

## 1. The surfaces

| Surface                  | Mode                          | What it does                                                                              |
| ------------------------ | ----------------------------- | ----------------------------------------------------------------------------------------- |
| `tools/post-execute`     | waterfall, plain registration | the note: `next()` first, then detect, gate, and prepend one `additionalContexts` message |
| `agent/pre-step`         | plain                         | the per-turn reset (ring, cooldowns, dedupe, counters) + the user-text capture (R12)      |
| `system-prompt/assemble` | waterfall, after `next()`     | the optional sticky section (`sectionMode: "sticky"`, off by default), TTL-rebuilt        |
| `tools/change`           | emit                          | the sticky section-cache invalidation only                                                |
| `tools/pre-execute`      | NOT used                      | a suggestion cannot rewrite arguments; a deny would be a coach, not a suggester           |

## 2. The config schema (Variable/Config.ts)

| Field             | Type     | Default                                                 | Volatile | Meaning                                                             |
| ----------------- | -------- | ------------------------------------------------------- | -------- | ------------------------------------------------------------------- |
| `log`             | boolean  | `true`                                                  | yes      | Ledger enabled                                                      |
| `logFile`         | string   | `~/.dsh/search-suggester.log`                           | yes      | The suggester's own ledger (one log per module)                     |
| `enabled`         | boolean  | `true` (patch ships `false`)                            | yes      | The master switch                                                   |
| `threshold`       | number   | `0.75`                                                  | yes      | The default confidence gate (destructive intents: 0.85 in the pack) |
| `maxCandidates`   | number   | `7`                                                     | yes      | Maximum candidates in one note                                      |
| `maxNoteChars`    | number   | `1200`                                                  | yes      | Hard character cap on the note text                                 |
| `cooldownCalls`   | number   | `6`                                                     | yes      | No second note for the same intent within this many judged calls    |
| `maxNotesPerTurn` | number   | `3`                                                     | yes      | Maximum notes per turn, per agent                                   |
| `intents`         | string[] | the ten kinds in priority order                         | yes      | The enabled intent kinds                                            |
| `emitOn`          | string[] | `["grep","glob","read","bash"]`                         | yes      | The judged tools                                                    |
| `scopeRoots`      | string[] | `["."]`                                                 | yes      | The scope roots                                                     |
| `exclude`         | string[] | `["node_modules","Target",".git","Site/Target","dist"]` | yes      | The excluded directories                                            |
| `learn`           | boolean  | `true`                                                  | yes      | The online learner switch                                           |
| `learnWindow`     | number   | `2`                                                     | yes      | The learner's observation window (judged calls)                     |
| `persistPath`     | string   | `~/.dsh/search-suggester/knowledge.json`                | no       | The learned knowledge file (remounts on edit)                       |
| `indexPath`       | string   | `~/.dsh/search-suggester/index.json`                    | no       | The static index file (remounts on edit)                            |
| `refreshOnBoot`   | boolean  | `true`                                                  | no       | Rebuild the index on boot when the fingerprint differs              |
| `sectionMode`     | string   | `"off"`                                                 | yes      | The second surface: `off` or `sticky`                               |
| `sectionTtl`      | number   | `20`                                                    | yes      | The sticky section's TTL in judged calls                            |

## 3. The ledger (byte-stable strings, Function-owned)

```
search-suggester: disabled (enabled=false)
search-suggester: activated (bundle 0.1.0, intents 10, threshold 0.75)
search-suggester: suggest <Intent> <k> <n> candidates
search-suggester: abstained low-confidence <Intent> <k>
search-suggester: abstained ambiguous-target <Intent> <k>
search-suggester: abstained no-signal <Intent> <k>
search-suggester: suppressed cooldown <Intent>
search-suggester: suppressed dedupe <Intent>
search-suggester: suppressed cap <Intent>
search-suggester: followed <Intent> <path>
search-suggester: ignored <Intent>
search-suggester: section rebuilt (ttl <n>)
search-suggester: section invalidated (tools/change)
```

The activation line uses the core's `Activate` composer and the module's own field list; every other
string is composed in Function/Apply.

## 4. The architecture

```
Source/
  Library.ts            the entry: name, apply, Config, inject (pluginFactory)
  Function/
    Apply.ts            the wiring: the State build, the activation, the 4 listeners
    Pack.ts             the embedded SEARCH pack: 10 intents, signals, thresholds, targets
    Detect.ts           the deterministic classifier (R1-R13), pure, no LLM
    Score.ts            k = sigmoid(sum - 0.6); the candidate scoring; the gate
    Note.ts             the labeled additionalContexts message + the 120-char summary
    Ring.ts             the per-agent state: the last 8 calls, cooldowns, dedupe, cap
    Persist.ts          the knowledge file: load, follow/ignore, atomic save 0600
  Interface/
    Config.ts           the validated config shape
    Execution.ts        the pack/detection/verdict/knowledge types
    Factory.ts          the factory service's structural view + the Context augmentation
    State.ts            the per-apply state
  Variable/
    Config.ts           the Schemastery schema (plan section 4.8)
```

## 5. The end-phase

The generated repo index (`Maintain/Index-Search-Targets.mjs`), the offline seed, the nine smoke
suites (Classification, Threshold-And-Cooldown, Delivery-And-Label, Abstention, Learning-Update,
Persistence, Index-Refresh, Noise, Ledger), the replay benchmark, and the ETS twin
(`@playform/ets-hook-dsh-search-suggester`) - POC-BRIEF.md section 8.
