# hook-dsh-test-suggester - the live test plan

## Identity

- Package: `@playform/hook-dsh-test-suggester` (Classic/packages/hook-dsh-test-suggester).
- Profile row id: `test-suggester` (bundled in the desktop profile).
- Exposes no tools or services: it hooks `tools/post-execute` for `emitOn`: bash, glob, grep, read.
  When the model searches for proof (a grep for PASS/FAIL/error TS, a read of a Test.ts, a bash
  error sweep), the hook classifies the call deterministically and prepends ONE labeled
  `additionalContexts` note naming the likely targets: the assertion body of the suite's Test.ts,
  the suite README carrying the expected count, the aggregate runner (Maintain/Run/Smokes/Index.mjs
  roster), and the README badge. Each candidate carries a stated reason, with a cooldown and an
  abstention path. The reconciliation (wave 2c, `Source/Function/Reconcile.ts`) additionally audits
  the smoke claims of the package against the tree it actually has, read-only, with ONE notice as
  its only surface.
- PACK-DRIVEN: the intents are the `test/` projection of the BUILT-IN pack
  (`@playform/lib-dsh-pack`; `Source/Variable/Defaults.ts` selects it with
  `Families(Builtin, "test")`): `Suite` (priority 1, threshold 0.6) and `Counts` (priority 2,
  threshold 0.5). A workspace pack (`.dsh/pack.yml` -> the user layer -> the built-in pack)
  overrides it per repo, and the Apply compiles the intents of the resolved pack once per workspace
  root. The workspace root is the nearest ancestor whose PACK SIGNATURE matches (defaulting to
  `Documentation/ARCHIVE-STYLE.md`), and a foreign workspace logs
  `test-suggester: abstained foreign-workspace  0.00`. `<...>` placeholder targets are illustrative
  and never existence-checked.
- Ledger prefix: `test-suggester:`; logFile `~/.dsh/playform/hook-dsh-test-suggester.log`.

## Activation checks

1. **The Config.**

    Inspect the Config with `cordis_inspect_query` host/Config/listConfigs
    `{"name": "@playform/hook-dsh-test-suggester"}` for one entry with status schema (defaults:
    threshold 0.75, maxCandidates 7, maxNoteChars 1200, cooldownCalls 6, maxNotesPerTurn 3, intents
    `[]` (all pack intents enabled), emitOn bash/glob/grep/read, exclude
    node_modules/Target/.git/dist).

2. **The tool check.**

    No tool is expected, because the hook registers none.

3. **The ledger line.**

    The `activated (...)` line appears in `~/.dsh/playform/hook-dsh-test-suggester.log` as
    `test-suggester: activated (bundle 0.1.0, intents <n>, threshold <t>)`, and a cold mount logs
    the byte-exact `test-suggester: disabled (enabled=false)`.

## Test cases

| #   | Trigger                                                                                                                                                                | Expected                                                                                                                                  | Pass criteria                                                                                                                                                                                     |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T1  | listConfigs query above                                                                                                                                                | one entry, `status: "schema"`                                                                                                             | the defaults match                                                                                                                                                                                |
| T3  | `grep` for `PASS - `                                                                                                                                                   | ONE note naming the suite's Test.ts, the README count, Run/Smokes/Index.mjs                                                               | candidates ≤ maxCandidates, each with a reason                                                                                                                                                    |
| T3  | `read` a `Source/Test/<Suite>/Test.ts`                                                                                                                                 | ONE note naming the suite README + the badge                                                                                              | the README count companion is listed                                                                                                                                                              |
| T1  | A second same-intent search within cooldownCalls                                                                                                                       | silence + `test-suggester: suppressed cooldown <Intent>`                                                                                  | cooldown holds; abstention ledgered                                                                                                                                                               |
| T4  | A judged call in a package whose `Source/Test/<Folder>/README.md` claims a count the tree doesn't support (e.g. no `Test.ts`, or not in the aggregate runner's roster) | ONE reconciliation notice: `[test-suggester] reconciliation package=<package> drifts=<n> expected=<e> actual=<a>` with one line per drift | the drifts each name ONE file (README, Test.ts, `Target/Test/<Folder>/Test.js`, the graph's node path); the note's caveat line says Target/ is never edited; a foreign workspace never reconciles |
| T4  | A consistent tree                                                                                                                                                      | `test-suggester: reconciliation clear <package> (<e> expected, <a> actual)` once per package root per apply, then silence                 | the documented abstention; an unchanged drift set is deduped (`reconciliation skipped deduped <package>`)                                                                                         |
| T5  | A foreign workspace (no pack layer)                                                                                                                                    | `test-suggester: abstained foreign-workspace  0.00`                                                                                       | the gate runs before the intent is known - the intent segment is empty and the kappa is the no-signal 0.00                                                                                        |

## Known live gaps

- Not dogfooded yet, so watch for notes firing on Target/ paths (which must be excluded), the
  aggregate runner path being wrong for non-repo workspaces, and the reconciliation taking the call
  (one note per family, D9): when it emits, the intent note yields to the next call. The graph index
  is probed, never injected, so an unpopulated graph contributes nothing.

## Fix loop

- Fix files: `Source/Function/` (the classifier, the reconciliation, the note builder),
  `Source/Variable/Defaults.ts`, `Source/Library.ts`.
- Rebuild:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/hook-dsh-test-suggester run prepublishOnly`
- Smokes: `node Classic/packages/hook-dsh-test-suggester/Target/Test/<Folder>/Test.js` per folder
  under `Source/Test/` (`Loader-And-Activation`, `Pipeline-And-Gates`, `Reconciliation`,
  `Workspace-Gate`, `Pack-Driven`), then restart the app.

## Report stub

- Plugin: `@playform/hook-dsh-test-suggester`
- Tests run: T1 config - / T3 grep note - / T3 read note - / T1 cooldown - / T4 reconciliation - /
  T5 foreign workspace -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
