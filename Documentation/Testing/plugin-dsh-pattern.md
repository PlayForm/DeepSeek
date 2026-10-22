# plugin-dsh-pattern - the live test plan

## Identity
- Package: `@playform/plugin-dsh-pattern`
  (Classic/packages/plugin-dsh-pattern).
- Profile row id: `plugin-dsh-pattern` (bundled in the desktop profile).
- Exposes: the pattern registry service - the pattern pack storage the
  suggester family's packs are seeded from. Function: Confidence.ts, Learner.ts
  (the online learner), Matcher.ts, Registry.ts, Snapshot.ts.
- Ledger line: `` `activated (seeded ${this.Store.Size()} patterns)` ``
  (module-prefixed); logFile `~/.dsh/pattern.log`.

## Activation checks
1. Inspect Config: `cordis_inspect_query` host/Config/listConfigs
   `{"name": "@playform/plugin-dsh-pattern"}` → one entry, status schema.
2. Service check: the pattern registry service resolves on the context.
3. Ledger line: `activated (seeded N patterns)` in `~/.dsh/pattern.log` - N
   must be > 0 when the pack ships data.

## Test cases
| # | Trigger | Expected | Pass criteria |
| T1 | listConfigs query above | one entry, `status: "schema"` | the defaults match |
| T1 | The seeded count in the ledger line | N patterns seeded | N agrees with the pack's size |
| T2 | Match a known pattern through the registry | a hit with a confidence score | the score respects the confidence gate |
| T2 | The Learner ingests one observation | the pattern's stats update | the snapshot persists the update |

## Known live gaps
- Not dogfooded yet. Watch for: the learner writing its snapshot on the hot
  path (must be batched/deferred) and zero seeded patterns (a broken pack).

## Fix loop
- Fix files: `Source/Function/` (Confidence.ts, Learner.ts, Matcher.ts,
  Registry.ts, Snapshot.ts), `Source/Library.ts`, `Source/Variable/Config.ts`.
- Rebuild: `pnpm --config.verify-deps-before-run=false --dir Classic/packages/plugin-dsh-pattern run prepublishOnly`
- Smokes: `node Classic/packages/plugin-dsh-pattern/Target/Test/<Folder>/Test.js`
  per folder under `Source/Test/`. Then the app restart.

## Report stub
- Plugin: `@playform/plugin-dsh-pattern`
- Tests run: T1 config - / T1 seed count - / T2 match - / T2 learner -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
