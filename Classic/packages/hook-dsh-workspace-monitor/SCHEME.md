# SCHEME - @playform/hook-dsh-workspace-monitor

The configuration schema follows (all knobs are volatile, and hot edits commit without remounting):

| Field             | Type              | Default                                              |
| ----------------- | ----------------- | ---------------------------------------------------- |
| `logFile`         | string            | `~/.dsh/playform/hook-dsh-workspace-monitor.log`     |
| `enabled`         | boolean           | `false`                                              |
| `domain`          | string            | `workspace_monitor`                                  |
| `debounceMs`      | number            | `250`                                                |
| `sweepIntervalMs` | number            | `600000` (0 = sweep at every checkpoint)             |
| `maxWatch`        | number            | `500` (the oldest entry is dropped, ledgered)        |
| `include`         | string[] (globs)  | `[]` (empty = every path watches)                    |
| `exclude`         | string[] (globs)  | `node_modules/**`, `**/Target/**`, `**/.git/**`      |
| `checksets`       | dict name -> spec | the shipped catalog (tsc, format, cargo, governance) |
| `policy`          | `Allowlist`       | the D6 defaults (see below)                          |

One check-set spec is `{ glob, command?, fast, intervalMs? }`, which is the classification only, and
`command` is never executed by this hook.

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

State probe: `ctx.__hookDshWorkspaceMonitorState` - `{ Watch, Events, Sweeps, LastSweepAt, ... }`.

## The policy block (D6)

The config carries the shared per-action allowlist (`policy: Policy()`), mapped to `State.Allow`:

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

This package's actions are record, all AUTOMATIC, and it has NO gated action (no file write, no
batch commit, no spawn), so the block documents the posture and refuses nothing.

The block is one volatile object, so a policy flip is hot-editable without a remount, and a resolved
pack's `policy` section overrides the defaults per action (the wiring is the next refinement).

No new ledger line: the package has no gated action.
