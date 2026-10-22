# @playform/hook-dsh-workspace-monitor

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

Plan: Documentation/Plans/Workspace-Family/MONITOR.md.
