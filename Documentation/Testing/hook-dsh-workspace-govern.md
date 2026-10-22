# hook-dsh-workspace-govern - the live test plan

## Identity
- Package: `@playform/hook-dsh-workspace-govern`
  (Classic/packages/hook-dsh-workspace-govern).
- Profile row id: `hook-dsh-workspace-govern` (bundled in the desktop profile).
- Exposes: the `workspaceGovern` service plus the `tools/pre-execute` gate on
  the gated tools (`write`, `edit`, `bash`, `applyPatch`). The governance gate
  of the invisible flow: operate proposes → the GOVERN GATES → the authority
  licenses → approve binds. Four INDEPENDENT MEANS-CHECKS on the ProposedChange
  (contributes, authorized scope, policy, preconditions) before any
  AuthorizationDecision - an intent must not authorize its own means. Fail-open
  recovery for contributes/policy/preconditions, fail-closed for scope.
  Recursion prevention: an operation id gated beyond loopBound (4) is dropped
  with a ledger line.
- Ledger: logFile `~/.dsh/govern.log`.

## Activation checks
1. Inspect Config: `cordis_inspect_query` host/Config/listConfigs
   `{"name": "@playform/hook-dsh-workspace-govern"}` → one entry, status schema
   (defaults: tools write/edit/bash/applyPatch, scope [] (unrestricted),
   exclude triple, policy [], recovery [], loopBound 4, maxDecisions 500).
2. Service check: `cordis_inspect_query` host/Service/listService
   `workspaceGovern` → resolves.
3. Ledger line: the activated line in `~/.dsh/govern.log`; a cold mount logs
   `disabled (enabled=false)` and the gate is a pass-through.

## Test cases
| # | Trigger | Expected | Pass criteria |
| T1 | listConfigs query above | one entry, `status: "schema"` | the gated tool list matches |
| T3 | A `write` to a /tmp scratch path with scope [] | the gate evaluates scope as "n/a" and passes | pass-through on unrestricted scope |
| T3 | Set scope to `["/tmp/**"]`, then `edit` a repo file | the gate FAILS CLOSED (unevaluable match) | the decision denies; ledgered |
| T3 | Gate the same operation id loopBound+1 times | the 5th proposal is dropped | the drop is a ledger line (recursion prevention) |

## Known live gaps
- Not dogfooded yet. Watch for: the recovery table overrides not landing on
  hot-edit (volatile cells must refresh State in place), and the policy table's
  first-match-wins ordering.

## Fix loop
- Fix files: `Source/Function/` (the four checks, Recovery.ts, the gate),
  `Source/Library.ts`, `Source/Variable/Config.ts`.
- Rebuild: `pnpm --config.verify-deps-before-run=false --dir Classic/packages/hook-dsh-workspace-govern run prepublishOnly`
- Smokes: `node Classic/packages/hook-dsh-workspace-govern/Target/Test/<Folder>/Test.js`
  per folder under `Source/Test/`. Then the app restart.

## Report stub
- Plugin: `@playform/hook-dsh-workspace-govern`
- Tests run: T1 config - / T3 unrestricted - / T3 fail-closed - / T3 loopBound -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
