# hook-dsh-edit-suggester - the live test plan

## Identity
- Package: `@playform/hook-dsh-edit-suggester`
  (Classic/packages/hook-dsh-edit-suggester).
- Profile row id: `hook-dsh-edit-suggester` (bundled in the desktop profile).
- Exposes: no tools or services - it hooks `tools/post-execute` for the
  modification family and, when a write/edit/raw-write lands on a file whose
  family carries a STANDARD COMPANION SET (the version lives in 36 manifests,
  6 Apply.ts and the CHANGELOG; a Config.ts edit must also land in the README's
  Config section, SCHEME.md, the cordis.patch.yml row and the byte-exact test),
  prepends ONE labeled `additionalContexts` note naming the companions the
  model has not touched yet. The second consumer of the search-suggester's
  pattern algebra; deterministic path rules.
- Ledger prefix: `edit-suggester:`; logFile `~/.dsh/edit-suggester.log`.

## Activation checks
1. Inspect Config: `cordis_inspect_query` host/Config/listConfigs
   `{"name": "@playform/hook-dsh-edit-suggester"}` → one entry, status schema
   (defaults per the search plan: threshold 0.75, maxCandidates 7,
   maxNoteChars 1200, cooldownCalls 6, maxNotesPerTurn 3, emitOn
   write/edit/raw-write).
2. Tool check: none expected (no tools).
3. Ledger line: the activated line in `~/.dsh/edit-suggester.log`.

## Test cases
| # | Trigger | Expected | Pass criteria |
| T1 | listConfigs query above | one entry, `status: "schema"` | the defaults match |
| T2 | `edit` a package's `Source/Variable/Config.ts` in /tmp scratch | ONE note naming README Config section, SCHEME.md, cordis.patch.yml, the test | the companions listed are exactly the ones NOT yet touched |
| T2 | The same edit repeated within cooldownCalls | silence | cooldown holds; abstention ledgered |
| T1 | `read`/`grep` calls | no note | the search consumer owns those intents; the edit suggester refuses them |

## Known live gaps
- Not dogfooded yet. Watch for: companion sets computed from stale family
  tables, and notes firing on `/tmp` paths that match a family by accident.

## Fix loop
- Fix files: `Source/Function/` (the family table, the companion diff),
  `Source/Library.ts`, `Source/Variable/Defaults.ts`.
- Rebuild: `pnpm --config.verify-deps-before-run=false --dir Classic/packages/hook-dsh-edit-suggester run prepublishOnly`
- Smokes: `node Classic/packages/hook-dsh-edit-suggester/Target/Test/<Folder>/Test.js`
  per folder under `Source/Test/`. Then the app restart.

## Report stub
- Plugin: `@playform/hook-dsh-edit-suggester`
- Tests run: T1 config - / T2 companion note - / T2 cooldown - / T1 silence -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
