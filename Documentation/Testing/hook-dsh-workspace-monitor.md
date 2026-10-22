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
- Ledger prefix: `` `monitor: ${Message}` ``; logFile `~/.dsh/monitor.log`.

## Activation checks

1. Inspect Config: `cordis_inspect_query` host/Config/listConfigs
   `{"name": "@playform/hook-dsh-workspace-monitor"}` → one entry, status schema (defaults per
   Variable/Config.ts; the check-set catalog and the exclusion globs).
2. Service check: none expected (no service; a listener hook).
3. Ledger line: the activated line in `~/.dsh/monitor.log`; a cold mount logs
   `disabled (enabled=false)`.

## Test cases

| # | Trigger | Expected | Pass criteria | | T1 | listConfigs query above | one entry,
`status: "schema"` | the check-set catalog is present | | T2 | Write a /tmp scratch file (an
fs/observed event) | ONE watch entry recorded with a debounce deadline | the entry classifies to a
check-set; no command executed | | T3 | Fire the sweep checkpoint (event-driven) | the deadline scan
runs and re-arms each entry | no setTimeout/setInterval in the trace | | T1 | A `.git` or Target
path event | no watch entry | the exclusion globs filter it |

## Known live gaps

- Not dogfooded yet. Watch for: real timers sneaking in (the module must use only the Clock) and the
  monitor attempting to execute the classified command (it must only record).

## Fix loop

- Fix files: `Source/Function/` (the watch recorder, the sweep, the Clock), `Source/Library.ts`,
  `Source/Variable/Config.ts`.
- Rebuild:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/hook-dsh-workspace-monitor run prepublishOnly`
- Smokes: `node Classic/packages/hook-dsh-workspace-monitor/Target/Test/<Folder>/Test.js` per folder
  under `Source/Test/`. Then the app restart.

## Report stub

- Plugin: `@playform/hook-dsh-workspace-monitor`
- Tests run: T1 config - / T2 watch entry - / T3 sweep - / T1 exclusion -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
