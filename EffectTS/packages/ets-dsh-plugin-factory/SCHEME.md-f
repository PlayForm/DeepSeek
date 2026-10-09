# Plugin-Factory — Service Scheme (v0.1.0, TypeScript, class/service plugin)

Status: **IMPLEMENTED and VERIFIED** (`tsc --noEmit` zero errors; minified build; 41-check smoke
with a fake ctx + a REAL instance — ALL PASS).

This document ships inside the bundle as `SCHEME.md`
(alongside the usage README) and IS the contract the trio refactor consumes.

## 0. The loader contract — the first class/service plugin in the family

```ts
export default class PluginFactory extends Service {
	static inject = ["fs"];
	constructor(Context: Context) {
		super(Context, "pluginFactory");
	}
	/* …19 methods, each a thin delegate to one Function module… */
}
```

Per docs/user/develop/framework/service.md: the constructor registers the service immediately
(`ctx.reflect.provide("pluginFactory", this)`) and it is removed with its owning fiber.

`static inject = ["fs"]` because the primitives call `ctx.fs` (the governed-file read and the
version-guarded write).

The default object contract does not apply here — the class form is the
Constructor plugin form; there is no `Config` schema and no config row beyond `config: {}` in the
patch.

Consumption: `inject: ["pluginFactory"]` (required service) or `ctx.get("pluginFactory")`
(optional probe).

## 1. The shared state (Interface/State)

Every method takes the model's state — the shape Function/State builds, plus the model's own fields
(a model declares `interface State extends FactoryState { Section: string[]; … }`; its instances are
assignable to the factory's shape).

Fields:

| Field                          | Meaning                                                                                                                                                                                          |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Context`                      | the loading context (fs, logger, emit, get, effect, on)                                                                                                                                          |
| `Module`                       | the model identity — **doubles as the logger/ledger prefix** ("hook-dsh-governor-package", "hook-dsh-pinner-package", "hook-dsh-governor-cargo" keep every factory-composed line byte-identical) |
| `Tool`                         | mutation-tool names (fixed mapping ← `mutationTools`)                                                                                                                                            |
| `Policy`                       | config `policyFile` (fixed mapping; "" = discovery)                                                                                                                                              |
| `PolicyName`                   | the policy sidecar filename for union discovery ("pin-policy.json" / "update-policy.json"; "" disables sidecar lookup)                                                                           |
| `Ledger` / `Enabled` / `List`  | fixed mappings ← `logFile` / `log` / `exclude`                                                                                                                                                   |
| `Stash`                        | `Map<FsTargetKey, FsVersion>` — the idempotence gate                                                                                                                                             |
| `Inflight`                     | `Map<string, { controller: AbortController }>` — P2 disposal                                                                                                                                     |
| `Seams`                        | probe-once cache (Function/Seam)                                                                                                                                                                 |
| `Subprocess`                   | P9: probed ONCE at build via the "subprocess" seam                                                                                                                                               |
| `Queue` / `Journal` / `Domain` | the P5 storage sink, pre-open queue (capped 256), open handle                                                                                                                                    |

Opaque identity types (`FsTargetKey`, `FsVersion`) are stored and compared, never parsed or computed
(subsystems/filesystem.md).

## 2. The 19 callable methods (18 sections; Write + GuardedWrite share §2.7), exact signatures

> Added in v0.2: the **direct-govern registry and entry** — `RegisterGovern` and `Govern`
> (§2.17–§2.18), the raw-write tool's per-call `govern` path.
>
> The callable count is now 19 (Write +
> GuardedWrite share §2.7; the GovernSteps registry instance field is state, not a method).
>
> §2.16's
> `UpdateKey` is the v0.1.1 P2 helper, factory-side since the cargo collision.

### 2.1 `Append(state, message): void`

The ledger.

`logger.info("<Module>: <message>")` (best-effort), then
`appendFileSync(state.Ledger, "[<ISO>] <message>\n")` when `state.Enabled` (best-effort).

**Never
throws.**

The message strings are the MODEL'S.

### 2.2 `Match(path, list): boolean`

True iff any path segment (split on `sep`) is in `list`.

Empty/absent list → false.

### 2.3 `Discover(dir): string | null`

Nearest `registry.json` walking UP from `dir`; stops at `node_modules` boundaries and the filesystem
root; null when none.

### 2.4 `Parse(path): unknown`

`JSON.parse(readFileSync(path, "utf8"))`; null on ANY failure.

### 2.5 `ResolvePolicy(state, dir, found, chain, opts?): string[]`

```ts
opts?: { policyFileField?: string; policyFileName?: string }
// defaults: policyFileField = "Policy", policyFileName = state.PolicyName
```

The UNION keep-list: the global policy (state[policyFileField], when it exists) →
`<dir>/<policyFileName>` → co-located with `found` (its parent dir) → **plus the P3 chain keys
(`chain`) always appended**.

Dedup, in that order.

An existing-but-unparsable sidecar is logged
(`unreadable <policyFileName> at <path> — using built-in default`) and contributes nothing; a
configured-but-absent one is silently not a source.

### 2.6 `Gate(state, target, observation, actor, {basename, mutationToolsField?}): Decision`

```ts
Decision = { pass: boolean; reason?: "target" | "govern" | "actor" | "kind" |
  "idempotent" | "basename" | "excluded"; path?: string }
```

The g1 gate set, in the trio's exact order: string `displayPath` → the `govern` marker (the
raw-write's WRAPPED actor — presence routes the write's governance to the DIRECT path only, so the
event path skips it silently) → actor tool name ∈ `state[mutationToolsField ?? "Tool"]` →
`kind === "present"` → Stash idempotence (`state.Stash.get(targetKey) === observation.version`) →
basename → exclusion-first.

**Reads the Stash, never writes it; logs nothing.**

The caller composes
its own lines (at least the `excluded` one) and seeds the Stash after g2, before detaching.

### 2.7 `Write(state, target, content, over?): Promise<FsWriteOutcome>` — the shared executor / `GuardedWrite(state, target, content, version, signal?)` — the guarded alias

`Write` is the ONE shared write executor (Function/Write) for every family-side write (the raw-write
tool, the chain pass, update stages); resolve stays CALLER-side (cwd semantics differ legitimately),
so the target arrives pre-resolved.

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

- `"standing"` (default) is the EXACT no-escalation replica of the built-in write's
  `FsSandboxController`: a bare backend (`ctx.fs.sandboxMode === undefined`) passes NO policy; a
  confining backend requires the `sandboxPolicy` service and stamps the session-resolved policy
  (resolved with `{ session }` from `over.actor.agent` when present, else `{}`). The missing-policy
  error is thrown byte-identically to raw-write's own:
  `"raw-write: the mounted filesystem confines but ctx.sandboxPolicy is missing"` (the standing
  path's only caller is the raw-write tool).
- `"p4"` is the SANDBOX-MODE-DECIDED FENCE: `ctx.fs.sandboxMode === undefined` → NO policy (the
  service keeps its own default); otherwise
  `{ mode: "workspace-write", workspaceRoot: dirname(target.displayPath) }`.
- `observe: true` (default) emits `fs/observed { kind: "present", version }` after success — on the
  ROOT context (`ctx.root.emit`, the built-in write's own posture: cordis scoping lets a listener
  hear the root and its own scope, never sibling plugin scopes, so a plugin-scope emit from the
  tool's ctx would not reach the governance hooks). `observe: false` skips it (the guarded path
  delegates the re-emit to Refresh §2.8 instead).
- `stash: true` pre-registers the outcome's fresh version in `state.Stash` BEFORE the emit/return,
  so a re-entrant listener call hits the idempotence gate.
- `transform` is the caller's content step, applied before the write (raw-write's six-fold Rewrite
  chain).

**The guarded alias** `GuardedWrite(state, target, content, version, signal?)` =
`Write(state, target, content, { intent: { kind: "replaceIfVersion", version }, signal, policy: "p4", stash: true, observe: false })`
— `ctx.fs.writeText` with the version-guarded intent and the P4 fence; on success, pre-registers the
outcome's fresh version in `state.Stash` (before any re-emit).

Logs nothing — the caller composes
its own ledger line from the outcome.

The built-in `write` tool stays OUT of scope (harness-owned
dsh-tool-fs); this executor mirrors its mechanics.

### 2.8 `Refresh(state, target, actor, version): void`

The P₃/U₂ refresh: `state.Stash.set(targetKey, version)` +
`ctx.emit( "fs/observed", target, { kind: "present", version }, actor)` — same actor ⇒ same owner
bucket.

Best-effort (swallows everything).

For the stat-based variant (update engines), stat first
and pass the stat's version.

### 2.9 `Continue(state, target, actor, dir, found, version, transform): Promise<void>`

The detached contained continuation.

Lifecycle:

1. `state.Inflight.set(String(targetKey), { controller })` (P2);
2. `text = await ctx.fs.readText(target, signal)` — catch → `null`;
3. chain keys = `Object.keys(Parse(found)?.effectiveLatest ?? {})`;
   `keep = ResolvePolicy(state, dir, found, chain)`;
4. `outcome = transform(text, state["Section"], keep)` — the model's pure function
   (Interface/Transform); `null` or `count === 0` → the designed NO-OP (silent; the model logged its
   own lines inside the transform);
5. serialization: `typeof next === "string" ? next : JSON.stringify(next, null, 2) + "\n"` →
   `GuardedWrite(state, target, next, current, signal)` — the intent's version is the FRESH stat of
   the target (the U₂ read-only probe, `ctx.fs.stat(target)` right before the write), NOT the
   observed `version` of the triggering event (that is only the stat-failure fallback). Why: the
   direct-govern sequential fold (§2.18) hands the same observed version to every registered step,
   so a later step's chain write against the stale observed version fails FS_STALE_VERSION once an
   earlier step's write has advanced the file — the fold silently aborted mid-way. Writing against
   the current version makes the fold converge in ANY step order: each step reads the file,
   transforms, stats, and writes against the version it just observed;
6. the model's `message` — string logged verbatim, or `message({ version: outcome.version })` logged
   — via `Append`;
7. `Refresh(state, target, actor, written.version)`;
8. `finally: state.Inflight.delete(String(targetKey))`; any throw →
   `logger.error("<Module>: continuation error (suppressed): <cause>")` (logger-only; never the
   ledger, never a rethrow).

### 2.10 `State(ctx, config, setup): State & Extra`

```ts
setup: { model: string; fields?: Record<string, string>;
         policyFileName?: string }
```

Defensive cell unwrap (volatile Schemastery cells `{ get }`) → fixed shared mappings
(Tool←mutationTools, Policy←policyFile, Ledger←logFile, Enabled←log, List←exclude) → `fields` maps
StateKey→configKey for the model's own fields → fresh `Stash`/`Inflight`/`Seams`/`Queue`/`Journal` +
the P9 subprocess probe (through Seam).

Generic: `Extra` names the model's field type.

Never
returned from `apply` (loader treats return values specially) — expose via a context attachment.

### 2.11 `Wire(ctx, state, observe): void`

`ctx.on("fs/observed", (target, observation, actor) => observe(target, observation, actor))` —
fiber-owned, removed on unload.

`state` accepted for signature stability.

The model's `observe` runs
Gate, its lines, g2 discovery, the Stash seed, and the Continue handoff.

The hook is fs/observed
ONLY.

The activation proof is the model's own `Append` + `Journal` call.

### 2.12 `Attach(ctx, { state, name }): void`

Three `ctx.effect` registrations, labels `<name>-jobs`, `<name>-inflight`, `<name>-storage`:

- **P1**: probe `ctx.get("jobs")` → `attachController(name)` (root-context registrations serve every
  owner); disposer detaches.
- **P2**: disposer aborts every `state.Inflight` controller and clears the map.
- **P5**: probe `ctx.get("storageDomain")`; present → `void Open(...)` (the `package_governance` v2
  `events` domain: zod enum
  `[activated, governed, dispatched, update-failed, excluded, normalized]`, string path/detail,
  number at; `layout: "per-record"` + `compatibleVersions: [1]` — the single-layout unit parser
  enforces exact version equality, so the per-record backend's legacy bootstrap migrates the
  pre-existing v1-stamped file instead of hard-failing `version-mismatch`;
  `invalidRecords: "backup-and-skip"` so one corrupt stored record cannot brick the open; dynamic
  imports off the module-load path; pre-open queue drained; the disposer closes the domain; a failed
  open emits ONE best-effort ledger line (`storage journal open failed: <message>` via the module's
  ledger — logger + durable file — never rethrown)); absent/unusable → silent skip, the sink retired
  to a no-op. The `normalized` event (added in v2 — a new event name requires a domain version bump)
  carries the non-manifest stream family's count records (the six normalize flavors, `path` empty).

### 2.13 `Journal(state, event, path, detail, at?): void`

The P5 writer: calls `state.Journal(...)` inside a try/catch — a storage failure can never reach any
caller path.

Consumers: the manifest modules' lifecycle events and the non-manifest stream family's
count records (event `normalized`, empty `path`, detail identical to the ledger count line).

### 2.14 `Schema(shared?, model?): Schema`

```ts
shared?: { log?: boolean; logFile?: string; updateCooldownMs?: number;
           mutationTools?: string[]; exclude?: string[]; policyFile?: string }
model?: Record<string, unknown>  // appended verbatim after the shared block
```

Produces
`Schema.object({ log: boolean.volatile (default true), logFile: string.volatile, updateCooldownMs: number.volatile (3000), mutationTools: string[].volatile (["write","edit","str_replace_editor"]), policyFile: string (""), exclude: string[] (the shared Default list), ...model })`.

The model exports the result as its `Config`.

### 2.15 `Seam(state, name): unknown`

Probe-once: cached on `state.Seams` (including cached `undefined`), via `ctx.get(name)` inside a
try/catch.

NEVER the direct accessor (`ctx.<name>` throws on service accessors without inject).

### 2.16 `UpdateKey(target): string` — the namespaced Inflight key

`update:${String(target.targetKey)}` — the P2 UPDATE-STAGE controller key (v0.1.1, factory-side
since the cargo collision).

The chain pass (§2.9) registers its own controller under the PLAIN
`String(targetKey)`; the two passes share the one `Inflight` map (Attach's disposal aborts every
entry on unload), so a collision would let the chain pass's settlement silently drop the running
update's controller while its engine is still in flight — the cargo collision lesson (the cargo
fixed it flavor-side with `update:` before the factory existed; now the helper is factory-side and
both governors adopt it).

### 2.17 `RegisterGovern(basename, name, run): void` — the direct-govern registry

The instance-level step registry (the SharedJournal pattern):

```ts
GovernSteps: { [basename: string]: { name: string;
  run: (target: FsTarget, actor: object | undefined, version: FsVersion) =>
    Promise<void> | void }[] }
```

The governance modules register their steps at apply time —
`RegisterGovern("package.json", "canonicalize", run)` etc. — and each `run` closure captures its OWN
State (built in that module's apply), so the chain pass, the update stage and every ledger string
stay the MODULE'S own, byte-identical (the factory never owns ledger strings).

One basename maps to
one ordered list; re-registering the same name replaces the step in place (registered position
preserved — an HMR reload rebinds the closure without duplicating it), a new name appends.

Empty
until the first module registers: with no registrations a `govern` call is a contained no-op.

Since
the sequential fold (v0.2.1) a run MAY return a promise — §2.18 awaits it, so the step's chain
completes before the next step starts.

### 2.18 `Govern(target, selection, actor, version): Promise<void>` — the SEQUENTIAL FOLD

The direct-govern entry — the raw-write tool's post-write call:
`await State.Factory.Govern(target, args.govern, exec, outcome.version)` after a successful write.

Resolves `GovernSteps[basename(target.displayPath)]`, filters by the selection, and runs each step
in REGISTERED order with `run(target, actor, version)` — AWAITED, one at a time (the sequential
fold, v0.2.1): each step's chain completes (its guarded write + its ledger line) BEFORE the next
step reads the file.

Selection semantics:

| selection                                | behavior                                                                    |
| ---------------------------------------- | --------------------------------------------------------------------------- |
| `true` / `"all"`                         | every registered step for the basename                                      |
| `["canonicalize", …]` (or a single name) | ONLY the named steps; unknown names match nothing (ignored by construction) |
| `false` / `null` / absent                | no governance at all (the escape hatch; the tool omits the call)            |

Contained: one try/catch per step — never throws, never affects the caller (the family's silence
invariant; a step's own async continuations are contained by the step).

The fold's `await` is what
makes a multi-step selection DETERMINISTIC.

The pre-fold version fired each step's chain detached
and concurrently, the chains raced on the version-guarded `replaceIfVersion` write (the first write
won, later ones failed `FS_STALE_VERSION`), and the file's final state plus the ledger lines were
nondeterministic.

Awaiting each chain eliminates the WRITE-WRITE races by construction — and §2.9's
fresh-stat write basis eliminates the version-guard abort the awaiting alone could not.

The fold
hands every step the SAME observed version, so even a perfectly serialized fold lost every step
after the first (their chain writes guarded against a version the first step's write had already
superseded — verified live: a `govern: true` run over canonicalize + pin produced only the pinner's
line, the canonicalize's write lost the version race).

With each step's chain writing against a
fresh stat of the file as the previous step left it, any step order converges to the same final
state.

The update step's awaited promise is fast.

Its `Follow`/`Dispatch` handoff resolves when the
STAGE IS DISPATCHED — the background job keeps running — so the tool's result returns after the
fold, not after an ncu/cargo run, and the ledger still shows the job's progress as before.

Best-effort by design: the handlers mirror the Observe path (g2 discovery, the Stash seed BEFORE
their writes, the awaited `Continue`/`Follow`/`Dispatch` handoffs) but no outcome ever flows back
into the write that triggered them.

The raw-write tool passes its exec WRAPPED as
`{ ...exec, govern: <selection> }` (the marker) — every handler receives the same actor with
`name`/`agent` intact, and the marker keeps the write's own `fs/observed` emit from re-entering the
event-path governance (this direct path is the raw-write's ONLY governance channel).

## 3. The model contract (what a refactor consumes)

A model supplies:

1. **Config** — `Factory.Schema({ logFile: … }, { …modelFields })`.
2. **State** — `Factory.State(ctx, config, { model, fields, policyFileName })`; model fields via
   `fields` (e.g. `{ Section: "sections" }` or the governor's
   `{ Strict: "strict", Wait: "updateCooldownMs", Limit: "maxUpdateFailures", Binary: "ncuBin", Mode: "updateMode" }`).
3. **A transform** —
   `(current: string | null, section: unknown, keep: string[]) => { next, count, message? } | null`.
   Decodes, applies the model logic, logs its own no-op/refusal lines, returns null for every no-op
   path; on change returns the next content + count + (optionally) the success line (string, or a
   function of `{ version }`).
4. **An observe function** — Gate → own lines → Discover/Parse → Stash seed →
   `Factory.Continue(...)`.
5. **apply** — State → Attach → own activation proof (Append + Journal) → Wire.
6. **An update engine** (optional) — jobs via the P1 controller, spawns via
   `state.Subprocess`/`Seam`, writes via `GuardedWrite` + `Refresh`, records via `Journal`;
   cooldown/breaker state as model fields.

Not centralized (deliberately): the transforms, the update engines (incl. the governor's first-wins
update-policy path pick — it is engine input, not keep-list discovery), the ledger strings.

## 4. Exemptions (inherited)

- **Ledger append** — plain `appendFileSync`: `ctx.fs` has no append operation; governed files
  always go through `ctx.fs`.
- **Auxiliary reads** — plain-fs probes/reads of `registry.json` and policy sidecars only;
  synchronous so g2 stays await-free; the governed manifest is never read on these paths.

## 5. Verification record

- `tsc --noEmit`: 0 errors.
- Build: `pnpm run prepublishOnly` → minified `Target/` with `.d.ts` twins, entry
  `Target/Library.js` (`class PluginFactory extends Service`).
- Smoke `node factory-smoke.mjs` (in the family's `smokes/` directory): 41 checks ALL PASS — entry
  contract (class extends Service, `static inject=["fs"]`, registered as `ctx.pluginFactory`, all 19
  methods), State defaults + cell unwrap + model fields, Seam probe-once caching, Match,
  Discover/Parse, ResolvePolicy (union order, chain keys, unreadable + absent sources), the full
  Gate matrix, Append byte format + Enabled gate + never-throws, Journal queue/silent-skip,
  GuardedWrite (both P4 postures, intent, Stash, signal), Refresh (same-actor re-emit, best-effort),
  Continue (change path incl. Inflight lifecycle + message forms + same-actor re-emit; no-op paths;
  unreadable → null; throw containment; P3 chain-key protection), Wire, Attach (P1/P2/P5 incl.
  stub-domain open/drain/close and the absent silent-skip; the P5 spec contract — per-record layout,
  compatibleVersions [1], backup-and-skip — and the loud failed-open ledger line), Schema (volatile
  cells, defaults, model slots, real validation through the schemastery instance).
