# @playform/plugin-dsh-factory

_The DeepSeek Harness Plugin Family for PlayForm._

[![npm](https://img.shields.io/static/v1?label=npm&message=%40playform%2Fplugin-dsh-factory&color=blue)](https://www.npmjs.com/package/@playform/plugin-dsh-factory)
[![release](https://img.shields.io/static/v1?label=release&message=v0.0.1&color=blue)](https://www.npmjs.com/package/@playform/plugin-dsh-factory)
[![variant](https://img.shields.io/static/v1?label=variant&message=CLASSIC&color=blue)](../../README.md)
[![sibling](https://img.shields.io/static/v1?label=sibling&message=EFFECT-TS&color=white)](../../README.md)
[![license](https://img.shields.io/static/v1?label=license&message=CC0-1.0&color=lightgrey)](https://creativecommons.org/publicdomain/zero/1.0/)

> [!NOTE]
>
> The **furnace of the DSH governance family** - the first _service-provider_ bundle in the DeepSeek
> Harness plugin family.
>
> Loading it registers one class plugin
> (`export default class PluginFactory extends Service`, `super(ctx, "pluginFactory")`,
> `static inject = ["fs"]`) that exposes **`ctx.pluginFactory`**: a single service holding every
> piece of common machinery the family's hooks used to duplicate.
>
> _One service._
>
> _Nineteen methods ([the direct-govern pair](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/plugin-dsh-factory/Source/Function/Govern.ts) `RegisterGovern` + `Govern` and the
> `GovernSteps` registry among them)._
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

| Consumer                                                            | injects                   | uses                                                                                                   |
| ------------------------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------ |
| [hook-dsh-governor-package](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-governor-package/Source)                                         | `["fs", "pluginFactory"]` | Gate, Discover/Parse, Continue, GuardedWrite, Refresh, State, Wire, Attach, Journal, Append, UpdateKey |
| [hook-dsh-pinner-package](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-pinner-package/Source)                                           | `["fs", "pluginFactory"]` | Gate, Discover, Continue (pin pass), State, Wire, Attach, Journal, Append                              |
| [hook-dsh-governor-cargo](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-governor-cargo/Source)                                           | `["fs", "pluginFactory"]` | Gate, Discover/Parse, Continue (TOML surgery), State, Wire, Attach, Journal, Append, UpdateKey, Seam   |
| [hook-dsh-normalize-dash](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-dash/Source) + the five `hook-dsh-normalize-*` flavors | `["pluginFactory"]`       | State, Append - plus the named `Schema` export (`shared: false`) for their config                      |

The pure layer it deliberately does **not** re-export is [`hook-dsh-core`](../hook-dsh-core) (its
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

  hook-dsh-governor-package ────►┐
  hook-dsh-pinner-package ───────┤       ctx.pluginFactory (Service)
  hook-dsh-governor-cargo ───────┤         │
  hook-dsh-normalize-dash ───────┤         ├─ Append(state, msg) ──► "<Module>: <msg>" on the logger
  hook-dsh-normalize-quotes ─────┤         │                        + "[<ISO>] <msg>" appended to the ledger file
  hook-dsh-normalize-ellipsis ───┤         ├─ Match(path, list) ───► the exclusion-first segment match
  hook-dsh-normalize-spaces ─────┤         ├─ Discover(dir) ──────► nearest registry.json walk-up
  hook-dsh-normalize-invisible ──┤         ├─ Parse(path) ─────────► contained JSON read (null on any failure)
  hook-dsh-normalize-fullwidth ──┘         ├─ ResolvePolicy(...) ──► union keep-list: global policy → <dir>/
                                           │                        registry-adjacent → + P3 chain keys
                                           ├─ Gate(...) ───────────► g1 gates: target → actor → kind →
                                           │                        Stash idempotence → basename → excluded
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
`Transform`, `Output`, `Journal` - the consumer contract, shipped as relative `.d.ts` specifiers)
and the standalone **`Schema`** function (factory v0.1.1) - the module-load use of the instance
method, because the loader needs `Config` before any context exists.

Full contract:
[SCHEME.md](./SCHEME.md).

### Verification

- `tsc --noEmit` - zero errors (TypeScript 7, `@playform/build/tsconfig`).
- `pnpm run prepublishOnly` - minified `Target/` (+ `.d.ts` twins).
- `node factory-smoke.mjs` (in the family's `smokes/` directory) - 34 checks, ALL PASS: a fake ctx +
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
hook-dsh-pinner-package.log:  [2026-10-03T09:16:01.880Z] pinned ~/Projects/acme/tool/package.json (7 versions)
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

---

## License 📜

CC0-1.0.
