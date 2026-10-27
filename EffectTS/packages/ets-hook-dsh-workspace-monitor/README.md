# @playform/hook-dsh-workspace-monitor

> v0.1.0 - UNPUBLISHED - plan:
> [Workspace-Family/MONITOR](../../../Documentation/Plans/Workspace-Family/MONITOR.md)

## The role

The **monitor hook** of the workspace family: the watch/sweep forms, the wave-3 machinery with **no
real timers**.

- **Watch.** On every `fs/observed` event (heard on the ROOT context, the Wire registration of the
  factory) the hook records one watch entry (path, observed version, clock stamp, classified check
  sets) with a debounce deadline computed from the Clock of the module.

    The listener is a synchronous recorder: no awaits, no subprocess work, and no file content ever
    read.

- **Sweep.** The **clock-based schedule** is a deadline scan that runs inside the event-driven
  checkpoints and re-arms each entry from the Clock.

    There is no `setTimeout` and no `setInterval` anywhere, because the next event is the bound.

- **Check sets.** The shipped classification catalog (tsc, format, cargo, governance, the
  live-containers monitor precedent) maps a watched path to its check-set identifiers, recorded for
  the accountability trail.

    The monitor **never executes a command**, because execution stays with the live-containers
    monitor.

- **Ledger.** Every decision carries a byte-stable module-owned line
  (`monitor: watch/ignored/capped/sweep/failed/disabled`), and the health and performance counters
  (events, sweeps, last sweep stamp) live on the state probed as
  `ctx.__hookDshWorkspaceMonitorState`.

The plugin ships **disabled** (the IDLE-forever posture): it never appears in the bundles of the
profile and enables only by an explicit ACTIVATE.

## The configuration

### The policy block (D6)

The config carries the shared per-action allowlist (`policy: Policy()`, composed from the block of
the factory), mapped to `State.Allow`:

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

The actions of this package are record, all AUTOMATIC; it has NO gated action (no file write, no
batch commit, no spawn), so the block documents the posture and refuses nothing.

The block is one volatile object, so a policy flip is hot-editable without a remount, and the
`policy` section of a resolved pack overrides the defaults per action (the wiring is the next
refinement).

## The plan

- [Workspace-Family/MONITOR](../../../Documentation/Plans/Workspace-Family/MONITOR.md) - the
  watch/sweep machinery.

## License

CC0-1.0.
