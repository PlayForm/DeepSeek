# hook-dsh-edit-suggester - the live test plan

## Identity

- Package: `@playform/hook-dsh-edit-suggester` (Classic/packages/hook-dsh-edit-suggester).
- Profile row id: `hook-dsh-edit-suggester` (bundled in the desktop profile).
- Exposes no tools or services: it hooks `tools/post-execute` for the modification family and, when
  a write/edit/raw-write lands on a file that matches one of the seven convention families, prepends
  ONE labeled `additionalContexts` note naming the standard companions that the model has not
  touched yet (e.g. the built-in Version family: the version lives in the manifests and the
  CHANGELOG; a Config.ts edit must also land in the Config section of the README, SCHEME.md, the
  cordis.patch.yml row and the byte-exact test). It is the second consumer of the pattern algebra of
  the search-suggester, with deterministic path rules and no LLM.
- PACK-DRIVEN: the `edit/` families of the resolved workspace pack (`Families(pack, "edit")` from
  `@playform/lib-dsh-pack`) drive Detect, so a repo pack (`.dsh/pack.yml` -> the user layer
  `~/.dsh/playform/workspaces/<slug>.yml` -> the built-in pack) overrides the built-in families
  without a restart. The workspace root is the nearest ancestor whose PACK SIGNATURE matches
  (defaulting to `Documentation/ARCHIVE-STYLE.md`), and a foreign workspace has no pack and logs
  `edit-suggester: abstained foreign-workspace  0.00`. The learning layer (D8) records every emitted
  note and every gated silence worth learning from as a decision, logs the `decided` line, stores it
  through the `pattern` service when present (probed per use, never injected) or the bounded memory
  fallback, and moves the learned rates on the follow-through.
- Ledger prefix: `edit-suggester:`; logFile `~/.dsh/playform/hook-dsh-edit-suggester.log`.

## Activation checks

1. **The Config.**

    Inspect the Config with `cordis_inspect_query` host/Config/listConfigs
    `{"name": "@playform/hook-dsh-edit-suggester"}` for one entry with status schema (SCHEME §2
    defaults: threshold 0.75, tools write/edit/raw-write, maxCompanions 7, maxNoteChars 1200,
    cooldownCalls 6, maxNotesPerTurn 3, exclude node_modules/Target/.git/dist, learn true,
    learnWindow 3, heuristics the six names (`scope`,`graph`,`prior`,`literal`,`history`,`accept`),
    weights `{scope:0.35, graph:0, prior:0.25, literal:0.25, history:0.15, accept:0}`, storeLimit
    512).

2. **The tool check.**

    No tool is expected, because the hook registers none.

3. **The ledger line.**

    The activated line appears in `~/.dsh/playform/hook-dsh-edit-suggester.log` as
    `edit-suggester: activated (bundle 0.1.0, families 7, threshold 0.75)`, and a cold mount logs
    the byte-exact `edit-suggester: disabled (enabled=false)`.

## Test cases

| #   | Trigger                                                           | Expected                                                                                                   | Pass criteria                                                                                                                        |
| --- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| T1  | listConfigs query above                                           | one entry, `status: "schema"`                                                                              | the SCHEME §2 defaults match                                                                                                         |
| T2  | `edit` a package's `Source/Variable/Config.ts` in the workspace   | ONE note naming README Config section, SCHEME.md, cordis.patch.yml, the test                               | the companions listed are exactly the ones NOT yet touched                                                                           |
| T2  | The same edit repeated within cooldownCalls                       | silence + `edit-suggester: suppressed cooldown <Family>`                                                   | cooldown holds                                                                                                                       |
| T2  | The note's follow-through: a later judged call naming a companion | `edit-suggester: accepted <Family> <companion>` and the decision's outcome becomes `accepted`              | the learned rate moves by +0.1; an unanswered window closes at learnWindow (3) as a soft reject (`rejected <Family> <n> companions`) |
| T2  | Inspect the `decided` line on any emission                        | `edit-suggester: decided <Family> <k> <n> companions <head path> <values> weights <weights> store=<pattern | memory>`                                                                                                                             | the values/weights are the canonical `name=value` tables of Function/Table; `store=` reflects the pattern service or the memory fallback |
| T1  | `read`/`grep` calls                                               | no note                                                                                                    | the search consumer owns those intents; the edit suggester refuses them                                                              |
| T5  | A foreign workspace (no pack layer)                               | `edit-suggester: abstained foreign-workspace  0.00`                                                        | the gate runs before the family is known - the family segment is empty and the kappa is the no-signal 0.00                           |

## Known live gaps

- Not dogfooded yet, so watch for companion sets computed from a stale pack layer, notes firing on
  excluded paths, and the learned rates moving unexpectedly when the `pattern` service is absent
  (the memory fallback answers the neutral 1/3, so the default behavior stays unchanged
  byte-for-byte).
- The replay benchmark on the recorded lanes and the ETS twin
  (`@playform/ets-hook-dsh-edit-suggester`) remain DEFERRED (the SCHEME's end-phase list).

## Fix loop

- Fix files: `Source/Function/` (the pack projection, the detector, the scorer, the decision
  record), `Source/Library.ts`, `Source/Variable/Config.ts`.
- Rebuild:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/hook-dsh-edit-suggester run prepublishOnly`
- Smokes: `node Classic/packages/hook-dsh-edit-suggester/Target/Test/<Folder>/Test.js` per folder
  under `Source/Test/` (`Post-Execute-And-Ring`, `Wiring-And-Ledger`, `Workspace-Gate`,
  `Pack-Driven`, `Learning-Loop`), then restart the app.

## Report stub

- Plugin: `@playform/hook-dsh-edit-suggester`
- Tests run: T1 config - / T2 companion note - / T2 cooldown - / T2 follow-through - / T1 silence -
  / T5 foreign workspace -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
