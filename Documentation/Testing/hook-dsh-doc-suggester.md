# hook-dsh-doc-suggester - the live test plan

## Identity

- Package: `@playform/hook-dsh-doc-suggester` (Classic/packages/hook-dsh-doc-suggester).
- Profile row id: `hook-dsh-doc-suggester` (bundled in the desktop profile).
- Exposes no tools or services: it hooks `tools/post-execute` for the doc-task tools (read, grep,
  glob, write, edit, raw-write) and, when the call touches a documentation path, prepends ONE
  labeled `additionalContexts` note naming the doc-graph companions the task most likely needs next:
  the INDEX row, the frontmatter statuses/registry/index block, the archive style, the
  cross-references, and the site mirror. The path rules are deterministic, no LLM is involved, and
  abstention is a ledger line for every silence.
- HISTORY-DRIVEN: the candidates come from the `session/event` fold + `Adjacent` over the agent's
  OWN PREVIOUS TOOL CALLS in this workspace (the synthetic `History` family): one touch per
  `tool/call` (capped at 512), the paths that followed the anchor within a window of 8 calls scored
  by `1 / (1 + distance)`, judged through the same Detect/Measure/Score/Decide pipeline as a pack
  family (confidence `k = sigmoid(2.5 - 0.6) = 0.87`). The built-in pack is retired and unimported.
- A pack is an EXPLICIT override only: `<repo>/.dsh/pack.yml` (or the user layer
  `~/.dsh/playform/workspaces/<slug>.yml`) resolved with `Resolve(root, { home, builtin: false })`.
  When a layer exists, its `doc/` families join the synthetic `History` family and drive the same
  classifier and note. Without a pack and without history the hook abstains
  `doc-suggester: abstained no-history  0.00` and returns the downstream decision unchanged.
- The workspace root is pack-independent: the nearest ancestor of the call path carrying `.git` or
  `package.json`, and a call path with no such ancestor and no session cwd logs
  `doc-suggester: abstained foreign-workspace  0.00`.
- The learning layer (D8) records decisions and logs the `decided` line like the edit suggester,
  storing through the `pattern` service or the bounded memory fallback.
- Ledger prefix: `doc-suggester:`; logFile `~/.dsh/playform/hook-dsh-doc-suggester.log`.

## Activation checks

1. **The Config.**

    Inspect the Config with `cordis_inspect_query` host/Config/listConfigs
    `{"name": "@playform/hook-dsh-doc-suggester"}` for one entry with status schema (SCHEME §2
    defaults: threshold 0.75, tools read/grep/glob/write/edit/raw-write, maxCompanions 7,
    maxNoteChars 1200, cooldownCalls 6, maxNotesPerTurn 3, exclude node_modules/Target/.git/dist,
    learn true, learnWindow 3, heuristics the six names
    (`scope`,`graph`,`prior`,`literal`,`history`,`accept`), weights
    `{scope:0.35, graph:0, prior:0.25, literal:0.25, history:0.15, accept:0}`, storeLimit 512).

2. **The tool check.**

    No tool is expected, because the hook registers none.

3. **The ledger line.**

    The activated line appears in `~/.dsh/playform/hook-dsh-doc-suggester.log` as the byte-exact
    `doc-suggester: activated (bundle 0.2.1, history, threshold 0.75)` (the second segment is
    `history`, not a family count: there is no boot pack), and a cold mount logs the byte-exact
    `doc-suggester: disabled (enabled=false)`.

## Test cases

| #   | Trigger                                                                                 | Expected                                                                                                  | Pass criteria                                                                                                                        |
| --- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| T1  | listConfigs query above                                                                 | one entry, `status: "schema"`                                                                             | the SCHEME §2 defaults match                                                                                                         |
| T2  | Seed the session history with doc companions, then `edit` a file under `Documentation/` | ONE `family=History` note naming the companions touched right after this file                             | exactly one note; the note never replaces content                                                                                    |
| T3  | `read` a plan file under `Documentation/Plans/` with history seeded                     | ONE note (index row, site mirror)                                                                         | the classification fired on a read-class call                                                                                        |
| T1  | `read` a source file outside the doc tree                                               | silence + abstention ledger line                                                                          | no note; the silence is ledgered                                                                                                     |
| T4  | A judged doc call in a workspace with no history and no pack layer                      | `doc-suggester: abstained no-history  0.00`                                                               | the built-in pack is not a fallback; the honest silence is the new behavior                                                          |
| T2  | The note's follow-through: a later judged call naming a companion                       | `doc-suggester: accepted <Family> <companion>`; the outcome becomes `accepted`                            | the learned rate moves by +0.1; an unanswered window closes at learnWindow (3) as a soft reject (`rejected <Family> <n> companions`) |
| T2  | Inspect the `decided` line on any emission                                              | `doc-suggester: decided <Family> <k> <n> companions <head path> <values> weights <weights> store=<pattern | memory>`                                                                                                                             | the values/weights are the canonical `name=value` tables of Function/Table |
| T5  | A call path with no `.git`/`package.json` root and no session cwd                       | `doc-suggester: abstained foreign-workspace  0.00`                                                        | the gate runs before any candidate work - no note, downstream decision unchanged                                                     |
| T6  | A temporary repo with `.dsh/pack.yml` whose signature marker is present, no history     | ONE note naming ONLY the pack's own `doc/` families and companions                                        | the explicit pack drives the classifier; without the layer the same workspace abstains `no-history`                                  |

## Known live gaps

- Not dogfooded yet, so watch for the note firing on `Site/Source/pages/*` without the site mirror
  companion, double notes when a call matches two families, and the base-aware existence filter
  (repo root, package root, package parent) dropping companions that live in a sibling package.
- The ETS twin (`@playform/ets-hook-dsh-doc-suggester`) remains DEFERRED (the SCHEME's end-phase
  list).

## Fix loop

- Fix files: `Source/Function/` (the history fold, the adjacency, the family rules, the note
  builder), `Source/Library.ts`, `Source/Variable/Config.ts`.
- Rebuild:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/hook-dsh-doc-suggester run prepublishOnly`
- Smokes: `node Classic/packages/hook-dsh-doc-suggester/Target/Test/<Folder>/Test.js` per folder
  under `Source/Test/` (`Learning-Loop`, `Pack-Driven`, `Post-Execute-And-Ring`,
  `Wiring-And-Ledger`, `Workspace-Gate`), then restart the app.

## Report stub

- Plugin: `@playform/hook-dsh-doc-suggester`
- Tests run: T1 config - / T2 history note - / T3 read-note - / T1 silence - / T4 no-history - / T2
  follow-through - / T5 foreign workspace - / T6 explicit pack -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
