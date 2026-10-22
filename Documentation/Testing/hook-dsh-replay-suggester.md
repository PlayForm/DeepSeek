# hook-dsh-replay-suggester - the live test plan

## Identity
- Package: `@playform/hook-dsh-replay-suggester`
  (Classic/packages/hook-dsh-replay-suggester).
- Profile row id: `replay-suggester` (bundled in the desktop profile).
- Exposes: no tools or services - it hooks `tools/post-execute` for
  `emitOn`: bash, edit, glob, grep, read, write. When the model searches with an
  intent it has pursued before, it recalls the matching record from its history
  store (`~/.dsh/replay-suggester/history.json`) and prepends ONE labeled
  `additionalContexts` notice: the files touched last time and the command that
  verified. The store is loaded once at apply; a missing or corrupt store
  degrades to silence, never to a guess. Read-only in v1 (the store is seeded
  by the offline learner / search-suggester journal).
- Ledger prefix: `replay-suggester:`; logFile `~/.dsh/replay-suggester.log`.

## Activation checks
1. Inspect Config: `cordis_inspect_query` host/Config/listConfigs
   `{"name": "@playform/hook-dsh-replay-suggester"}` → one entry, status schema
   (defaults: threshold 0.75, maxCandidates 7, maxNoteChars 1200, cooldownCalls
   6, maxNotesPerTurn 3, historyPath ~/.dsh/replay-suggester/history.json,
   learnWindow 2).
2. Tool check: none expected (no tools).
3. Ledger line: the activated line in `~/.dsh/replay-suggester.log`.

## Test cases
| # | Trigger | Expected | Pass criteria |
| T1 | listConfigs query above | one entry, `status: "schema"` | the defaults match |
| T1 | A search call whose intent has a history record (seed the store first) | ONE note with the files touched and the verify command | the record matches the store exactly |
| T1 | The same query with NO store / a corrupt store | silence + abstention ledger line | degrade to silence, never a guess |
| T1 | `write` a file after a note | no note on the write itself (learning-only signal) | the write never triggers a note |

## Known live gaps
- The store is never written in v1: without a manual seed the hook always
  abstains - that is correct behavior, not a bug. Watch for: the seed being
  read on the hot path (must be the boot path).

## Fix loop
- Fix files: `Source/Function/` (the recall matcher, the note builder),
  `Source/Variable/Defaults.ts`, `Source/Library.ts`.
- Rebuild: `pnpm --config.verify-deps-before-run=false --dir Classic/packages/hook-dsh-replay-suggester run prepublishOnly`
- Smokes: `node Classic/packages/hook-dsh-replay-suggester/Target/Test/<Folder>/Test.js`
  per folder under `Source/Test/`. Then the app restart.

## Report stub
- Plugin: `@playform/hook-dsh-replay-suggester`
- Tests run: T1 config - / T1 seeded recall - / T1 corrupt-store silence -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
