# hook-dsh-workspace-monitor - the live test plan

## Identity

- Package: `@playform/hook-dsh-workspace-monitor` (Classic/packages/hook-dsh-workspace-monitor).
- Profile row id: `hook-dsh-workspace-monitor` (bundled in the desktop profile).
- Exposes: no tools - the watch/sweep role with NO REAL TIMERS. The watch form records one entry per
  fs/observed event (heard on the ROOT context, the factory's Wire registration) with a debounce
  deadline from the module's Clock; the sweep form is a CLOCK-BASED SCHEDULE - a deadline scan
  inside the event-driven checkpoints, re-armed from the Clock (never setTimeout or setInterval).
  The shipped check-set catalog (tsc, format, cargo, governance) classifies watched paths and is
  recorded for the accountability trail; the monitor NEVER executes a command (MONITOR.md).
- Config (all volatile; hot edits commit without remounting): `logFile`
  `~/.dsh/playform/hook-dsh-workspace-monitor.log`, `enabled` false, `domain` `workspace_monitor`,
  `debounceMs` 250, `sweepIntervalMs` 60000 (0 = sweep at every checkpoint), `maxWatch` 500 (the
  oldest entry is dropped, ledgered), `include` `[]` (empty = every path watches), `exclude`
  `node_modules/**`, `**/Target/**`, `**/.git/**`, `checksets` (the shipped catalog; one spec is
  `{ glob, command?, fast, intervalMs? }` - the classification only), `policy` (the D6 defaults).
- Ledger lines (module-owned, byte-stable, prefixed `monitor: `):
  `` `monitor: disabled (enabled=false)` ``,
  `` `monitor: activated (domain=<domain>, checksets=<n>)` ``,
  `` `monitor: watch <path> version <version> (<sets>)` ``,
  `` `monitor: ignored <path> (own actor)` ``, `` `monitor: ignored <path> (excluded)` ``,
  `` `monitor: ignored <path> (not included)` ``, `` `monitor: capped <path> (maxWatch <n>)` ``,
  `` `monitor: sweep <path> (<age>ms)` ``, `` `monitor: failed <path> (<reason>)` ``. LogFile
  `~/.dsh/playform/hook-dsh-workspace-monitor.log`.
- State probe: `ctx.__hookDshWorkspaceMonitorState` - `{ Watch, Events, Sweeps, LastSweepAt, ... }`.

## Activation checks

1. **The Config.**

    Inspect Config: `cordis_inspect_query` host/Config/listConfigs
    `{"name": "@playform/hook-dsh-workspace-monitor"}` → one entry, status schema (defaults per
    Variable/Config.ts: domain `workspace_monitor`, debounceMs 250, sweepIntervalMs 60000, maxWatch
    500, the include/exclude globs, the check-set catalog, the D6 policy block).

2. **The service check.**

    Service check: none expected (no service; a listener hook).

3. **The ledger line.**

    Ledger line: `monitor: activated (domain=workspace_monitor, checksets=<n>)` in
    `~/.dsh/playform/hook-dsh-workspace-monitor.log`; a cold mount logs
    `monitor: disabled (enabled=false)`.

## Test cases

| #   | Trigger                                          | Expected                                          | Pass criteria                                                                                                     |
| --- | ------------------------------------------------ | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| T1  | listConfigs query above                          | one entry, `status: "schema"`                     | the check-set catalog and the D6 policy block are present                                                         |
| T2  | Write a /tmp scratch file (an fs/observed event) | ONE watch entry recorded with a debounce deadline | `monitor: watch <path> version <version> (<sets>)` with the entry classifying to a check-set; no command executed |
| T3  | Fire the sweep checkpoint (event-driven)         | the deadline scan runs and re-arms each entry     | `monitor: sweep <path> (<age>ms)` lines; no setTimeout/setInterval in the trace                                   |
| T1  | A `.git` or Target path event                    | no watch entry                                    | `monitor: ignored <path> (excluded)`                                                                              |
| T1  | An event caused by the monitor's own actor       | no watch entry                                    | `monitor: ignored <path> (own actor)`                                                                             |
| T2  | Exceed maxWatch entries                          | the oldest entry dropped, ledgered                | `monitor: capped <path> (maxWatch 500)`                                                                           |

## Known live gaps

- Not dogfooded yet. Watch for: real timers sneaking in (the module must use only the Clock) and the
  monitor attempting to execute the classified command (it must only record); also the resolved
  pack's `policy` override (the wiring is the next refinement).

## Fix loop

- Fix files: `Source/Function/` (the watch recorder, the sweep, the Clock), `Source/Library.ts`,
  `Source/Variable/Config.ts`.
- Rebuild:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/hook-dsh-workspace-monitor run prepublishOnly`
- Smokes: `node Classic/packages/hook-dsh-workspace-monitor/Target/Test/<Folder>/Test.js` per folder
  under `Source/Test/`. Then the app restart.

## Report stub

- Plugin: `@playform/hook-dsh-workspace-monitor`
- Tests run: T1 config - / T2 watch entry - / T3 sweep - / T1 exclusion - / T1 own actor - / T2
  cap -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
