# hook-dsh-graph-suggester - the live test plan

## Identity

- Package: `@playform/hook-dsh-graph-suggester` (Classic/packages/hook-dsh-graph-suggester).
- Profile row id: `graph-suggester` (bundled in the desktop profile).
- Exposes: no tools or services - it hooks `tools/post-execute` for the discovery family (`emitOn`:
  glob, grep, read) and, when the call touches a graph task (a package/doc block), prepends ONE
  labeled `additionalContexts` notice naming it. Declares
  `inject: ["pluginFactory", "workspaceGraph"]` - the loader's PENDING state orders the graph
  service first. When the graph service is absent or fails, the hook abstains with a
  `graph unavailable` ledger line - the Neighborhood intent never guesses. Read-only by design.
- PACK-DRIVEN: the intents come from the embedded pack (`Source/Variable/Defaults.ts`, pack `graph`
  v1): `Neighborhood` (priority 1, threshold 0.6 - the graph query resolves it; an empty component
  falls back to the static set, an absent/failed graph abstains) and `Sibling` (priority 2,
  threshold 0.5 - static: `Documentation/Plugins/PLUGIN-FAMILY.md`, the inventory, `**/README.md`).
  The pack's per-intent thresholds are floors: the config `threshold` may raise the gate, never
  lower it below the pack floor.
- Ledger prefix: `graph-suggester:`; logFile `~/.dsh/playform/hook-dsh-graph-suggester.log`.

## Activation checks

1. Inspect Config: `cordis_inspect_query` host/Config/listConfigs
   `{"name": "@playform/hook-dsh-graph-suggester"}` → one entry, status schema (defaults: threshold
   0.75, maxCandidates 7, maxNoteChars 1200, cooldownCalls 6, maxNotesPerTurn 3, intents `[]` (all
   pack intents enabled), emitOn glob/grep/read, exclude node_modules/Target/.git/dist, graph true).
2. Tool check: none expected (no tools).
3. Ledger line: the activated line in `~/.dsh/playform/hook-dsh-graph-suggester.log` -
   `graph-suggester: activated (bundle 0.1.0, intents <n>, threshold <t>)`; a cold mount logs the
   byte-exact `graph-suggester: disabled (enabled=false)`.

## Test cases

| #   | Trigger                                                                                                                    | Expected                                                                                                                                                        | Pass criteria                                                                                                                                                                       |
| --- | -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T1  | listConfigs query above                                                                                                    | one entry, `status: "schema"`                                                                                                                                   | the defaults match                                                                                                                                                                  |
| T3  | `glob` a graph-ish query (e.g. `Source/Function/*.ts`) with the graph service ABSENT or FAILED                             | the Neighborhood intent abstains with `graph-suggester: graph unavailable` (and `graph-suggester: abstained graph-unavailable <Intent> <k>` on the intent path) | no guess from a fallback; static intents may still fire                                                                                                                             |
| T3  | `glob` the same query with the real graph POPULATED (`@playform/plugin-dsh-workspace-graph` now serves the declared query) | ONE note listing the anchor (definition), the importing test file (tests) and the other importer                                                                | the anchor is the first quoted `.ts` path in the arguments, matched by exact display path else path suffix; an anchor the graph does not know honestly falls back to the static set |
| T3  | `read` a package entry file                                                                                                | ONE note naming the graph companions                                                                                                                            | exactly one note                                                                                                                                                                    |
| T1  | A `bash` call                                                                                                              | no note                                                                                                                                                         | emitOn is the discovery family only                                                                                                                                                 |

## Known live gaps

- The workspace graph is populated by `@playform/plugin-dsh-workspace-graph`
  (`neighborhood(path, limit)` plus `indexWorkspace`; verified in the `Real-Graph-Neighborhood`
  smoke folder). W1 still has no `calls`/`references` edges, so the component carries importers
  rather than callers: the pack's note text still says "callers", and the graph's own SCHEME
  documents the deferral. Verify the abstention line appears - never a fabricated note - when the
  service is absent, fails, or returns an empty component for a known static fallback.

## Fix loop

- Fix files: `Source/Function/` (the intents, the note builder), `Source/Variable/Defaults.ts`,
  `Source/Library.ts`.
- Rebuild:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/hook-dsh-graph-suggester run prepublishOnly`
- Smokes: `node Classic/packages/hook-dsh-graph-suggester/Target/Test/<Folder>/Test.js` per folder
  under `Source/Test/` (`Loader-And-Activation`, `Pipeline-And-Graph`, `Real-Graph-Neighborhood`).
  Then the app restart.

## Report stub

- Plugin: `@playform/hook-dsh-graph-suggester`
- Tests run: T1 config - / T3 abstention - / T3 real-graph note - / T1 silence -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
