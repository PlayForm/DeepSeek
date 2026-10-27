# hook-dsh-workspace-approve - the live test plan

## Identity

- Package: `@playform/hook-dsh-workspace-approve` (Classic/packages/hook-dsh-workspace-approve).
- Profile row id: `hook-dsh-workspace-approve` (bundled in the desktop profile).
- Exposes the `workspaceApprove` service. It binds the EXACT human approval: an approval binds to
  the concrete candidate (path + content fingerprint + the version observed at the approval), the
  constraints travel with the approval, and the merge/execute side checks the exact fingerprint
  (APPROVE.md). The Binding decision state machine is `pending → approved → revoked`,
  `pending → denied`, `pending → rejected` (constraints changed, or identity incomplete), and
  `pending/approved → invalidated` (the observed version of the file moved).
- Ledger: the hook's own logFile `~/.dsh/playform/hook-dsh-workspace-approve.log`, plus the KV
  domain `workspace_approve` (its own domain, tables `bindings` per id + `ring` meta `__ring`,
  recovered on mount with the monotonic sequence as max loaded).

## Activation checks

1. **The Config.**

    Inspect the Config with `cordis_inspect_query` host/Config/listConfigs
    `{"name": "@playform/hook-dsh-workspace-approve"}` for one entry with status schema.

    The defaults per SCHEME section 7: `logFile=~/.dsh/playform/hook-dsh-workspace-approve.log`,
    `log=true`, `enabled=false`, `domain=workspace_approve`, `maxBindings=1000`,
    `requireConstraints=true`, and the `policy` D6 block (record-only posture, no gated action).

2. **The service check.**

    `cordis_inspect_query` host/Service/listService `workspaceApprove` resolves, and it reads
    honestly from the empty state even when disabled.

3. **The ledger line.**

    The line `approve: activated (domain=workspace_approve)` appears in
    `~/.dsh/playform/hook-dsh-workspace-approve.log`, and a cold mount logs
    `approve: disabled (enabled=false)`.

## Test cases

- T1 listConfigs query above - one entry, `status: "schema"` - the defaults match SCHEME section 7
  (domain `workspace_approve`, maxBindings 1000, requireConstraints true, the `policy` D6 block).
- T2 Bind an approval with constraints to a /tmp scratch path + fingerprint - the binding is stored
  in the domain ring, and path, fingerprint, version and constraints are all recorded; the log shows
  `approve: bound <id> <path> fingerprint <fingerprint>`.
- T2 Bind an approval with NO constraints (requireConstraints true) - rejected - the constraint law
  refuses the bind, and the log shows `approve: rejected <id> (constraints changed)`.
- T2 Decide the binding (`approved`/`denied` by a named human) - the decision is the Commitment -
  the log shows `approve: decided <id> approved by <who>` (or `denied by <who>`), and
  `revoked <id> by <who>` on revoke.
- T3 Verify with the check guard chain (SCHEME section 3): no binding for path + fingerprint gives
  `unbound`; a non-approved binding gives its own decision; an approved binding with a different
  version gives `stale`; otherwise `approved`. The log shows `approve: checked <path> (<decision>)`,
  and a stale version is detected - the exact-fingerprint check rejects it, and the move of the file
  invalidates the binding (`approve: invalidated <id> (version changed)`).
- T4 Exceed `maxBindings` - the oldest ring entry is evicted - the log shows
  `approve: capped <id> (maxBindings <n>)`.

## Known live gaps

- Not dogfooded yet, so watch for bindings surviving a restart unexpectedly (the `__ring` meta
  record) and eviction dropping records silently (which must be ledgered, not quiet).
- The caller computes the candidate fingerprint, because the approve hook binds and checks and never
  hashes content (SCHEME section 8).

## Fix loop

- Fix files: `Source/Function/` (bind / verify / evict), `Source/Library.ts`,
  `Source/Variable/Config.ts`.
- Rebuild:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/hook-dsh-workspace-approve run prepublishOnly`
- Smokes: `node Classic/packages/hook-dsh-workspace-approve/Target/Test/<Folder>/Test.js` per folder
  under `Source/Test/`, then restart the app.

## Report stub

- Plugin: `@playform/hook-dsh-workspace-approve`
- Tests run: T1 config - / T2 bind - / T2 no-constraints - / T2 decide - / T3 check chain - / T4
  cap -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
