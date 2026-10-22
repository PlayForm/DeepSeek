# plugin-dsh-workspace-evidence - the live test plan

## Identity

- Package: `@playform/plugin-dsh-workspace-evidence`
  (Classic/packages/plugin-dsh-workspace-evidence).
- Profile row id: `plugin-dsh-workspace-evidence` (bundled in the desktop profile).
- Exposes: the `workspaceEvidence` service (`export default class WorkspaceEvidence extends Service`
  with `super(Context, "workspaceEvidence")`). The evidence store of the traceability graph: the
  OutcomeEvidence records the audit/journal steps attach to.
- Ledger lines: `` `evidence: disabled (enabled=false)` `` (cold mount) and
  `` `evidence: activated (domain=workspace_evidence)` ``; logFile `~/.dsh/evidence.log`; KV domain
  `workspace_evidence`.

## Activation checks

1. Inspect Config: `cordis_inspect_query` host/Config/listConfigs
   `{"name": "@playform/plugin-dsh-workspace-evidence"}` → one entry, status schema (defaults per
   Variable/Config.ts: the domain and the ring bounds).
2. Service check: `cordis_inspect_query` host/Service/listService `workspaceEvidence` → resolves.
3. Ledger line: `evidence: activated (domain=workspace_evidence)` in `~/.dsh/evidence.log`.

## Test cases

| # | Trigger | Expected | Pass criteria | | T1 | listConfigs query above | one entry,
`status: "schema"` | the defaults match | | T2 | Record one piece of OutcomeEvidence for a /tmp
operation | the record stored in the domain | operation id, outcome, timestamp present | | T2 |
Attach the same evidence to a traceability query | the evidence is retrievable by operation id | no
duplicate records | | T1 | Query evidence on a fresh state | the honest empty answer | no fabricated
records |

## Known live gaps

- Not dogfooded yet. Watch for: evidence records not linked to the audit records (broken
  operation-id join) and ring eviction dropping evidence silently.

## Fix loop

- Fix files: `Source/Function/Service.ts`, `Source/Function/` (the store),
  `Source/Variable/Config.ts`.
- Rebuild:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/plugin-dsh-workspace-evidence run prepublishOnly`
- Smokes: `node Classic/packages/plugin-dsh-workspace-evidence/Target/Test/<Folder>/Test.js` per
  folder under `Source/Test/`. Then the app restart.

## Report stub

- Plugin: `@playform/plugin-dsh-workspace-evidence`
- Tests run: T1 config - / T2 record - / T2 retrieval - / T1 empty -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
