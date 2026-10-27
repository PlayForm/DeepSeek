# plugin-dsh-pattern - the live test plan

## Identity

- Package: `@playform/plugin-dsh-pattern` (Classic/packages/plugin-dsh-pattern).
- Profile row id: `plugin-dsh-pattern` (bundled in the desktop profile).
- Exposes the pattern registry service, the pattern pack storage that the packs of the suggester
  family are seeded from. Function: Confidence.ts, Learner.ts (the online learner), Matcher.ts,
  Registry.ts, Snapshot.ts. Service `pattern` (`super(Context, "pattern")`, the class form,
  registered at construction): `Configure` / `Put` / `Get` / `List` / `Match` /
  `Record(id, outcome)` / `Decay(now?)` / `Save()` / `Flush()` (the smoke seam).
- The scoring weights (SCHEME "The scoring weights"):
  `score = 0.6 * keywordOverlap + 0.2 * toolMatch + 0.2 * confidence`, thresholded at
  `matchThreshold`, where the ambiguity rule empties the result when the top two scores sit within
  `ambiguityEpsilon` (the empty result is the abstention).
- The learning config (README "Configuration"): `matchThreshold` 0.35, `maxMatches` 3,
  `ambiguityEpsilon` 0.02, `decayHalfLifeDays` 14, and the Record deltas `acceptBonus` 0.1 /
  `rejectPenalty` 0.2 / `appliedBonus` 0.15 / `failedPenalty` 0.25, with every field a volatile
  cell.
- The stores (SCHEME "Storage"): the PRIMARY store is the `ctx.storage` KV domain of the harness
  (config `domain`, default `pattern`, version 1, per-record tables `patterns` + `meta`), loaded on
  open as a per-record overlay on the cold-start catalog and written on every mutation (`Record`,
  `Decay`); the FALLBACK is the JSON snapshot (`storagePath`, default
  `~/.dsh/pattern/registry.json`), used only when no storage facility is provided or the open of the
  domain fails (the loud `storage open failed: <reason>` line).
- Ledger lines (SCHEME "Ledger strings", byte-stable, module-prefixed):
  `pattern: activated (seeded <n> patterns) (logFile <logFile>)`,
  `pattern: disabled (enabled=false) (logFile <logFile>)`,
  `pattern: recorded <outcome> on <id> (confidence <0.xx>) (logFile <logFile>)`,
  `pattern: restored <n> patterns from snapshot (logFile <logFile>)`,
  `pattern: saved <n> patterns to <destination> (logFile <logFile>)`,
  `pattern: storage open failed: <reason> (logFile <logFile>)`; logFile
  `~/.dsh/playform/plugin-dsh-pattern.log`.
- The policy block (D6, SCHEME "The policy block"): the schema composes the shared
  `policy: Policy()` of the factory, with read/record/suggest = `auto` and write/commit/spawn =
  `approve` (declared for uniformity, because the service never writes files, commits or spawns).
  One volatile object stays hot-editable, and a resolved pack's `policy` section overrides per
  action.

## Activation checks

1. **The Config.**

    Inspect the Config with `cordis_inspect_query` host/Config/listConfigs
    `{"name": "@playform/plugin-dsh-pattern"}` for one entry with status schema (defaults: domain
    `pattern`, storagePath ~/.dsh/pattern/registry.json, matchThreshold 0.35, maxMatches 3,
    ambiguityEpsilon 0.02, decayHalfLifeDays 14, policy.* D6 defaults).

2. **The service check.**

    The `pattern` service resolves on the context.

3. **The ledger line.**

    The line `pattern: activated (seeded <n> patterns) (logFile <logFile>)` appears in
    `~/.dsh/playform/plugin-dsh-pattern.log`, and N must be > 0 when the pack ships data.

## Test cases

| # | Trigger | Expected | Pass criteria | | T1 | listConfigs query above | one entry,
`status: "schema"` | the defaults match | | T1 | The seeded count in the ledger line | N patterns
seeded | N agrees with the pack's size | | T2 | Match a known pattern through the registry | a hit
with a confidence score | score = 0.6*keywordOverlap + 0.2*toolMatch + 0.2*confidence, above
matchThreshold 0.35; two scores within ambiguityEpsilon 0.02 → empty result (abstention) | | T2 |
`Record(id, "accepted")` then `Flush()` | the pattern's confidence moves (+acceptBonus 0.1) | the
active store persists the update; `pattern: recorded accepted on <id> (confidence <0.xx>)` line | |
T2 | `Decay()` after the half-life window | confidence trends to the neutral 0.5 floor | the
mutation written to the active store |

## Known live gaps

- Not dogfooded yet, so watch for zero seeded patterns (a broken pack), the open of the KV domain
  failing (the loud `storage open failed: <reason>` line, then the JSON fallback), and the fallback
  JSON snapshot REPLACING the catalog while the KV domain only overlays per record.

## Fix loop

- Fix files: `Source/Function/` (Confidence.ts, Learner.ts, Matcher.ts, Registry.ts, Snapshot.ts),
  `Source/Library.ts`, `Source/Variable/Config.ts`.
- Rebuild:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/plugin-dsh-pattern run prepublishOnly`
- Smokes: `node Classic/packages/plugin-dsh-pattern/Target/Test/<Folder>/Test.js` per folder under
  `Source/Test/`, then restart the app.

## Report stub

- Plugin: `@playform/plugin-dsh-pattern`
- Tests run: T1 config - / T1 seed count - / T2 match - / T2 learner - / T2 decay -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
