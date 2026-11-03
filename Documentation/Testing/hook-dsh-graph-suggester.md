# hook-dsh-graph-suggester - the live test plan

## Identity

- Package: `@playform/hook-dsh-graph-suggester` (Classic/packages/hook-dsh-graph-suggester).
- Profile row id: `graph-suggester` (bundled in the desktop profile).
- Exposes no tools or services: it hooks `tools/post-execute` for the discovery family (`emitOn`:
  glob, grep, read) and, when the call's arguments carry a code path, prepends ONE labeled
  `additionalContexts` notice naming the graph companions of that path. It declares
  `inject: ["pluginFactory", "workspaceGraph"]`, so the PENDING state of the loader orders the graph
  service first. When the graph service is absent or fails, the hook abstains with a
  `graph unavailable` ledger line, because the intents never guess. The hook is read-only by design.
- GRAPH-ONLY: the candidates come from the workspace graph query ONLY
  (`ctx.workspaceGraph.neighborhood(path, limit)`), and the two intents are SYNTHESIZED per judged
  call from the query's own answer: `Neighborhood` (priority 1, threshold 0.75, every entry of the
  neighborhood, prior 1.0) and `Sibling` (priority 2, threshold 0.75, the same-directory projection
  of the same component, prior 1.0), both at confidence `k = sigmoid(2.5 - 0.6) = 0.87`. There is no
  boot pack (`State.Rules` is empty at apply) and no static fallback: the built-in pack
  (`Source/Variable/Defaults.ts`) is retired and unimported, and an empty component abstains
  honestly instead of falling back.
- Every abstention is a ledger line: an absent service, a disabled `graph` switch or a throwing
  `neighborhood` abstains `graph-suggester: abstained graph-unavailable <Intent> <k>`; an empty
  component abstains `graph-suggester: abstained no-companions <Intent> <k>`; a component fully
  dropped by the `exclude` prefixes abstains `graph-suggester: abstained ambiguous <Intent> <k>`.
  The hook names no path of its own.
- Ledger prefix: `graph-suggester:`; logFile `~/.dsh/playform/hook-dsh-graph-suggester.log`.

## Activation checks

1. **The Config.**

    Inspect the Config with `cordis_inspect_query` host/Config/listConfigs
    `{"name": "@playform/hook-dsh-graph-suggester"}` for one entry with status schema (defaults:
    threshold 0.75 (the effective gate is `max(0.75, threshold)`: the graph floor raises a lower
    value, never lowers a higher one), maxCandidates 7, maxNoteChars 1200, cooldownCalls 6,
    maxNotesPerTurn 3, intents `[]` (both graph intents enabled), emitOn glob/grep/read, exclude
    node_modules/Target/.git/dist, graph true).

2. **The tool check.**

    No tool is expected, because the hook registers none.

3. **The ledger line.**

    The activated line appears in `~/.dsh/playform/hook-dsh-graph-suggester.log` as the byte-exact
    `graph-suggester: activated (bundle 0.2.1, graph, threshold 0.75)` (the second segment is
    `graph`, not an intent count: there is no boot pack), and a cold mount logs the byte-exact
    `graph-suggester: disabled (enabled=false)`.

## Test cases

| #   | Trigger                                                                                                                    | Expected                                                                                                                                                        | Pass criteria                                                                                                                                                                                      |
| --- | -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T1  | listConfigs query above                                                                                                    | one entry, `status: "schema"`                                                                                                                                   | the defaults match                                                                                                                                                                                 |
| T3  | `glob` a graph-ish query (e.g. `Source/Function/*.ts`) with the graph service ABSENT or FAILED                             | the Neighborhood intent abstains with `graph-suggester: graph unavailable` (and `graph-suggester: abstained graph-unavailable <Intent> <k>` on the intent path) | no guess from a fallback; the unavailable case logs once per apply (with the throw's reason when it throws)                                                                                        |
| T3  | `glob` the same query with the real graph POPULATED (`@playform/plugin-dsh-workspace-graph` now serves the declared query) | ONE note listing the anchor (definition), the importing test file (tests) and the other importer                                                                | the anchor is the first quoted `.ts` path in the arguments, matched by exact display path else path suffix; an anchor the graph does not know abstains `abstained no-companions Neighborhood 0.87` |
| T3  | `read` a package entry file with a populated graph                                                                         | ONE note naming the graph companions                                                                                                                            | exactly one note                                                                                                                                                                                   |
| T3  | An empty component (the real service answered `[]`)                                                                        | `graph-suggester: abstained no-companions Neighborhood 0.87` with NO `graph unavailable` line                                                                   | an empty component is NOT an unavailable graph: the honest silence replaces the old static fallback                                                                                                |
| T1  | A `bash` call                                                                                                              | no note                                                                                                                                                         | emitOn is the discovery family only                                                                                                                                                                |

## Known live gaps

- The workspace graph is populated by `@playform/plugin-dsh-workspace-graph`
  (`neighborhood(path, limit)` plus `indexWorkspace`; verified in the `Real-Graph-Neighborhood`
  smoke folder). W1 still has no `calls`/`references` edges, so the component carries importers
  rather than callers: the note text still says "callers", and the own SCHEME of the graph documents
  the deferral. Verify that the abstention lines appear - never a fabricated note - when the service
  is absent, fails, or returns an empty component.

## Fix loop

- Fix files: `Source/Function/` (the synthesized intents, the note builder), `Source/Library.ts`.
- Rebuild:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/hook-dsh-graph-suggester run prepublishOnly`
- Smokes: `node Classic/packages/hook-dsh-graph-suggester/Target/Test/<Folder>/Test.js` per folder
  under `Source/Test/` (`Loader-And-Activation`, `Pipeline-And-Graph`, `Real-Graph-Neighborhood`),
  then restart the app.

## Report stub

- Plugin: `@playform/hook-dsh-graph-suggester`
- Tests run: T1 config - / T3 abstention - / T3 real-graph note - / T3 empty component - / T1
  silence -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
