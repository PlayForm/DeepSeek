# plugin-dsh-workspace-semantics - the live test plan

## Identity

- Package: `@playform/plugin-dsh-workspace-semantics`
  (Classic/packages/plugin-dsh-workspace-semantics).
- Profile row id: `plugin-dsh-workspace-semantics` (bundled in the desktop profile).
- Exposes: the `workspaceSemantics` service (`ctx.workspaceSemantics`) with `resolve` / `symbol` /
  `references` / `rename` / `adapt` / `statistics`. The semantics layer: the adapter registry (the
  default TypeScript/JavaScript adapter on seven extensions plus the opt-in any-file adapters
  `json`, `yaml`, `markdown`, `package`) running a LIGHT LEXICAL SCAN, deliberately no full parser
  in v0. The LSP deepener (`ctx.lsp`, probed) is the PRIMARY reference answer for the
  TypeScript/JavaScript extensions while symbols stay lexical. The recovery (once, on mount): the
  loaded `models` records rebuild the semantic state.
- Ledger: logFile `~/.dsh/playform/plugin-dsh-workspace-semantics.log`; a cold mount logs
  `semantics: disabled (enabled=false)`.

## Activation checks

1. **The Config.**

    Inspect Config: `cordis_inspect_query` host/Config/listConfigs
    `{"name": "@playform/plugin-dsh-workspace-semantics"}` → one entry, status schema.

    Verify the schema defaults match SCHEME.md: `log=true`, `logFile`, `enabled=false`,
    `domain=workspace_semantics`, `maxEntries=256`,
    `exclude=["node_modules/**", "**/Target/**", "**/.git/**"]`, `root=""`, `lsp=true`,
    `adapters=[]`, and the `policy` block (the D6 allowlist; all this package's actions
    read-only/`auto`, no gated action).

2. **The service check.**

    Service check: `cordis_inspect_query` host/Service/listService `workspaceSemantics` → resolves.

3. **The ledger line.**

    Ledger line: `semantics: activated (domain=workspace_semantics)` in
    `~/.dsh/playform/plugin-dsh-workspace-semantics.log`; a cold mount logs
    `semantics: disabled (enabled=false)`.

    On a warm activation also expect `semantics: adapters registered (7 extensions)`.

## Test cases

- T1 listConfigs query above - one entry, `status: "schema"` - the defaults match the SCHEME table
  above.
- T1 The TypeScript adapter on a small /tmp .ts file - a light lexical scan result - symbols
  extracted without a full parse; the log shows
  `semantics: resolved <path> (<n> symbols, <m> references)` and
  `semantics: adapters registered (7 extensions)` at mount.
- T1 An unsupported language file - the honest skip - the log shows
  `semantics: refused <path> (no adapter for <ext>)`; no crash, no guess.
- T2 The same file changes (an fs/observed event) - the semantic record updates and the log shows
  `semantics: indexed <path> version <v> (revision <r>)` - the mount-time recovery does not re-scan
  everything.
- T3 The LSP deepener (config `lsp=true`, `root` set to the workspace root) - one `findReferences`
  query per declared symbol, same-file locations only - the log shows
  `semantics: deepened <path> (<n> references via <name>)` and the rename plan carries
  `certainty: "references"`. With the seam absent or the query failing, no line is added and the
  lexical answer stands (every "cannot answer" path is `undefined`).
- T4 The opt-in adapters (`adapters: ["json", "yaml", "markdown", "package"]`) - the registry count
  in `adapters registered (<n> extensions)` grows by the added extensions plus file names per the
  SCHEME count rule; a `package.json` adapter hit never falls through to the extension adapter. A
  Markdown heading rename is the adapter's refusal: `semantics: refused <path> (rename: ...)`. An
  unknown `adapters` name fails loud at load:
  `semantics: adapters must name known adapters (json, yaml, markdown, package)`.
- T5 `rename` on a supported symbol - a plan, never a write - the log shows
  `semantics: planned rename <from> -> <to> in <path> (<n> edits, <certainty>)`; JSON/YAML key
  quotes are never part of the edit (the inner range).

## Known live gaps

- Not dogfooded yet. Watch for: the lexical scan being slow on large files (it must stay light) and
  the mount-time recovery replaying stale `models` records.
- The `policy` block documents the posture and refuses nothing (this package has no gated action, no
  new ledger line); a resolved pack's `policy` section override is the next refinement.

## Fix loop

- Fix files: `Source/Function/Service.ts`, `Source/Function/Register.ts`,
  `Source/Function/TypeScript.ts`, `Source/Library.ts`, `Source/Variable/Config.ts`.
- Rebuild:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/plugin-dsh-workspace-semantics run prepublishOnly`
- Smokes: `node Classic/packages/plugin-dsh-workspace-semantics/Target/Test/<Folder>/Test.js` per
  folder under `Source/Test/`. Then the app restart.

## Report stub

- Plugin: `@playform/plugin-dsh-workspace-semantics`
- Tests run: T1 config - / T1 TS scan - / T1 skip - / T2 update - / T3 lsp deepener - / T4
  adapters - / T5 rename -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
