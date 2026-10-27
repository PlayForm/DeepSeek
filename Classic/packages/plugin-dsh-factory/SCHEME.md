# Plugin-Factory - Service Scheme (v0.1.0, TypeScript, class/service plugin)

Status: **IMPLEMENTED and VERIFIED** (`tsc --noEmit` zero errors; minified build; the per-test
folder suite - 45 checks across 7 folders, a fake ctx + a REAL instance - ALL PASS).

The bundle ships this document as `SCHEME.md` next to the usage README, and it IS the contract that
the trio refactor consumes.

## 0. The loader contract - the first class/service plugin in the family

```ts
export default class PluginFactory extends Service {
	static inject = ["fs"];
	constructor(Context: Context) {
		super(Context, "pluginFactory");
	}
	/* …19 methods, each a thin delegate to one Function module… */
}
```

As docs/user/develop/framework/service.md states, the constructor registers the service at once
through `ctx.reflect.provide("pluginFactory", this)`, and the owning fiber removes it on unload.

The class declares `static inject = ["fs"]` because the primitives call `ctx.fs` for the
governed-file read and for the version-guarded write.

The default object contract does not apply here, because the class form is the Constructor plugin
form; the plugin has no `Config` schema and no config row beyond `config: {}` in the patch.

A consumer either lists `inject: ["pluginFactory"]` for the required service or probes the service
with `ctx.get("pluginFactory")`.

## 0.1 The trace bus (`ctx.trace`) - the second provided service

The constructor also builds ONE trace bus and provides it as `ctx.trace`, which follows D5 of the
completion spec: the indexer comes from the event bus, so no separate process and no separate
indexer plugin exist.

The vocabulary - the envelope, the event names, the coalescing key, the guards, and the detached
loop - lives in `@playform/lib-dsh-trace`; the SERVICE lives here because the factory owns the
shared machinery of the family.

```ts
export default class PluginFactory extends Service {
	static inject = ["fs"];
	constructor(Context: Context) {
		super(Context, "pluginFactory");
		this.Trace = CreateTrace(); // Function/Trace
		Context.provide?.("trace", this.Trace);
		Context.effect?.(() => () => this.Trace.dispose(), "trace");
	}
	Trace: Trace; // Interface/Trace
}
```

Both registrations are contained, because a bare fixture context may not implement provide or effect
and a second factory instance may find the name already provided; neither case may break the
factory.

| Member         | Contract                                                                                                                                                                                                                                                                                                         |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `emit(draft)`  | complete the envelope (`Complete`: `trace-<n>` and `at` when the emitter supplied none), push it into the ring, dispatch it to the listeners of its kind. Every listener is contained; the whole emit is contained: it NEVER throws into a caller. A malformed draft (no kind, a non-object payload) is ignored. |
| `on(name, fn)` | subscribe; the returned disposer is idempotent. After `dispose`, a subscription returns a no-op disposer.                                                                                                                                                                                                        |
| `flush()`      | the deterministic settle seam: the bus dispatches synchronously, so it resolves at once (no timer, no queue - the coalescing belongs to the adapters' loops).                                                                                                                                                    |
| `ring(limit?)` | the bounded recent envelopes, NEWEST first; the bound is the library's fixed `Bound` = 256 (no config knob).                                                                                                                                                                                                     |
| `dispose()`    | the unload path: drop every listener, stop dispatch; a late emit/subscription is a contained no-op.                                                                                                                                                                                                              |

This service adds NO method to the nineteen-method `pluginFactory` surface and NO config field.

The typed accessor is declaration-merged onto the cordis Context as `ctx.trace`, and the entry
re-exports the `Trace` type.

The `Trace-Service` smoke folder of the factory holds 9 checks that pin the registration, the
round-trip, the ring, the disposer, the fail-open containment, and the unload path.

## 1. The shared state (Interface/State)

Every method takes the state of the model, which is the shape that Function/State builds plus the
fields of the model itself; a model declares
`interface State extends FactoryState { Section: string[]; ... }`, and its instances stay assignable
to the factory shape.

Fields:

| Field                          | Meaning                                                                                                                                                                                          |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Context`                      | the loading context (fs, logger, emit, get, effect, on)                                                                                                                                          |
| `Module`                       | the model identity - **doubles as the logger/ledger prefix** ("hook-dsh-package-governor", "hook-dsh-package-pinner", "hook-dsh-cargo-governor" keep every factory-composed line byte-identical) |
| `Tool`                         | mutation-tool names (fixed mapping ← `mutationTools`)                                                                                                                                            |
| `Policy`                       | config `policyFile` (fixed mapping; "" = discovery)                                                                                                                                              |
| `PolicyName`                   | the policy sidecar filename for union discovery ("pin-policy.json" / "update-policy.json"; "" disables sidecar lookup)                                                                           |
| `Ledger` / `Enabled` / `List`  | fixed mappings ← `logFile` / `log` / `exclude`                                                                                                                                                   |
| `Stash`                        | `Map<FsTargetKey, FsVersion>` - the idempotence gate                                                                                                                                             |
| `Inflight`                     | `Map<string, { controller: AbortController }>` - P2 disposal                                                                                                                                     |
| `Seams`                        | probe-once cache (Function/Seam)                                                                                                                                                                 |
| `Subprocess`                   | P9: probed ONCE at build via the "subprocess" seam                                                                                                                                               |
| `Queue` / `Journal` / `Domain` | the P5 storage sink, pre-open queue (capped 256), open handle                                                                                                                                    |
| `JournalDomain`                | the P5 domain name (the `journalDomain` setup option; the `package_governance` default lives in Function/Open)                                                                                   |

The code stores and compares the opaque identity types `FsTargetKey` and `FsVersion`, and it never
parses or computes them (subsystems/filesystem.md).

## 2. The 19 callable methods (18 sections; Write + GuardedWrite share §2.7), exact signatures

> Version 0.2 added the **direct-govern registry and entry**, `RegisterGovern` and `Govern`
> (§2.17-§2.18), and the per-call `govern` path of the raw-write tool.
>
> The callable count is now 19, because Write and GuardedWrite share §2.7 and the GovernSteps
> registry instance field is state, not a method.
>
> The `UpdateKey` helper of §2.16 is the v0.1.1 P2 helper, and it lives factory-side after the cargo
> collision.
>
> §2.19 documents the two **module-level** helpers that sit BESIDE the surface: `Policy()`, the
> shared policy-block builder from D6, and `Decide(policy, action)`, the verdict lookup. The entry
> exports both by name, so they are not service methods and the callable count above stays 19.

### 2.1 `Append(state, message): void`

This method writes the ledger.

It calls `logger.info("<Module>: <message>")` as best effort, then
`appendFileSync(state.Ledger, "[<ISO>] <message>\n")` when `state.Enabled` is true, also as best
effort.

**Never throws.**

The message strings belong to the MODEL.

### 2.2 `Match(path, list): boolean`

It returns true when any path segment, split on `sep`, is in `list`.

An empty or absent list gives false.

### 2.3 `Discover(dir): string | null`

It finds the nearest `registry.json` while it walks UP from `dir`, stops at `node_modules`
boundaries and at the filesystem root, and gives null when none exists.

### 2.4 `Parse(path): unknown`

It runs `JSON.parse(readFileSync(path, "utf8"))` and gives null on ANY failure.

### 2.5 `ResolvePolicy(state, dir, found, chain, opts?): string[]`

```ts
opts?: { policyFileField?: string; policyFileName?: string }
// defaults: policyFileField = "Policy", policyFileName = state.PolicyName
```

The method builds the UNION keep-list from the global policy in `state[policyFileField]` when that
file exists, then `<dir>/<policyFileName>`, then the file co-located with `found` in its parent dir,
and it **always appends the P3 chain keys (`chain`)**.

It removes duplicates and keeps that order.

It logs an existing but unparsable sidecar as
`unreadable <policyFileName> at <path> - using built-in default` and takes nothing from it, while a
configured but absent sidecar is silently not a source.

### 2.6 `Gate(state, target, observation, actor, {basename, mutationToolsField?}): Decision`

```ts
Decision = { pass: boolean; reason?: "target" | "govern" | "actor" | "kind" |
  "idempotent" | "basename" | "excluded"; path?: string }
```

The method applies the g1 gate set in the exact order of the trio: the string `displayPath`, then
the `govern` marker of the WRAPPED raw-write actor, whose presence routes the governance of the
write to the DIRECT path only so the event path skips it silently, then the actor tool name in
`state[mutationToolsField ?? "Tool"]`, then `kind === "present"`, then Stash idempotence through
`state.Stash.get(targetKey) === observation.version`, then the basename, and finally
exclusion-first.

**The gate reads the Stash and never writes it, and it logs nothing.**

The caller composes its own lines, at least the `excluded` one, and it seeds the Stash after g2 and
before it detaches.

### 2.7 `Write(state, target, content, over?): Promise<FsWriteOutcome>` - the shared executor / `GuardedWrite(state, target, content, version, signal?)` - the guarded alias

`Write` is the ONE shared write executor (Function/Write) for every write on the family side, which
covers the raw-write tool, the chain pass, and the update stages; resolution stays CALLER-side
because cwd semantics differ for good reason, so the target arrives pre-resolved.

The `over` bundle adds:

```ts
over?: {
  intent?: FsWriteIntent | { waterfall: true };   // default { waterfall: true }:
      // the fs/write-intent waterfall with next() => undefined; an EXPLICIT
      // FsWriteIntent skips the waterfall (the guarded path's inline intent)
  signal?: AbortSignal | undefined;               // forwarded to writeText end to end
  policy?: "standing" | "p4" | SandboxExecutionPolicy;  // default "standing"
  actor?: object | undefined;                     // the fs/write-intent + fs/observed actor
  observe?: boolean;                              // default true: the fs/observed emit
  stash?: boolean;                                // default false: Stash pre-registration
  transform?: (content: string) => string;        // the caller's content step
}
```

- `"standing"` (default) is the EXACT no-escalation replica of the `FsSandboxController` of the
  built-in write: a bare backend (`ctx.fs.sandboxMode === undefined`) passes NO policy, and a
  confining backend requires the `sandboxPolicy` service and stamps the session-resolved policy,
  which it resolves with `{ session }` from `over.actor.agent` when present and with `{}` otherwise.
- The missing-policy error is thrown byte-identically to raw-write's own:
  `"raw-write: the mounted filesystem confines but ctx.sandboxPolicy is missing"` (the raw-write
  tool is the only caller of the standing path).
- `"p4"` is the SANDBOX-MODE-DECIDED FENCE: when `ctx.fs.sandboxMode === undefined` it passes NO
  policy and the service keeps its own default; otherwise it passes
  `{ mode: "workspace-write", workspaceRoot: dirname(target.displayPath) }`.
- `observe: true` (default) emits `fs/observed { kind: "present", version }` after success, on the
  ROOT context through `ctx.root.emit`, which is the posture of the built-in write: cordis scoping
  lets a listener hear the root and its own scope but never a sibling plugin scope, so a
  plugin-scope emit from the ctx of the tool would not reach the governance hooks.
- `observe: false` skips that emit, because the guarded path delegates the re-emit to Refresh §2.8
  instead.
- `stash: true` pre-registers the fresh version of the outcome in `state.Stash` BEFORE the
  emit/return, so a re-entrant listener call hits the idempotence gate.
- `transform` is the content step of the caller, applied before the write (the six-fold Rewrite
  chain of raw-write).

**The guarded alias** `GuardedWrite(state, target, content, version, signal?)` =
`Write(state, target, content, { intent: { kind: "replaceIfVersion", version }, signal, policy: "p4", stash: true, observe: false })`

- `ctx.fs.writeText` with the version-guarded intent and the P4 fence; on success, pre-registers the
  outcome's fresh version in `state.Stash` (before any re-emit).

It logs nothing, and the caller composes its own ledger line from the outcome.

The built-in `write` tool stays OUT of scope because the harness owns dsh-tool-fs, and this executor
mirrors its mechanics.

### 2.8 `Refresh(state, target, actor, version): void`

This is the P₃/U₂ refresh: it runs `state.Stash.set(targetKey, version)` and
`ctx.emit( "fs/observed", target, { kind: "present", version }, actor)`, so the same actor gives the
same owner bucket.

It is best-effort and swallows everything.

For the stat-based variant that the update engines use, stat first and pass the version of that
stat.

### 2.9 `Continue(state, target, actor, dir, found, version, transform): Promise<void>`

This method runs the detached contained continuation.

Lifecycle:

1. **Register the controller.**

    It sets `state.Inflight.set(String(targetKey), { controller })` (P2).

2. **Read the target.**

    It runs `text = await ctx.fs.readText(target, signal)`, and a catch gives `null`.

3. **Resolve the keep-list.**

    It takes the chain keys from `Object.keys(Parse(found)?.effectiveLatest ?? {})` and sets
    `keep = ResolvePolicy(state, dir, found, chain)`.

4. **Transform the content.**

    It runs `outcome = transform(text, state["Section"], keep)`, which is the pure function of the
    model (Interface/Transform); `null` or `count === 0` gives the designed NO-OP, silently, because
    the model logged its own lines inside the transform.

5. **Serialize and write.**

    It serializes with `typeof next === "string" ? next : JSON.stringify(next, null, 2) + "\n"`,
    then calls `GuardedWrite(state, target, next, current, signal)` against the FRESH stat of the
    target from the U₂ read-only probe `ctx.fs.stat(target)` right before the write, not the
    observed `version` of the triggering event, which is only the stat-failure fallback, because the
    direct-govern sequential fold of §2.18 hands the same observed version to every registered step
    and a later step's chain write against that stale version fails FS_STALE_VERSION once an earlier
    step has advanced the file, which silently aborted the fold mid-way, while a write against the
    current version makes the fold converge in ANY step order since each step reads the file,
    transforms it, stats it, and writes against the version it just observed.

6. **Append the message.**

    It logs the `message` of the model through `Append`, either the string verbatim or the result of
    `message({ version: outcome.version })`.

7. **Refresh the observation.**

    It calls `Refresh(state, target, actor, written.version)`.

8. **Settle the entry.**

    In a `finally` block it runs `state.Inflight.delete(String(targetKey))`, and any throw goes to
    `logger.error("<Module>: continuation error (suppressed): <cause>")`, which is logger-only and
    never the ledger and never a rethrow.

### 2.10 `State(ctx, config, setup): State & Extra`

```ts
setup: { model: string; fields?: Record<string, string>;
         policyFileName?: string }
```

It unwraps the defensive cells (the volatile Schemastery cells `{ get }`), builds the fixed shared
mappings (Tool←mutationTools, Policy←policyFile, Ledger←logFile, Enabled←log, List←exclude), maps
StateKey→configKey through `fields` for the fields of the model, and makes a fresh
`Stash`/`Inflight`/`Seams`/`Queue`/`Journal` plus the P9 subprocess probe through Seam.

The helper is generic, and `Extra` names the field type of the model.

It is never returned from `apply`, because the loader treats return values specially, so expose it
through a context attachment.

### 2.11 `Wire(ctx, state, observe): void`

It runs `ctx.on("fs/observed", (target, observation, actor) => observe(target, observation, actor))`
on the fiber, so unload removes the listener.

It accepts `state` for signature stability.

The `observe` function of the model runs Gate, its lines, g2 discovery, the Stash seed, and the
Continue handoff.

The hook is fs/observed ONLY.

The activation proof is the `Append` + `Journal` call of the model itself.

### 2.12 `Attach(ctx, { state, name }): void`

It makes three `ctx.effect` registrations with the labels `<name>-jobs`, `<name>-inflight`, and
`<name>-storage`:

- **P1**: it probes `ctx.get("jobs")` and calls `attachController(name)`, because root-context
  registrations serve every owner, and the disposer detaches.
- **P2**: the disposer aborts every `state.Inflight` controller and clears the map.
- **P5**: it probes `ctx.get("storageDomain")`, and a present service gets `void Open(...)` for the
  v2 `events` domain of the `journalDomain` option in the State, which is the `package_governance`
  default so a module that does not set the option keeps its behavior; a module may pass its own
  distinct name, lowercase letters, digits, and underscores per the storage unit-name rule, to keep
  its open out of the single-open contention of the shared domain, with the zod enum
  `[activated, governed, dispatched, update-failed, excluded, normalized]`, string path/detail, and
  number at, `layout: "per-record"` plus `compatibleVersions: [1]` because the single-layout unit
  parser enforces exact version equality so the legacy bootstrap of the per-record backend migrates
  the pre-existing v1-stamped file instead of hard-failing `version-mismatch`, and
  `invalidRecords: "backup-and-skip"` so one corrupt stored record cannot brick the open, with the
  dynamic imports off the module-load path, the pre-open queue drained, and the disposer closing the
  domain; a failed open emits ONE best-effort ledger line, `storage journal open failed: <message>`,
  through the module ledger, which is logger plus durable file, and it is never rethrown; an absent
  or unusable service gets a silent skip and the sink retires to a no-op.
- The `normalized` event, added in v2, where a new event name requires a domain version bump,
  carries the count records of the non-manifest stream family: the six normalize flavors with an
  empty `path`.

### 2.13 `Journal(state, event, path, detail, at?): void`

The P5 writer calls `state.Journal(...)` inside a try/catch, so a storage failure can never reach
any caller path.

The consumers are the lifecycle events of the manifest modules and the count records of the
non-manifest stream family, with the event `normalized`, an empty `path`, and a detail identical to
the ledger count line.

### 2.14 `Schema(shared?, model?): Schema`

```ts
shared?: { log?: boolean; logFile?: string; updateCooldownMs?: number;
           mutationTools?: string[]; exclude?: string[]; policyFile?: string }
model?: Record<string, unknown>  // appended verbatim after the shared block
```

It produces
`Schema.object({ log: boolean.volatile (default true), logFile: string.volatile, updateCooldownMs: number.volatile (3000), mutationTools: string[].volatile (["write","edit","str_replace_editor"]), policyFile: string (""), exclude: string[] (the shared Default list), ...model })`.

The model exports the result as its `Config`.

### 2.15 `Seam(state, name): unknown`

The helper probes once and caches the answer on `state.Seams`, including a cached `undefined`,
through `ctx.get(name)` inside a try/catch.

It NEVER uses the direct accessor, because `ctx.<name>` throws on service accessors without inject.

### 2.16 `UpdateKey(target): string` - the namespaced Inflight key

The helper returns `update:${String(target.targetKey)}`, the P2 UPDATE-STAGE controller key from
v0.1.1, factory-side since the cargo collision.

The chain pass of §2.9 registers its own controller under the PLAIN `String(targetKey)`, and the two
passes share the one `Inflight` map, whose disposal in Attach aborts every entry on unload, so a
collision would let the settlement of the chain pass silently drop the controller of the running
update while its engine is still in flight.

That is the cargo collision lesson: the cargo fixed it flavor-side with `update:` before the factory
existed, and now the helper is factory-side and both governors adopt it.

### 2.17 `RegisterGovern(basename, name, run): void` - the direct-govern registry

This method owns the instance-level step registry, which follows the SharedJournal pattern:

```ts
GovernSteps: { [basename: string]: { name: string;
  run: (target: FsTarget, actor: object | undefined, version: FsVersion) =>
    Promise<void> | void }[] }
```

The governance modules register their steps at apply time with calls such as
`RegisterGovern("package.json", "canonicalize", run)`, and each `run` closure captures its OWN State
from the apply of that module, so the chain pass, the update stage, and every ledger string stay the
MODULE'S own and byte-identical, because the factory never owns ledger strings.

One basename maps to one ordered list, and re-registering the same name replaces the step in place
with its registered position preserved, so an HMR reload rebinds the closure without duplicating it,
while a new name appends.

The registry is empty until the first module registers, and with no registrations a `govern` call is
a contained no-op.

Since the sequential fold of v0.2.1 a run MAY return a promise, and §2.18 awaits it, so the chain of
the step completes before the next step starts.

### 2.18 `Govern(target, selection, actor, version): Promise<void>` - the SEQUENTIAL FOLD

This method is the direct-govern entry and the post-write call of the raw-write tool:
`await State.Factory.Govern(target, args.govern, exec, outcome.version)` after a successful write.

It resolves `GovernSteps[basename(target.displayPath)]`, filters by the selection, and runs each
step in REGISTERED order with `run(target, actor, version)`, AWAITED one at a time in the sequential
fold of v0.2.1, so each step's chain completes, with its guarded write and its ledger line, BEFORE
the next step reads the file.

Selection semantics:

| selection                                  | behavior                                                                    |
| ------------------------------------------ | --------------------------------------------------------------------------- |
| `true` / `"all"`                           | every registered step for the basename                                      |
| `["canonicalize", ...]` (or a single name) | ONLY the named steps; unknown names match nothing (ignored by construction) |
| `false` / `null` / absent                  | no governance at all (the escape hatch; the tool omits the call)            |

The method is contained with one try/catch per step, so it never throws and never affects the
caller, which is the silence invariant of the family, and a step's own async continuations are
contained by the step.

The `await` of the fold is what makes a multi-step selection DETERMINISTIC.

The pre-fold version fired each chain detached and concurrently, the chains raced on the
version-guarded `replaceIfVersion` write, the first write won and the later ones failed
`FS_STALE_VERSION`, and the final state of the file plus the ledger lines were nondeterministic.

Awaiting each chain eliminates the WRITE-WRITE races by construction, and the fresh-stat write basis
of §2.9 eliminates the version-guard abort that the awaiting alone could not.

The fold hands every step the SAME observed version, so even a perfectly serialized fold lost every
step after the first, because their chain writes guarded against a version that the write of the
first step had already superseded, which a live run confirmed: a `govern: true` run over
canonicalize + pin produced only the line of the pinner, and the write of canonicalize lost the
version race.

With each step's chain writing against a fresh stat of the file as the previous step left it, any
step order converges to the same final state.

The awaited promise of the update step is fast.

Its `Follow`/`Dispatch` handoff resolves when the STAGE IS DISPATCHED and the background job keeps
running, so the result of the tool returns after the fold and not after an ncu or cargo run, and the
ledger still shows the progress of the job as before.

The method is best-effort by design: the handlers mirror the Observe path with g2 discovery, the
Stash seed BEFORE their writes, and the awaited `Continue`/`Follow`/`Dispatch` handoffs, but no
outcome ever flows back into the write that triggered them.

The raw-write tool passes its exec WRAPPED as `{ ...exec, govern: <selection> }`, which is the
marker, so every handler receives the same actor with `name`/`agent` intact, and the marker keeps
the write's own `fs/observed` emit from re-entering the event-path governance, because this direct
path is the ONLY governance channel of raw-write.

### 2.19 `Policy()` and `Decide(policy, action)` - the policy block (D6), MODULE-LEVEL exports

Neither helper is a service method, so the class surface stays at the documented nineteen.

Both are named exports of the entry for the same reason that the standalone `Schema` export exists:
the loader needs the composed `Config` at MODULE-EVALUATION time, before any context and therefore
any service instance exists.

```ts
Policy(): Schema.object({ read, index, record, suggest, write, commit, spawn, message })
Decide(policy: Allowlist, action: keyof Allowlist): "auto" | "approve"
```

The block carries ONE key per action class, each `Schema.union(["auto", "approve"])` with the D6
default, and the whole block is `.volatile()`, so one hot-editable object re-reads wholesale into
the mapped State field of the consumer on a flip:

| action    | default   | meaning                                                 |
| --------- | --------- | ------------------------------------------------------- |
| `read`    | `auto`    | read-only inspection of the workspace                   |
| `index`   | `auto`    | building or refreshing the index                        |
| `record`  | `auto`    | recording a decision, an outcome or a journal entry     |
| `suggest` | `auto`    | emitting a suggestion or a note                         |
| `write`   | `approve` | writing a file                                          |
| `commit`  | `approve` | committing a batch of writes                            |
| `spawn`   | `approve` | spawning an agent or starting a job                     |
| `message` | `auto`    | sending a message to another agent (inside the session) |

A consumer composes the block into its own schema and maps it to its own State field:

```ts
// Variable/Config.ts
export default Compose(false, { …, policy: Policy() });

// Function/Apply.ts
const State = Factory.State<State>(Context, Options, {
  module: "…",
  fields: { Allow: "policy", /* … */ },
});
```

The `Policy` field of the shared State stays the configured global policy FILE (Interface/State),
and the verdicts of the block live on the mapped field of the consumer, which the family convention
names `Allow`.

`Decide` answers the verdict for one action, and the action names ARE the keys of the block.

A missing key from a partial or hand-built block falls back to the D6 default of that action from
`Variable/Policy`, and the helper treats a malformed value as missing, so a bad config can only be
MORE conservative for write, commit, and spawn and can never silently widen an automatic action.

The helper never throws.

THE PACK SECTION (D2/D3/D6): the `policy` section of a pack, which is the `Policy` type of
`@playform/lib-dsh-pack` with the same action → verdict mapping, OVERRIDES these defaults per action
when a pack is resolved.

The wiring from pack to policy defaulting is the next refinement, and the type and the section
already exist, so the block of a resolved pack is a straight overlay on the table of
`Variable/Policy`: per action the value of the pack wins, and an absent action keeps the D6 default.

The consumers in the orchestration family each compose the block, map it to `State.Allow`, and
consult `Decide` before their gated action: `plugin-dsh-queue` before a spawn,
`hook-dsh-batch-decision` before an auto-approval, and `plugin-dsh-batch-edit` before an apply.

The existing module knobs `autoSpawn` and `autoApprove` stay the INNER gate, because the policy is
the OUTER one, so `approve` beats an enabled knob while a disabled knob still refuses on its own.

## 3. The model contract (what a refactor consumes)

A model supplies:

1. **Config.**

    It calls `Factory.Schema({ logFile: ... }, { ...modelFields })`, and a module that can take a
    gated action such as a write, a batch commit, a spawn, or a message also composes the shared
    policy block with `Factory.Schema({ ... }, { ..., policy: Policy() })`, as §2.19 describes.

2. **State.**

    It calls `Factory.State(ctx, config, { model, fields, policyFileName })` and passes the model
    fields through `fields`, for example `{ Section: "sections" }` or the governor's
    `{ Strict: "strict", Wait: "updateCooldownMs", Limit: "maxUpdateFailures", Binary: "ncuBin", Mode: "updateMode" }`.

3. **A transform.**

    It provides
    `(current: string | null, section: unknown, keep: string[]) => { next, count, message? } | null`,
    which decodes, applies the model logic, logs its own no-op and refusal lines, and returns null
    for every no-op path; on a change it returns the next content plus the count and, optionally,
    the success line as a string or as a function of `{ version }`.

4. **An observe function.**

    It runs Gate, then its own lines, then Discover/Parse, then the Stash seed, then
    `Factory.Continue(...)`.

5. **apply.**

    It runs State, then Attach, then its own activation proof with Append + Journal, then Wire.

6. **An update engine (optional).**

    It uses jobs through the P1 controller, spawns through `state.Subprocess`/`Seam`, writes through
    `GuardedWrite` + `Refresh`, records through `Journal`, and keeps the cooldown and breaker state
    as model fields.

The factory deliberately does not centralize the transforms, the update engines, which include the
first-wins update-policy path pick of the governor because that pick is engine input and not
keep-list discovery, or the ledger strings.

## 4. Exemptions (inherited)

- **Ledger append** - it uses plain `appendFileSync`, because `ctx.fs` has no append operation,
  while governed files always go through `ctx.fs`.
- **Auxiliary reads** - plain-fs probes and reads of `registry.json` and of policy sidecars only,
  synchronous so that g2 stays await-free, and the governed manifest is never read on these paths.

## 5. Verification record

- `tsc --noEmit`: 0 errors.
- Build: `pnpm run prepublishOnly` → minified `Target/` with `.d.ts` twins, entry
  `Target/Library.js` (`class PluginFactory extends Service`).
- Smoke `node factory-smoke.mjs` (in the family's `smokes/` directory): 34 checks ALL PASS - entry
  contract (class extends Service, `static inject=["fs"]`, registered as `ctx.pluginFactory`, all 19
  methods), State defaults + cell unwrap + model fields, Seam probe-once caching, Match,
  Discover/Parse, ResolvePolicy (union order, chain keys, unreadable + absent sources), the full
  Gate matrix, Append byte format + Enabled gate + never-throws, Journal queue/silent-skip,
  GuardedWrite (both P4 postures, intent, Stash, signal), Refresh (same-actor re-emit, best-effort),
  Continue (change path incl. Inflight lifecycle + message forms + same-actor re-emit; no-op paths;
  unreadable → null; throw containment; P3 chain-key protection), Wire, Attach (P1/P2/P5 incl.
  stub-domain open/drain/close and the absent silent-skip; the P5 spec contract - per-record layout,
  compatibleVersions [1], backup-and-skip - and the loud failed-open ledger line), Schema (volatile
  cells, defaults, model slots, real validation through the schemastery instance), and the policy
  block (Policy-And-Decide: the eight action classes in the D6 order and with the D6 defaults, the
  partial override, the fail-loud unknown verdict, the composed volatile cell, and `Decide`'s
  key-is-the-action contract plus its D6 fallback for a missing or malformed key).
