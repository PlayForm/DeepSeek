# SCHEME.md - @playform/hook-dsh-edit-suggester (v0.2.1, TypeScript, function plugin)

Status: **IMPLEMENTED (PoC phase + the D8 learning layer + the history candidates)**.

The Source is complete, the build and the five smoke folders pass, and the decision-record,
follow-through, and learned-rate layer of section 3.4 has landed. The candidates now come from the
session's own previous tool calls; the pack is an explicit override only (section 3.2).

## 0. What this plugin is

The modification-intent **companion suggester**: when a judged call edits a path, the plugin
prepends ONE labeled `additionalContexts` note on the `tools/post-execute` waterfall and names the
files that were touched right after this one in this workspace - the companions the task most likely
needs next (the root manifest, the CHANGELOG section, the Config table row, the byte-exact test, the
site mirror).

The note closes with the domain's standing caution: _this file rarely stands alone; check whether
these need the same change._

Deterministic path rules, no LLM, gated hard, fail-open, and silent by default (it ships with
`enabled: false`).

It is the second consumer of the pattern algebra of the search-suggester and of the two-consumer
extraction trigger.

Source of truth: `Documentation/Plans/SEARCH-SUGGESTER-PLUGIN.md` (sections 1.4, 8, and the shared
algebra of section 3).

## 1. The surfaces

| Surface              | Mode                          | What it does                                                                                                            |
| -------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `session/event`      | plain                         | Folds every `tool/call` event into the session's history (one touch per call, capped at 512)                            |
| `tools/post-execute` | waterfall, plain registration | the note: `next()` first, then the history candidates (or an explicit pack), gate, and one `additionalContexts` message |
| `agent/pre-step`     | plain                         | the per-turn reset (touched paths, cooldowns, dedupe, counters)                                                         |
| `tools/pre-execute`  | NOT used                      | a suggestion cannot rewrite arguments; a deny would be a coach, not a suggester                                         |

## 2. The config schema (Variable/Config.ts)

| Field             | Type     | Default                                                                   | Volatile | Meaning                                                              |
| ----------------- | -------- | ------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------- |
| `log`             | boolean  | `true`                                                                    | yes      | Ledger enabled                                                       |
| `logFile`         | string   | `~/.dsh/playform/hook-dsh-edit-suggester.log`                             | yes      | The suggester's own ledger (one log per module)                      |
| `enabled`         | boolean  | `true` (patch ships `false`)                                              | yes      | The master switch                                                    |
| `threshold`       | number   | `0.75`                                                                    | yes      | The default confidence gate (a family's own threshold may raise it)  |
| `tools`           | string[] | `["write","edit","raw-write"]`                                            | yes      | The judged modification tools                                        |
| `maxCompanions`   | number   | `7`                                                                       | yes      | Maximum companions in one note, and the `Adjacent` limit             |
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
edit-suggester: disabled (enabled=false)
edit-suggester: activated (bundle 0.2.1, history, threshold 0.75)
edit-suggester: suggest <Family> <k> <n> companions <edited path>
edit-suggester: decided <Family> <k> <n> companions <head path> <values> weights <weights> store=<pattern|memory>
edit-suggester: accepted <Family> <companion>
edit-suggester: rejected <Family> <n> companions
edit-suggester: abstained low-confidence <Family> <k>
edit-suggester: abstained ambiguous-target <Family> <k>
edit-suggester: abstained already-touched <Family> <k>
edit-suggester: abstained no-companions <Family> <k>
edit-suggester: abstained no-signal  0.00
edit-suggester: abstained foreign-workspace  0.00
edit-suggester: abstained no-history  0.00
edit-suggester: suppressed cooldown <Family>
edit-suggester: suppressed dedupe <Family>
edit-suggester: suppressed cap <Family>
```

The activation line uses the `Activate` composer of the core and the own field list of the module.

Its second segment is `history` (not a family count): there is no boot pack, because the candidates
come from the session's own tool calls and only an explicit pack may still speak.

Every other string is composed in Function/Apply (the `decided` line in Function/Decided, the
outcome lines in Function/Apply).

`<values>` and `<weights>` are the canonical `name=value` tables of Function/Table
(`scope=1.00,graph=0.50,prior=1.00,literal=0.50,history=0.33,accept=0.33`), and the head is the
top-ranked companion, whose row the values describe.

### 3.1 The candidates (the session history)

The suggestions come from the agent's OWN PREVIOUS TOOL CALLS in this workspace, never from a
literal built-in pack.

The `session/event` listener folds every `tool/call` event into one touch (the sequence number, the
normalized path and the tool) in the SESSION's history, through the fold unit of
`@playform/lib-dsh-pack`. One entry per session object, created lazily; the touch array is capped at
512, oldest first.

The path comes from the first path-shaped argument (`file_path`, `path`, `filePath`), with
backslashes normalized to slashes and a leading `./` stripped.

On a judged call the listener reads the session's touches (keyed on the agent's session, then the
agent, then one shared default entry) and calls
`Adjacent(touches, callPath, { limit: maxCompanions })`: for every touch of the anchor path, the
touches that follow it within a window of 8 calls contribute `1 / (1 + distance)` to the followed
path's score and one to its count. A repeatedly co-touched path outranks a single one, and a near
neighbour outranks a far one. The anchor itself is never a candidate.

Those co-touch rows become ONE SYNTHETIC pack family, so the existing Detect/Measure/Score/Decide
pipeline judges them exactly like a resolved pack's family:

```ts
{
  id: "History",
  priority: 0,
  threshold: 0.75,
  note: "these files were touched right after this one in this workspace",
  familyGlobs: [],
  signals: [{ rule: "history", pattern: ".", weight: 2.5 }],
  targets: nearby.map((entry) => ({
    path: entry.path,
    kind: "",
    prior: 0.6,
    reason: `touched ${entry.count} time(s) after this file`,
  })),
}
```

Its confidence is therefore `k = sigmoid(2.5 - 0.6) = 0.87`. The note carries the existing
`[edit-suggester] family=History` header, the ledger records the existing `decided History ...`
line, and the follow-through window opens exactly as it does for a pack family.

### 3.2 The explicit pack override

A pack is an EXPLICIT user/repo override, never a fallback:

- `<repo>/.dsh/pack.yml` (or `.yaml`/`.json`), or
- the user layer `~/.dsh/playform/workspaces/<slug>.yml`.

The listener resolves it with `Resolve(root, { home, builtin: false })`, so a workspace with no pack
layer resolves to `undefined` and its `edit/` families contribute nothing. The built-in projection
(`Function/Pack.ts`) was removed from this package, so the built-in pack no longer exists here and an
explicit pack is the only pack source. When a layer exists, its `edit/` families
(`Families(pack, "edit")`) join the synthetic History family, which is placed FIRST, and drive the
same classifier, existence filter, gate and notice - so a repo that ships a hand-written pack still
gets its own families and companions.

A workspace with no pack layer and no session history has no candidate source at all and abstains
`abstained no-history  0.00` (the double space is the empty-family shape).

### 3.3 The workspace gate and the existence filter

The root is PACK-INDEPENDENT: the nearest ancestor of the call path carrying `.git` or
`package.json`, from the call path plus the session cwd (`Root` of `@playform/lib-dsh-pack`).

A call path with no such ancestor and no session cwd has no history to mine here: the listener
appends `abstained foreign-workspace  0.00` and returns the downstream decision unchanged.

With the root known, `Function/Filter` drops every companion that exists under NONE of the three
bases of the call: the root, the package root (the nearest ancestor of the resolved call path
carrying `package.json`, at or below the root) and the package parent.

A literal path uses `existsSync`.

A `*/<rest>` glob needs an immediate subdirectory of the package parent or the root to contain
`<rest>`.

Any other glob needs its literal prefix directory under a base.

A target carrying a `<...>` placeholder is illustrative and always kept.

A winning family whose whole companion set is gone abstains `no-companions <Family> <k>`.

The note text, the relative companion paths, and the cooldown/dedupe/cap behavior are unchanged,
because the filter only drops a target and never rewrites one.

### 3.4 The learning layer (D8)

#### The decision record (Interface/Decision)

Every emitted note, and every gated silence worth learning from (`low-confidence`,
`already-touched`), records ONE decision:

```ts
{
  family: "History",
  kappa: 0.87,
  companions: [{ path: "README.md", score: 0.675,
                 heuristics: { scope: 1, graph: 0.5, prior: 0.6, literal: 0.5,
                               history: 0.3333, accept: 0.3333 } }, ...],
  weights: { scope: 0.35, graph: 0, prior: 0.25, literal: 0.25, history: 0.15, accept: 0 },
  enabled: ["scope", "graph", "prior", "literal", "history", "accept"],
  outcome: "pending",            // then "accepted" or "rejected"
  store: "pattern",              // or "memory" (the bounded fallback)
}
```

The record is built by `Function/Decide` from the rows that `Function/Measure` already scored, and a
gated silence measures the would-be companions of the family through `Function/Would`, the same
leaf.

It is logged as the `decided` line and stored through `Function/Store`: the optional `pattern`
service (`ctx.get("pattern")`, probed per use, never injected) when present, the bounded memory ring
otherwise.

The service projection: `intent` = the family, `targets` = the companion paths, `arbiter` = the
outcome, `confidence` = the kappa, and the `transform` lines carry `weights <table>`,
`enabled <names>`, `outcome <verdict>` and one `<path> <table>` line per companion.

The store keeps the record ring in memory too, so `Learning.Resolve` can fill the outcome
placeholder when the follow-through closes.

#### The follow-through (the outcome signal)

An emitted note opens a window (`Ring.Open`) that holds the family and the companion paths.

Every judged IN-WORKSPACE call (`Ring.Follow`/`Ring.Age`) does one of two things.

- If the call path names a companion (`Function/Match`, glob-aware), it is an **accept**: the
  companion and its family move by the accept bonus of the service (`accepted <Family> <path>`), the
  window closes, and the outcome of the decision record becomes `accepted`.
- Otherwise the window ages by one call, and the call that reaches `learnWindow` closes it untouched
  as a **soft reject**: every named companion and the family move by the reject penalty
  (`rejected <Family> <n> companions`), and the outcome becomes `rejected`.

No timers and no clock, because the window is a counter of judged calls.

The per-turn reset forgets an open note without a verdict (a turn boundary is not a judged call).

#### The learned rate and the score

`Function/Store` answers the rates: the `confidence` of a record (the service) or the row of the
fallback (memory), both starting at the neutral 1/3 and moving by +0.1 (accept) / -0.2 (reject),
clamped to 0..1.

The score is

```
score(c) = sum over the ENABLED heuristics of weight(h) * value(h)
```

| Heuristic | Value                                               | Default weight |
| --------- | --------------------------------------------------- | -------------- |
| `scope`   | 1.00 (the call matched the family's path rules)     | 0.35           |
| `graph`   | 0.50 (the neutral graph-distance placeholder)       | 0.00           |
| `prior`   | the family's prior for the companion                | 0.25           |
| `literal` | 0.50 (the neutral literal)                          | 0.25           |
| `history` | the learned per-companion accept rate (neutral 1/3) | 0.15           |
| `accept`  | the learned per-family accept rate (neutral 1/3)    | 0.00           |

The default row reproduces the PoC formula exactly (`0.35*1 + 0.25*prior + 0.25*0.5 + 0.15*(1/3)`);
for the History family (`prior` 0.6) that is `0.675`.

A missing store answers the neutral 1/3, so the default behavior is unchanged byte-for-byte.

The config's `heuristics` (the enabled names) and `weights` (the table) make every term pickable.

A disabled name is dropped from the sum (its effective weight is 0), and the decision record keeps
the enabled list, so the choice is auditable.

## 4. The architecture

```
Source/
  Library.ts            the entry: name, apply, Config, inject (pluginFactory)
  Function/
    Apply.ts            the wiring: the State build, the activation, the 3 listeners
                        (the session/event history fold, the post-execute note,
                        the per-turn reset)
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
    State.ts            the per-apply state (plus the per-session history entry)
  Variable/
    Config.ts           the Schemastery schema
    Heuristics.ts       the six pickable heuristic names
    Weights.ts          the default weight table (the schema default's one source)
```

## 5. The end-phase

The smoke folders are `Post-Execute-And-Ring` (16), `Wiring-And-Ledger` (12), `Workspace-Gate` (6),
`Pack-Driven` (5) and `Learning-Loop` (12); the last is the Classic-only folder, and it drives the
decision records, the follow-through, the learned rate, the pickable heuristics and the storage
fallback from the history candidates.

The learned layer of the end-phase list of the plan is landed (section 3.4 of this document).

The twin in the other release tree carries the same behavior.
