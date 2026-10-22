# plugin-dsh-queue - the live test plan

## Identity

- Package: `@playform/plugin-dsh-queue` (Classic/packages/plugin-dsh-queue).
- Profile row id: `plugin-dsh-queue` (bundled in the desktop profile).
- Exposes: the `dshQueue` service (`export default class Dispatcher extends Service` with
  `super(Context_, "dshQueue")`) and the tools `queue_enqueue` and `queue_status`. The cooperative
  batch's seat dispatcher: pending entries, the next seat, running count against
  `State.Capacity.main`.
- Ledger: logFile `~/.dsh/queue.log`. Status line format:
  `` `QUEUE: ${Pending} pending - next: ${Next ?? "none"} - running: ${Running}/${State.Capacity.main} (main seats ${Active})` ``.

## Activation checks

1. Inspect Config: `cordis_inspect_query` host/Config/listConfigs
   `{"name": "@playform/plugin-dsh-queue"}` → one entry, status schema (the capacity defaults live
   in Variable/Config.ts).
2. Tool check: the Tool provider lists `queue_enqueue` and `queue_status`.
3. Ledger line: the activated line in `~/.dsh/queue.log`; a cold mount logs
   `disabled (enabled=false)` and the tools/service no-op.

## Test cases

| # | Trigger | Expected | Pass criteria | | T1 | listConfigs query above | one entry,
`status: "schema"` | the defaults match | | T1 | `queue_status` on a fresh boot |
`QUEUE: 0 pending - next: none - running: 0/N` | the format is exact; honest zeros | | T2 |
`queue_enqueue` one task | the queue grows by one; `queue_status` shows it | pending=1,
next=<the task> | | T2 | Enqueue beyond Capacity.main | the excess waits (pending, not running) |
running never exceeds capacity |

## Known live gaps

- Not dogfooded yet. Watch for: seats not released after a task completes and the status line
  drifting from its byte-stable format.

## Fix loop

- Fix files: `Source/Library.ts`, `Source/Function/Dispatcher.ts`, `Source/Function/ToolEnqueue.ts`,
  `Source/Function/ToolStatus.ts`, `Source/Variable/Config.ts`.
- Rebuild:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/plugin-dsh-queue run prepublishOnly`
- Smokes: `node Classic/packages/plugin-dsh-queue/Target/Test/<Folder>/Test.js` per folder under
  `Source/Test/`. Then the app restart.

## Report stub

- Plugin: `@playform/plugin-dsh-queue`
- Tests run: T1 config - / T1 status - / T2 enqueue - / T2 capacity -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
