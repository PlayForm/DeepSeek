# SCHEME.md - @playform/hook-dsh-search-suggester (v0.2.1, TypeScript, function plugin)

Status: **IMPLEMENTED (the history model)** - the session-projection history unit, the synthetic
`History` family, the explicit-only pack, the P2 graph projection, the P3 offline seed, the P4
dismiss tool and replay benchmark, and the fifteen smoke folders (128 PASS) are in the Source and
the build.

## 0. What this plugin is

The search-intent **companion suggester**: when a search-class tool call (`grep`, `glob`, `read`,
search-shaped `bash`) lands on a path whose session history knows the next files, the plugin
prepends ONE labeled `additionalContexts` note on the `tools/post-execute` waterfall naming them,
before the model finishes searching.

The candidates come from the agent's OWN previous tool calls in this workspace. The literal built-in
pack is retired; a pack survives only as an explicit user/repo override.

It is deterministic (no LLM in the hot path), gated hard, fail-open, and silent by default (it ships
`enabled: false`).

Source of truth: `Documentation/Plans/SEARCH-SUGGESTER-PLUGIN.md`.

## 1. The surfaces

| Surface                                | Mode                          | What it does                                                                                                                                                                                                                                                                  |
| -------------------------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sessionProjections` (projection unit) | pure fold, host-only          | `apply(state, event)` folds every committed `tool/call` that names a path into the session's `{ Seq, Touches }` (cap 512); registered through `ctx.inject(['sessionProjections'], ...)`, read at detection through `stateOf(session, key)`. No `wire` block: no client value. |
| `tools/post-execute`                   | waterfall, plain registration | the note: `next()` first, then the gate, the history, the explicit pack, and the score                                                                                                                                                                                        |
| `agent/pre-step`                       | plain                         | the per-turn reset (ring, cooldowns, dedupe, counters) + the user-text capture (R12)                                                                                                                                                                                          |
| `system-prompt/assemble`               | waterfall, after `next()`     | the optional sticky section (`sectionMode: "sticky"`, off by default), TTL-rebuilt                                                                                                                                                                                            |
| `tools/change`                         | emit                          | the sticky section-cache invalidation                                                                                                                                                                                                                                         |
| `tools/pre-execute`                    | NOT used                      | a suggestion cannot rewrite arguments; a deny would be a coach, not a suggester                                                                                                                                                                                               |
| `tools` (register)                     | the loader's tool API         | the `suggestion_dismiss` tool (guarded: a bare mount without `ctx.tools` still applies)                                                                                                                                                                                       |

## 2. The config schema (Variable/Config.ts)

| Field             | Type     | Default                                                 | Volatile | Meaning                                                                                                 |
| ----------------- | -------- | ------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------- |
| `enabled`         | boolean  | `true` (patch ships `false`)                            | yes      | The master switch                                                                                       |
| `log`             | boolean  | `true`                                                  | yes      | Ledger enabled                                                                                          |
| `logFile`         | string   | `~/.dsh/playform/hook-dsh-search-suggester.log`         | yes      | The suggester's own ledger (one log per module)                                                         |
| `threshold`       | number   | `0.75`                                                  | yes      | The default confidence gate (the synthetic family's own gate is 0.75; a config value can only raise it) |
| `maxCandidates`   | number   | `7`                                                     | yes      | Maximum candidates in one note (and the `Adjacent` limit)                                               |
| `maxNoteChars`    | number   | `1200`                                                  | yes      | Hard character cap on the note text                                                                     |
| `cooldownCalls`   | number   | `6`                                                     | yes      | No second note for the same family within this many judged calls                                        |
| `maxNotesPerTurn` | number   | `3`                                                     | yes      | Maximum notes per turn, per agent                                                                       |
| `intents`         | string[] | the ten former kinds in priority order                  | yes      | Filters an EXPLICIT pack's families (the synthetic `History` row is never filtered)                     |
| `emitOn`          | string[] | `["grep","glob","read","bash"]`                         | yes      | The judged tools                                                                                        |
| `scopeRoots`      | string[] | `["."]`                                                 | yes      | The scope roots                                                                                         |
| `exclude`         | string[] | `["node_modules","Target",".git","Site/Target","dist"]` | yes      | The excluded directories                                                                                |
| `learn`           | boolean  | `true`                                                  | yes      | The online learner switch                                                                               |
| `learnWindow`     | number   | `2`                                                     | yes      | The learner's observation window (judged calls)                                                         |
| `persistPath`     | string   | `~/.dsh/search-suggester/knowledge.json`                | no       | The learned knowledge file (remounts on edit)                                                           |
| `indexPath`       | string   | `~/.dsh/search-suggester/index.json`                    | no       | RETIRED by the P2 re-spec (the graph projection supersedes the generated index); never read             |
| `refreshOnBoot`   | boolean  | `true`                                                  | no       | The projection refresh: rebuild it on `tools/change` (false freezes it)                                 |
| `dismissTtl`      | number   | `86400`                                                 | yes      | The dismissal TTL in seconds (`until = now + dismissTtl`)                                               |
| `seed`            | boolean  | `true`                                                  | yes      | Seed the knowledge at load from an EXPLICIT pack + the projection (a repo without one seeds nothing)    |
| `sectionMode`     | string   | `"off"`                                                 | yes      | The second surface: `off` or `sticky`                                                                   |
| `sectionTtl`      | number   | `20`                                                    | yes      | The sticky section's TTL in judged calls                                                                |

## 3. The ledger (byte-stable strings, Function-owned)

```
search-suggester: disabled (enabled=false)
search-suggester: activated (bundle 0.2.1, history, threshold 0.75)
search-suggester: suggest <Family> <k> <n> candidates
search-suggester: abstained low-confidence <Family> <k>
search-suggester: abstained ambiguous-target <Family> <k>
search-suggester: abstained no-companions <Family> <k>
search-suggester: abstained no-signal  0.00
search-suggester: abstained foreign-workspace  0.00
search-suggester: abstained no-history  0.00
search-suggester: suppressed cooldown <Family>
search-suggester: suppressed dedupe <Family>
search-suggester: suppressed cap <Family>
search-suggester: suppressed dismissed <Family>
search-suggester: followed <Family> <path>
search-suggester: ignored <Family>
search-suggester: dismissed <Family> <path|*>
search-suggester: section rebuilt (ttl <n>)
search-suggester: section invalidated (tools/change)
```

The activation line uses the `Activate` composer of the core and the own field list of the module.
Its second segment is `history`, not a family count: there is no boot pack, because the candidates
come from the session's own tool calls.

Every other string is composed in Function/Apply (the dismiss record line in Function/Dismiss).

THE THREE EMPTY-FAMILY LINES carry a double space: `abstained no-signal  0.00`,
`abstained foreign-workspace  0.00`, `abstained no-history  0.00`. The gate runs before the family
is known, so the family segment is empty and the kappa is the no-signal 0.00.

THE HISTORY SOURCE. The history is a session-projection unit (`Function/Unit`, key `searchHistory`),
not a listener fold and not a `State` WeakMap: `ctx.sessionProjections` subscribes to
`session/event` ONCE and passes every committed event through the unit's `apply`, so the hook holds
no subscription of its own. Every `tool/call` that names a path becomes one `Touch` (the sequence
number, the normalized path and the tool) in THAT SESSION's cell, through the pack library's `Fold`.
The unit is registered through the optional `ctx.inject(['sessionProjections'], ...)` form
(`Function/Register`), so a mount without the registry still loads and simply has no history to
mine; the detection-time read is the registry's own face, `stateOf(session, key)`
(`Function/History`), probed with `ctx.get` because the registry is an optional service.

The state is one cell per session, built lazily from `init` (`{ Seq: 0, Touches: [] }`) and rebuilt
from the log on first touch; the touch array is capped at 512, oldest first. `apply` returns the
SAME state reference for an event it ignores (the registry's zero-work signal) and a NEW plain-JSON
state for a folded call. The persisted-state validator (`stateSchema`, version 1) sanitizes a cached
row instead of throwing, so a damaged row degrades to a shorter history rather than a failed read.
There is NO post-execute append: the harness commits `tool/call` as the call's STARTED record before
dispatch, so the anchor is already folded when the listener runs.

On a judged call the anchor is the call's own `path`/`file_path` argument when it carries one,
otherwise the directory of the call's path-shaped target argument, otherwise the session cwd; and
`Adjacent(touches, anchor, { limit: maxCandidates })` yields the co-touch candidates.

When the adjacency is non-empty the listener builds ONE synthetic family:

```
{ id: "History", priority: 0, threshold: 0.75,
  note: "these files were touched right after similar calls in this workspace",
  familyGlobs: [],
  signals: [{ rule: "history", pattern: ".", weight: 2.5 }],
  targets: [{ path, kind: "", prior: 0.6,
              reason: "touched <n> time(s) after a similar call" }] }
```

and PREPENDS it as data to the compiled family list, so the existing Detect/Filter/Score pipeline
judges it exactly like a pack row. Its confidence is `sigmoid(2.5 - 0.6) = 0.87` (0.89 on the R13
loop bonus).

THE WORKSPACE GATE resolves the PACK-INDEPENDENT root (`Root` of `@playform/lib-dsh-pack`: the
nearest ancestor carrying `.git` or `package.json`, from the call path plus the session cwd) before
any candidate work. A call outside any workspace abstains `foreign-workspace  0.00`.

THE EXPLICIT PACK. `Resolve(root, { home: Home(), builtin: false })` reads `<repo>/.dsh/pack.yml`
(or the user layer); `Families(pack, "search")` then projects its families, filtered by the
`intents` config. With no pack and no adjacency the listener abstains `no-history  0.00`. The
literal built-in pack is never a candidate source.

THE EXISTENCE FILTER. With the root known, a candidate is kept when it exists under ANY of the three
bases of the call: the repo root, the package root (the nearest ancestor of the resolved call path
that carries `package.json`, at or below the repo root), and the package parent. A winning family
with none left logs `abstained no-companions <Family> <k>`.

THE P2 GRAPH PROJECTION adds NO ledger string: the projection is proven by the order of the note and
the text of the sticky section, never by a line.

THE DISMISS TOOL adds two: the record line `dismissed <Family> <path|*>` (`*` is the family
dismissal) and the suppression `suppressed dismissed <Family>`, where the family dismissal, or the
dismissal that emptied the candidate list, holds the note back until the entry expires.

The sticky section (`system-prompt/assemble`) renders the last noted family: the synthetic `History`
row renders the paths the note named, and an explicit pack renders its own family.

## 4. The architecture

```
Source/
  Library.ts            the entry: name, apply, Config, inject (pluginFactory)
  Function/
    Apply.ts            the wiring: the State build, the projection registration, the
                        seed, the projection cache, the activation, the 4 listeners,
                        the tool
    Unit.ts             the session-projection unit: the pure `tool/call` fold
    Register.ts         the optional `ctx.inject(['sessionProjections'], ...)`
    History.ts          the detection-time read: `stateOf(session, key)`
    Detect.ts           the deterministic classifier (R1-R13), pure, no LLM
    Score.ts            k = sigmoid(sum - 0.6); the candidate scoring; the gate
                        (the projection's scope/literal, the dismissal filter)
    Note.ts             the labeled additionalContexts message + the 120-char summary
    Ring.ts             the per-agent state: the last 8 calls, cooldowns, dedupe, cap
    Persist.ts          the knowledge file: load, follow/ignore/dismiss, atomic save 0600
    Projection.ts       the P2 graph projection builder (the optional workspaceGraph probe)
    Measure.ts          one candidate against the projection (the scope/literal rules)
    Projected.ts        the projected index: the top graph paths per family (the section)
    Seed.ts             the P3 offline seed (an explicit pack's canonical set + the projection)
    Dismiss.ts          the P4 `suggestion_dismiss` tool definition
    Benchmark.ts        the P4 replay scorer (precision/recall/first-note)
  Interface/
    Config.ts           the validated config shape
    Execution.ts        the family/detection/verdict/knowledge types
    Session.ts          the session-projection seam (the unit contract + the registry faces)
    Projection.ts       the P2 graph projection + fact shapes
    Measurement.ts      one candidate's measured scores
    Benchmark.ts        one replayed note
    Factory.ts          the factory service's structural view + the Context augmentation
    State.ts            the per-apply state (Pack empty, no History field)
  Variable/
    Config.ts           the Schemastery schema (plan section 4.8 + this wave's fields)
    Projection.ts       the projection key (`searchHistory`), the cap (512), the version (1)
    Kinds.ts            the expected graph node kinds per family (History included)
    Sequence.ts         the fixed fifty-call replay corpus + the lane targets
```

## 5. The current state

The history model replaced the built-in pack as the candidate source.

- **THE HISTORY PROJECTION.** The history is a `ctx.sessionProjections` unit (key `searchHistory`),
  not a `session/event` listener and not a `State` WeakMap: the registry drives every committed
  event through the unit's pure `apply`, the cell is built lazily and rebuilt from the log on first
  touch, and the post-execute listener reads it through `stateOf(session, key)` before `Adjacent`
  scores it as the synthetic `History` family. There is no post-execute append.

- **THE EXPLICIT-ONLY PACK.** `State.Pack` is empty at apply; only a repo/user pack is compiled, per
  call, with `builtin: false`. A workspace with neither a pack nor a history abstains
  `no-history  0.00`.

- **THE GRAPH PROJECTION (P2).** The neutral 0.5 literal is replaced by the `ctx.workspaceGraph`
  projection (`Function/Projection`, `Function/Measure`, `Function/Projected`), the sticky section
  renders the projected index, and the absent/empty graph keeps the documented neutral fallback.
  `indexPath` is retired (never read).

- **THE OFFLINE SEED (P3).** `Function/Seed` runs at load with source = an explicit pack's canonical
  candidates + the graph projection, and the existing store persists it on the next real write. A
  repo without an explicit pack seeds nothing.

- **THE DISMISS TOOL (P4).** `suggestion_dismiss` runs through the tool API of the loader, the
  dismissal is durable with the `dismissTtl` expiry, and two ledger strings are documented.

- **THE REPLAY BENCHMARK (P4).** `Variable/Sequence` + `Function/Benchmark`, measured against a
  session history committed through the projection drive, with the recorded baseline
  `calls=50 notes=5 precision=1.00 recall=1.00 first-note=1`.

The fifteen folders: `Abstention`, `Benchmark`, `Classification`, `Dismiss`, `Index-Refresh`,
`Noise`, `Pack-Driven`, `Persistence`, `Post-Execute-And-Learning`, `Projection`, `Seed`,
`Sticky-Section-And-Ring`, `Threshold-And-Cooldown`, `Wiring-And-Ledger`, `Workspace-Gate` - 128
PASS.

Residuals (not silently dropped):

- the scope override of plan section 3.4 (a lockfile grep is Dependency, not Version) is not
  implemented, because the signals carry no scope weight;
- the search-specific abstentions 4 and 5 of plan section 2.4 (the exploratory-question gate and the
  read-only-subagent threshold bump) are not implemented;
- the near-miss rule and the `history -= 0.2` ignored penalty (plan 6.2) are not implemented, and an
  ignored window moves the stats and the journal only;
- the ETS twin carries the same history model; this tree is the Classic release.
