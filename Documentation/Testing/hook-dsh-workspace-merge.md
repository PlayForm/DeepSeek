# hook-dsh-workspace-merge - the live test plan

## Identity

- Package: `@playform/hook-dsh-workspace-merge` (Classic/packages/hook-dsh-workspace-merge).
- Profile row id: `hook-dsh-workspace-merge` (bundled in the desktop profile).
- Exposes: the `workspace_merge` tool, registered from apply (the tool lives inside its owning
  hook), plus the `workspaceMerge` service (`preview`, `commit`, `batch`, `batches`, `statistics`).
  The batch merge, the step after the approve binds: the atomic gates, the per-file commits through
  the factory's shared write executor (the explicit version fence, the P4 sandbox fence), and the
  commit reply union (applied / conflict / denied / rejected / recovery-required / outcome-unknown).
  v1 promises preview, version fence, explicit conflict - never a three-way merge.
- Ledger: logFile `~/.dsh/playform/hook-dsh-workspace-merge.log`; KV domain `workspace_merge`
  (version 1, per-record: `batches` one record per batch, `meta` one `__meta` record
  `{ sequence }`).

## Activation checks

1. Inspect Config: `cordis_inspect_query` host/Config/listConfigs
   `{"name": "@playform/hook-dsh-workspace-merge"}` → one entry, status schema. Defaults per the
   SCHEME config table: `enabled=false`, `domain=workspace_merge`, `mode=all-or-nothing`
   (`"all-or-nothing" | "survivors"`), `maxFiles=50`, `maxTotalBytes=1000000`, the `policy` D6 block
   (see below), `logFile=~/.dsh/playform/hook-dsh-workspace-merge.log`.
2. Tool check: the Tool provider lists `workspace_merge`.
3. Ledger line: `merge: activated (domain=workspace_merge, mode=all-or-nothing)` in
   `~/.dsh/playform/hook-dsh-workspace-merge.log`; a cold mount logs
   `merge: disabled (enabled=false)` and nothing is wired.

## Test cases

- T1 listConfigs query above - one entry, `status: "schema"` - the defaults match the SCHEME table.
- T1 `workspace_merge` preview on /tmp scratch files - the preview reply - no writes performed; the
  reply lists per-file intent (`{path, expected, observed, bytes, status}`) and the SHA-256 hex
  digest of the joined intended contents; the log shows
  `merge: batch <id> started (<n> files, <bytes> bytes)`.
- T2 `workspace_merge` commit on a /tmp scratch batch - `applied` - all files written through the
  factory's write executor; version fence held; the log shows
  `merge: applied <path> version <version> (batch <id>)` and
  `merge: batch <id> complete (applied <a>, conflict <c>, denied <d>, recovery <r>, unknown <u>)`.
- T2 Commit with a stale version on one file - the reply is `conflict` - in all-or-nothing mode
  nothing else lands; the log shows `merge: conflict <path> (expected <e>, observed <o>)`.
- T2 A batch exceeding maxFiles - `rejected` by the gates - the reply names the gate, not a crash;
  gate order: empty batch → `maxFiles` → `maxTotalBytes` → duplicate paths → missing version fence →
  per file unresolved path / fence mismatch; the log shows `merge: batch <id> rejected (<reason>)`.
- T3 Commit with `policy.commit=approve` - the policy holds the whole batch, zero writes - the log
  records the byte-exact `merge: merge held (<n> files) (policy commit=approve)` line, every
  operation replies `rejected` with `the policy holds the commit (commit=approve)`, and nothing is
  persisted. `auto` proceeds to the atomic gates.
- T4 Survivors mode (`mode=survivors`) - conflicts and per-file failures are per-operation replies,
  not batch rejections - the batch status is `partial`; `batch(id)`/`batches()` return the records.

## Known live gaps

- Not dogfooded yet. Watch for: the commit reply union collapsing to a bare success, and the P4
  sandbox fence blocking /tmp writes (the fence scope must allow the scratch area).
- The `recovery-required` and `outcome-unknown` paths need a deliberately wedged write to be seen
  live; the policy-held commit is the one new byte-exact line to check.

## Fix loop

- Fix files: `Source/Function/` (the merge engine, the gates, the reply union), `Source/Library.ts`,
  `Source/Variable/Config.ts`.
- Rebuild:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/hook-dsh-workspace-merge run prepublishOnly`
- Smokes: `node Classic/packages/hook-dsh-workspace-merge/Target/Test/<Folder>/Test.js` per folder
  under `Source/Test/`. Then the app restart.

## Report stub

- Plugin: `@playform/hook-dsh-workspace-merge`
- Tests run: T1 config - / T1 preview - / T2 commit - / T2 conflict - / T2 gate - / T3 policy hold -
  / T4 survivors -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
