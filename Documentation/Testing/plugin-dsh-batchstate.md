# plugin-dsh-batchstate - the live test plan

## Identity
- Package: `@playform/plugin-dsh-batchstate`
  (Classic/packages/plugin-dsh-batchstate).
- Profile row id: `plugin-dsh-batchstate` (bundled in the desktop profile).
- Exposes: the `batchstate` service (read API: getState / getContext / getScope
  / whoElse) and the write API (setTask / setStatus / setScope / queue). The
  cooperative batch's live state board: members (id, role, the CURRENT ACTIVITY
  task, the status, the queue position, the owned surfaces, the timestamps),
  the compiled presentation (Context = Compile(State), recompiled on every
  state change), and the ledger. Every state change emits `batch/state-change`
  and persists the snapshot into the well-known JSON state file.
- Ledger line: `` `batchstate: activated (batch=default, stateFile=${StateFile})` ``;
  logFile `~/.dsh/plugin-dsh-batchstate.log`; stateFile
  `~/.dsh/batch-state.json`.

## Activation checks
1. Inspect Config: `cordis_inspect_query` host/Config/listConfigs
   `{"name": "@playform/plugin-dsh-batchstate"}` → one entry, status schema
   (defaults: batch "default", stateFile ~/.dsh/batch-state.json, maxRecent 8).
2. Service check: `cordis_inspect_query` host/Service/listService `batchstate`
   → resolves (it reads honestly from the empty state even when disabled).
3. Ledger line: `batchstate: activated (batch=default, stateFile=...)` in
   `~/.dsh/plugin-dsh-batchstate.log`.

## Test cases
| # | Trigger | Expected | Pass criteria |
| T1 | listConfigs query above | one entry, `status: "schema"` | the defaults match |
| T1 | `getState()` on a fresh boot | the honest empty state | no fabricated members |
| T2 | `setTask(agentId, task)` then `setStatus(agentId, "running")` | the state changes, `batch/state-change` emitted, snapshot persisted | the state file reflects the change; the presentation recompiled |
| T2 | `whoElse(agentId)` with 2+ registered members | the other members' activity/status | the CURRENT ACTIVITY task visible |

## Known live gaps
- Not dogfooded yet. Watch for: the state file not being written on hot config
  edits and maxRecent evictions dropping history silently.

## Fix loop
- Fix files: `Source/Function/` (the state board, the write/read API, the
  compiler, the ledger), `Source/Library.ts`, `Source/Variable/Config.ts`.
- Rebuild: `pnpm --config.verify-deps-before-run=false --dir Classic/packages/plugin-dsh-batchstate run prepublishOnly`
- Smokes: `node Classic/packages/plugin-dsh-batchstate/Target/Test/<Folder>/Test.js`
  per folder under `Source/Test/`. Then the app restart.

## Report stub
- Plugin: `@playform/plugin-dsh-batchstate`
- Tests run: T1 config - / T1 empty state - / T2 setTask/setStatus - / T2 whoElse -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
