# hook-dsh-edit-suggester - the live test plan

## Identity

- Package: `@playform/hook-dsh-edit-suggester` (Classic/packages/hook-dsh-edit-suggester).
- Profile row id: `hook-dsh-edit-suggester` (bundled in the desktop profile).
- Exposes no tools or services: it hooks `tools/post-execute` for the modification family (write,
  edit, raw-write) and, when a call edits a path, prepends ONE labeled `additionalContexts` note
  naming the files the session touched right after this one in this workspace: the companions the
  task most likely needs next (the root manifest, the CHANGELOG section, the Config table row, the
  byte-exact test, the site mirror). The note closes with the domain's standing caution: _this file
  rarely stands alone; check whether these need the same change._ It is the second consumer of the
  pattern algebra of the search-suggester, with deterministic path rules and no LLM.
- HISTORY-DRIVEN: the candidates come from the `session/event` fold + `Adjacent` over the agent's
  OWN PREVIOUS TOOL CALLS in this workspace (the synthetic `History` family): one touch per
  `tool/call` (capped at 512), the paths that followed the anchor within a window of 8 calls scored
  by `1 / (1 + distance)`, judged through the same Detect/Measure/Score/Decide pipeline as a pack
  family (confidence `k = sigmoid(2.5 - 0.6) = 0.87`). The built-in pack is retired and unimported.
- A pack is an EXPLICIT override only: `<repo>/.dsh/pack.yml` (or the user layer
  `~/.dsh/playform/workspaces/<slug>.yml`) resolved with `Resolve(root, { home, builtin: false })`.
  When a layer exists, its `edit/` families join the synthetic `History` family and drive the same
  classifier and note. Without a pack and without history the hook abstains
  `edit-suggester: abstained no-history  0.00` and returns the downstream decision unchanged.
- The workspace root is pack-independent: the nearest ancestor of the call path carrying `.git` or
  `package.json`, and a call path with no such ancestor and no session cwd logs
  `edit-suggester: abstained foreign-workspace  0.00`.
- The learning layer (D8) records every emitted note and every gated silence worth learning from as
  a decision, logs the `decided` line, stores it through the `pattern` service when present (probed
  per use, never injected) or the bounded memory fallback, and moves the learned rates on the
  follow-through.
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

    The activated line appears in `~/.dsh/playform/hook-dsh-edit-suggester.log` as the byte-exact
    `edit-suggester: activated (bundle 0.2.1, history, threshold 0.75)` (the second segment is
    `history`, not a family count: there is no boot pack), and a cold mount logs the byte-exact
    `edit-suggester: disabled (enabled=false)`.

## Test cases

| #   | Trigger                                                                             | Expected                                                                                                   | Pass criteria                                                                                                                        |
| --- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| T1  | listConfigs query above                                                             | one entry, `status: "schema"`                                                                              | the SCHEME §2 defaults match                                                                                                         |
| T2  | Seed the session history with companions, then `edit` a file in the workspace       | ONE `family=History` note naming the companions touched right after this file                              | exactly one note; the note never replaces content and never claims the Transform                                                     |
| T2  | The same edit repeated within cooldownCalls                                         | silence + `edit-suggester: suppressed cooldown <Family>`                                                   | cooldown holds                                                                                                                       |
| T2  | The note's follow-through: a later judged call naming a companion                   | `edit-suggester: accepted <Family> <companion>` and the decision's outcome becomes `accepted`              | the learned rate moves by +0.1; an unanswered window closes at learnWindow (3) as a soft reject (`rejected <Family> <n> companions`) |
| T2  | Inspect the `decided` line on any emission                                          | `edit-suggester: decided <Family> <k> <n> companions <head path> <values> weights <weights> store=<pattern | memory>`                                                                                                                             | the values/weights are the canonical `name=value` tables of Function/Table; `store=` reflects the pattern service or the memory fallback |
| T1  | `read`/`grep` calls                                                                 | no note                                                                                                    | the search consumer owns those intents; the edit suggester refuses them                                                              |
| T4  | A judged edit in a workspace with no history and no pack layer                      | `edit-suggester: abstained no-history  0.00`                                                               | the built-in pack is not a fallback; the honest silence is the new behavior                                                          |
| T5  | A call path with no `.git`/`package.json` root and no session cwd                   | `edit-suggester: abstained foreign-workspace  0.00`                                                        | the gate runs before any candidate work - no note, downstream decision unchanged                                                     |
| T6  | A temporary repo with `.dsh/pack.yml` whose signature marker is present, no history | ONE note naming ONLY the pack's own `edit/` families and companions                                        | the explicit pack drives the classifier; without the layer the same workspace abstains `no-history`                                  |

## Known live gaps

- Not dogfooded yet, so watch for notes firing on excluded paths, and the learned rates moving
  unexpectedly when the `pattern` service is absent (the memory fallback answers the neutral 1/3, so
  the default behavior stays unchanged byte-for-byte).
- The replay benchmark on the recorded lanes and the ETS twin
  (`@playform/ets-hook-dsh-edit-suggester`) remain DEFERRED (the SCHEME's end-phase list).

## Fix loop

- Fix files: `Source/Function/` (the history fold, the adjacency, the detector, the scorer, the
  decision record), `Source/Library.ts`, `Source/Variable/Config.ts`.
- Rebuild:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/hook-dsh-edit-suggester run prepublishOnly`
- Smokes: `node Classic/packages/hook-dsh-edit-suggester/Target/Test/<Folder>/Test.js` per folder
  under `Source/Test/` (`Learning-Loop`, `Pack-Driven`, `Post-Execute-And-Ring`,
  `Wiring-And-Ledger`, `Workspace-Gate`), then restart the app.

## Report stub

- Plugin: `@playform/hook-dsh-edit-suggester`
- Tests run: T1 config - / T2 history note - / T2 cooldown - / T2 follow-through - / T1 silence - /
  T4 no-history - / T5 foreign workspace - / T6 explicit pack -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
