# @playform/plugin-dsh-batchstate

The batch-state plugin: a DeepSeek Harness plugin that is the cooperative batch's live state board
(Documentation/Plans/BATCH-STATE-PLUGIN.md).

## The role

- **The open-batch state**: the members - id, role, the CURRENT ACTIVITY (the last-updated
  phase/target, NEVER the initial spec), the status
  (`idle -> active -> completed/failed/interrupted`), the queue position, the owned surfaces, the
  started/finished timestamps.
- **The write API** (`setTask`/`setStatus`/`setScope`/`queue`/`setGate`/`clear`): the parent's
  activations and the agents' phase reports flow THROUGH the plugin - the state transitions are
  events the plugin owns.
- **The read API** (the `batchstate` service): `getState()`, `getContext(agentId)`,
  `getScope(agentId)`, `whoElse(agentId)`, `getProposals()`, `getGates()`, `getQueue()` - both the
  service and the spliced block give the LIVE state.
- **The inbox splice** (the re-spec's target, D5): the board registers on the harness agent-team
  inbox - the durable `agent/inbox/spliced` session event and the live `agent/inbox/inserted` emit -
  and projects every batch proposal/decision that arrives through it. A proposal from the pass-on
  reaches the board; a decision from the hook moves its status. The two channels are one delivery,
  de-duplicated on the message id.
- **The Gates block**: the compiled arbiter truth (the build/smokes state and the lane that owns the
  failure), reported by the parent through `setGate` and rendered to every lane.
- **The queue projection**: the queue service's own compiled line, read read-only from
  `ctx.dshQueue` - one source of truth, no drift, and the queue package is never modified.
- **The presentation**: the dynamic table-of-contents block, recompiled on every state change -
  `Context = Compile(State)`. Every block is a COMPILED OUTPUT of a deterministic compiler (pure
  functions); the LLM's only role is to READ it. READ-ONLY for the agents - never their own content.
- **The ledger**: one global log per module (the module-owned, byte-stable lines in SCHEME.md
  section 7).
- **The persistence (the store split)**: every state change emits `batch/state-change` and persists
  the full state. The **PRIMARY** store is the harness's `ctx.storage` KV domain (config `domain`,
  default `batch_state`, version 1, per-record: the `members`, `queue`, `proposals` and `gates`
  tables); the **FALLBACK** is the well-known JSON state file (config `stateFile`, default
  `~/.dsh/batch-state.json`), written and read only when no storage facility is provided (or the
  domain's open fails). Both feed the same recovery, so the board survives a restart on either
  store.

## The anatomy

- `Source/Library.ts` - the loader contract (`name`, `apply`, `Config`, `inject`; `apply` returns
  nothing).
- `Source/Function/` - one definition per file: the entry (`Apply`), the service (`Service`), the
  write API (`Task`, `Status`, `Surfaces`, `Queue`, `Gate`, `Clear`), the emission (`Emit`), the
  stores (`Storage` - the KV primary open/recovery, `Persist` - the primary/fallback write split,
  `Recover` - the JSON fallback read, `Restore` - the shared recovery), the compiler (`Compile`),
  the member upsert (`Ensure`), the inbox splice (`Inbox`, `Envelope`, `Propose`, `Decide`) and the
  queue projection (`Projection`).
- `Source/Interface/` - the types (`State`, `Config`, `Member`, `Change`, `Snapshot`, `Scope`,
  `Factory`, `Proposal`, `Decision`, `Gate`, `Entry`, `File`, `Handle`).
- `Source/Variable/Config.ts` - the Schemastery schema (every knob a volatile cell).
- `Configuration/` - the ESBuild configuration.
- `cordis.patch.yml` - the bundle patch row (`enabled: false`).

## The inbox contract (the cross-package wire)

```
[BATCH PROPOSAL - <id>]
<the canonical proposal JSON>
```

```
[BATCH DECISION - <id>]
<the canonical decision JSON>
```

The markers are a cross-package contract (each package declares its own copy - the self-contained
rule). The board parses the FIRST block out of any inbox text; ordinary messages are silence.

## The posture

The plugin ships DISABLED (the IDLE-forever posture): it never appears in the profile's bundles and
enables only by an explicit ACTIVATE; a cold mount logs `disabled (enabled=false)`, registers the
service (it reads honestly from the empty state) and wires nothing.

## The policy block (D6)

The config carries the shared per-action allowlist (`policy: Policy()`, composed from the factory's
block), mapped to `State.Allow`:

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

The board records and projects - `read`, `record` and `suggest` are automatic; the write/commit/
spawn verdicts are declared for uniformity and stay the shipped `approve` (the board never writes
files, commits or spawns). The block is one volatile object (a policy flip is hot-editable), and a
resolved pack's `policy` section overrides the defaults per action (the wiring is the next
refinement). The defaults are smoke-arbitrated in `Source/Test/Policy-Defaults`.

## The build

```
sh Source/prepublishOnly.sh   # the full chain (Build + tsc + tsc-alias)
sh Source/Run.sh              # the dev twin (Build only)
```

## The smokes

| Folder                | What it proves                                                                                           | Count |
| --------------------- | -------------------------------------------------------------------------------------------------------- | ----- |
| `State-And-Compile`   | the write API, the events, the ring cap, the compiled blocks                                             | 14    |
| `Wiring-And-Recovery` | the loader contract, the cold mount, the recovery, the fs purity                                         | 13    |
| `Inbox-Splice`        | the inbox splice, the Gates block, the queue projection, the restart                                     | 22    |
| `Storage-Domain`      | the KV domain (primary), the per-mutation round-trip, the reopen, the JSON fallback, the version failure | 15    |
| `Policy-Defaults`     | the D6 block's defaults and the recorder posture                                                         | 4     |
