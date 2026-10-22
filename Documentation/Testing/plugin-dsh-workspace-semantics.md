# plugin-dsh-workspace-semantics - the live test plan

## Identity

- Package: `@playform/plugin-dsh-workspace-semantics`
  (Classic/packages/plugin-dsh-workspace-semantics).
- Profile row id: `plugin-dsh-workspace-semantics` (bundled in the desktop profile).
- Exposes: the `workspaceSemantics` service
  (`export default class WorkspaceSemantics extends Service` with
  `super(Context, "workspaceSemantics")`). The semantics layer: the adapter registry
  (Function/Register.ts - one adapter entry per language) with the TypeScript seed adapter running a
  LIGHT LEXICAL SCAN, deliberately no full parser in v0. The recovery (once, on mount): the loaded
  `models` records rebuild the semantic state.
- Ledger: logFile `~/.dsh/semantics.log`; a cold mount logs `disabled (enabled=false)`.

## Activation checks

1. Inspect Config: `cordis_inspect_query` host/Config/listConfigs
   `{"name": "@playform/plugin-dsh-workspace-semantics"}` → one entry, status schema (defaults per
   Variable/Config.ts: the languages/adapter set).
2. Service check: `cordis_inspect_query` host/Service/listService `workspaceSemantics` → resolves.
3. Ledger line: the activated line in `~/.dsh/semantics.log`; a cold mount logs
   `disabled (enabled=false)`.

## Test cases

| # | Trigger | Expected | Pass criteria | | T1 | listConfigs query above | one entry,
`status: "schema"` | the adapter set matches | | T1 | The TypeScript adapter on a small /tmp .ts
file | a light lexical scan result | symbols/refs extracted without a full parse | | T2 | The same
file changes (an fs/observed event) | the semantic record updates | the mount-time recovery does not
re-scan everything | | T1 | An unsupported language file | the honest skip (e.g.
`language X not enabled`) | no crash, no guess |

## Known live gaps

- Not dogfooded yet. Watch for: the lexical scan being slow on large files (it must stay light) and
  the mount-time recovery replaying stale `models` records.

## Fix loop

- Fix files: `Source/Function/Service.ts`, `Source/Function/Register.ts`,
  `Source/Function/TypeScript.ts`, `Source/Library.ts`, `Source/Variable/Config.ts`.
- Rebuild:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/plugin-dsh-workspace-semantics run prepublishOnly`
- Smokes: `node Classic/packages/plugin-dsh-workspace-semantics/Target/Test/<Folder>/Test.js` per
  folder under `Source/Test/`. Then the app restart.

## Report stub

- Plugin: `@playform/plugin-dsh-workspace-semantics`
- Tests run: T1 config - / T1 TS scan - / T2 update - / T1 skip -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
