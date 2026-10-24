# SCHEME.md - @playform/hook-dsh-doc-suggester (v0.1.0, TypeScript, function plugin)

Status: **IMPLEMENTED (PoC phase + the D8 learning layer)** - the Source is complete, the build and
the five smoke folders pass, and the decision-record/follow-through/learned-rate layer of section
3.2 has landed (the ETS twin is deferred, POC-BRIEF.md section 8).

## 0. What this plugin is

The doc-task **companion suggester**: when a judged call names a documentation path matching one of
the seven families, the plugin prepends ONE labeled `additionalContexts` note on the
`tools/post-execute` waterfall naming the doc-graph companions the task conventionally requires.
Deterministic path rules, no LLM, gated hard, fail-open, and silent by default (ships
`enabled: false`). It is the third consumer of the search-suggester's pattern algebra.

Source of truth: `Documentation/Plans/SEARCH-SUGGESTER-PLUGIN.md` (sections 3.6 Doc, 8, and the
shared algebra of section 3).

## 1. The surfaces

| Surface              | Mode                          | What it does                                                                              |
| -------------------- | ----------------------------- | ----------------------------------------------------------------------------------------- |
| `tools/post-execute` | waterfall, plain registration | the note: `next()` first, then detect, gate, and prepend one `additionalContexts` message |
| `agent/pre-step`     | plain                         | the per-turn reset (touched paths, cooldowns, dedupe, counters)                           |
| `tools/pre-execute`  | NOT used                      | a suggestion cannot rewrite arguments; a deny would be a coach, not a suggester           |

## 2. The config schema (Variable/Config.ts)

| Field             | Type     | Default                                                                   | Volatile | Meaning                                                              |
| ----------------- | -------- | ------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------- |
| `log`             | boolean  | `true`                                                                    | yes      | Ledger enabled                                                       |
| `logFile`         | string   | `~/.dsh/playform/hook-dsh-doc-suggester.log`                              | yes      | The suggester's own ledger (one log per module)                      |
| `enabled`         | boolean  | `true` (patch ships `false`)                                              | yes      | The master switch                                                    |
| `threshold`       | number   | `0.75`                                                                    | yes      | The default confidence gate (the pack rows override per family)      |
| `tools`           | string[] | `["read","grep","glob","write","edit","raw-write"]`                       | yes      | The judged doc-task tools                                            |
| `maxCompanions`   | number   | `7`                                                                       | yes      | Maximum companions in one note                                       |
| `maxNoteChars`    | number   | `1200`                                                                    | yes      | Hard character cap on the note text                                  |
| `cooldownCalls`   | number   | `6`                                                                       | yes      | No second note for the same family within this many judged calls     |
| `maxNotesPerTurn` | number   | `3`                                                                       | yes      | Maximum notes per turn, per agent                                    |
| `exclude`         | string[] | `["node_modules","Target",".git","dist"]`                                 | yes      | The excluded directories                                             |
| `learn`           | boolean  | `true`                                                                    | yes      | The learning layer's master switch (false = the pure PoC posture)    |
| `learnWindow`     | number   | `3`                                                                       | yes      | The follow-through window, in judged calls (no timers)               |
| `heuristics`      | string[] | the six names (`scope`,`graph`,`prior`,`literal`,`history`,`accept`)      | yes      | The ENABLED pickable heuristics; a name left out is dropped          |
| `weights`         | object   | `{scope:0.35, graph:0, prior:0.25, literal:0.25, history:0.15, accept:0}` | yes      | The pickable weight table (a missing name falls back to the default) |
| `storeLimit`      | number   | `512`                                                                     | yes      | The in-memory fallback's bound (rate rows and decision ring)         |

## 3. The ledger (byte-stable strings, Function-owned)

```
doc-suggester: disabled (enabled=false)
doc-suggester: activated (bundle 0.1.0, families 7, threshold 0.75)
doc-suggester: suggest <Family> <k> <n> companions <doc path>
doc-suggester: decided <Family> <k> <n> companions <head path> <values> weights <weights> store=<pattern|memory>
doc-suggester: accepted <Family> <companion>
doc-suggester: rejected <Family> <n> companions
doc-suggester: abstained low-confidence <Family> <k>
doc-suggester: abstained ambiguous-target <Family> <k>
doc-suggester: abstained already-touched <Family> <k>
doc-suggester: abstained no-companions <Family> <k>
doc-suggester: abstained no-signal <Family> <k>
doc-suggester: abstained foreign-workspace <Family> <k>
doc-suggester: suppressed cooldown <Family>
doc-suggester: suppressed dedupe <Family>
doc-suggester: suppressed cap <Family>
```

The activation line uses the core's `Activate` composer and the module's own field list; every other
string is composed in Function/Apply (the `decided` line in Function/Decided, the outcome lines in
Function/Apply). `<values>` and `<weights>` are the canonical `name=value` tables of Function/Table
(`scope=1.00,graph=0.50,prior=1.00,literal=0.50,history=0.33,accept=0.33`); the head is the
top-ranked companion, whose row the values describe.

### 3.1 The workspace gate and the existence filter

The pack is the repo's own doc graph: the BUILT-IN pack when the repo has no pack file, or the
resolved workspace pack otherwise. The `tools/post-execute` listener resolves the workspace root
BEFORE detect/score through `@playform/lib-dsh-pack`'s `Locate`: it walks up from the call path
(resolved against the session cwd, when the optional `workingDirectory` service exposes one) to the
first ancestor whose PACK SIGNATURE matches - the signature is the pack's `signature` list,
defaulting to `Documentation/ARCHIVE-STYLE.md`. No root means a foreign workspace: the listener
appends `abstained foreign-workspace  0.00` (the gate runs before the family is known, so the family
segment is empty and the kappa is the no-signal 0.00) and returns the downstream decision unchanged.
The resolved pack's `doc/` families (`Families(pack, "doc")`) drive Detect, so a repo pack overrides
the built-in families without a restart.

With the root known, `Function/Filter` drops every companion that exists under NONE of the call's
three bases: the repo root, the package root (the nearest ancestor of the resolved call path
carrying `package.json`, at or below the repo root) and the package parent. A literal path uses
`existsSync`; a `*/<rest>` glob needs an immediate subdirectory of the package parent or the repo
root to contain `<rest>`; any other glob needs its literal prefix directory under a base. A target
carrying a `<...>` placeholder is illustrative and always kept. A winning family whose whole
companion set is gone abstains `no-companions <Family> <k>`. The note text, the relative companion
paths, and the cooldown/dedupe/cap behavior are unchanged - the filter only drops a target, never
rewrites one.

## 3.2 The learning layer (D8)

### The decision record (Interface/Decision)

Every emitted note - and every gated silence worth learning from (`low-confidence`,
`already-touched`) - records ONE decision:

```ts
{
  family: "Plan",
  kappa: 0.87,
  companions: [{ path: "Documentation/INDEX.md", score: 0.775,
                 heuristics: { scope: 1, graph: 0.5, prior: 1, literal: 0.5,
                               history: 0.3333, accept: 0.3333 } }, ...],
  weights: { scope: 0.35, graph: 0, prior: 0.25, literal: 0.25, history: 0.15, accept: 0 },
  enabled: ["scope", "graph", "prior", "literal", "history", "accept"],
  outcome: "pending",            // then "accepted" or "rejected"
  store: "pattern",              // or "memory" (the bounded fallback)
}
```

The record is built by `Function/Decide` from the rows `Function/Measure` already scored (a gated
silence measures the family's would-be companions through `Function/Would`, the same leaf), logged
as the `decided` line, and stored through `Function/Store`: the optional `pattern` service
(`ctx.get("pattern")`, probed per use, never injected) when present, the bounded memory ring
otherwise. The service projection: `intent` = the family, `targets` = the companion paths, `arbiter`
= the outcome, `confidence` = the kappa, and the `transform` lines carry `weights <table>`,
`enabled <names>`, `outcome <verdict>` and one `<path> <table>` line per companion. The store keeps
the record ring in memory too, so `Learning.Resolve` can fill the outcome placeholder when the
follow-through closes.

### The follow-through (the outcome signal)

An emitted note opens a window (`Ring.Open`) holding the family and the companion paths. Every
judged IN-WORKSPACE call (`Ring.Follow`/`Ring.Age`):

- if the call path names a companion (`Function/Match`, glob-aware), it is an **accept**: the
  companion and its family move by the service's accept bonus (`accepted <Family> <path>`), the
  window closes, and the decision record's outcome becomes `accepted`;
- otherwise the window ages by one call; the call that reaches `learnWindow` closes it untouched as
  a **soft reject**: every named companion and the family move by the reject penalty
  (`rejected <Family> <n> companions`), and the outcome becomes `rejected`.

No timers and no clock: the window is a counter of judged calls. The per-turn reset forgets an open
note without a verdict (a turn boundary is not a judged call).

### The learned rate and the score

`Function/Store` answers the rates: a record's `confidence` (the service) or the fallback's row
(memory), both starting at the neutral 1/3 and moving by +0.1 (accept) / -0.2 (reject), clamped to
0..1. The score is

```
score(c) = sum over the ENABLED heuristics of weight(h) * value(h)
```

| Heuristic | Value                                               | Default weight |
| --------- | --------------------------------------------------- | -------------- |
| `scope`   | 1.00 (the call matched the family's path rules)     | 0.35           |
| `graph`   | 0.50 (the neutral graph-distance placeholder)       | 0.00           |
| `prior`   | the pack's prior                                    | 0.25           |
| `literal` | 0.50 (the neutral literal)                          | 0.25           |
| `history` | the learned per-companion accept rate (neutral 1/3) | 0.15           |
| `accept`  | the learned per-family accept rate (neutral 1/3)    | 0.00           |

The default row reproduces the PoC formula exactly (`0.35*1 + 0.25*prior + 0.25*0.5 + 0.15*(1/3)`);
a missing store answers the neutral 1/3, so the default behaviour is unchanged byte-for-byte. The
config's `heuristics` (the enabled names) and `weights` (the table) make every term pickable: a
disabled name is dropped from the sum (its effective weight is 0) and the decision record keeps the
enabled list, so the choice is auditable.

## 4. The architecture

```
Source/
  Library.ts            the entry: name, apply, Config, inject (pluginFactory)
  Function/
    Apply.ts            the wiring: the State build, the activation, the 2 listeners
    Pack.ts             the doc projection of the built-in pack (@playform/lib-dsh-pack):
                        7 families, path rules, companions (thin projection, no data)
    Exists.ts           the BASE-AWARE companion existence filter (repo root,
                        package root, package parent; `<...>` targets exempt)
    Filter.ts           the base-aware existence filter over the detections (before score/gate)
    Detect.ts           the deterministic path classifier, pure, no LLM
    Measure.ts          one companion -> the six pickable values + the weighted score
    Would.ts            a gated silence's would-be companion rows (the same Measure)
    Score.ts            k = sigmoid(sum - 0.6); the pickable companion scoring; the gate
    Weights.ts          the enabled list + the weight table -> the EFFECTIVE table
    Decide.ts           the decision record: build it and hand it to the learned layer
    Decided.ts          the `decided` ledger line
    Table.ts            the canonical `name=value` heuristic table formatter
    Store.ts            the learned layer: the pattern service or the bounded memory fallback
    Match.ts            companion <-> call path (the follow-through's lookup)
    Note.ts             the labeled additionalContexts message + the 120-char summary
    Ring.ts             the per-agent state: touched paths, cooldowns, dedupe, cap, the open note
  Interface/
    Config.ts           the validated config shape
    Decision.ts         the decision record and its heuristic values
    Execution.ts        the family/detection/verdict types
    Factory.ts          the factory service's structural view + the Context augmentation
    Learning.ts         the learned layer's view (rate/move/remember/resolve)
    State.ts            the per-apply state
  Variable/
    Config.ts           the Schemastery schema
    Heuristics.ts       the six pickable heuristic names
    Weights.ts          the default weight table (the schema default's one source)
```

## 5. The end-phase

The smoke folders are `Post-Execute-And-Ring`, `Wiring-And-Ledger`, `Workspace-Gate`, `Pack-Driven`
and `Learning-Loop` (the decision records, the follow-through, the learned rate, the pickable
heuristics and the storage fallback - 12 checks). The learned layer of the plan's end-phase list is
now landed (this section's 3.2); the ETS twin (`@playform/ets-hook-dsh-doc-suggester`) is DEFERRED
for this wave (the user's ETS deferral) - POC-BRIEF.md section 8.
