# hook-dsh-test-suggester - the live test plan

## Identity
- Package: `@playform/hook-dsh-test-suggester`
  (Classic/packages/hook-dsh-test-suggester).
- Profile row id: `test-suggester` (bundled in the desktop profile).
- Exposes: no tools or services - it hooks `tools/post-execute` for
  `emitOn`: bash, glob, grep, read. When the model searches for proof (a grep
  for PASS/FAIL/error TS, a read of a Test.ts, a bash error sweep), it
  classifies the call deterministically and prepends ONE labeled
  `additionalContexts` note naming the likely targets: the suite's Test.ts
  assertion body, the suite README carrying the expected count, the aggregate
  runner (Maintain/Run-Smokes.mjs), and the README badge. High threshold; a
  stated reason per candidate; cooldown; abstention path.
- Ledger prefix: `test-suggester:`; logFile `~/.dsh/test-suggester.log`.

## Activation checks
1. Inspect Config: `cordis_inspect_query` host/Config/listConfigs
   `{"name": "@playform/hook-dsh-test-suggester"}` → one entry, status schema
   (defaults: threshold 0.75, maxCandidates 7, maxNoteChars 1200, cooldownCalls
   6, maxNotesPerTurn 3, emitOn bash/glob/grep/read, exclude
   node_modules/Target/.git/dist).
2. Tool check: none expected (no tools).
3. Ledger line: the `activated (...)` line in `~/.dsh/test-suggester.log`.

## Test cases
| # | Trigger | Expected | Pass criteria |
| T1 | listConfigs query above | one entry, `status: "schema"` | the defaults match |
| T3 | `grep` for `PASS - ` | ONE note naming the suite's Test.ts, the README count, Run-Smokes.mjs | candidates ≤ maxCandidates, each with a reason |
| T3 | `read` a `Source/Test/<Suite>/Test.ts` | ONE note naming the suite README + the badge | the README count companion is listed |
| T1 | A second same-intent search within cooldownCalls | silence | cooldown holds; abstention ledgered |

## Known live gaps
- Not dogfooded yet. Watch for: notes firing on Target/ paths (must be
  excluded) and the aggregate runner path being wrong for non-repo workspaces.

## Fix loop
- Fix files: `Source/Function/` (the classifier, the note builder),
  `Source/Variable/Defaults.ts`, `Source/Library.ts`.
- Rebuild: `pnpm --config.verify-deps-before-run=false --dir Classic/packages/hook-dsh-test-suggester run prepublishOnly`
- Smokes: `node Classic/packages/hook-dsh-test-suggester/Target/Test/<Folder>/Test.js`
  per folder under `Source/Test/`. Then the app restart.

## Report stub
- Plugin: `@playform/hook-dsh-test-suggester`
- Tests run: T1 config - / T3 grep note - / T3 read note - / T1 cooldown -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
