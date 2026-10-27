# plugin-dsh-batchstate - the live test plan

## Identity

- Package: `@playform/plugin-dsh-batchstate` (Classic/packages/plugin-dsh-batchstate).
- Profile row id: `plugin-dsh-batchstate` (bundled in the desktop profile).
- Exposes: the `batchstate` service (read API: getState / getContext / getScope / whoElse /
  getProposals / getGates / getQueue) and the write API (setTask / setStatus / setScope / queue /
  setGate / clear). The cooperative batch's live state board: members (id, role, the CURRENT
  ACTIVITY task, the status, the queue position, the owned surfaces, the timestamps), the compiled
  presentation (Context = Compile(State), recompiled on every state change), the inbox splice, and
  the ledger. Every state change emits `batch/state-change` and persists the snapshot into the
  stores.
- The stores (SCHEME §6): the PRIMARY store is the harness's `ctx.storage` KV domain (config
  `domain`, default `batch_state`, version 1, per-record tables `members` / `queue` / `proposals` /
  `gates`); the FALLBACK is the well-known JSON state file (`~/.dsh/batch-state.json`), written and
  read only when no storage facility is provided or the domain's open fails (the loud
  `storage open failed: <reason>` line). A member recovered as `active` is downgraded to
  `interrupted` after a restart.
- The inbox splice (SCHEME §4a): the board registers on the harness agent-team inbox
  (`agent/inbox/spliced` + `agent/inbox/inserted`, de-duplicated on the message id) and projects
  every `[BATCH PROPOSAL - <id>]` / `[BATCH DECISION - <id>]` block; a newer-revision proposal is
  spliced, an older one logs `proposal <id> skipped (revision not newer)`; a decision for an unknown
  proposal is refused (`decision <id> ignored (unknown proposal)`).
- Ledger lines (SCHEME §7, byte-stable): `` `activated (batch=<key>, stateFile=<path>)` ``,
  `recovered (<n> members, queue <n>)`, `storage open failed: <reason>`, the proposal/decision
  splice lines, `gate <name>: <state>`; logFile `~/.dsh/playform/plugin-dsh-batchstate.log`.
- The policy block (D6, SCHEME §3.1): the config composes the factory's shared `policy: Policy()`
  (read/index/record/suggest/message = `auto`; write/commit/spawn = `approve`, declared for
  uniformity - the board never writes, commits or spawns), mapped to `State.Allow`. One volatile
  object; a resolved pack's `policy` section overrides per action.

## Activation checks

1. **The Config.**

    Inspect Config: `cordis_inspect_query` host/Config/listConfigs
    `{"name": "@playform/plugin-dsh-batchstate"}` → one entry, status schema (defaults: batch
    "default", domain `batch_state`, stateFile ~/.dsh/batch-state.json, maxRecent 8, maxProposals
    16, policy.* D6 defaults).

2. **The service check.**

    Service check: `cordis_inspect_query` host/Service/listService `batchstate` → resolves (it reads
    honestly from the empty state even when disabled).

3. **The ledger line.**

    Ledger line: `batchstate: activated (batch=default, stateFile=...)` in
    `~/.dsh/playform/plugin-dsh-batchstate.log`.

## Test cases

| # | Trigger | Expected | Pass criteria | | T1 | listConfigs query above | one entry,
`status: "schema"` | the defaults match | | T1 | `getState()` on a fresh boot | the honest empty
state | no fabricated members | | T2 | `setTask(agentId, task)` then `setStatus(agentId, "running")`
| the state changes, `batch/state-change` emitted, snapshot persisted | the active store (KV domain
or fallback file) reflects the change; the presentation recompiled | | T2 | `whoElse(agentId)` with
2+ registered members | the other members' activity/status | the CURRENT ACTIVITY task visible | |
T2 | Splice a `[BATCH PROPOSAL - <id>]` block into the inbox | the proposal recorded,
`proposal <id> spliced (...)` line | `getProposals()` shows it; a stale revision is skipped, not
errored | | T2 | Splice a `[BATCH DECISION - <id>]` decision for the held proposal | the status
moves | an unknown decision id is refused (`decision <id> ignored (unknown proposal)`), never
guessed | | T2 | `setGate(name, "green", owner)` | the gate recorded | `GATES:` appears in the
compiled block; a bad name or state throws at the call site |

## Known live gaps

- Not dogfooded yet. Watch for: the KV domain's open failing (the loud
  `storage open failed: <reason>` line, then the fallback recovers), maxRecent evictions dropping
  history, and the queue projection's dependence on `ctx.dshQueue` being mounted (omitted →
  `getQueue()` returns `QUEUE: none`).

## Fix loop

- Fix files: `Source/Function/` (the state board, the write/read API, the compiler, the ledger),
  `Source/Library.ts`, `Source/Variable/Config.ts`.
- Rebuild:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/plugin-dsh-batchstate run prepublishOnly`
- Smokes: `node Classic/packages/plugin-dsh-batchstate/Target/Test/<Folder>/Test.js` per folder
  under `Source/Test/`. Then the app restart.

## Report stub

- Plugin: `@playform/plugin-dsh-batchstate`
- Tests run: T1 config - / T1 empty state - / T2 setTask/setStatus - / T2 whoElse -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
