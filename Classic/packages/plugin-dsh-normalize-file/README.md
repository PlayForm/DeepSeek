# @playform/plugin-dsh-normalize-file - The file-content normalizer

> Version 0.1.0 - UNPUBLISHED (the npm bootstrap tier 2-planned / 3-candidates).
>
> Plan: [SCHEME.md](./SCHEME.md).

## The role

The **file-content normalizer** - a DeepSeek Harness plugin that registers the normalize family's
`normalize-file` TOOL: the read → count → write pipeline over files ALREADY on disk, beyond the tool
layer.

One agent-chosen file per call: the target's content is read, the family's SIX transforms (the
core's Dashes/Quotes/Ellipsis/Spaces/Invisible/Fullwidth tables through the shared
Replace/ReplaceMap replacers, the same chain the raw-write `normalize: true` applies) are applied
with a per-character count, and only when N > 0 is the rewritten content written back through the
factory's ONE shared write executor (resolve-side read, `fs/write-intent` waterfall, standing
sandbox policy, `writeText`, the root-context `fs/observed` present emit).

N = 0 writes NOTHING - the no-op no-write rule.

The rewrite is explicit, visible (a diff card showing the before/after) and opt-in by construction:
the family's first LISTENER-LESS flavor (no `llm/stream`, no `fs/observed` - the background-rewrite
posture of the design report is deliberately deferred, because it would break the edit tool's
`old_string` contract).

## The surfaces

| Kind     | Name                      | What                                                                                          |
| -------- | ------------------------- | --------------------------------------------------------------------------------------------- |
| tool     | `normalize-file`          | The tool the plugin registers (`Context.tools.register`) - one file per call.                 |
| tool     | `normalize-overpass`      | The human command (registered through the factory's commands seam): arms a one-shot overpass. |
| listener | `tools/post-execute`      | The tool-results overpass arm (registered with `prepend: true`).                              |
| listener | `agent/pre-step`          | The batch overpass arm.                                                                       |
| config   | Schemastery Config schema | The exported `Config` (the minimal shared block + the module's own fields).                   |
| config   | ledger file               | The module's own ledger, SEPARATE from the family's logs (one log per module).                |

## The configuration

| Field                 | Type     | Default                                                                                            | Meaning                                                                                                                                                                        |
| --------------------- | -------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `log`                 | boolean  | `true`                                                                                             | Ledger enabled - write the durable log file (volatile).                                                                                                                        |
| `logFile`             | string   | `~/.dsh/playform/plugin-dsh-normalize-file.log`                                                    | The file-flavor ledger, SEPARATE from the family's logs (volatile; overrides the minimal shared block's empty default).                                                        |
| `replacement`         | string   | `-`                                                                                                | The dash replacement - the transform's ONLY knob (ASCII hyphen-minus by default; volatile: the next tool call picks it up with no remount).                                    |
| `scopes`              | object   | (see leaves)                                                                                       | Granular scope gates, ALL volatile as one object (live toggling, no remount): one leaf change commits one update whose whole object the refresh listener re-reads.             |
| `scopes.conversation` | boolean  | `true`                                                                                             | The conversation/text/block-end gate.                                                                                                                                          |
| `scopes.reasoning`    | boolean  | `true`                                                                                             | The reasoning sub-gate.                                                                                                                                                        |
| `scopes.toolInput`    | boolean  | `false`                                                                                            | The tool-call arguments arm.                                                                                                                                                   |
| `scopes.toolResults`  | boolean  | `false`                                                                                            | The tools/post-execute arm.                                                                                                                                                    |
| `scopes.files`        | boolean  | `true`                                                                                             | The `normalize-file` tool itself - the ONLY arm this tool flavor has; off means the tool returns the unchanged `changed: false` result with no read, no write, no ledger line. |
| `scopes.batch`        | boolean  | `false`                                                                                            | The agent/pre-step arm.                                                                                                                                                        |
| `toolResultsExempt`   | string[] | `["read", "edit", "raw-write", "normalize-file", "ccr_retrieve", "subagent", "ask_user_question"]` | Tool-results exemption list (volatile): a tool result whose exec name is listed passes through by identity.                                                                    |

All fields are volatile (hot edits commit WITHOUT remounting the plugin).

The other five scopes are inert in this flavor but present in the schema so one patch override
drives the whole family.

## The ledger

```text
plugin-dsh-normalize-file: activated (replacement=-, logFile=~/.dsh/playform/plugin-dsh-normalize-file.log)
plugin-dsh-normalize-file: normalized N char(s) in <path>
plugin-dsh-normalize-file: command "normalize-overpass" registration skipped (the mount continues): <cause>
```

Written through the factory's `Append` (the durable file line is `[<ISO>] <message>`).

The activation line is written by `apply()`; the count line follows only a successful N > 0 write -
a no-op writes no line, and a failed read or an aborted call writes none either.

Each N > 0 write also journals one `normalized` record into the shared `package_governance` v2
domain.

## The build and the tests

- Build:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/plugin-dsh-normalize-file run prepublishOnly`
- Smokes: `node Classic/packages/plugin-dsh-normalize-file/Target/Test/<Folder>/Test.js`
    - Config-And-Registration - 18 checks
    - Error-Paths - 10 checks
    - No-Op-Rule - 11 checks
    - Overpass - 29 checks
    - Presenters - 8 checks
    - Read-Write-Pipeline - 24 checks
    - Volatile-Live-Flip - 12 checks

## The plan

[SCHEME.md](./SCHEME.md).
