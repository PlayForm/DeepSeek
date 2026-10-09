# @playform/ets-plugin-dsh-factory

*The DeepSeek Harness Plugin Family for PlayForm.*

[![npm](https://img.shields.io/static/v1?label=npm&message=%40playform%2Fets-plugin-dsh-factory&color=blue)](https://www.npmjs.com/package/@playform/ets-plugin-dsh-factory)
[![release](https://img.shields.io/static/v1?label=release&message=v0.0.1&color=blue)](https://www.npmjs.com/package/@playform/ets-plugin-dsh-factory)
[![variant](https://img.shields.io/static/v1?label=variant&message=EFFECT-TS&color=blue)](../../README.md)
[![sibling](https://img.shields.io/static/v1?label=sibling&message=CLASSIC&color=white)](../../README.md)
[![license](https://img.shields.io/static/v1?label=license&message=CC0-1.0&color=lightgrey)](https://creativecommons.org/publicdomain/zero/1.0/)

> [!NOTE]
>
> The **furnace of the DSH governance family** - the first *service-provider* bundle in the DeepSeek
> Harness plugin family.
>
> Loading it registers one class plugin
> (`export default class PluginFactory extends Service`, `super(ctx, "pluginFactory")`,
> `static inject = ["fs"]`) that exposes **`ctx.pluginFactory`**: a single service holding every
> piece of common machinery the family's hooks used to duplicate.
>
> *One service.*
>
> *Nineteen methods ([the direct-govern pair](https://github.com/PlayForm/DeepSeek/tree/Current/EffectTS/packages/ets-plugin-dsh-factory/Source/Function/Govern.ts) `RegisterGovern` + `Govern` and the
> `GovernSteps` registry among them).*
>
> *The hooks bring their own metal; the factory pours the mold.*
>
> *The @-sentence identity: **Plugin @ DSH @ Factory**.*

---

## Where It Fits

**Family position** (the @-sentence **Plugin @ DSH @ Factory**): the family's parent service - every
other package consumes it (the three governance hooks inject the service; the six normalize flavors
consume `State`/`Append` and the `Schema` helper); its own parent is the filesystem service
(`inject: ["fs"]`).

The factory is the **hub** of the eleven-package DSH family:

| Consumer                                                            | injects                   | uses                                                                                                   |
| ------------------------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------ |
| [ets-hook-dsh-package-governor](https://github.com/PlayForm/DeepSeek/tree/Current/EffectTS/packages/ets-hook-dsh-package-governor/Source)                                         | `["fs", "pluginFactory"]` | Gate, Discover/Parse, Continue, GuardedWrite, Refresh, State, Wire, Attach, Journal, Append, UpdateKey |
| [ets-hook-dsh-package-pinner](https://github.com/PlayForm/DeepSeek/tree/Current/EffectTS/packages/ets-hook-dsh-package-pinner/Source)                                           | `["fs", "pluginFactory"]` | Gate, Discover, Continue (pin pass), State, Wire, Attach, Journal, Append                              |
| [ets-hook-dsh-cargo-governor](https://github.com/PlayForm/DeepSeek/tree/Current/EffectTS/packages/ets-hook-dsh-cargo-governor/Source)                                           | `["fs", "pluginFactory"]` | Gate, Discover/Parse, Continue (TOML surgery), State, Wire, Attach, Journal, Append, UpdateKey, Seam   |
| [ets-hook-dsh-normalize-dash](https://github.com/PlayForm/DeepSeek/tree/Current/EffectTS/packages/ets-hook-dsh-normalize-dash/Source) + the five `ets-hook-dsh-normalize-*` flavors | `["pluginFactory"]`       | State, Append - plus the named `Schema` export (`shared: false`) for their config                      |

The pure layer it deliberately does **not** re-export is [`ets-hook-dsh-core`](../ets-hook-dsh-core) (its
19-method service surface stays stable); the hooks import the core's helpers directly.

The DSH plugin family is the DeepSeek Harness plugin layer of the PlayForm ecosystem:
TypeScript-first `Source/` → `Target/`, the deterministic `@playform` build, `prepublishOnly`-only -
the same conventions as every other @playform package.

## Install

**`Terminal`** (registry)

```sh
pnpm add @playform/ets-plugin-dsh-factory
```

1. **Remote / dependency install (auto-activation):** `pnpm add @playform/ets-plugin-dsh-factory` in a
   profile dir (+ the package name in `dsh.profile.bundles`, or `dsh plugin add`) - installed
   automatically and activated at the next host start.
2. **Profile link (the dev loop):** the profile's `package.json` lists
   `"@playform/ets-plugin-dsh-factory": "link:.../bundles/ ets-plugin-dsh-factory"` in `dependencies` and
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


The shared Effect-TS plumbing - the runtime wiring, the stream machinery and the hook contract types - comes from the base [`ets-base-dsh`](../ets-base-dsh) package.

---

## The Problem

Three independent consumers of the *same* machinery already existed.

The governor, the pinner and
the cargo governor each maintained their own copy of: the ledger (`Append`), the exclusion match
(`Match`), the registry / policy walk-up discovery (`Discover`/`Parse`), the union keep-list
resolution with the P3 chain-keys interlock, the g1 gate set, the version-guarded write with the P4
sandbox fence, the P3/U2 observation-policy refresh, the detached contained continuation
scaffolding, the `State` construction with defensive cell unwrap, the `ctx.on` wiring, the P1/P2/P5
lifecycle effects, the Schemastery schema shape, and the probe-once optional-service accessor.

Every
bug fix or hardening pass - the sandbox fence, the stale-version leak, the in-flight disposal - had
to be applied three times.

The factory makes it apply **once**.

---

## How It Works

**`The furnace`**

```text
  THE CONSUMERS BRING THEIR OWN METAL         THE FACTORY POURS THE MOLD
  (model logic: a Config extension,           (19 methods on ctx.pluginFactory,
   a pure transform, an update engine          inject: ["fs"] - it calls ctx.fs)
   and every ledger string)

  ets-hook-dsh-package-governor ────►┐
  ets-hook-dsh-package-pinner ───────┤       ctx.pluginFactory (Service)
  ets-hook-dsh-cargo-governor ───────┤         │
  ets-hook-dsh-normalize-dash ───────┤         ├─ Append(state, msg) ──► "<Module>: <msg>" on the logger
  ets-hook-dsh-normalize-quotes ─────┤         │                        + "[<ISO>] <msg>" appended to the ledger file
  ets-hook-dsh-normalize-ellipsis ───┤         ├─ Match(path, list) ───► the exclusion-first segment match
  ets-hook-dsh-normalize-spaces ─────┤         ├─ Discover(dir) ──────► nearest registry.json walk-up
  ets-hook-dsh-normalize-invisible ──┤         ├─ Parse(path) ─────────► contained JSON read (null on any failure)
  ets-hook-dsh-normalize-fullwidth ──┘         ├─ ResolvePolicy(...) ──► union keep-list: global policy → <dir>/
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
tool-driven write goes through it (GuardedWrite is the guarded alias): the `Over` bundle carries
the intent (an explicit `replaceIfVersion` skips the [fs/write-intent][dsh-fs] waterfall - the
default `{ waterfall: true }` runs it), the sandbox posture (`"standing"` = the built-in's
no-escalation replica, `"p4"` = the per-call fence, or an explicit policy object), the
root-context fs/observed emit (default true), the Stash pre-registration and the caller's content
transform. It logs nothing - the caller composes its own ledger line from the outcome.

**The direct-govern entry (`Govern`)** - the raw-write tool's post-write call: resolves the
registered steps for the target's basename, filters them by the selection (`true`/`"all"` = every
registered step; an array or a single name = the named steps; unknown names ignored; `false`/absent
= none), and runs each contained - one try/catch per step, never throws. The SEQUENTIAL FOLD
(v0.2.1): the steps are awaited one at a time, so each step's chain (its guarded write + its
ledger line) completes before the next step reads the file. An empty registry (no module
registered for the basename) is a contained no-op.

### What the factory deliberately does NOT own

- **The consumer ledger strings.** Every message a hook logs (`skipped (excluded) ...`,
  `observed non-JSON package.json ... - skipped`, `REFUSED rewrite ...`, `pinned ...`,
  `governed ... → ...`, the `activated (...)` proof) is composed and logged by the hook - through
  the factory's `Append`. The factory's own composed strings are *parameterized machinery* (the
  unreadable-policy line takes the policy file name; the suppressed-error lines take `state.Module`
  as the prefix) and stay byte-identical when a consumer keeps its historical name.
- **The transforms.** The consumer supplies the pure function; the factory only drives it inside
  `Continue`.
- **The update engines.** The factory gives them `GuardedWrite`/`Refresh`/
  `Seam`/`Journal`/`UpdateKey` to build with.

### The named exports

Only the entry carries named exports: the six **type re-exports** (`State`, `Options`, `Gate`,
`Transform`, `Output`, `Journal` - the consumer contract, shipped as relative `.d.ts` specifiers)
and the standalone **`Schema`** function (factory v0.1.1) - the module-load use of the instance
method, because the loader needs `Config` before any context exists.

Full contract:
[SCHEME.md](./SCHEME.md).

### Verification

- `tsc --noEmit` - zero errors (TypeScript 7, `@playform/build/tsconfig`).
- `pnpm run prepublishOnly` - minified `Target/` (+ `.d.ts` twins).
- `node factory-smoke.mjs` (in the family's `smokes/` directory) - 41 checks, ALL PASS: a fake ctx +
  a REAL instance (the class/service registered as `ctx.pluginFactory`), covering every primitive,
  the Gate matrix, both GuardedWrite postures, the full Continue lifecycle (Inflight
  registration/removal, no-op paths, throw containment, message forms, the P3 union), State
  defaults + cell unwrap, Attach's three effects, Journal's queue/drain/silent-skip, Schema's
  volatile cells and Seam's probe-once caching.

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

Its
`Schema(shared?, m)` instance method is the Schemastery schema factory every consumer builds its
schema with, and the standalone named **`Schema`** export (factory v0.1.1) makes the same factory
usable at module-evaluation time, before any service instance exists (the loader needs `Config` at
load).

`shared: false` emits the minimal block (no
`logFile`/`updateCooldownMs`/`mutationTools`/`policyFile`/`exclude`) for non-manifest modules like
the normalize flavors; the shared defaults carry the family's block.

Volatile cells (`log`,
`logFile` and any consumer's own hot fields) commit without remounting the plugin; the factory's
`State` builder unwraps them defensively.

---

## In Action

A governed write, end to end.

The consumer supplies the transform; the factory drives the rest (the
excerpt is the pinner's pin pass, condensed to its shape):

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
ets-hook-dsh-package-pinner.log:  [2026-10-03T09:16:01.880Z] pinned ~/Projects/acme/tool/package.json (7 versions)
```

The factory's part of that one pass: Gate decided the actor and the path, Discover found the nearest
registry.json, Continue ran the transform detached and contained, GuardedWrite carried
`replaceIfVersion` past the P4 sandbox fence, Refresh re-emitted the fresh version with the same
actor, and Append composed the loggers line from the module's message.

The consumer composed the
only string in the chain.

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

The factory's own composed strings are parameterized machinery (the
unreadable-policy line takes the policy file name; the suppressed-error lines take `state.Module` as
the prefix) and stay byte-identical when a consumer keeps its historical name.

The P5 records (the consumers' `Journal` calls) route to ONE shared sink: the harness's
storageDomain allows one open per domain name, so the first module whose open succeeds binds the
shared `package_governance` table and every module's records land there. Records journaled before
any open succeeds buffer in the factory's pre-bind queue (capped at 256, drained by the first
successful open) - the boot-window race is closed by construction.


---

[dsh-fs]: https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/fs/src/index.ts

## License 📜

CC0-1.0.
