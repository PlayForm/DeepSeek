# SCHEME.md - @playform/hook-dsh-search-suggester (v0.3.0, TypeScript, function plugin)

Status: **IMPLEMENTED (wave 2d)**.

The P2 graph projection, the P3 offline seed, the P4 dismiss tool and replay benchmark, and the
fifteen smoke folders (126 PASS) are in the Source and the build.

## 0. What this plugin is

The search-intent **target suggester** prepends ONE labeled `additionalContexts` note on the
`tools/post-execute` waterfall when a search-class tool call (`grep`, `glob`, `read`, search-shaped
`bash`) matches one of the ten intent kinds, naming the likely target set (the standard locations
where that intent lives) before the model finishes searching.

The plugin is deterministic (no LLM in the hot path), gated hard, fail-open, and silent by default
(ships `enabled: false`).

Source of truth: `Documentation/Plans/SEARCH-SUGGESTER-PLUGIN.md`.

## 1. The surfaces

| Surface                  | Mode                          | What it does                                                                              |
| ------------------------ | ----------------------------- | ----------------------------------------------------------------------------------------- |
| `tools/post-execute`     | waterfall, plain registration | the note: `next()` first, then detect, gate, and prepend one `additionalContexts` message |
| `agent/pre-step`         | plain                         | the per-turn reset (ring, cooldowns, dedupe, counters) + the user-text capture (R12)      |
| `system-prompt/assemble` | waterfall, after `next()`     | the optional sticky section (`sectionMode: "sticky"`, off by default), TTL-rebuilt        |
| `tools/change`           | emit                          | the projection refresh (when `refreshOnBoot`) + the sticky section-cache invalidation     |
| `tools/pre-execute`      | NOT used                      | a suggestion cannot rewrite arguments; a deny would be a coach, not a suggester           |
| `tools` (register)       | the loader's tool API         | the `suggestion_dismiss` tool (guarded: a bare mount without `ctx.tools` still applies)   |

## 2. The config schema (Variable/Config.ts)

| Field             | Type     | Default                                                 | Volatile | Meaning                                                                                     |
| ----------------- | -------- | ------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------- |
| `log`             | boolean  | `true`                                                  | yes      | Ledger enabled                                                                              |
| `logFile`         | string   | `~/.dsh/playform/hook-dsh-search-suggester.log`         | yes      | The suggester's own ledger (one log per module)                                             |
| `enabled`         | boolean  | `true` (patch ships `false`)                            | yes      | The master switch                                                                           |
| `threshold`       | number   | `0.75`                                                  | yes      | The default confidence gate (destructive intents: 0.85 in the pack)                         |
| `maxCandidates`   | number   | `7`                                                     | yes      | Maximum candidates in one note                                                              |
| `maxNoteChars`    | number   | `1200`                                                  | yes      | Hard character cap on the note text                                                         |
| `cooldownCalls`   | number   | `6`                                                     | yes      | No second note for the same intent within this many judged calls                            |
| `maxNotesPerTurn` | number   | `3`                                                     | yes      | Maximum notes per turn, per agent                                                           |
| `intents`         | string[] | the ten kinds in priority order                         | yes      | The enabled intent kinds                                                                    |
| `emitOn`          | string[] | `["grep","glob","read","bash"]`                         | yes      | The judged tools                                                                            |
| `scopeRoots`      | string[] | `["."]`                                                 | yes      | The scope roots                                                                             |
| `exclude`         | string[] | `["node_modules","Target",".git","Site/Target","dist"]` | yes      | The excluded directories                                                                    |
| `learn`           | boolean  | `true`                                                  | yes      | The online learner switch                                                                   |
| `learnWindow`     | number   | `2`                                                     | yes      | The learner's observation window (judged calls)                                             |
| `persistPath`     | string   | `~/.dsh/search-suggester/knowledge.json`                | no       | The learned knowledge file (remounts on edit)                                               |
| `indexPath`       | string   | `~/.dsh/search-suggester/index.json`                    | no       | RETIRED by the P2 re-spec (the graph projection supersedes the generated index); never read |
| `refreshOnBoot`   | boolean  | `true`                                                  | no       | The projection refresh: rebuild it on `tools/change` (false freezes it)                     |
| `dismissTtl`      | number   | `86400`                                                 | yes      | The dismissal TTL in seconds (`until = now + dismissTtl`)                                   |
| `seed`            | boolean  | `true`                                                  | yes      | Seed the knowledge at load from the built-in pack + the projection                          |
| `sectionMode`     | string   | `"off"`                                                 | yes      | The second surface: `off` or `sticky`                                                       |
| `sectionTtl`      | number   | `20`                                                    | yes      | The sticky section's TTL in judged calls                                                    |

## 3. The ledger (byte-stable strings, Function-owned)

```
search-suggester: disabled (enabled=false)
search-suggester: activated (bundle 0.3.0, intents 10, threshold 0.75)
search-suggester: suggest <Intent> <k> <n> candidates
search-suggester: abstained low-confidence <Intent> <k>
search-suggester: abstained ambiguous-target <Intent> <k>
search-suggester: abstained no-companions <Intent> <k>
search-suggester: abstained no-signal <Intent> <k>
search-suggester: abstained foreign-workspace <Intent> <k>
search-suggester: suppressed cooldown <Intent>
search-suggester: suppressed dedupe <Intent>
search-suggester: suppressed cap <Intent>
search-suggester: suppressed dismissed <Intent>
search-suggester: followed <Intent> <path>
search-suggester: ignored <Intent>
search-suggester: dismissed <Intent> <path|*>
search-suggester: section rebuilt (ttl <n>)
search-suggester: section invalidated (tools/change)
```

The activation line uses the core's `Activate` composer and the module's own field list, and every
other string is composed in Function/Apply (the dismiss record line in Function/Dismiss).

THE P2 GRAPH PROJECTION adds NO ledger string, because the projection is proven by the note's order
and the sticky section's text, never by a line.

THE DISMISS TOOL adds two: the record line `dismissed <Intent> <path|*>` (`*` is the family
dismissal) and the suppression `suppressed dismissed <Intent>` (the family dismissal, or the
dismissal that emptied the candidate list, holds the note back until the entry expires).

The post-execute listener resolves the workspace root before the score (the nearest ancestor whose
PACK SIGNATURE matches, where the signature is the resolved pack's `signature` list, defaulting to
`Documentation/ARCHIVE-STYLE.md`, from the call path plus the session cwd).

A foreign workspace has no pack and logs `abstained foreign-workspace  0.00` (the gate runs before
the intent is known, so the intent segment is empty and the kappa is the no-signal 0.00).

The resolved pack's `search/` intents (`Families(pack, "search")`) drive Detect, so a repo pack
overrides the built-in intents without a restart.

With the root known, a candidate is kept when it exists under ANY of the call's three bases (the
repo root, the package root, which is the nearest ancestor of the resolved call path carrying
`package.json` at or below the repo root, and the package parent), so repo-relative,
package-relative, and sibling-relative pack paths all survive.

A winning intent with none left logs `abstained no-companions <Intent> <k>`.

The sticky section (`system-prompt/assemble`) resolves the same way from the process's workspace
pack.

## 4. The architecture

```
Source/
  Library.ts            the entry: name, apply, Config, inject (pluginFactory)
  Function/
    Apply.ts            the wiring: the State build, the seed, the projection
                        cache, the activation, the 4 listeners, the tool
    Pack.ts             the search projection of the built-in pack (@playform/lib-dsh-pack):
                        10 intents, signals, thresholds, targets (thin projection, no data)
    Detect.ts           the deterministic classifier (R1-R13), pure, no LLM
    Score.ts            k = sigmoid(sum - 0.6); the candidate scoring; the gate
                        (the projection's scope/literal, the dismissal filter)
    Note.ts             the labeled additionalContexts message + the 120-char summary
    Ring.ts             the per-agent state: the last 8 calls, cooldowns, dedupe, cap
    Persist.ts          the knowledge file: load, follow/ignore/dismiss, atomic save 0600
    Projection.ts       the P2 graph projection builder (the optional workspaceGraph probe)
    Measure.ts          one candidate against the projection (the scope/literal rules)
    Projected.ts        the projected index: the top graph paths per intent (the section)
    Seed.ts             the P3 offline seed (the built-in canonical set + the projection)
    Dismiss.ts          the P4 `suggestion_dismiss` tool definition
    Benchmark.ts        the P4 replay scorer (precision/recall/first-note)
  Interface/
    Config.ts           the validated config shape
    Execution.ts        the pack/detection/verdict/knowledge types
    Projection.ts       the projection + fact shapes
    Measurement.ts      one candidate's measured scores
    Benchmark.ts        one replayed note
    Factory.ts          the factory service's structural view + the Context augmentation
    State.ts            the per-apply state
  Variable/
    Config.ts           the Schemastery schema (plan section 4.8 + this wave's fields)
    Kinds.ts            the expected graph node kinds per intent
    Sequence.ts         the fixed fifty-call replay corpus + the lane targets
```

## 5. The current state

The P2/P3/P4 items of the plan landed:

- THE GRAPH PROJECTION (P2): the neutral 0.5 literal is replaced by the `ctx.workspaceGraph`
  projection (`Function/Projection`, `Function/Measure`, `Function/Projected`), the sticky section
  renders the projected index, the absent or empty graph keeps the documented neutral fallback, and
  `indexPath` is retired (never read).
- THE OFFLINE SEED (P3): `Function/Seed` runs at load with source = the built-in pack's canonical
  candidates + the graph projection, persisted by the existing store on the next real write.
- THE DISMISS TOOL (P4): `suggestion_dismiss` goes through the loader's tool API, the durable
  dismissal uses the `dismissTtl` expiry, and two documented ledger strings result.
- THE REPLAY BENCHMARK (P4): `Variable/Sequence` + `Function/Benchmark` with the recorded baseline
  `calls=50 notes=5 precision=1.00 recall=0.70 first-note=1`.

The nine suites exist: `Classification`, `Threshold-And-Cooldown`, `Delivery-And-Label` (covered by
Post-Execute-And-Learning), `Abstention`, `Learning-Update` (covered by Post-Execute-And-Learning),
`Persistence`, `Index-Refresh` (re-specified onto the projection), `Noise`, `Ledger` (covered by
Wiring-And-Ledger).

The wave adds four capability folders (`Projection`, `Dismiss`, `Seed`, `Benchmark`), for fifteen
folders and 126 PASS.

Residuals (not silently dropped):

- the plan's section 3.4 scope override (a lockfile grep is Dependency, not Version) is not
  implemented, because the signals carry no scope weight;
- the plan's section 2.4 search-specific abstentions 4 and 5 (the exploratory-question gate, the
  read-only-subagent threshold bump) are not implemented;
- the near-miss rule and the `history -= 0.2` ignored penalty (plan 6.2) are not implemented,
  because an ignored window moves the stats and the journal only;
- the ETS twin (`@playform/ets-hook-dsh-search-suggester`) is deferred by the wave's scope.
