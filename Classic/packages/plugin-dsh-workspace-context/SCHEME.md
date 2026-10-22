# SCHEME - @playform/plugin-dsh-workspace-context

The configuration schema (all knobs volatile; hot edits commit without
remounting):

| Field            | Type     | Default                              |
| ---------------- | -------- | ------------------------------------ |
| `logFile`        | string   | `~/.dsh/context.log`                  |
| `enabled`        | boolean  | `false`                               |
| `budgetTokens`   | number   | `2000` (the target)                   |
| `budgetMaximum`  | number   | `4000` (the hard cap, >= target)      |
| `lenses`         | string[] | `["code", "docs", "tests"]`           |
| `lensDefault`    | string   | `code`                                |
| `neighborLimit`  | number   | `20`                                  |
| `evidenceLimit`  | number   | `12`                                  |
| `mapLimit`       | number   | `12`                                  |
| `workspaceName`  | string   | `workspace`                           |

Ledger lines (module-owned, byte-stable, prefixed `context: `):

```
disabled (enabled=false)
activated (budget=<target>/<max>, lenses=<n>)
packet <focus> (<tokens> tok, lens <lens>)
clamped (<from> -> <to> tok, budget <max>)
stale <id> (caller held <version>)
focus <caller> -> <id>
```

Service: `ctx.workspaceContext` - `packet(query)`, `lenses()`,
`focusOf(caller)`, `statistics()`. Tool: `workspace_context` (read-only).

State probe: `ctx.__pluginDshWorkspaceContextState`.
