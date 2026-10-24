# @playform/plugin-dsh-factory

_The DeepSeek Harness Plugin Family for PlayForm._

[![npm](https://img.shields.io/static/v1?label=npm&message=%40playform%2Fplugin-dsh-factory&color=blue)](https://www.npmjs.com/package/@playform/plugin-dsh-factory)
[![release](https://img.shields.io/static/v1?label=release&message=v0.1.0&color=blue)](https://www.npmjs.com/package/@playform/plugin-dsh-factory)
[![variant](https://img.shields.io/static/v1?label=variant&message=CLASSIC&color=blue)](../../README.md)
[![sibling](https://img.shields.io/static/v1?label=sibling&message=EFFECT-TS&color=white)](../../README.md)
[![license](https://img.shields.io/static/v1?label=license&message=CC0-1.0&color=lightgrey)](https://creativecommons.org/publicdomain/zero/1.0/)

> [!NOTE]
>
> The **furnace of the DSH governance family** - the first _service-provider_ bundle in the DeepSeek
> Harness plugin family.
>
> Loading it registers one class plugin (`export default class PluginFactory extends Service`,
> `super(ctx, "pluginFactory")`, `static inject = ["fs"]`) that exposes **`ctx.pluginFactory`**: a
> single service holding every piece of common machinery the family's hooks used to duplicate.
>
> _One service._
>
> _Nineteen methods
> ([the direct-govern pair](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/plugin-dsh-factory/Source/Function/Govern.ts)
> `RegisterGovern` + `Govern` and the `GovernSteps` registry among them)._
>
> _The hooks bring their own metal; the factory pours the mold._
>
> _The @-sentence identity: **Plugin @ DSH @ Factory**._

---

## Where It Fits

**Family position** (the @-sentence **Plugin @ DSH @ Factory**): the family's parent service - every
other package consumes it (the three governance hooks inject the service; the six normalize flavors
consume `State`/`Append` and the `Schema` helper); its own parent is the filesystem service
(`inject: ["fs"]`).

The factory is the **hub** of the eleven-package DSH family:

| Consumer                                                                                                                                                               | injects                   | uses                                                                                                   |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------ |
| [hook-dsh-package-governor](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-package-governor/Source)                                       | `["fs", "pluginFactory"]` | Gate, Discover/Parse, Continue, GuardedWrite, Refresh, State, Wire, Attach, Journal, Append, UpdateKey |
| [hook-dsh-package-pinner](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-package-pinner/Source)                                           | `["fs", "pluginFactory"]` | Gate, Discover, Continue (pin pass), State, Wire, Attach, Journal, Append                              |
| [hook-dsh-cargo-governor](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-cargo-governor/Source)                                           | `["fs", "pluginFactory"]` | Gate, Discover/Parse, Continue (TOML surgery), State, Wire, Attach, Journal, Append, UpdateKey, Seam   |
| [hook-dsh-normalize-dash](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-dash/Source) + the five `hook-dsh-normalize-*` flavors | `["pluginFactory"]`       | State, Append - plus the named `Schema` export (`shared: false`) for their config                      |

The pure layer it deliberately does **not** re-export is [`lib-dsh-core`](../lib-dsh-core) (its
19-method service surface stays stable); the hooks import the core's helpers directly.

The DSH plugin family is the DeepSeek Harness plugin layer of the PlayForm ecosystem:
TypeScript-first `Source/` → `Target/`, the deterministic `@playform` build, `prepublishOnly`-only -
the same conventions as every other @playform package.

## Install

**`Terminal`** (registry)

```sh
pnpm add @playform/plugin-dsh-factory
```

1. **Remote / dependency install (auto-activation):** `pnpm add @playform/plugin-dsh-factory` in a
   profile dir (+ the package name in `dsh.profile.bundles`, or `dsh plugin add`) - installed
   automatically and activated at the next host start.
2. **Profile link (the dev loop):** the profile's `package.json` lists
   `"@playform/plugin-dsh-factory": "link:.../bundles/ plugin-dsh-factory"` in `dependencies` and
   the package in `dsh.profile.bundles`; the bundle dir carries its own `node_modules`
   (`pnpm install --ignore-workspace` inside it - pnpm does not install a linked package's
   dependencies). Every rebuild of `Target/` is fresh on the next restart.
3. **Tarball/npm:** `dsh plugin --profile <name> add <tarball|npm-spec>` - ships built `Target/`
   (the `prepublishOnly` build hook produces it).
4. **Git:** clone + `pnpm install --ignore-workspace` + `pnpm run prepublishOnly`, then link or
   pack - git installs fetch sources, not builds.

There are no `build`/`watch` npm scripts: the harness consumes the built `Target/` output directly
(`main` → `Target/Library.js`); the only npm script is `prepublishOnly`.

### Usage

Consumers never import the factory module at runtime - they inject the service and use it through
`ctx.pluginFactory` (full method contract in [SCHEME.md](./SCHEME.md)):

```js
export const name = "my-hook";
export const inject = ["fs", "pluginFactory"];

export async function apply(ctx) {
	const Factory = ctx.pluginFactory;
	const State = Factory.State(ctx, Config, { module: "my-hook", fields: {} });
	// Factory.Append(state, message), Factory.Gate(...), Factory.Continue(...), ...
}
```

---

## The Problem

Three independent consumers of the _same_ machinery already existed.

The governor, the pinner and the cargo governor each maintained their own copy of: the ledger
(`Append`), the exclusion match (`Match`), the registry / policy walk-up discovery
(`Discover`/`Parse`), the union keep-list resolution with the P3 chain-keys interlock, the g1 gate
set, the version-guarded write with the P4 sandbox fence, the P3/U2 observation-policy refresh, the
detached contained continuation scaffolding, the `State` construction with defensive cell unwrap,
the `ctx.on` wiring, the P1/P2/P5 lifecycle effects, the Schemastery schema shape, and the
probe-once optional-service accessor.

Every bug fix or hardening pass - the sandbox fence, the stale-version leak, the in-flight
disposal - had to be applied three times.

The factory makes it apply **once**.

---

## How It Works

**`The furnace`**

```text
  THE CONSUMERS BRING THEIR OWN METAL         THE FACTORY POURS THE MOLD
  (model logic: a Config extension,           (19 methods on ctx.pluginFactory,
   a pure transform, an update engine          inject: ["fs"] - it calls ctx.fs)
   and every ledger string)

  hook-dsh-package-governor ────►┐
  hook-dsh-package-pinner ───────┤       ctx.pluginFactory (Service)
  hook-dsh-cargo-governor ───────┤         │
  hook-dsh-normalize-dash ───────┤         ├─ Append(state, msg) ──► "<Module>: <msg>" on the logger
  hook-dsh-normalize-quotes ─────┤         │                        + "[<ISO>] <msg>" appended to the ledger file
  hook-dsh-normalize-ellipsis ───┤         ├─ Match(path, list) ───► the exclusion-first segment match
  hook-dsh-normalize-spaces ─────┤         ├─ Discover(dir) ──────► nearest registry.json walk-up
  hook-dsh-normalize-invisible ──┤         ├─ Parse(path) ─────────► contained JSON read (null on any failure)
  hook-dsh-normalize-fullwidth ──┘         ├─ ResolvePolicy(...) ──► union keep-list: global policy → <dir>/
                                           │                        registry-adjacent → + P3 chain keys
                                           ├─ Gate(...) ───────────► g1 gates: target → actor → kind →
                                           │                        Stash idempotence → basename → excluded
                                           ├─ Write(...) ──────────► the ONE shared write executor
                                           │                        (intent → waterfall → sandbox posture →
                                           │                        writeText → fs/observed emit; the Over
                                           │                        bundle, below)
                                           ├─ GuardedWrite(...) ──► replaceIfVersion + the P4 sandbox fence
                                           ├─ Refresh(...) ───────► Stash seed + fs/observed re-emit (same actor)
                                           ├─ Continue(..., tfm) ─► Inflight → readText → keep-list →
                                           │                        the model's transform → GuardedWrite →
                                           │                        message → Refresh → contained throws
                                           ├─ State(ctx, cfg, s) ─► cell unwrap + shared fields + extras
                                           ├─ Wire(ctx, st, obs) ─► the fiber-owned fs/observed registration
                                           ├─ Attach(ctx, {...}) ─► P1 jobs controller / P2 inflight disposal /
                                           │                        P5 storage domain (probed, graceful)
                                           ├─ Journal(state, ...) ─► the P5 package_governance writer
                                           ├─ Schema(shared?, m) ─► the Schemastery schema factory
                                           ├─ UpdateKey(target) ──► the namespaced Inflight key (update stages)
                                           └─ Seam(state, name) ──► probe-once optional-service accessor
```

A consumer never re-implements the mold - it injects the service (`inject: ["pluginFactory"]`, the
loader holds it PENDING until the factory exists) and supplies only its own three parts:

1. **A Config extension** - `export const Config = Schema({ logFile: ... }, { myField: ... })` via
   the standalone named `Schema` export (usable at module-evaluation time, before any service
   instance exists; `shared: false` emits the minimal block for non-manifest modules).
2. **A transform** - the pure `(current, section, keep) => { next, count, message? } | null`
   function (Interface/Transform). `current` is the RAW file text (null when the read failed); the
   consumer decodes, applies its logic, logs its own no-op/refusal lines and returns `null` for
   every no-op path. `next` is an object (serialized exactly as
   `JSON.stringify(next, null, 2) + "\n"`) or a string (text surgery, written verbatim).
3. **An update engine** (optional) - ncu/cargo dispatch, cooldowns, circuit breakers, the first-wins
   update-policy path pick: model logic, built on
   `GuardedWrite`/`Refresh`/`Seam`/`Journal`/`UpdateKey`.

**The shared write executor (`Write`)** - the one write path in the family. Every governed or
tool-driven write goes through it (GuardedWrite is the guarded alias): the `Over` bundle carries the
intent (an explicit `replaceIfVersion` skips the [fs/write-intent][dsh-fs] waterfall - the default
`{ waterfall: true }` runs it), the sandbox posture (`"standing"` = the built-in's no-escalation
replica, `"p4"` = the per-call fence, or an explicit policy object), the root-context fs/observed
emit (default true), the Stash pre-registration and the caller's content transform. It logs
nothing - the caller composes its own ledger line from the outcome.

**The direct-govern entry (`Govern`)** - the raw-write tool's post-write call: resolves the
registered steps for the target's basename, filters them by the selection (`true`/`"all"` = every
registered step; an array or a single name = the named steps; unknown names ignored; `false`/absent
= none), and runs each contained - one try/catch per step, never throws. The SEQUENTIAL FOLD
(v0.2.1): the steps are awaited one at a time, so each step's chain (its guarded write + its ledger
line) completes before the next step reads the file. An empty registry (no module registered for the
basename) is a contained no-op.

### The trace bus (`ctx.trace`)

The factory is also the home of the workspace family's **trace bus** (the completion spec's D5: the
indexer is INFERRED from the event bus - no separate process, no separate indexer plugin). The
constructor builds one bus and provides it as `ctx.trace`; the vocabulary and the detached loop live
in [`@playform/lib-dsh-trace`](../lib-dsh-trace), and every adapting plugin carries its own
`Source/Trace/` adapter - no plugin imports another.

```ts
ctx.trace.emit({ kind: "observe/stamp", payload: { path, version, origin } }); // complete + dispatch
const Dispose = ctx.trace.on("graph/invalidated", (Envelope) => { ... });       // the disposer
await ctx.trace.flush();                                                        // deterministic
ctx.trace.ring(10);                                                             // newest first, bounded 256
```

The bus completes the envelope (`{ trace, kind, at, actor, payload }` - the bus assigns `trace-<n>`
and `at` when the emitter supplied none), pushes it into a bounded ring (the fixed `Bound` = 256, no
config knob), and dispatches it to the listeners of its kind. Every listener runs inside its own
try/catch and the whole emit is contained: the bus NEVER throws into a caller (the callers are
synchronous fs/observed listeners). The constructor's unload effect disposes the bus - a late emit
and a late subscription are contained no-ops. The service adds NO method to the 19-method
`pluginFactory` surface and NO config field.

### What the factory deliberately does NOT own

- **The consumer ledger strings.** Every message a hook logs (`skipped (excluded) ...`,
  `observed non-JSON package.json ... - skipped`, `REFUSED rewrite ...`, `pinned ...`,
  `governed ... → ...`, the `activated (...)` proof) is composed and logged by the hook - through
  the factory's `Append`. The factory's own composed strings are _parameterized machinery_ (the
  unreadable-policy line takes the policy file name; the suppressed-error lines take `state.Module`
  as the prefix) and stay byte-identical when a consumer keeps its historical name.
- **The transforms.** The consumer supplies the pure function; the factory only drives it inside
  `Continue`.
- **The update engines.** The factory gives them `GuardedWrite`/`Refresh`/
  `Seam`/`Journal`/`UpdateKey` to build with.

### The named exports

Only the entry carries named exports: the six **type re-exports** (`State`, `Options`, `Gate`,
`Transform`, `Output`, `Journal` - the consumer contract, shipped as relative `.d.ts` specifiers),
the trace service's **type re-export** (`Trace`), the **`Allowlist`** type re-export (the policy
block's shape, D6), the standalone **`Schema`** function (factory v0.1.1) - the module-load use of
the instance method, because the loader needs `Config` before any context exists - and the two
policy helpers, **`Policy()`** (the shared schema-block builder) and **`Decide(policy, action)`**
(the `"auto" | "approve"` verdict lookup).

Full contract: [SCHEME.md](./SCHEME.md).

### Verification

- `tsc --noEmit` - zero errors (TypeScript 7, `@playform/build/tsconfig`).
- `pnpm run prepublishOnly` - minified `Target/` (+ `.d.ts` twins).
- `node Target/Test/<Folder>/Test.js` (one folder per suite) - 53 checks across 8 folders, ALL PASS:
  a fake ctx + a REAL instance (the class/service registered as `ctx.pluginFactory`), covering every
  primitive, the Gate matrix, both GuardedWrite postures, the full Continue lifecycle (Inflight
  registration/removal, no-op paths, throw containment, message forms, the P3 union), State
  defaults + cell unwrap, Attach's three effects, Journal's queue/drain/silent-skip, Schema's
  volatile cells, Seam's probe-once caching, the trace service (`Trace-Service`: registration,
  emit/on, the ring, the disposer, fail-open, the unload path), and the policy block
  (`Policy-And-Decide`: the D6 defaults, the override, the fail-loud verdict, the composed cell and
  `Decide`'s fallback).

### The Exemptions (inherited, documented)

- **The ledger append** (Function/Append): a plain `appendFileSync` because `ctx.fs` has no append
  operation; re-reading + rewriting a shared log through `ctx.fs.writeText` would be racy and wrong.
  Every write of a GOVERNED file goes through `ctx.fs` (Function/Write).
- **The auxiliary reads** (Function/Discover/Parse/Resolve): plain-fs existence probes and reads of
  auxiliary discovery files (`registry.json`, policy sidecars) only - internal calculation, kept
  synchronous so the listener's g2 stage stays await-free. The GOVERNED manifest is never read on
  these paths.

---

### The Hard Lessons

1. **The loader holds consumers PENDING until the factory exists** - the service resolves at boot;
   load order never matters, but the factory bundle must be present in the profile.
2. **`Config` must be built through the standalone named `Schema` export** - the loader reads
   `Config` at module-evaluation time, before any service instance exists; the instance method
   cannot be used there (the pre-v0.1.1 stub-context workaround is gone).
3. **Root-context writes need an explicit sandbox posture** - the deployment default
   (`workspace-write`) denies paths outside the canonical workspace; the governance modules pass
   `{ mode: "danger-full-access" }` because their own exclude list IS their fence.
4. **The journal sink binds once** - the first successful open wins the shared `package_governance`
   table; records before that buffer in the pre-bind queue (cap 256) and drain on the first open.
5. **An empty govern registry is a no-op** - a raw-write `govern` call against a registry no module
   has populated resolves to nothing, contained; the registry fills at apply.

## The Config

The factory registers no Config schema of its own - it **is** the config machinery.

Its `Schema(shared?, m)` instance method is the Schemastery schema factory every consumer builds its
schema with, and the standalone named **`Schema`** export (factory v0.1.1) makes the same factory
usable at module-evaluation time, before any service instance exists (the loader needs `Config` at
load).

`shared: false` emits the minimal block (no
`logFile`/`updateCooldownMs`/`mutationTools`/`policyFile`/`exclude`) for non-manifest modules like
the normalize flavors; the shared defaults carry the family's block.

Volatile cells (`log`, `logFile` and any consumer's own hot fields) commit without remounting the
plugin; the factory's `State` builder unwraps them defensively. The volatile-refresh path: every
volatile edit commits one `loader/volatile-update` dispatch whose whole object the State's refresh
listener re-reads - live, silent, no remount (the granular scopes of the normalize hooks ride the
same path, and the scopes are all volatile live toggles).

### The policy block (D6)

The shared per-plugin allowlist: `Policy()` builds the Schemastery block a consumer spreads into its
own schema, one key per action class, each `"auto"` (the plugin acts on its own) or `"approve"` (the
action waits for the user's approval).

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

```ts
// Variable/Config.ts - composed at module-evaluation time, like Schema.
// the gated action - the policy is the OUTER gate.
import { Schema as Compose, Decide, Policy } from "@playform/plugin-dsh-factory";

export default Compose(false, { logFile: "…", enabled: false, policy: Policy() });

// Function/Apply.ts - the block lands on the consumer's own State field.
fields: {
	Allow: "policy";
}

switch (Decide(State.Allow, "spawn")) {
	case "auto":
		/* act */ break; /* approve: wait */
}
```

`Decide(policy, action)` answers the verdict; the action names ARE the keys. A missing key (a
partial block) falls back to that action's D6 default and a malformed value is treated as missing,
so a bad config can only be MORE conservative for write/commit/spawn. The block is one volatile
object: a policy flip is hot-editable without a remount.

The existing module knobs (`autoSpawn`, `autoApprove`, `enabled`) stay the INNER gate - the policy
is the OUTER one, so an `approve` verdict beats an enabled knob, while a disabled knob still refuses
on its own.

**The pack section.** A pack's `policy` section (`@playform/lib-dsh-pack`'s `Policy` type - the same
action -> verdict mapping) overrides these defaults per action when a pack is resolved, so one file
describes one repo. The pack -> policy defaulting wiring is the next refinement; the type and the
section already exist, and a resolved pack's block is a straight overlay on the table above.

---

## In Action

A governed write, end to end.

The consumer supplies the transform; the factory drives the rest (the excerpt is the pinner's pin
pass, condensed to its shape):

```js
// Source/Function/Transform.ts of a consumer (condensed to its shape):
export default (Current, Section, Keep) => {
	const Document = JSON.parse(Current); // Current: the RAW file text
	const Outcome = Pin(Document, Section, Keep); // the module's own logic
	switch (true) {
		case !Outcome: // nothing to pin
			return null; // every no-op path logs itself, then null
		default:
			return {
				next: Outcome.Next, // written as JSON.stringify(next, null, 2) + "\n"
				count: Outcome.Pinned,
				message: `pinned ${Path} (${Outcome.Pinned} versions)`,
			}; // Continue: GuardedWrite → Refresh → Append → journal
	}
};
```

The write the factory performs for that return value (a `package.json` whose
`"@playform/build": "^0.3.4"` becomes `"0.3.4"`), as the author and the ledger see it:

```text
transcript:  the write tool result shows exactly what the author wrote
hook-dsh-package-pinner.log:  [2026-10-03T09:16:01.880Z] pinned ~/Projects/acme/tool/package.json (7 versions)
```

The factory's part of that one pass: Gate decided the actor and the path, Discover found the nearest
registry.json, Continue ran the transform detached and contained, GuardedWrite carried
`replaceIfVersion` past the P4 sandbox fence, Refresh re-emitted the fresh version with the same
actor, and Append composed the loggers line from the module's message.

The consumer composed the only string in the chain.

---

## The Ledger

The factory registers no activation line and owns no ledger strings - it is a service, not a module.

Its `Append(state, message)` is the family's one ledger mechanism, and it composes exactly two
wrappers around the CONSUMER's message:

```text
logger:  <State.Module>: <message>      (State.Module = the consumer's historical prefix)
ledger:  [<ISO timestamp>] <message>    (appendFileSync, best-effort, when log is enabled)
```

Every string a hook logs - `skipped (excluded) ...`, `governed <path> → <version>`,
`pinned <path> (N versions)`, the `activated (...)` proof - is composed and logged by the hook,
through the factory's `Append`.

The factory's own composed strings are parameterized machinery (the unreadable-policy line takes the
policy file name; the suppressed-error lines take `state.Module` as the prefix) and stay
byte-identical when a consumer keeps its historical name.

The P5 records (the consumers' `Journal` calls) route to ONE shared sink: the harness's
storageDomain allows one open per domain name, so the first module whose open succeeds binds the
shared `package_governance` table and every module's records land there. Records journaled before
any open succeeds buffer in the factory's pre-bind queue (capped at 256, drained by the first
successful open) - the boot-window race is closed by construction.

---

## The two release groups (CLASSIC vs EFFECT-TS)

Two published groups, one contract: this package is the CLASSIC build - plain TypeScript, zero
framework dependencies: `import ... from "@playform/plugin-dsh-factory"` resolves to `Target/`. The
EFFECT-TS implementation of the same contract is the separate package
`@playform/ets-plugin-dsh-factory` - effect-backed, built on the shared `@playform/ets-base-dsh`
base with `effect` v4.0.2 as its runtime dependency. Install the group you run and never mix the
groups in one graph (the effect-ts `Update` returns Effect envelopes, not the classic dispatch
envelope).

## License 📜

CC0-1.0.
