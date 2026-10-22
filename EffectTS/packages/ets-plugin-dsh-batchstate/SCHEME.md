# SCHEME - @playform/plugin-dsh-batchstate

The batch-state plugin: the cooperative batch's live state board
(Documentation/Plans/BATCH-STATE-PLUGIN.md sections 2 and 7).

## 1. The identity (four agreeing places)

| Place | Value |
| ----- | ----- |
| Package name | `@playform/plugin-dsh-batchstate` |
| The `name` export | `plugin-dsh-batchstate` |
| The State build's `module` option | `batchstate` |
| The ledger logFile default | `~/.dsh/plugin-dsh-batchstate.log` |

## 2. The loader contract

- Object form: `name`, `apply`, `Config`, `inject`, the default object
  carries all four.
- `inject: ["pluginFactory"]` - the factory provides the State builder
  (cell unwrap + shared fields + the P10 volatile refresh) and the ledger.
- `apply` returns NOTHING (a returned value silently kills event delivery);
  the state is exposed through the `ctx.__pluginDshBatchstateState`
  attachment (the test probe).
- The `batchstate` service is registered from apply (the Service base
  constructor calls `ctx.reflect.provide("batchstate", this)`), with the
  typed accessor and the typed `batch/state-change` event through
  declaration merging.

## 3. The config schema (every knob volatile)

| Field | Type | Default | Meaning |
| ----- | ---- | ------- | ------- |
| `enabled` | boolean | `false` | The master switch (the IDLE-forever posture). |
| `log` | boolean | `false` | Ledger enabled - write the durable log file. |
| `logFile` | string | `~/.dsh/plugin-dsh-batchstate.log` | The ledger file (one log per module). |
| `batch` | string | `default` | The batch key (multi-batch isolation). |
| `stateFile` | string | `~/.dsh/batch-state.json` | The well-known JSON state file (the file-based fallback). |
| `maxRecent` | integer | `8` | The completions ring bound. |

Fail-loud validation runs BEFORE the State build: `stateFile` non-empty,
`maxRecent` an integer >= 1, `batch` non-empty - an invalid config throws
at load, never silently defaults.

## 4. The service API (`ctx.batchstate`)

Read (the subagents' path - both the service and the spliced block give
the LIVE state):

| Method | Returns |
| ------ | ------- |
| `getState()` | The full snapshot: `{ batch, generatedAt, running, idle, recent }`. |
| `getContext(agentId)` | The compiled dynamic context block (the table of contents + the scope + the pending). |
| `getScope(agentId)` | `{ yours, shared, offLimits }` - the file-ownership matrix derived at call time. |
| `whoElse(agentId)` | The concurrent lanes' CURRENT activities (the "you are never alone" block). |

Write (the parent/orchestrator side + the agents' phase reports):

| Method | Effect |
| ------ | ------ |
| `setTask(agentId, task)` | The CURRENT ACTIVITY update (reactivates a terminal member; stamps `startedAt` once). |
| `setStatus(agentId, status)` | The transition `idle -> active -> completed/failed/interrupted`; a terminal status drops the queue position and appends to the completions ring. |
| `setScope(agentId, surfaces)` | The scope registry (the surfaces the member owns). |
| `queue(agentId)` | The idle-queue append (idempotent). |
| `clear()` | The whole-batch reset. |

## 5. The event

`batch/state-change` - `{ batch, id, kind }` with
`kind: "task" | "status" | "scope" | "queue" | "clear"`. Emitted AFTER the
state is updated and persisted; the consumers are the splice trigger and
any agent listening.

## 6. The state file

The well-known JSON file (default `~/.dsh/batch-state.json`) holds
`{ members: Member[], queue: string[] }`. Every write persists the full
snapshot. On mount the recovery restores the members and the queue; a
member that recovered as `active` is honestly downgraded to
`interrupted` (the owning process is gone after a restart). A missing or
corrupt file starts the batch EMPTY - never guessed.

The state file is the plugin's OWN store: plain fs read/write, not a
governed file (the same documented exemption the ledger carries - `ctx.fs`
has no append, and re-reading + rewriting the plugin's own snapshot
through a governed write would be both racy and wrong).

## 7. The ledger lines (module-owned, byte-stable)

All lines carry the `batchstate: ` prefix (the factory's Append prefixes
with `<State.Module>: `):

```
disabled (enabled=false)
activated (batch=<key>, stateFile=<path>)
recovered (<n> members, queue <n>)
task <id>: <task>
status <id>: <status>
scope <id>: <n> surfaces
queued <id> (position <n>)
cleared
```

## 8. The presentation (Context = Compile(State))

Every block the agents receive is a COMPILED OUTPUT of the deterministic
compiler (Function/Compile - pure functions over the state): the TOC, the
scope view, the "you are never alone" block. The LLM's only role is to
READ the output. The blocks are bounded (the compact TOC + the scope +
the pending - never the histories). The presentation is READ-ONLY for the
agents - the injected context is clearly delimited, never their own
content.

## 9. The safe-composition notes

- The member upsert (Function/Ensure) copies nothing the caller owns; the
  scope arrays are copied on write (no aliasing).
- The listener path has no awaits and never throws (the silence invariant).
- A contained exception logs to the logger and the ledger only.
