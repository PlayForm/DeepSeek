# hook-dsh-workspace-approve - the live test plan

## Identity

- Package: `@playform/hook-dsh-workspace-approve` (Classic/packages/hook-dsh-workspace-approve).
- Profile row id: `hook-dsh-workspace-approve` (bundled in the desktop profile).
- Exposes: the `workspaceApprove` service. Binds the EXACT human approval: an approval binds to the
  concrete candidate (path + content fingerprint + the version observed at the approval), the
  constraints travel with the approval, and the merge/execute side checks the exact fingerprint
  (APPROVE.md). The Binding decision state machine: `pending → approved → revoked`,
  `pending → denied`, `pending → rejected` (constraints changed, or identity incomplete),
  `pending/approved → invalidated` (the file's observed version moved).
- Ledger: the hook's own logFile `~/.dsh/playform/hook-dsh-workspace-approve.log`; KV domain
  `workspace_approve` (its own domain, tables `bindings` per id + `ring` meta `__ring`, recovered on
  mount with the monotonic sequence as max loaded).

## Activation checks

1. **The Config.**

    Inspect Config: `cordis_inspect_query` host/Config/listConfigs
    `{"name": "@playform/hook-dsh-workspace-approve"}` → one entry, status schema.

    Defaults per SCHEME section 7: `logFile=~/.dsh/playform/hook-dsh-workspace-approve.log`,
    `log=true`, `enabled=false`, `domain=workspace_approve`, `maxBindings=1000`,
    `requireConstraints=true`, and the `policy` D6 block (record-only posture, no gated action).

2. **The service check.**

    Service check: `cordis_inspect_query` host/Service/listService `workspaceApprove` → resolves (it
    reads honestly from the empty state even when disabled).

3. **The ledger line.**

    Ledger line: `approve: activated (domain=workspace_approve)` in
    `~/.dsh/playform/hook-dsh-workspace-approve.log`; a cold mount logs
    `approve: disabled (enabled=false)`.

## Test cases

- T1 listConfigs query above - one entry, `status: "schema"` - the defaults match SCHEME section 7
  (domain `workspace_approve`, maxBindings 1000, requireConstraints true, the `policy` D6 block).
- T2 Bind an approval with constraints to a /tmp scratch path + fingerprint - the binding is stored
  in the domain ring - path, fingerprint, version and constraints all recorded; the log shows
  `approve: bound <id> <path> fingerprint <fingerprint>`.
- T2 Bind an approval with NO constraints (requireConstraints true) - rejected - the constraint law
  refuses the bind; the log shows `approve: rejected <id> (constraints changed)`.
- T2 Decide the binding (`approved`/`denied` by a named human) - the decision is the Commitment -
  the log shows `approve: decided <id> approved by <who>` (or `denied by <who>`);
  `revoked <id> by <who>` on revoke.
- T3 Verify with the check guard chain (SCHEME section 3): no binding for path + fingerprint →
  `unbound`; a non-approved binding → its own decision; an approved binding with a different version
  → `stale`; otherwise `approved`. The log shows `approve: checked <path> (<decision>)`; a stale
  version is detected - the exact-fingerprint check rejects it, and the file's move invalidates the
  binding (`approve: invalidated <id> (version changed)`).
- T4 Exceed `maxBindings` - the oldest ring entry is evicted - the log shows
  `approve: capped <id> (maxBindings <n>)`.

## Known live gaps

- Not dogfooded yet. Watch for: bindings surviving a restart unexpectedly (the `__ring` meta record)
  and eviction dropping records silently (must be ledgered, not quiet).
- The candidate fingerprint is computed by the caller; the approve hook binds and checks, it never
  hashes content (SCHEME section 8).

## Fix loop

- Fix files: `Source/Function/` (bind / verify / evict), `Source/Library.ts`,
  `Source/Variable/Config.ts`.
- Rebuild:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/hook-dsh-workspace-approve run prepublishOnly`
- Smokes: `node Classic/packages/hook-dsh-workspace-approve/Target/Test/<Folder>/Test.js` per folder
  under `Source/Test/`. Then the app restart.

## Report stub

- Plugin: `@playform/hook-dsh-workspace-approve`
- Tests run: T1 config - / T2 bind - / T2 no-constraints - / T2 decide - / T3 check chain - / T4
  cap -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
