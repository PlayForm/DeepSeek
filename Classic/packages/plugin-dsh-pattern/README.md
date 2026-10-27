# @playform/plugin-dsh-pattern

> v0.1.0 - UNPUBLISHED - plan:
> [PATTERN-GRAPH-PLUGIN](../../Documentation/Plans/PATTERN-GRAPH-PLUGIN.md)

## The role

The pattern-graph service plugin: the registry, the matcher, the confidence store and the learner
behind the suggester family.

Plan: `Documentation/Plans/PATTERN-GRAPH-PLUGIN.md`.

## The surfaces

One service: `pattern` (class form, `ctx.pattern` - the method table below).

No tool, no event listener.

## What it provides

`ctx.pattern` (service name `pattern`, class form):

| Method                | Behavior                                                      |
| --------------------- | ------------------------------------------------------------- |
| `Configure(options)`  | apply validated config knobs (every knob volatile)            |
| `Put(pattern)`        | idempotent upsert by id                                       |
| `Get(id)` / `List()`  | read the registry                                             |
| `Match(context)`      | ranked matches; the **empty result is the abstention**        |
| `Record(id, outcome)` | `accepted / rejected / applied / failed` moves the confidence |
| `Decay(now?)`         | the half-life sweep toward the neutral 0.5 floor              |
| `Save()`              | the full snapshot flush (the KV domain, else the JSON file)   |
| `Flush()`             | await the pending store work (the smoke seam)                 |

A pattern is one behavior graph: intent, trigger signals, target globs, ordered transform steps,
arbiter, confidence, and the decision hook's `allowlist` hint.

The match is a lookup plus arithmetic - never an LLM call.

The cold start is the shipped static catalog (`Source/Variable/ DefaultPatterns.ts`), never an empty
registry.

## The store (primary and fallback)

The **PRIMARY** store is the harness's `ctx.storage` KV domain (config `domain`, default `pattern`,
version 1, per-record, tables `patterns` + `meta`), probed once at construction
(`ctx.storage.domain`, else `ctx.storageDomain`), loaded on open and written on every mutation
(`Record`/`Decay`); `Save` writes the whole registry plus the `__savedAt` meta record.

The domain declares NO `compatibleVersions` - the library rejects an entry that is not strictly
below the declared version, so `[1]` against version 1 throws at load.

The **FALLBACK** store is the JSON snapshot (`storagePath`, default `~/.dsh/pattern/registry.json`):
written and read ONLY when no storage facility is provided or the domain's open fails (the loud
`storage open failed: <reason>` line, then the JSON snapshot loads).

The KV domain restores as a PER-RECORD overlay on the cold-start catalog (a stored record replaces
the catalog entry with the same id; a catalog entry the domain never received stays); the JSON
snapshot is a full snapshot and replaces the catalog, exactly as before.

## Abstention (the boundary)

Match returns `[]` when the top score is below `matchThreshold` or when the top two scores sit
within `ambiguityEpsilon` (two patterns matching equally is not a decision).

The ledger records every Record call so precision can be measured, not assumed.

## The ledger

The lines are prefixed `pattern: ` and go to `logFile` (byte-stable):

```text
pattern: activated (seeded N patterns) (logFile ...)
pattern: recorded <accepted|rejected|applied|failed> on <id> (confidence X.XX)
pattern: saved N patterns to <store> (logFile ...)
pattern: restored N patterns from snapshot (logFile ...)
pattern: storage open failed: <reason> (logFile ...)
```

## The configuration

| Field                                                              | Default                                  | Notes                                                  |
| ------------------------------------------------------------------ | ---------------------------------------- | ------------------------------------------------------ |
| `enabled`                                                          | `false`                                  | ships disabled (idle-forever posture)                  |
| `log`                                                              | `true`                                   | the ledger switch (the factory's shared volatile cell) |
| `logFile`                                                          | `~/.dsh/playform/plugin-dsh-pattern.log` | the service's own ledger                               |
| `domain`                                                           | `pattern`                                | the KV domain (the primary store)                      |
| `storagePath`                                                      | `~/.dsh/pattern/registry.json`           | the JSON snapshot (the fallback store)                 |
| `matchThreshold`                                                   | `0.35`                                   | below this the match abstains                          |
| `maxMatches`                                                       | `3`                                      | top-N per Match                                        |
| `ambiguityEpsilon`                                                 | `0.02`                                   | the equal-match abstention window                      |
| `decayHalfLifeDays`                                                | `14`                                     | the stale-pattern decay                                |
| `acceptBonus` / `rejectPenalty` / `appliedBonus` / `failedPenalty` | `0.1 / 0.2 / 0.15 / 0.25`                | the Record deltas                                      |
| `policy.*`                                                         | D6 defaults                              | the per-action allowlist (the shared factory block)    |

Every field is a volatile cell: a hot edit lands on the next service call.

The constructor also accepts the loader's validated config (the second constructor argument - the
graph service's precedent), so a loaded plugin gets the schema's posture; `Configure` remains the
hot path.

### The policy block (D6)

The schema composes the factory's shared block (`policy: Policy()`) into the plugin's own schema;
the service reads it as `Knobs.policy` (a bare construction falls back to the same D6 table):

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

The service matches, records and decays - `read`, `record` and `suggest` are automatic; the
write/commit/spawn verdicts are declared for uniformity and stay the shipped `approve` (the service
never writes files, commits or spawns).

A resolved pack's `policy` section overrides the defaults per action (the wiring is the next
refinement).

The defaults are smoke-arbitrated in `Source/Test/Policy-Defaults`.

## The build and the tests

The build is `pnpm prepublishOnly` (Source/prepublishOnly.sh): the plugin build (ESM `Target/`, Test
tree excluded), the Test build, the harness selfcheck, and the Test type-check.

| Folder                      | What it proves                                                                         | Count |
| --------------------------- | -------------------------------------------------------------------------------------- | ----- |
| `Service-And-Match`         | the loader contract, the registry, the match arithmetic, abstention                    | 13    |
| `Record-And-Decay-And-Save` | the learner, the decay, the JSON fallback's save and restore                           | 10    |
| `Storage-Domain`            | the KV domain (primary), the round-trip, the reopen, the fallback, the version failure | 14    |
| `Policy-Defaults`           | the D6 block's defaults and the registry's read/record posture                         | 4     |

## The plan

- [PATTERN-GRAPH-PLUGIN](../../Documentation/Plans/PATTERN-GRAPH-PLUGIN.md) - the pattern-graph
  service.

## License

CC0-1.0.
