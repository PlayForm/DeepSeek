---
title: 06-harness-integration - how the family attaches to the host
category: Diagram
kind: reference
date: 2026-10-21
status: active
---

# 06-harness-integration

> **The capability.** This folder is the seam and not a plugin. It explains how the 31 packages
> attach to the DeepSeek Harness: the Cordis loader that reads the profile, the `insert:` rows that
> compose the bundle layers, the `apply` that registers listeners and tools, the five event surfaces
> the family uses, the write path that carries a mutation tool to governed disk, and the stream path
> that carries a model delta to the transcript. It also states exactly what is active in this
> desktop profile and why the two release trees must never meet.

## The host in one page

The **Cordis loader** composes the host from bundle layers at boot. A profile `package.json` names
the bundles in `dsh.profile.bundles`, and the profile `cordis.patch.yml` carries the config rows.
The loader reads `Target/Library.js` of each bundle, evaluates its `Config` (a Schemastery schema),
and calls its `apply` with the context.

The **plugin contract** is four fields on the default export: `name` (the identity, in agreement
with the package name), `apply` (returns nothing, because a returned value silently kills event
delivery), `Config` (validated at load and failing loud), and `inject` (the services that the plugin
needs).

`inject` is also the ordering mechanism: the loader holds a consumer PENDING until its services
exist, so the order of the bundle list never decides whether a listener registers.

The **services** that the family uses are `fs` (read, resolve, write, and the observation policy),
`tools` (register a tool, read the live registry), `jobs` (the controller behind an unowned
background job), and the own `pluginFactory` of the family (the 19-method service that the Classic
and ETS factories provide). A service is reached through `ctx.<name>` and only after it is declared
in `inject`, and otherwise the accessor throws.

The **event bus** is the waterfall and event dispatch of Cordis. The family attaches to four event
seams: `llm/stream` (the interceptable wrapper around every streaming model call), `fs/observed`
(the event that every tool-layer write dispatches after content is on disk), `tools/pre-execute` and
`tools/post-execute` (the two waterfalls of the tool pipeline), and `system-prompt/assemble` with
`agent/pre-step` (the prompt and step surfaces).

The fifth surface is the loader/service surface, where activation happens.

The **tool pipeline** runs a call through `tools/pre-execute` (a waterfall that may deny), then the
execute of the tool, then `tools/post-execute` (a waterfall that may replace the model-visible
result), and then the result becomes model content. A tool result is built from what the tool
produced, and for a write tool from the own content of the author, never from a disk re-read.

The **LLM stream** is the waterfall that the model call passes through: a listener may wrap the
chunk stream, but it must call `next()` first, must not touch the deep-frozen options, and must
preserve order without buffering. The six normalize flavors are the only listeners of the family
that rewrite model output.

The **ledger** is the own durable record of the family: one file per plugin,
`~/.dsh/<identity>.log`, one `[<ISO>] <message>` line per event, with the activation line written by
`apply`. It answers "did it activate", independent of the own logs of the host.

## The four diagrams

**boot-and-wiring** ([.mmd](boot-and-wiring.mmd), [SVG](boot-and-wiring.svg)) is the top-down
hierarchy: the profile `package.json` and `cordis.patch.yml` feed the loader, the loader calls
`apply`, the services resolve, the factory builds the state and the wiring, the plugin registers its
listeners and tools, and the activation line lands in its ledger.

Look for the two failure notes: a returned value from `apply` kills event delivery, and a `file:`
dependency without a bundle-list entry never reaches `apply` at all.

**event-surfaces** ([.mmd](event-surfaces.mmd), [SVG](event-surfaces.svg)) is the map of the four
event seams and of the groups that attach. `llm/stream` carries the six normalize flavors,
`fs/observed` carries the governance trio and the `Wire`/`Write` of the factory, `tools/pre-execute`
and `tools/post-execute` carry the guardians (and the tool-results arm of normalize), and
`system-prompt/assemble` and `agent/pre-step` carry the guardians and live-containers.

Look for what is _not_ there: the foundation attaches no listener of its own.

**write-path** ([.mmd](write-path.mmd), [SVG](write-path.svg)) follows one mutation tool:
`tools/pre-execute`, then `fs/write-intent` (the version guard), then the write executor, then
`ctx.fs.writeText`, then `fs/observed` with the fresh version and the same actor, then the
governance gate, the contained continuation, the guarded write, and the P3 re-emit.

Look for the two silences: the tool result is built from the own content of the author, and a
listener throw becomes a suppressed line and not a failed write.

**stream-path** ([.mmd](stream-path.mmd), [SVG](stream-path.svg)) follows one model delta:
`llm/stream`, the six flavors (each wrapping the next, order-independent), the tool-arguments gate
with its `edit` / `raw-write` / `normalize-file` exemptions, and the yield to the live UI and the
durable transcript.

Look for the two defaults: `normalizeReasoning` on and `normalizeToolArguments` off.

## Activation vs dependency

A **`file:` or `link:` dependency is not activation.** The `dependencies` of the profile can list
every package in the family and nothing will run. Activation is the `dsh.profile.bundles` list plus
a restart, because the bundle layers compose at host boot, so a running host does not pick up a new
entry until it restarts.

A **`cordis.patch.yml` `insert:` row** adds an entry to the composed configuration. The rows of the
family are one insert per bundle, with the own config keys of the module.

A bare `id:` row does something different: it **patches an existing entry**, and the loader rejects
an unknown id with `entry "..." not found`. That is why every family bundle ships `- insert:`, and
why a profile that wants to override a shipped cell writes a bare `id:` row against the entry that
the bundle already inserted; the `notes.persistent` override of tool-coach and the `enabled: true`
override of live-containers are exactly that.

The identity lives in four agreeing places: the package name, the `name` export, the `module:`
option of the State build, and the `logFile` default of the ledger. A rename that misses one of them
gives a plugin that loads but writes to the wrong ledger, or a ledger line whose prefix disagrees
with its file.

## The ledger contract

**One log per plugin.** The path follows `~/.dsh/<identity>.log`, and the identity is the own one of
the module: `hook-dsh-package-governor.log`, `ccr.log`, `hook-dsh-normalize-dash.log`,
`plugin-dsh-normalize-file.log`, `live-containers.log`. The factory has no ledger of its own, and it
appends into the file of the caller.

**The activation line is written by `apply`.** "Did it activate" must be answerable from the ledger
alone:
`hook-dsh-package-governor: activated (anywhere mode, logFile=..., updateMode=programmatic, ...)`,
`ccr: activated (bundle 0.1.0, targets 8, budget 268435456)`, and
`live-containers: disabled (enabled=false)` on a cold mount.

**The strings are byte-identical.** The smoke suites assert every activation line, refusal line,
chain-pass line, and journal record byte-identically, in both trees. The one exception is an
identity change by design: a package rename changes the own strings of that module and is recorded
as a rename.

The ETS tree keeps the Classic strings, which is why `ets-hook-dsh-tool-coach` writes
`hook-dsh-tool-coach.log` with no `ets-` prefix, and why `ets-hook-dsh-ccr` writes the same
`~/.dsh/ccr.log` path as the Classic CCR.

**The `~/.dsh/` convention** keeps the history of every module in one directory, so a support
question is answered by listing the logs and reading the activation lines. The timestamps are ISO
UTC in the ledger lines, and the storage journal uses epoch milliseconds.

## What is active in this profile

The desktop profile (`~/.dsh/profiles/desktop/package.json`) lists **all 14 Classic plugin bundles**
in `dsh.profile.bundles`: the factory, the three governance hooks, the normalize-file bundle, the
six normalize flavors, CCR, tool-coach, and live-containers. `@playform/lib-dsh-core` is the library
that those bundles depend on and not a bundle, so it is a `link:` dependency with no row. The
profile `cordis.patch.yml` carries one config row per bundle, and for live-containers it overrides
the shipped `enabled: false` of the package with `enabled: true`.

The **16 EffectTS packages are a parallel release and are not active in this profile.** They are
published, built, and smoke-tested as the same contract behind Effect 4.0.5, but no `ets-*` package
appears in the bundle list or the dependencies of this profile. Nothing in this profile runs the ETS
tree.

At authoring time the ledgers under `~/.dsh/` are the Classic ones: `ccr.log`,
`hook-dsh-package-governor.log`, `hook-dsh-package-pinner.log`, `hook-dsh-cargo-governor.log`, the
six normalize logs, `plugin-dsh-normalize-file.log`, and `hook-dsh-tool-coach.log`. There is no
`~/.dsh/live-containers.log` yet, so the live-containers activation is a config fact (the profile
row says `enabled: true`) and not a ledger fact in this session.

## Why two trees

The family is **one contract expressed twice**: plain TypeScript in `Classic/`, and Effect 4.0.5
services and layers in `EffectTS/`. Both trees implement the same loader contract, the same event
surfaces, the same config keys, and the same ledger strings. The ETS tree exists to prove that the
contract is not tied to a runtime: the Cordis shell stays a `Service` class, and behind it the
mechanism becomes `Context.Service`s that `Layer`s provide and compose into one runtime.

**Never mix the two trees in one dependency graph.** The difference that forces this is the `Update`
envelope: the Classic `Update` (in `lib-dsh-core`) returns the classic `Dispatch`/`Settle` pair,
while the ETS `Update` (in `ets-base-dsh`) returns Effect envelopes. A graph that pulls one hook
from each tree type-checks against neither contract.

The two trees also share some ledger paths (`ccr.log`, `live-containers.log`,
`hook-dsh-tool-coach.log`), which is safe only because they are never active together.

**The Effect envelope difference** shows at the edges: the ETS `Dispatch` is
`Effect<void, never, Scope.Scope>` and forks the detached continuation into the scope of the caller,
so disposal interrupts the fiber; `Settle` is an `Effect`; and the promise seams run
`Effect.runPromise` with the long-lived scope of the state provided. The Classic tree uses promises
and a detached continuation. The bytes on disk are the same.

## What the user experiences

- A restart is the only way to activate a bundle, and a dependency alone changes nothing.
- The ledger of each plugin answers for its own activation, in one directory.
- The result of a write tool and the governed file can disagree, and the ledger is the only place
  that says so.
- The model sees the normalized transcript and the compressed tool output, and the user sees the
  same transcript and the ledgers.
- The ETS tree can run somewhere else, and this profile keeps running the Classic one.

## Sources

- [PLUGIN-FAMILY.md](../../Documentation/Plugins/PLUGIN-FAMILY.md) - the registry
- [plugin-dsh-factory cordis.patch.yml](../../Classic/packages/plugin-dsh-factory/cordis.patch.yml) -
  the activation comment
- [package-governor cordis.patch.yml](../../Classic/packages/hook-dsh-package-governor/cordis.patch.yml) -
  the `insert:` vs bare `id:` rule
- [live-containers cordis.patch.yml](../../Classic/packages/hook-dsh-live-containers/cordis.patch.yml) -
  the ships-disabled row
- [ets-plugin-dsh-factory SCHEME.md](../../EffectTS/packages/ets-plugin-dsh-factory/SCHEME.md) - the
  Effect runtime and the envelope
