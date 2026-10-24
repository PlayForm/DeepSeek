# plugin-dsh-queue - the live test plan

## Identity

- Package: `@playform/plugin-dsh-queue` (Classic/packages/plugin-dsh-queue).
- Profile row id: `plugin-dsh-queue` (bundled in the desktop profile).
- Exposes: the `dshQueue` service (`export default class Dispatcher extends Service` with
  `super(Context_, "dshQueue")`; `Enqueue` / `Dispatch` / `Capacity` / `Start` / `Complete` / `Fail`
  / `Interrupt` / `Reconcile` / `Flush` / `Board` / `Snapshot`) and the tools `queue_enqueue` and
  `queue_status`. The cooperative batch's seat dispatcher: pending entries, the next seat, running
  count against `State.Capacity.main`.
- The capacity law (README "The user's capacity model is the law"): `capacity.main` 10 for the main
  conversation's pool, `capacity.child` 2 caps every spawned agent's own children (the two-active
  regime); the harness's `maxActiveSubagents` stays the backstop.
- The spawn law (SCHEME §2): the launch goes through the harness subagent service
  (`ctx.subagents.startActivation`, the `spawnProvider` backend) — never a private spawn.
  `autoSpawn` ships **false**: assign and ledger only, no spawn call, no spawn line; the idle-slot
  automation is gated on `autoDispatch && autoSpawn`. `spawnProvider` (default `spawn`) selects the
  backend.
- The policy block (D6, SCHEME §2): `policy: Policy()` is the OUTER gate in front of `autoSpawn`
  (the INNER one); write/commit/spawn = `approve`, the rest `auto`. An `approve` verdict for `spawn`
  refuses the launch even with the knob on, logs the byte-exact
  `spawn held <id> (policy spawn=approve)` line, and leaves the task `dispatched` with its seat held
  — precedence **policy approve > knob**. One volatile object.
- Ledger lines (SCHEME §3, byte-stable): `disabled (enabled=false)`; the activation (`bundle 0.1.0`,
  `capacity main=10 child=2`, `routedDispatch true`); `queued <id> <role|auto> p<priority> deps<n>`;
  `dispatched <id> -> <agent>[ route <provider> <model> <effort>]`; `running <id>`;
  `<completed|failed|interrupted> <id> (<agent>)`; `spawned <id> -> <child>`;
  `spawn held <id> (policy spawn=approve)`; `spawn skipped <id> (...)`;
  `spawn failed <id> (<error>)`; `requeued <id> (<agent> gone)`; logFile
  `~/.dsh/playform/plugin-dsh-queue.log`. Status line format:
  `` `QUEUE: ${Pending} pending - next: ${Next ?? "none"} - running: ${Running}/${State.Capacity.main} (main seats ${Active})` ``.

## Activation checks

1. Inspect Config: `cordis_inspect_query` host/Config/listConfigs
   `{"name": "@playform/plugin-dsh-queue"}` → one entry, status schema (defaults: capacity.main 10,
   capacity.child 2, autoDispatch true, routedDispatch true, autoSpawn false, spawnProvider "spawn",
   policy.* D6 defaults).
2. Tool check: the Tool provider lists `queue_enqueue` and `queue_status`.
3. Ledger line: the activated line in `~/.dsh/playform/plugin-dsh-queue.log`; a cold mount logs
   `disabled (enabled=false)` and the tools/service no-op.

## Test cases

| # | Trigger | Expected | Pass criteria | | T1 | listConfigs query above | one entry,
`status: "schema"` | the defaults match | | T1 | `queue_status` on a fresh boot |
`QUEUE: 0 pending - next: none - running: 0/N` | the format is exact; honest zeros | | T2 |
`queue_enqueue` one task | the queue grows by one; `queue_status` shows it | pending=1,
next=<the task>; the `queued <id> <role|auto> p<priority> deps<n>` line lands | | T2 | Enqueue
beyond Capacity.main | the excess waits (pending, not running) | running never exceeds capacity | |
T2 | With `autoSpawn: false` (shipped default), dispatch a task | the task is assigned and ledgered
only | NO spawn call, NO spawn line, the seat held | | T2 | Flip `autoSpawn: true` while
`policy.spawn` stays `approve` | the launch is refused | the byte-exact
`spawn held <id> (policy spawn=approve)` line; task stays `dispatched` with its seat held | | T2 |
`policy.spawn: auto` (hot edit) + `autoSpawn: true` | the spawn goes through
`ctx.subagents.startActivation` | `spawned <id> -> <child>`; the child's result settles the task
(`completed`/`failed`) |

## Known live gaps

- Not dogfooded yet. Watch for: seats not released after a task completes, the status line drifting
  from its byte-stable format, and the durable queue store (still absent — the reconcile reads the
  caller's `Snapshot().tasks`; a `spawn skipped` task keeps its seat until the orchestrator settles
  it).

## Fix loop

- Fix files: `Source/Library.ts`, `Source/Function/Dispatcher.ts`, `Source/Function/Dispatch.ts`
  (the policy gate), `Source/Function/Spawn.ts`, `Source/Function/ToolEnqueue.ts`,
  `Source/Function/ToolStatus.ts`, `Source/Variable/Config.ts`.
- Rebuild:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/plugin-dsh-queue run prepublishOnly`
- Smokes: `node Classic/packages/plugin-dsh-queue/Target/Test/<Folder>/Test.js` per folder under
  `Source/Test/`. Then the app restart.

## Report stub

- Plugin: `@playform/plugin-dsh-queue`
- Tests run: T1 config - / T1 status - / T2 enqueue - / T2 capacity - / T2 policy hold - / T2
  spawn -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
