---
title: 01-foundation - the service and the libraries every other plugin is built on
category: Diagram
kind: reference
date: 2026-10-21
status: active
---

# 01-foundation

> **The capability.** When this group is present, every other plugin in the family has one place to
> append its ledger line, one gate that decides whether a write is governed, one write executor that
> respects the file's observed version, one state builder that unwraps volatile config, one
> `fs/observed` registration, one direct-govern fold, and one set of normalize tables and stream
> dispatchers. Nothing here is a feature the model can see on its own: it is the machinery that
> makes the other five groups small. The Classic half is a plain library plus a service plugin; the
> EffectTS half is the same machinery behind Effect services and layers.

## The harness surfaces

| Surface                                                            | Direction         | What the group does there                                                                                                                                                                                         |
| ------------------------------------------------------------------ | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| loader / service surface                                           | registers         | The Classic factory is a class plugin (`super(ctx, "pluginFactory")`, `static inject = ["fs"]`); loading it provides `ctx.pluginFactory` for every consumer. The libraries register nothing.                      |
| `fs/observed`                                                      | registers + emits | `Wire` installs a governance hook's `fs/observed` listener; `Write` / `GuardedWrite` emit `fs/observed` with the written version and the same actor after a governed write.                                       |
| tool execution surface (`tools/pre-execute`, `tools/post-execute`) | called by         | The tool layer calls `Gate` with the actor and observation; `Write` is the executor behind `raw-write` and `normalize-file`; `Govern` is the `raw-write` `govern` channel. The factory attaches no listener here. |
| `llm/stream`                                                       | called by         | `Chunk` and `Block` are the generic per-chunk and block-end dispatchers the six flavors call; the flavor supplies only its table and replacement. The library attaches no listener here.                          |

## The packages

| Package                            | Tree     | Role                  | Trigger                                                          | Ledger file                                                            | Diagram                                                              |
| ---------------------------------- | -------- | --------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `@playform/lib-dsh-core`           | Classic  | library - no listener | none; imported by the governance hooks and the normalize family  | none                                                                   | [lib-core.mmd](Classic/lib-core.mmd) ([SVG](Classic/lib-core.svg))   |
| `@playform/plugin-dsh-factory`     | Classic  | service plugin        | loader `apply`; consumers inject `pluginFactory`                 | none of its own; appends into each consumer's `logFile`                | [factory.mmd](Classic/factory.mmd) ([SVG](Classic/factory.svg))      |
| `@playform/ets-base-dsh`           | EffectTS | library - no listener | none; every `ets-*` package depends on it                        | none                                                                   | [base.mmd](EffectTS/base.mmd) ([SVG](EffectTS/base.svg))             |
| `@playform/ets-lib-dsh-core`       | EffectTS | library - no listener | none; imported by the ETS governance hooks and stream flavors    | none                                                                   | [lib-core.mmd](EffectTS/lib-core.mmd) ([SVG](EffectTS/lib-core.svg)) |
| `@playform/ets-plugin-dsh-factory` | EffectTS | service plugin        | loader `apply`; the Cordis shell materializes the Effect runtime | none of its own; byte-identical strings into each consumer's `logFile` | [factory.mmd](EffectTS/factory.mmd) ([SVG](EffectTS/factory.svg))    |

## How each plugin works

### @playform/lib-dsh-core

**Classic.** What it does. The core is the family's pure machinery layer: zero runtime dependencies,
no loader contract, no Config, no ledger. It exists because the governance hooks and the six stream
flavors kept re-implementing the same lists, guards, tables and dispatch.

The governance half exports `Section` (the four NPM dependency sections), `Default` (the six
exclusion segments), `Suppress` (the contained-throw composer), `Policy` (the update-policy loader),
`Refusal` (the refusal guard), `Activate` (the `activated (...)` string mechanics) and `Update` (the
shared `Dispatch`/`Settle` envelope).

The normalize half exports the six character tables, `Replace` / `ReplaceMap`, and `Chunk` /
`Block`; the `Overpass` arms (`RewriteBlocks`, `StepBatch`, `ToolResults`, `Command`) are exported
too.

**The chain.**

1. A consumer imports a named export from `Target/`; there is no context, no service and no
   registration.
2. The consumer's own config supplies the parameters: `Replace(text, Dashes, replacement)`,
   `Policy(append, file, defaults)`, `Chunk(input, transform, reasoning, toolArgs, raw)`.
3. The transform returns `{ text, count }`; `count === 0` means unchanged, and the caller keeps the
   original by identity.
4. `Refusal` compares the author's manifest with the proposed one and returns `true` (never writing)
   when a non-dependency section would change.
5. The consumer logs the composed line through its own `Append`; the core itself writes nothing.

**The config that matters.** The core registers no schema. Every knob is a function parameter
decided by the consuming module: `Policy`'s built-in `defaults`, `Replace`'s `replacement`, and
`Chunk`'s injected transform. See the package
[README](../../Classic/packages/lib-dsh-core/README.md).

**The safety.** Fail-open by construction: `Policy` falls back to the module's built-in defaults on
any read failure; `Suppress` turns a contained throw into one logger-only line; `Refusal` refuses
rather than rewrites; a zero count is an identity pass-through, not a copy.

**The ledger.** None. The core owns no ledger strings and writes no file; the `Suppress` line, the
`Policy` diagnostics and the `Refusal` line are composed by the core but logged by the module.

**The diagram.** [lib-core.mmd](Classic/lib-core.mmd) and ([SVG](Classic/lib-core.svg)).

### @playform/plugin-dsh-factory

**Classic.** What it does. The factory is the family's first service-provider bundle. It is a class
plugin (`export default class PluginFactory extends Service`, `super(ctx, "pluginFactory")`,
`static inject = ["fs"]`) exposing one service, `ctx.pluginFactory`, with nineteen callable methods
that cover the ledger, the exclusion match, registry discovery and parsing, the union keep-list, the
gate set, the shared write executor, the `fs/observed` re-emit, the detached contained continuation,
the state builder, the fiber-owned wiring, the three lifecycle effects, the P5 journal, the schema
factory, the probe-once seam, the inflight key, and the direct-govern registry and entry.

**The chain.**

1. The loader applies the bundle; the constructor registers `pluginFactory` on the context and the
   service is removed with its owning fiber.
2. A consumer declares `inject: ["fs", "pluginFactory"]`; the loader holds it PENDING until the
   factory exists.
3. `State(ctx, Config, { module, fields })` unwraps the volatile cells and fixes the `Ledger` /
   `Enabled` / `List` mappings.
4. `Gate` runs the gate set in order: target, `govern` marker, actor, kind, Stash idempotence,
   basename, exclusion.
5. `Continue` runs the consumer's transform detached and contained: read, keep-list, transform,
   `GuardedWrite`, message, `Refresh`.
6. `Append` writes the consumer's string to its own ledger; `Govern` runs the registered
   direct-govern steps one at a time.

**The config that matters.** The factory registers no Config of its own - it _is_ the config
machinery. `Schema(shared?, module?)` builds every consumer's schema; `shared: false` emits the
minimal block for non-manifest modules. Volatile cells (`log`, `logFile`, and a consumer's hot
fields) commit through one `loader/volatile-update` dispatch without remounting. See
[SCHEME.md](../../Classic/packages/plugin-dsh-factory/SCHEME.md).

**The safety.** Every primitive is contained: `Append` never throws, `Govern` uses one try/catch per
step and an empty registry is a contained no-op, `Continue` contains the transform's throw and logs
the `Suppress` line. A write carries `replaceIfVersion` at the observed version, so a racing author
write fails safely instead of clobbering.

**The ledger.** The factory owns no ledger strings and writes no activation line.
`Append(state, message)` composes exactly two wrappers around the consumer's message:
`<Module>: <message>` on the logger and `[<ISO>] <message>` appended to the consumer's `logFile`
when `log` is enabled.

**The diagram.** [factory.mmd](Classic/factory.mmd) and ([SVG](Classic/factory.svg)).

### @playform/ets-base-dsh

**The package.** What it does. The base is the single owner of the ETS plumbing. It holds the
structural contracts (`State`, `Options`, `Gate`, `Transform`, `Output`, `Journal`, `Actor`,
`Jobs`), the moved stream machinery (`Update`, `Append`, `Activate`, `Block`, `Chunk`,
`StreamGate`), the Effect services and layers (`LedgerService`, `JournalService`, `WriteService`,
`GovernService`), `materialize()`, and the overpass scaffolding. It is not a plugin: no patch row,
no Config, no listener.

**The chain.**

1. `ets-plugin-dsh-factory` imports the four service layers from the base.
2. `Layer.mergeAll(Ledger, Journal, Write, Govern)` composes them into one layer graph.
3. `Effect.scoped(Layer.build(...))` materializes one runtime in the factory's constructor.
4. Each factory method delegates into that runtime: sync methods through `Effect.runSync`, promise
   seams through `Effect.runPromise`.
5. The hooks consume the factory, never the runtime directly.

**The config that matters.** None. The base exposes no schema; it is configured by the factory's
runtime and by the packages that build on it. The only external dependency is `effect`, pinned at
`4.0.5` in the package manifest.

**The safety.** The layers are `Layer.succeed` closures that read the shell's instance state at call
time, so the runtime holds no scoped resources and the loader's removal needs no extra disposal.
Tracing defaults to no-op, so the ETS tree adds no trace output unless asked.

**The ledger.** None. The ledger strings are composed by the consuming modules and written through
the factory's `Append`; the base supplies only the mechanism.

**The diagram.** [base.mmd](EffectTS/base.mmd) and ([SVG](EffectTS/base.svg)).

### @playform/ets-lib-dsh-core

**EffectTS twin.** The exact package is `@playform/ets-lib-dsh-core`, built on
`@playform/ets-base-dsh` with `effect` pinned at `4.0.5`. Its public surface is thirteen names -
`Section`, `Default`, `Suppress`, `Policy`, `Refusal`, the six tables, `Replace` and `ReplaceMap` -
and it deliberately does **not** carry `Chunk`, `Block`, `Update` or `Activate`: in the ETS tree
those live in the base (`Source/Stream`, `Source/Function/Update.ts`), so the package imports
nothing from `effect` and re-exports neither.

The Effect delta is therefore an inversion of the Classic layout: the pure tables and guards stay
here, the dispatch and envelope move one package down.

The ledger strings are byte-identical to the Classic core's (the core writes none; the `Suppress`,
`Policy` and `Refusal` strings are the same bytes). The diagram is
[lib-core.mmd](EffectTS/lib-core.mmd) and ([SVG](EffectTS/lib-core.svg)).

### @playform/ets-plugin-dsh-factory

**EffectTS twin.** The exact package is `@playform/ets-plugin-dsh-factory`, built on
`@playform/ets-base-dsh` and consumed through the same `ctx.pluginFactory` name. The Cordis shell
stays a `Service` class because the loader contract is not an Effect concept; behind it the
machinery becomes `Context.Service`s provided by `Layer`s composed into one runtime, with sync
methods running through `Effect.runSync` and promise seams through `Effect.runPromise` - no
`RunOptions` are passed, so the caller's abort signal rides the write seam rather than interrupting
a fiber.

The ledger identity is the point: every consumer string is byte-identical to the Classic tree, and
the factory still owns none of them. The diagram is [factory.mmd](EffectTS/factory.mmd) and
([SVG](EffectTS/factory.svg)).

## How the group composes

The factory is loaded first in practice and first by contract: every consumer declares
`inject: ["fs", "pluginFactory"]` (or `["pluginFactory"]` for the normalize flavors), and the loader
holds a consumer PENDING until the service exists, so the bundle-list order never decides whether a
hook can start. `inject` is the ordering mechanism; a profile that lists the governor before the
factory still works.

The library is not a bundle. `@playform/lib-dsh-core` has no `cordis.patch.yml`, no `apply` and no
Config: it is a plain `link:` dependency that the hooks and flavors import. Adding it to
`dsh.profile.bundles` would do nothing, and adding it to `dependencies` alone does not activate
anything.

The dependency shape is flat: the Classic factory declares no runtime dependency at all,
`lib-dsh-core` declares none, and every Classic hook declares both. In the ETS tree the base
declares only `effect` (plus two harness peer dependencies), `ets-lib-dsh-core` declares the base,
`ets-plugin-dsh-factory` declares the base, and every hook declares all three.

The two trees never mix. The Classic tree's `Update` (in `lib-dsh-core`) returns the Classic
dispatch envelope; the ETS tree's `Update` (in `ets-base-dsh`) returns Effect envelopes. A graph
that pulls one hook from each tree type-checks against neither contract, which is why the foundation
overview draws the trees as two separate columns feeding one consumer group.

Consumers type-check against the built factory `Target/`, not its `Source/`. Rebuilding a consumer
before the factory produces stale-Target errors; the family's build order is factory first, then
serialized workspace builds.

## How it plugs into the harness

The Classic bundle row is an `insert:` entry with an empty config:

```yaml
- insert:
      - id: plugin-dsh-factory
        name: "@playform/plugin-dsh-factory"
        config: {}
```

There is no `logFile`, no `log` and no other key, because the factory has no schema of its own. The
service injection is `ctx.pluginFactory`: a consumer reads `const Factory = ctx.pluginFactory`
inside `apply` and builds its state with `Factory.State(ctx, Config, { module, fields })`. The
libraries are imported directly, with no service lookup.

Boot order is: profile bundles -> loader applies the factory -> `pluginFactory` is provided -> the
loader resolves the PENDING consumers -> each consumer's `apply` registers its listeners and logs
its activation line.

The model observes nothing from this group directly; the user observes that the other groups work,
that governed writes do not fight the author's next edit, and that each plugin's ledger answers for
its own activation.

A `file:` dependency alone is not activation. The package must be listed in the profile's
`dsh.profile.bundles` and the host restarted; the bundle layers compose at boot, and the factory's
own patch comment says so explicitly.

## What the user experiences

- Every plugin's ledger exists at `~/.dsh/<identity>.log` and its activation line is the answer to
  "did it start".
- A write performed by a governed tool does not fail the next guarded write: the executor's version
  guard and re-emit keep the author's view coherent.
- The six normalize flavors can be configured with one small block each, because the shared `Schema`
  helper and `State` builder do the unwrapping.
- A plugin that throws inside its listener logs one suppressed line and the host keeps running.
- Nothing in this group writes to the model's transcript; the foundation is invisible by design.

## Sources

- [lib-dsh-core README](../../Classic/packages/lib-dsh-core/README.md)
- [plugin-dsh-factory README](../../Classic/packages/plugin-dsh-factory/README.md),
  [SCHEME.md](../../Classic/packages/plugin-dsh-factory/SCHEME.md),
  [cordis.patch.yml](../../Classic/packages/plugin-dsh-factory/cordis.patch.yml)
- [ets-base-dsh README](../../EffectTS/packages/ets-base-dsh/README.md)
- [ets-lib-dsh-core README](../../EffectTS/packages/ets-lib-dsh-core/README.md)
- [ets-plugin-dsh-factory README](../../EffectTS/packages/ets-plugin-dsh-factory/README.md),
  [SCHEME.md](../../EffectTS/packages/ets-plugin-dsh-factory/SCHEME.md),
  [cordis.patch.yml](../../EffectTS/packages/ets-plugin-dsh-factory/cordis.patch.yml)
