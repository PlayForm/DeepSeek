# @playform/plugin-dsh-pattern

The pattern-graph service plugin: the registry, the matcher, the confidence
store and the learner behind the suggester family. Plan:
`Documentation/Plans/PATTERN-GRAPH-PLUGIN.md`.

## What it provides

`ctx.pattern` (service name `pattern`, class form):

| Method | Behaviour |
| --- | --- |
| `Configure(options)` | apply validated config knobs (every knob volatile) |
| `Put(pattern)` | idempotent upsert by id |
| `Get(id)` / `List()` | read the registry |
| `Match(context)` | ranked matches; the **empty result is the abstention** |
| `Record(id, outcome)` | `accepted / rejected / applied / failed` moves the confidence |
| `Decay(now?)` | the half-life sweep toward the neutral 0.5 floor |
| `Save()` | best-effort JSON snapshot under `~/.dsh/pattern/registry.json` |

A pattern is one behavior graph: intent, trigger signals, target globs,
ordered transform steps, arbiter, confidence, and the decision hook's
`allowlist` hint. The match is a lookup plus arithmetic - never an LLM call.
The cold start is the shipped static catalog (`Source/Variable/
DefaultPatterns.ts`), never an empty registry.

## Abstention (the boundary)

Match returns `[]` when the top score is below `matchThreshold` or when the
top two scores sit within `ambiguityEpsilon` (two patterns matching equally
is not a decision). The ledger records every Record call so precision can
be measured, not assumed.

## Configuration

| Field | Default | Notes |
| --- | --- | --- |
| `enabled` | `false` | ships disabled (idle-forever posture) |
| `log` | `true` | the ledger switch (the factory's shared volatile cell) |
| `logFile` | `~/.dsh/pattern.log` | the service's own ledger |
| `storagePath` | `~/.dsh/pattern/registry.json` | the local snapshot |
| `matchThreshold` | `0.35` | below this the match abstains |
| `maxMatches` | `3` | top-N per Match |
| `ambiguityEpsilon` | `0.02` | the equal-match abstention window |
| `decayHalfLifeDays` | `14` | the stale-pattern decay |
| `acceptBonus` / `rejectPenalty` / `appliedBonus` / `failedPenalty` | `0.1 / 0.2 / 0.15 / 0.25` | the Record deltas |

Every field is a volatile cell: a hot edit lands on the next service call.
