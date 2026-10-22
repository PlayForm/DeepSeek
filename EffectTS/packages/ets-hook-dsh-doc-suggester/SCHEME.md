# SCHEME.md - @playform/hook-dsh-doc-suggester (v0.1.0, TypeScript, function plugin)

Status: **IMPLEMENTED (PoC phase)** - the Source is complete; the build, the
tsc check, and the smoke suites are the end-phase (POC-BRIEF.md section 8).

## 0. What this plugin is

The doc-task **companion suggester**: when a judged call names a
documentation path matching one of the seven families, the plugin prepends
ONE labeled `additionalContexts` note on the `tools/post-execute` waterfall
naming the doc-graph companions the task conventionally requires.
Deterministic path rules, no LLM, gated hard, fail-open, and silent by
default (ships `enabled: false`). It is the third consumer of the
search-suggester's pattern algebra.

Source of truth: `Documentation/Plans/SEARCH-SUGGESTER-PLUGIN.md` (sections
3.6 Doc, 8, and the shared algebra of section 3).

## 1. The surfaces

| Surface | Mode | What it does |
| ------- | ---- | ------------ |
| `tools/post-execute` | waterfall, plain registration | the note: `next()` first, then detect, gate, and prepend one `additionalContexts` message |
| `agent/pre-step` | plain | the per-turn reset (touched paths, cooldowns, dedupe, counters) |
| `tools/pre-execute` | NOT used | a suggestion cannot rewrite arguments; a deny would be a coach, not a suggester |

## 2. The config schema (Variable/Config.ts)

| Field | Type | Default | Volatile | Meaning |
| ----- | ---- | ------- | -------- | ------- |
| `log` | boolean | `true` | yes | Ledger enabled |
| `logFile` | string | `~/.dsh/doc-suggester.log` | yes | The suggester's own ledger (one log per module) |
| `enabled` | boolean | `true` (patch ships `false`) | yes | The master switch |
| `threshold` | number | `0.75` | yes | The default confidence gate (the pack rows override per family) |
| `tools` | string[] | `["read","grep","glob","write","edit","raw-write"]` | yes | The judged doc-task tools |
| `maxCompanions` | number | `7` | yes | Maximum companions in one note |
| `maxNoteChars` | number | `1200` | yes | Hard character cap on the note text |
| `cooldownCalls` | number | `6` | yes | No second note for the same family within this many judged calls |
| `maxNotesPerTurn` | number | `3` | yes | Maximum notes per turn, per agent |
| `exclude` | string[] | `["node_modules","Target",".git","dist"]` | yes | The excluded directories |

## 3. The ledger (byte-stable strings, Function-owned)

```
doc-suggester: disabled (enabled=false)
doc-suggester: activated (bundle 0.1.0, families 7, threshold 0.75)
doc-suggester: suggest <Family> <k> <n> companions <doc path>
doc-suggester: abstained low-confidence <Family> <k>
doc-suggester: abstained ambiguous-target <Family> <k>
doc-suggester: abstained already-touched <Family> <k>
doc-suggester: abstained no-signal <Family> <k>
doc-suggester: suppressed cooldown <Family>
doc-suggester: suppressed dedupe <Family>
doc-suggester: suppressed cap <Family>
```

The activation line uses the core's `Activate` composer and the module's own
field list; every other string is composed in Function/Apply.

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

The smoke suites (Path-Classification, Threshold-And-Cooldown,
Delivery-And-Label, Noise, Ledger), the learned layer, the replay benchmark,
and the ETS twin (`@playform/ets-hook-dsh-doc-suggester`) - POC-BRIEF.md
section 8.
