# SCHEME - @playform/hook-dsh-workspace-monitor

The configuration schema (all knobs volatile; hot edits commit without
remounting):

| Field             | Type                        | Default                                     |
| ----------------- | --------------------------- | ------------------------------------------- |
| `logFile`         | string                      | `~/.dsh/monitor.log`                         |
| `enabled`         | boolean                     | `false`                                      |
| `domain`          | string                      | `workspace_monitor`                          |
| `debounceMs`      | number                      | `250`                                        |
| `sweepIntervalMs` | number                      | `60000` (0 = sweep at every checkpoint)      |
| `maxWatch`        | number                      | `500` (the oldest entry is dropped, ledgered)|
| `include`         | string[] (globs)            | `[]` (empty = every path watches)            |
| `exclude`         | string[] (globs)            | `node_modules/**`, `**/Target/**`, `**/.git/**` |
| `checksets`       | dict name -> spec           | the shipped catalog (tsc, format, cargo, governance) |

One check-set spec: `{ glob, command?, fast, intervalMs? }` - the
classification only; `command` is never executed by this hook.

Ledger lines (module-owned, byte-stable, prefixed `monitor: `):

```
disabled (enabled=false)
activated (domain=<domain>, checksets=<n>)
watch <path> version <version> (<sets>)
ignored <path> (own actor)
ignored <path> (excluded)
ignored <path> (not included)
capped <path> (maxWatch <n>)
sweep <path> (<age>ms)
failed <path> (<reason>)
```

State probe: `ctx.__hookDshWorkspaceMonitorState` - `{ Watch, Events, Sweeps,
LastSweepAt, ... }`.
