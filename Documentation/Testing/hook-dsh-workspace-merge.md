# hook-dsh-workspace-merge - the live test plan

## Identity
- Package: `@playform/hook-dsh-workspace-merge`
  (Classic/packages/hook-dsh-workspace-merge).
- Profile row id: `hook-dsh-workspace-merge` (bundled in the desktop profile).
- Exposes: the `workspace_merge` tool, registered from apply (the tool lives
  inside its owning hook). The batch merge, the step after the approve binds:
  the atomic gates, the per-file commits through the factory's shared write
  executor (the explicit replaceIfVersion intent, the P4 sandbox fence), and
  the commit reply union (applied / conflict / denied / rejected /
  recovery-required / outcome-unknown). v1 promises preview, version fence,
  explicit conflict - never a three-way merge.
- Ledger: logFile `~/.dsh/merge.log`; KV domain `workspace_merge`.

## Activation checks
1. Inspect Config: `cordis_inspect_query` host/Config/listConfigs
   `{"name": "@playform/hook-dsh-workspace-merge"}` → one entry, status schema
   (defaults: domain workspace_merge, mode all-or-nothing, maxFiles 50,
   maxTotalBytes 1000000).
2. Tool check: the Tool provider lists `workspace_merge`.
3. Ledger line: the activated line in `~/.dsh/merge.log`; a cold mount logs
   `disabled (enabled=false)` and nothing is wired.

## Test cases
| # | Trigger | Expected | Pass criteria |
| T1 | listConfigs query above | one entry, `status: "schema"` | the defaults match |
| T1 | `workspace_merge` preview on /tmp scratch files | the preview reply | no writes performed; the reply lists per-file intent |
| T2 | `workspace_merge` commit on a /tmp scratch batch | `applied` | all files written through Factory.Write; version fence held |
| T2 | Commit with a stale version on one file | the reply is `conflict` | all-or-nothing: nothing else lands |
| T2 | A batch exceeding maxFiles | `rejected` by the gate | the reply names the gate, not a crash |

## Known live gaps
- Not dogfooded yet. Watch for: the commit reply union collapsing to a bare
  success, and the P4 sandbox fence blocking /tmp writes (the fence scope must
  allow the scratch area).

## Fix loop
- Fix files: `Source/Function/` (the merge engine, the gates, the reply
  union), `Source/Library.ts`, `Source/Variable/Config.ts`.
- Rebuild: `pnpm --config.verify-deps-before-run=false --dir Classic/packages/hook-dsh-workspace-merge run prepublishOnly`
- Smokes: `node Classic/packages/hook-dsh-workspace-merge/Target/Test/<Folder>/Test.js`
  per folder under `Source/Test/`. Then the app restart.

## Report stub
- Plugin: `@playform/hook-dsh-workspace-merge`
- Tests run: T1 config - / T1 preview - / T2 commit - / T2 conflict - / T2 gate -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
