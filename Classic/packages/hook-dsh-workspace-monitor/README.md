# @playform/hook-dsh-workspace-monitor

> v0.1.0 - UNPUBLISHED - plan:
> [Workspace-Family/MONITOR](../../../Documentation/Plans/Workspace-Family/MONITOR.md)

## The role

The workspace family's **monitor hook**: the watch/sweep forms - the wave-3 machinery with **no real
timers**.

- **Watch**: on every `fs/observed` event (heard on the ROOT context, the factory's Wire
  registration) the hook records one watch entry (path, observed version, clock stamp, classified
  check sets) with a debounce deadline computed from the module's Clock. The listener is a
  synchronous recorder: no awaits, no subprocess work, no file content ever read.
- **Sweep**: the **clock-based schedule** - a deadline scan that runs inside the event-driven
  checkpoints and re-arms each entry from the Clock. There is no `setTimeout` and no `setInterval`
  anywhere: the next event is the bound.
- **Check sets**: the shipped classification catalog (tsc, format, cargo, governance - the
  live-containers monitor precedent) maps a watched path to its check-set identifiers, recorded for
  the accountability trail. The monitor **never executes a command**; execution stays with the
  live-containers monitor.
- **Ledger**: every decision carries a byte-stable module-owned line
  (`monitor: watch/ignored/capped/sweep/failed/disabled`); the health and performance counters
  (events, sweeps, last sweep stamp) live on the state probed as
  `ctx.__hookDshWorkspaceMonitorState`.

The plugin ships **disabled** (the IDLE-forever posture): it never appears in the profile's bundles
and enables only by an explicit ACTIVATE.

## The surfaces

- The `fs/observed` listener on the ROOT context (the factory's Wire registration) - the watch
  recorder (synchronous: no awaits, no subprocess work, no file content ever read).
- The clock-based deadline sweep inside the event-driven checkpoints.
- The state probed as `ctx.__hookDshWorkspaceMonitorState`.
- No tool, no provided service; the monitor never executes a command.

## The ledger

Every decision carries a byte-stable module-owned line (prefix `monitor:`):
`watch/ignored/capped/sweep/failed/disabled`; the health and performance counters (events, sweeps,
last sweep stamp) live on the probed state.

## The configuration

| Field             | Default                                          | Meaning                              |
| ----------------- | ------------------------------------------------ | ------------------------------------ |
| `enabled`         | `false`                                          | the master switch (IDLE-forever)     |
| `log`             | `true`                                           | the ledger switch (shared cell)      |
| `logFile`         | `~/.dsh/playform/hook-dsh-workspace-monitor.log` | the ledger                           |
| `domain`          | `workspace_monitor`                              | the KV domain name                   |
| `debounceMs`      | `250`                                            | the watch debounce deadline          |
| `sweepIntervalMs` | `60000`                                          | the sweep schedule interval          |
| `maxWatch`        | `500`                                            | the watch entry cap                  |
| `policy.*`        | D6 defaults                                      | the per-action allowlist (see below) |

Every field is a volatile cell.

### The policy block (D6)

The config carries the shared per-action allowlist (`policy: Policy()`, composed from the factory's
block), mapped to `State.Allow`:

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

This package's actions are record, all AUTOMATIC; it has NO gated action (no file write, no batch
commit, no spawn), so the block documents the posture and refuses nothing.

The block is one volatile object, so a policy flip is hot-editable without a remount; a resolved
pack's `policy` section overrides the defaults per action (the wiring is the next refinement).

## The build and the tests

The build is `pnpm prepublishOnly` (Source/prepublishOnly.sh): the plugin build (ESM `Target/`, Test
tree excluded), the Test build, the harness selfcheck, and the Test type-check.

## The plan

- [Workspace-Family/MONITOR](../../../Documentation/Plans/Workspace-Family/MONITOR.md) - the
  watch/sweep machinery.
- The plugin ships **disabled** (the IDLE-forever posture): it never appears in the profile's
  bundles and enables only by an explicit ACTIVATE.

## License

CC0-1.0.
