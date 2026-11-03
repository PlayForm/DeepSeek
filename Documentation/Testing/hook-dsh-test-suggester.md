# hook-dsh-test-suggester - the live test plan

## Identity

- Package: `@playform/hook-dsh-test-suggester` (Classic/packages/hook-dsh-test-suggester).
- Profile row id: `test-suggester` (bundled in the desktop profile).
- Exposes no tools or services: it hooks `tools/post-execute` for `emitOn`: bash, glob, grep, read.
  When the model searches for proof (a grep for PASS/FAIL/error TS, a read of a Test.ts, a bash
  error sweep), the hook prepends ONE labeled `additionalContexts` note naming the companions the
  session touched right after this one in this workspace (the synthetic `History` family: the suite
  Test.ts, the README carrying the expected count, the aggregate runner roster, the badge). Each
  candidate carries a stated reason, with a cooldown and an abstention path. The reconciliation
  (wave 2c, `Source/Function/Reconcile.ts`) additionally audits the smoke claims of the package
  against the tree it actually has, read-only, with ONE notice as its only surface.
- HISTORY-DRIVEN: the candidates come from the `session/event` fold + `Adjacent` over the agent's
  OWN PREVIOUS TOOL CALLS in this workspace (the synthetic `History` family): one touch per
  `tool/call` (capped at 512), the paths that followed the anchor within a window of 8 calls scored
  by `1 / (1 + distance)`, judged through the same Detect/gate/note pipeline as a pack family
  (confidence `k = sigmoid(2.5 - 0.6) = 0.87`). The built-in pack is retired and unimported; the
  retired projection (`Source/Variable/Defaults.ts`) is kept as the domain's reference table and is
  no longer imported by the hot path.
- A pack is an EXPLICIT override only: `<repo>/.dsh/pack.yml` (or the user layer
  `~/.dsh/playform/workspaces/<slug>.yml`) resolved with `Resolve(root, { home, builtin: false })`.
  When a layer exists, its `test/` families (`Families(pack, "test")`) join the synthetic `History`
  family, which is placed FIRST, and the `intents` filter applies to the explicit pack's families
  only (empty = all). Without a pack and without history the hook abstains
  `test-suggester: abstained no-history  0.00`.
- The workspace root is pack-independent: the nearest ancestor of the call path carrying `.git` or
  `package.json`, and a call path with no such ancestor and no session cwd logs
  `test-suggester: abstained foreign-workspace  0.00` before any candidate work. `<...>` placeholder
  targets are illustrative and never existence-checked.
- Ledger prefix: `test-suggester:`; logFile `~/.dsh/playform/hook-dsh-test-suggester.log`.

## Activation checks

1. **The Config.**

    Inspect the Config with `cordis_inspect_query` host/Config/listConfigs
    `{"name": "@playform/hook-dsh-test-suggester"}` for one entry with status schema (defaults:
    threshold 0.75, maxCandidates 7, maxNoteChars 1200, cooldownCalls 6, maxNotesPerTurn 3, intents
    `[]` (all of an explicit pack's families enabled), emitOn bash/glob/grep/read, exclude
    node_modules/Target/.git/dist).

2. **The tool check.**

    No tool is expected, because the hook registers none.

3. **The ledger line.**

    The `activated (...)` line appears in `~/.dsh/playform/hook-dsh-test-suggester.log` as the
    byte-exact `test-suggester: activated (bundle 0.2.1, history, threshold 0.75)` (the second
    segment is `history`, not an intent count: there is no boot pack), and a cold mount logs the
    byte-exact `test-suggester: disabled (enabled=false)`.

## Test cases

| #   | Trigger                                                                                                                                                                | Expected                                                                                                                                  | Pass criteria                                                                                                                                                                                     |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T1  | listConfigs query above                                                                                                                                                | one entry, `status: "schema"`                                                                                                             | the defaults match                                                                                                                                                                                |
| T2  | Seed the session history with companions, then `grep` for `PASS - `                                                                                                    | ONE `History` note naming the companions touched right after this file                                                                    | candidates ≤ maxCandidates, each with a reason (`touched <n> time(s) after this file`)                                                                                                            |
| T2  | `read` a `Source/Test/<Suite>/Test.ts` with history seeded                                                                                                             | ONE note naming the companions that followed the anchor in the session                                                                    | the adjacency, not a built-in pack, picks the targets; the anchor itself is never a candidate                                                                                                     |
| T1  | A second same-family search within cooldownCalls                                                                                                                       | silence + `test-suggester: suppressed cooldown <Family>`                                                                                  | cooldown holds; abstention ledgered                                                                                                                                                               |
| T3  | A judged search in a workspace with no history and no pack layer                                                                                                       | `test-suggester: abstained no-history  0.00`                                                                                              | the built-in pack is not a fallback; the honest silence is the new behavior                                                                                                                       |
| T4  | A judged call in a package whose `Source/Test/<Folder>/README.md` claims a count the tree doesn't support (e.g. no `Test.ts`, or not in the aggregate runner's roster) | ONE reconciliation notice: `[test-suggester] reconciliation package=<package> drifts=<n> expected=<e> actual=<a>` with one line per drift | the drifts each name ONE file (README, Test.ts, `Target/Test/<Folder>/Test.js`, the graph's node path); the note's caveat line says Target/ is never edited; a foreign workspace never reconciles |
| T4  | A consistent tree                                                                                                                                                      | `test-suggester: reconciliation clear <package> (<e> expected, <a> actual)` once per package root per apply, then silence                 | the documented abstention; an unchanged drift set is deduped (`reconciliation skipped deduped <package>`)                                                                                         |
| T5  | A call path with no `.git`/`package.json` root and no session cwd                                                                                                      | `test-suggester: abstained foreign-workspace  0.00`                                                                                       | the gate runs before any candidate work - the family segment is empty and the kappa is the no-signal 0.00                                                                                         |
| T6  | A temporary repo with `.dsh/pack.yml` whose marker is present, no history                                                                                              | ONE note naming ONLY the pack's own `test/` families and companions                                                                       | the explicit pack drives the classifier; without the layer the same workspace abstains `no-history`                                                                                               |

## Known live gaps

- Not dogfooded yet, so watch for notes firing on Target/ paths (which must be excluded), the
  aggregate runner path being wrong for non-repo workspaces, and the reconciliation taking the call
  (one note per family, D9): when it emits, the candidate note yields to the next call. The graph
  index is probed, never injected, so an unpopulated graph contributes nothing.

## Fix loop

- Fix files: `Source/Function/` (the history fold, the adjacency, the reconciliation, the note
  builder), `Source/Library.ts`.
- Rebuild:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/hook-dsh-test-suggester run prepublishOnly`
- Smokes: `node Classic/packages/hook-dsh-test-suggester/Target/Test/<Folder>/Test.js` per folder
  under `Source/Test/` (`Loader-And-Activation`, `Pack-Driven`, `Pipeline-And-Gates`,
  `Reconciliation`, `Workspace-Gate`), then restart the app.

## Report stub

- Plugin: `@playform/hook-dsh-test-suggester`
- Tests run: T1 config - / T2 history note - / T2 read note - / T1 cooldown - / T3 no-history - / T4
  reconciliation - / T5 foreign workspace - / T6 explicit pack -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
