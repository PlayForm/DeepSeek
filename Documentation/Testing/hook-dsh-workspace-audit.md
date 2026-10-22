# hook-dsh-workspace-audit - the live test plan

## Identity

- Package: `@playform/hook-dsh-workspace-audit` (Classic/packages/hook-dsh-workspace-audit).
- Profile row id: `hook-dsh-workspace-audit` (bundled in the desktop profile).
- Exposes: no tools - it records the workspace's accountability: the event records and the ledger
  lines - the OutcomeEvidence on the traceability graph (AUDIT.md). Every line carries the operation
  identifier, the parent identifier, and the event category (the recursion-prevention law).
- Ledger: logFile `~/.dsh/workspace-audit.log`; KV domain `workspace_audit` (a NEW domain, never an
  extension record in the shared package_governance one); ring bound maxLines 2000.

## Activation checks

1. Inspect Config: `cordis_inspect_query` host/Config/listConfigs
   `{"name": "@playform/hook-dsh-workspace-audit"}` → one entry, status schema (defaults: domain
   workspace_audit, maxLines 2000, exclude node_modules/**, **/Target/**, **/.git/**).
2. Service check: none expected (no service; a listener hook).
3. Ledger line: the activated line in `~/.dsh/workspace-audit.log`; a cold mount logs
   `disabled (enabled=false)`.

## Test cases

| # | Trigger | Expected | Pass criteria | | T1 | listConfigs query above | one entry,
`status: "schema"` | the defaults match | | T2 | Perform a /tmp scratch write through a governed
path | one audit record | the record carries operation id, parent id, event category | | T3 |
Inspect the audit lines after a batch | every line has the triple | no line without the operation
identifier | | T1 | An event under node_modules or Target | no record | the exclusion triple filters
it |

## Known live gaps

- Not dogfooded yet. Watch for: records piling past maxLines without FIFO eviction, and the parent
  identifier being null on the first hop (acceptable) vs missing entirely (a bug).

## Fix loop

- Fix files: `Source/Function/` (the recorder, the ring), `Source/Library.ts`,
  `Source/Variable/Config.ts`.
- Rebuild:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/hook-dsh-workspace-audit run prepublishOnly`
- Smokes: `node Classic/packages/hook-dsh-workspace-audit/Target/Test/<Folder>/Test.js` per folder
  under `Source/Test/`. Then the app restart.

## Report stub

- Plugin: `@playform/hook-dsh-workspace-audit`
- Tests run: T1 config - / T2 record - / T3 triple - / T1 exclusion -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
