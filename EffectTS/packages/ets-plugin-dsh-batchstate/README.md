# @playform/plugin-dsh-batchstate

The batch-state plugin: a DeepSeek Harness plugin that is the cooperative batch's live state board
(Documentation/Plans/BATCH-STATE-PLUGIN.md).

## The role

- **The open-batch state**: the members - id, role, the CURRENT ACTIVITY (the last-updated
  phase/target, NEVER the initial spec), the status
  (`idle -> active -> completed/failed/interrupted`), the queue position, the owned surfaces, the
  started/finished timestamps.
- **The write API** (`setTask`/`setStatus`/`setScope`/`queue`/`clear`): the parent's activations and
  the agents' phase reports flow THROUGH the plugin - the state transitions are events the plugin
  owns.
- **The read API** (the `batchstate` service): `getState()`, `getContext(agentId)`,
  `getScope(agentId)`, `whoElse(agentId)` - both the service and the spliced block give the LIVE
  state.
- **The presentation**: the dynamic table-of-contents block, recompiled on every state change -
  `Context = Compile(State)`. Every block is a COMPILED OUTPUT of a deterministic compiler (pure
  functions); the LLM's only role is to READ it. READ-ONLY for the agents - never their own content.
- **The ledger**: one global log per module (the module-owned, byte-stable lines in SCHEME.md
  section 7).
- **The persistence**: every state change emits `batch/state-change` and persists the snapshot into
  the well-known JSON state file (default `~/.dsh/batch-state.json`) - the plan's file-based
  fallback, the sanctioned path when the inbox splice is not exposed.

## The anatomy

- `Source/Library.ts` - the loader contract (`name`, `apply`, `Config`, `inject`; `apply` returns
  nothing).
- `Source/Function/` - one definition per file: the entry (`Apply`), the service (`Service`), the
  write API (`Task`, `Status`, `Surfaces`, `Queue`, `Clear`), the emission (`Emit`), the recovery
  (`Recover`), the compiler (`Compile`), the member upsert (`Ensure`).
- `Source/Interface/` - the types (`State`, `Config`, `Member`, `Change`, `Snapshot`, `Scope`,
  `Factory`).
- `Source/Variable/Config.ts` - the Schemastery schema (every knob a volatile cell).
- `Configuration/` - the ESBuild configuration.
- `cordis.patch.yml` - the bundle patch row (`enabled: false`).

## The posture

The plugin ships DISABLED (the IDLE-forever posture): it never appears in the profile's bundles and
enables only by an explicit ACTIVATE; a cold mount logs `disabled (enabled=false)`, registers the
service (it reads honestly from the empty state) and wires nothing.

## The build

```
sh Source/prepublishOnly.sh   # the full chain (Build + tsc + tsc-alias)
sh Source/Run.sh              # the dev twin (Build only)
```

The smoke suites are the end-phase (the PoC mode): the fake-context harness and the byte-identical
ledger assertions land with the aggregate runner.
