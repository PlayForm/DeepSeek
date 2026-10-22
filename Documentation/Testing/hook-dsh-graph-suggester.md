# hook-dsh-graph-suggester - the live test plan

## Identity
- Package: `@playform/hook-dsh-graph-suggester`
  (Classic/packages/hook-dsh-graph-suggester).
- Profile row id: `graph-suggester` (bundled in the desktop profile).
- Exposes: no tools or services - it hooks `tools/post-execute` for the
  discovery family (`emitOn`: glob, grep, read) and, when the call touches a
  graph task (a package/doc block), prepends ONE labeled `additionalContexts`
  notice naming it. Declares `inject: ["pluginFactory", "workspaceGraph"]` - the
  loader's PENDING state orders the graph service first. When the graph service
  is absent or fails, the hook abstains with a `graph unavailable` ledger line -
  the Neighborhood intent never guesses. Read-only by design.
- Ledger prefix: `graph-suggester:`; logFile `~/.dsh/graph-suggester.log`.

## Activation checks
1. Inspect Config: `cordis_inspect_query` host/Config/listConfigs
   `{"name": "@playform/hook-dsh-graph-suggester"}` → one entry, status schema
   (defaults: threshold 0.75, maxCandidates 7, maxNoteChars 1200, cooldownCalls
   6, maxNotesPerTurn 3, graph true).
2. Tool check: none expected (no tools).
3. Ledger line: the activated line in `~/.dsh/graph-suggester.log`.

## Test cases
| # | Trigger | Expected | Pass criteria |
| T1 | listConfigs query above | one entry, `status: "schema"` | the defaults match |
| T3 | `glob` a graph-ish query (e.g. `Source/Function/*.ts`) with the graph EMPTY (the known gap) | the Neighborhood intent abstains with a `graph unavailable` line | no guess from a fallback; static intents may still fire |
| T3 | `read` a package entry file | ONE note naming the graph companions | exactly one note |
| T1 | A `bash` call | no note | emitOn is the discovery family only |

## Known live gaps
- The workspace graph is EMPTY (no index trigger), so the graph-based
  Neighborhood intent should abstain, not hallucinate targets - verify the
  abstention line appears instead of a fabricated note.

## Fix loop
- Fix files: `Source/Function/` (the intents, the note builder),
  `Source/Variable/Defaults.ts`, `Source/Library.ts`.
- Rebuild: `pnpm --config.verify-deps-before-run=false --dir Classic/packages/hook-dsh-graph-suggester run prepublishOnly`
- Smokes: `node Classic/packages/hook-dsh-graph-suggester/Target/Test/<Folder>/Test.js`
  per folder under `Source/Test/`. Then the app restart.

## Report stub
- Plugin: `@playform/hook-dsh-graph-suggester`
- Tests run: T1 config - / T3 abstention - / T3 note - / T1 silence -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
