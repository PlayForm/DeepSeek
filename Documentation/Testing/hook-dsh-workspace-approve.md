# hook-dsh-workspace-approve - the live test plan

## Identity
- Package: `@playform/hook-dsh-workspace-approve`
  (Classic/packages/hook-dsh-workspace-approve).
- Profile row id: `hook-dsh-workspace-approve` (bundled in the desktop profile).
- Exposes: the `workspaceApprove` service. Binds the EXACT human approval: an
  approval binds to the concrete change set (path + content fingerprint + the
  observed file version), the constraints travel with the approval, and the
  merge/execute side checks the exact fingerprint (APPROVE.md).
- Ledger: the hook's own logFile `~/.dsh/approve.log`; KV domain
  `workspace_approve` (its own domain, no collision).

## Activation checks
1. Inspect Config: `cordis_inspect_query` host/Config/listConfigs
   `{"name": "@playform/hook-dsh-workspace-approve"}` → one entry, status
   schema (defaults: domain workspace_approve, maxBindings 1000,
   requireConstraints true).
2. Service check: `cordis_inspect_query` host/Service/listService
   `workspaceApprove` → resolves (it reads honestly from the empty state even
   when disabled).
3. Ledger line: the activated line in `~/.dsh/approve.log`; a cold mount logs
   `disabled (enabled=false)`.

## Test cases
| # | Trigger | Expected | Pass criteria |
| T1 | listConfigs query above | one entry, `status: "schema"` | the defaults match |
| T2 | Bind an approval with constraints to a /tmp scratch path + fingerprint | the binding is stored in the domain ring | path, fingerprint and constraints all recorded |
| T2 | Bind an approval with NO constraints (requireConstraints true) | rejected | the constraint law refuses the bind; ledgered |
| T2 | Verify the merge side checks a fingerprint that does NOT match | mismatch is detected | the exact-fingerprint check rejects the stale version |

## Known live gaps
- Not dogfooded yet. Watch for: bindings surviving a restart unexpectedly (the
  meta record ring) and eviction dropping records silently (must be `evict`
  disposition, ledgered).

## Fix loop
- Fix files: `Source/Function/` (bind / verify / evict), `Source/Library.ts`,
  `Source/Variable/Config.ts`.
- Rebuild: `pnpm --config.verify-deps-before-run=false --dir Classic/packages/hook-dsh-workspace-approve run prepublishOnly`
- Smokes: `node Classic/packages/hook-dsh-workspace-approve/Target/Test/<Folder>/Test.js`
  per folder under `Source/Test/`. Then the app restart.

## Report stub
- Plugin: `@playform/hook-dsh-workspace-approve`
- Tests run: T1 config - / T2 bind - / T2 no-constraints - / T2 fingerprint -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
