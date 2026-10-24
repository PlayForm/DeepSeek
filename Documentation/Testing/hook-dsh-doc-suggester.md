# hook-dsh-doc-suggester - the live test plan

## Identity

- Package: `@playform/hook-dsh-doc-suggester` (Classic/packages/hook-dsh-doc-suggester).
- Profile row id: `hook-dsh-doc-suggester` (bundled in the desktop profile).
- Exposes: no tools or services - it hooks `tools/post-execute` for the doc-task tools (read, grep,
  glob, write, edit, raw-write) and, when the call touches a documentation path matching one of the
  seven families (plan, guide, skill, index, site content, ...), prepends ONE labeled
  `additionalContexts` note naming the doc-graph companions: the INDEX row, the frontmatter
  statuses/registry/index block, the archive style, the cross-references, the site mirror.
  Deterministic path rules; no LLM; abstention is a ledger line for every silence.
- PACK-DRIVEN: the pack is the repo's own doc graph - the BUILT-IN pack when the repo has no pack
  file, or the resolved workspace pack otherwise, via `@playform/lib-dsh-pack`'s `Locate`. The
  workspace root is the nearest ancestor whose PACK SIGNATURE matches (the pack's `signature` list,
  defaulting to `Documentation/ARCHIVE-STYLE.md`); a foreign workspace logs
  `doc-suggester: abstained foreign-workspace  0.00` and returns the downstream decision unchanged.
  The resolved pack's `doc/` families (`Families(pack, "doc")`) drive Detect, so a repo pack
  (`.dsh/pack.yml` → the user layer → the built-in pack) overrides the built-in families without a
  restart. The learning layer (D8) records decisions and logs the `decided` line like the edit
  suggester, storing through the `pattern` service or the bounded memory fallback.
- Ledger prefix: `doc-suggester:`; logFile `~/.dsh/playform/hook-dsh-doc-suggester.log`.

## Activation checks

1. Inspect Config: `cordis_inspect_query` host/Config/listConfigs
   `{"name": "@playform/hook-dsh-doc-suggester"}` → one entry, status schema (SCHEME §2 defaults:
   threshold 0.75, tools read/grep/glob/write/edit/raw-write, maxCompanions 7, maxNoteChars 1200,
   cooldownCalls 6, maxNotesPerTurn 3, exclude node_modules/Target/.git/dist, learn true,
   learnWindow 3, heuristics the six names (`scope`,`graph`,`prior`,`literal`,`history`,`accept`),
   weights `{scope:0.35, graph:0, prior:0.25, literal:0.25, history:0.15, accept:0}`, storeLimit
   512).
2. Tool check: none expected (no tools).
3. Ledger line: the activated line in `~/.dsh/playform/hook-dsh-doc-suggester.log` -
   `doc-suggester: activated (bundle 0.1.0, families 7, threshold 0.75)`; a cold mount logs the
   byte-exact `doc-suggester: disabled (enabled=false)`.

## Test cases

| #   | Trigger                                                           | Expected                                                                                                  | Pass criteria                                                                                                                        |
| --- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| T1  | listConfigs query above                                           | one entry, `status: "schema"`                                                                             | the SCHEME §2 defaults match                                                                                                         |
| T3  | `edit` a file under `Documentation/`                              | ONE note naming the doc-graph companions                                                                  | exactly one note; the note never replaces content                                                                                    |
| T3  | `read` a plan file under `Documentation/Plans/`                   | ONE note (index row, site mirror)                                                                         | the family classification fired on a read-class call                                                                                 |
| T1  | `read` a source file outside the doc tree                         | silence + abstention ledger line                                                                          | no note; the silence is ledgered                                                                                                     |
| T2  | The note's follow-through: a later judged call naming a companion | `doc-suggester: accepted <Family> <companion>`; the outcome becomes `accepted`                            | the learned rate moves by +0.1; an unanswered window closes at learnWindow (3) as a soft reject (`rejected <Family> <n> companions`) |
| T2  | Inspect the `decided` line on any emission                        | `doc-suggester: decided <Family> <k> <n> companions <head path> <values> weights <weights> store=<pattern | memory>`                                                                                                                             | the values/weights are the canonical `name=value` tables of Function/Table |
| T5  | A foreign workspace (no pack layer)                               | `doc-suggester: abstained foreign-workspace  0.00`                                                        | the gate runs before the family is known - no note, downstream decision unchanged                                                    |

## Known live gaps

- Not dogfooded yet. Watch for: the note firing on `Site/Source/pages/*` without the site mirror
  companion, double notes when a call matches two families, and the base-aware existence filter
  (repo root, package root, package parent) dropping companions that live in a sibling package.
- The ETS twin (`@playform/ets-hook-dsh-doc-suggester`) remains DEFERRED (the SCHEME's end-phase
  list).

## Fix loop

- Fix files: `Source/Function/` (the pack projection, the family rules, the note builder),
  `Source/Library.ts`, `Source/Variable/Config.ts`.
- Rebuild:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/hook-dsh-doc-suggester run prepublishOnly`
- Smokes: `node Classic/packages/hook-dsh-doc-suggester/Target/Test/<Folder>/Test.js` per folder
  under `Source/Test/` (`Post-Execute-And-Ring`, `Wiring-And-Ledger`, `Workspace-Gate`,
  `Pack-Driven`, `Learning-Loop`). Then the app restart.

## Report stub

- Plugin: `@playform/hook-dsh-doc-suggester`
- Tests run: T1 config - / T3 edit-note - / T3 read-note - / T1 silence - / T2 follow-through - / T5
  foreign workspace -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
