# hook-dsh-workspace-audit - the live test plan

## Identity

- Package: `@playform/hook-dsh-workspace-audit` (Classic/packages/hook-dsh-workspace-audit).
- Profile row id: `hook-dsh-workspace-audit` (bundled in the desktop profile).
- Exposes: no tools - it records the workspace's accountability: the AuditLines and the ledger lines
    - the OutcomeEvidence on the traceability graph (AUDIT.md). The graph: Announcement →
      Interpretation → IntentRevision → Commitment → PlanRevision → ProposedChange →
      AuthorizationDecision → ExecutionAttempt → OutcomeEvidence → IntentAssessment. The fs/observed
      listener records the OutcomeEvidence nodes; the service's `line` records the rest as the other
      services feed them; `assessment` closes the loop against the IntentSpecification's
      satisfaction contract. Every line carries the operation identifier, the parent identifier, and
      the event category (the recursion-prevention law).
- Ledger: logFile `~/.dsh/playform/hook-dsh-workspace-audit.log`; KV domain `workspace_audit`
  (version 1, per-record, `invalidRecords: backup-and-skip`; tables `lines` keyed `a<sequence>` and
  `ring` meta `__ring` the bounded ring snapshot) - a NEW domain, never an extension record in the
  shared package_governance one; ring bound maxLines 2000. Every line is prefixed by the factory's
  Append with the module identity (`audit: `).

## Activation checks

1. Inspect Config: `cordis_inspect_query` host/Config/listConfigs
   `{"name": "@playform/hook-dsh-workspace-audit"}` → one entry, status schema (defaults: domain
   workspace_audit, maxLines 2000, exclude node_modules/**, **/Target/**, **/.git/**, and the
   `policy` D6 block).
2. Service check: none expected (no service; a listener hook).
3. Ledger line: `audit: activated (domain=workspace_audit, maxLines=2000)` in
   `~/.dsh/playform/hook-dsh-workspace-audit.log`; a cold mount logs
   `audit: disabled (enabled=false)`.

## Test cases

- T1 listConfigs query above - one entry, `status: "schema"` - the defaults match.
- T2 Perform a /tmp scratch write through a governed path - one audit record (an OutcomeEvidence
  node) - the record carries id `a<sequence>`, operation id, parent id, category, path, outcome
  (`success | failure | conflict | pending | refused`), assessment, sequence; the log shows
  `audit: audit <category> <operation> (<outcome>) <path>`.
- T3 Inspect the audit lines after a batch - every line has the triple - no line without the
  operation identifier.
- T4 An intent assessment event - the loop closes - the log shows
  `audit: audit intent-assessment <operation> (satisfied)` or
  `audit: audit intent-assessment <operation> (unsatisfied[: <detail>])`.
- T1 An event under node_modules or Target - no record - the exclusion triple filters it
  (`audit: ignored <path> (excluded)`; own actor likewise `audit: ignored <path> (own actor)`).
- T5 Ring bound - the oldest line is evicted at maxLines - the log shows
  `audit: capped <id> (maxLines <n>)`.

## Known live gaps

- Not dogfooded yet. Watch for: records piling past maxLines without FIFO eviction, and the parent
  identifier being empty on the first hop (acceptable - "" at the top) vs missing entirely (a bug).
- The sequence counter must be the plugin's monotonic counter, never a wall clock.

## Fix loop

- Fix files: `Source/Function/` (the recorder, the ring), `Source/Library.ts`,
  `Source/Variable/Config.ts`.
- Rebuild:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/hook-dsh-workspace-audit run prepublishOnly`
- Smokes: `node Classic/packages/hook-dsh-workspace-audit/Target/Test/<Folder>/Test.js` per folder
  under `Source/Test/`. Then the app restart.

## Report stub

- Plugin: `@playform/hook-dsh-workspace-audit`
- Tests run: T1 config - / T2 record - / T3 triple - / T4 assessment - / T1 exclusion - / T5 ring -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
