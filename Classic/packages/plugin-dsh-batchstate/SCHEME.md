# SCHEME - @playform/plugin-dsh-batchstate

The batch-state plugin: the cooperative batch's live state board
(Documentation/Plans/BATCH-STATE-PLUGIN.md sections 2 and 7).

## 1. The identity (four agreeing places)

| Place                             | Value                                       |
| --------------------------------- | ------------------------------------------- |
| Package name                      | `@playform/plugin-dsh-batchstate`           |
| The `name` export                 | `plugin-dsh-batchstate`                     |
| The State build's `module` option | `batchstate`                                |
| The ledger logFile default        | `~/.dsh/playform/plugin-dsh-batchstate.log` |

## 2. The loader contract

- Object form: `name`, `apply`, `Config`, `inject`, the default object carries all four.
- `inject: ["pluginFactory"]` - the factory provides the State builder (cell unwrap + shared
  fields + the P10 volatile refresh) and the ledger.
- `apply` returns NOTHING (a returned value silently kills event delivery); the state is exposed
  through the `ctx.__pluginDshBatchstateState` attachment (the test probe).
- The `batchstate` service is registered from apply (the Service base constructor calls
  `ctx.reflect.provide("batchstate", this)`), with the typed accessor and the typed
  `batch/state-change` event through declaration merging.

## 3. The config schema (every knob volatile)

| Field          | Type    | Default                                     | Meaning                                              |
| -------------- | ------- | ------------------------------------------- | ---------------------------------------------------- |
| `enabled`      | boolean | `false`                                     | The master switch (the IDLE-forever posture).        |
| `log`          | boolean | `true`                                      | Ledger enabled - write the durable log file.         |
| `logFile`      | string  | `~/.dsh/playform/plugin-dsh-batchstate.log` | The ledger file (one log per module).                |
| `batch`        | string  | `default`                                   | The batch key (multi-batch isolation).               |
| `domain`       | string  | `batch_state`                               | The KV domain name (the PRIMARY store).              |
| `stateFile`    | string  | `~/.dsh/batch-state.json`                   | The well-known JSON state file (the FALLBACK store). |
| `maxRecent`    | integer | `8`                                         | The completions ring bound.                          |
| `maxProposals` | integer | `16`                                        | The spliced-proposal ring bound (the inbox memory).  |
| `policy`       | object  | the D6 block (see §3.1)                     | The per-action allowlist (the shared factory block). |

Fail-loud validation runs BEFORE the State build: `stateFile` non-empty, `domain` a lowercase unit
name matching `/^[a-z][a-z0-9_]*$/`, `maxRecent` an integer >= 1, `maxProposals` an integer >= 1,
`batch` non-empty - an invalid config throws at load, never silently defaults.

### 3.1 The policy block (D6)

The config composes the factory's shared block (`policy: Policy()`, volatile as one object) and maps
it to `State.Allow`:

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

The board is a RECORDER/projection: it reads, records and suggests (all automatic) and never writes
files, commits or spawns - those verdicts are declared for uniformity with the family's block and
stay the shipped `approve`. A resolved pack's `policy` section overrides the defaults per action
(the wiring is the next refinement; the type already exists in `@playform/lib-dsh-pack`). The
defaults are smoke-arbitrated in `Source/Test/Policy-Defaults`.

## 4. The service API (`ctx.batchstate`)

Read (the subagents' path - both the service and the spliced block give the LIVE state):

| Method                | Returns                                                                               |
| --------------------- | ------------------------------------------------------------------------------------- |
| `getState()`          | The full snapshot: `{ batch, generatedAt, running, idle, recent, proposals, gates }`. |
| `getContext(agentId)` | The compiled dynamic context block (the table of contents + the scope + the pending). |
| `getScope(agentId)`   | `{ yours, shared, offLimits }` - the file-ownership matrix derived at call time.      |
| `whoElse(agentId)`    | The concurrent lanes' CURRENT activities (the "you are never alone" block).           |
| `getProposals()`      | The spliced proposals (the inbox splice's result), in splice order.                   |
| `getGates()`          | The arbiter gates by name (the Gates block's truth).                                  |
| `getQueue()`          | The queue projection: the queue service's own compiled line, read read-only.          |

Write (the parent/orchestrator side + the agents' phase reports):

| Method                        | Effect                                                                                                                                           |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `setTask(agentId, task)`      | The CURRENT ACTIVITY update (reactivates a terminal member; stamps `startedAt` once).                                                            |
| `setStatus(agentId, status)`  | The transition `idle -> active -> completed/failed/interrupted`; a terminal status drops the queue position and appends to the completions ring. |
| `setScope(agentId, surfaces)` | The scope registry (the surfaces the member owns).                                                                                               |
| `queue(agentId)`              | The idle-queue append (idempotent).                                                                                                              |
| `setGate(name, state, owner)` | The arbiter truth (`green` / `red` / `unknown`; a bad name or state throws at the call site).                                                    |
| `clear()`                     | The whole-batch reset (members, queue, completions, proposals, gates).                                                                           |

## 4a. The inbox splice (the re-spec's target, D5)

The board registers on the harness agent-team inbox and projects every batch block it sees:

| Channel (the harness checkout)                                                                         | What it carries                           |
| ------------------------------------------------------------------------------------------------------ | ----------------------------------------- |
| `session/event` with `type === "agent/inbox/spliced"`                                                  | the durable splice the agent-loop appends |
| (`packages/core/agent/src/types.ts:96`; the commit at `packages/core/agent-loop/src/inbox.ts:227-241`) |                                           |
| `agent/inbox/inserted` (`packages/core/agent/src/runtime-types.ts:288`)                                | the live per-agent notification           |

Both fire for one inserted message, so the listener de-duplicates on the message id (the live emit
and the durable splice are one delivery). The block format is the cross-package contract:

```
[BATCH PROPOSAL - <id>]
<the canonical proposal JSON>
```

```
[BATCH DECISION - <id>]
<the canonical decision JSON>
```

A proposal is spliced when its revision is newer than the held one
(`proposal <id> skipped (revision not newer)` otherwise); a decision moves the proposal's status. A
decision for a proposal the board does not hold is refused, never guessed. The proposal's `origin`
is the DELIVERING session (the return address), not the payload's own origin field.

## 5. The event

`batch/state-change` - `{ batch, id, kind }` with
`kind: "task" | "status" | "scope" | "queue" | "clear" | "proposal" | "decision" | "gate"`. Emitted
AFTER the state is updated and persisted; the consumers are the splice trigger and any agent
listening.

## 6. The stores (primary and fallback)

The plugin owns TWO stores, one recovery. The **PRIMARY** store is the harness's `ctx.storage` KV
domain - probed once at apply (`ctx.storage.domain`, else the provided `ctx.storageDomain`),
declared as
`defineDomain({ name: <config domain>, version: 1, layout: "per-record", invalidRecords: "backup-and-skip", tables: { members, queue, proposals, gates } })`
and closed by the plugin's own effect disposer. The domain declares NO `compatibleVersions`: the
library rejects an entry that is not strictly below the declared version, so `[1]` against version 1
throws at load. Every state change writes the FULL state into the four tables and RECONCILES each
table first (a record the live state no longer holds is deleted, so a `clear` cannot resurrect a
member on the next restart); the writes are serialised on the plugin's own chain, so the
open/recovery always lands before the first write and the smokes await the chain without a sleep.

The **FALLBACK** store is the well-known JSON file (default `~/.dsh/batch-state.json`), holding
`{ members: Member[], queue: string[], proposals: Entry[], gates: Gate[] }`. It is written and read
only when no storage facility is provided or the domain's open fails (the loud
`storage open failed: <reason>` line, then the fallback recovers). Its write is SYNCHRONOUS - the
file-only lane's behaviour, unchanged.

On mount the recovery restores the members, the queue, the spliced proposals and the gates from
whichever store is active (the shared `Function/Restore`); a member that recovered as `active` is
honestly downgraded to `interrupted` (the owning process is gone after a restart). A missing or
corrupt store starts the batch EMPTY - never guessed.

The state file is the plugin's OWN store: plain fs read/write, not a governed file (the same
documented exemption the ledger carries - `ctx.fs` has no append, and re-reading + rewriting the
plugin's own snapshot through a governed write would be both racy and wrong).

## 7. The ledger lines (module-owned, byte-stable)

All lines carry the `batchstate: ` prefix (the factory's Append prefixes with `<State.Module>: `):

```
disabled (enabled=false)
activated (batch=<key>, stateFile=<path>)
recovered (<n> members, queue <n>)
storage open failed: <reason>
task <id>: <task>
status <id>: <status>
scope <id>: <n> surfaces
queued <id> (position <n>)
cleared
proposal <id> spliced (intent <intent>, targets <n>, rev <n>, origin <origin|->)
proposal <id> skipped (revision not newer)
proposal <id> rejected (malformed payload)
proposal rejected (malformed payload)
proposal <id> decided <outcome> (by <user|policy>)
decision <id> ignored (unknown proposal)
decision <id> rejected (malformed payload)
decision rejected (malformed payload)
gate <name>: <state>
gate <name>: <state> (owner <owner>)
```

The `<id>` forms are emitted by the inbox splice (`Function/Inbox`) when a `[BATCH PROPOSAL - <id>]`
/ `[BATCH DECISION - <id>]` marker carries an unparseable JSON body; `<id>` is the marker's trimmed
id (empty only for a whitespace-only marker). The id-less `proposal rejected (malformed payload)`
and `decision rejected (malformed payload)` forms are emitted by `Function/Propose` /
`Function/Decide` when a parsed payload fails their validation.

`storage open failed: <reason>` is the ONE line the storage migration adds (the family's P5 v2
posture: a present facility whose open fails must be diagnosable; the reason is the library's own
error message, e.g. `version-mismatch: stored 2, declared 1`). The `recovered (...)` line is shared
by both stores, so it stays byte-exact.

## 8. The presentation (Context = Compile(State))

Every block the agents receive is a COMPILED OUTPUT of the deterministic compiler
(Function/Compile - pure functions over the state): the TOC, the scope view, the "you are never
alone" block, the Gates block and the queue projection. The LLM's only role is to READ the output.
The blocks are bounded (the compact TOC + the scope + the pending - never the histories). The
presentation is READ-ONLY for the agents - the injected context is clearly delimited, never their
own content.

The compiled block's line order is: header, `RUNNING`, `IDLE`, [`GATES`], [`QUEUE`], `YOUR SCOPE`,
`PENDING`. The two bracketed lines render only when there is a truth to render:

- `GATES: <name> <state>[, <name> <state> (owner <owner>)]` (sorted by name) when the board holds at
  least one gate; the block omits the line otherwise (`getGates()`/`GATES: none` reads the empty
  form directly);
- the queue service's OWN compiled line, verbatim, when `ctx.dshQueue` is mounted (read-only - the
  queue package is never modified); omitted otherwise (`getQueue()` returns `QUEUE: none`).

The conditional rendering is what keeps every pre-splice block byte-identical: with no gates and no
queue service the compiled context is exactly the PoC's.

## 9. The safe-composition notes

- The member upsert (Function/Ensure) copies nothing the caller owns; the scope arrays are copied on
  write (no aliasing).
- The listener path has no awaits and never throws (the silence invariant): a dead consumer, a
  malformed block and a broken queue service are all contained.
- A contained exception logs to the logger and the ledger only.
- The queue projection reads `ctx.dshQueue.Board()` at use time (the optional-service rule) and
  never writes into the queue package.
