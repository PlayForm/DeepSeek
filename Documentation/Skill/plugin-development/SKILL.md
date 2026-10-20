---
name: plugin-development
description: THE operating manual for authoring DeepSeek Harness (DSH) plugins against the Cordis plugin API — the five dispatch modes, plugin anatomy, Config schemas, services, fibers/effects/HMR, tools, packaging, performance pressure rules, the well-integrated checklist, and a verified pitfalls catalog. Load before writing, refactoring, or reviewing ANY dsh plugin.
whenToUse: Mandatory before creating a plugin bundle, hooking a cordis event, exporting a Config schema, providing/consuming a service, registering a tool, packing a bundle, or diagnosing why a plugin did not activate. If you are about to write plugin code without having applied this manual, stop and read it first.
---

# DSH Plugin Development - Operating Manual

THE operating manual for authoring DSH plugins against the Cordis plugin
API. Sources: `~/Developer/Documentation/Module/deepseek-harness/docs/`
(citations `file.md:line`), plus live verification against the running host
and a fully shipped production plugin (`@local/dsh-hook-package-governor`,
this machine). A DSH plugin is a cordis plugin: it receives `ctx` and
`config`, declares what it needs, and integrates ONLY through the API - the
harness is a microkernel with no privileged core to patch, so free-floating
Node.js inside a plugin is the anti-pattern. The full philosophy lives in
the references; this file is the index.

## The One Sentence

- **Plugin equals cordis plugin** - see ./references/one-sentence.md
  Integrates only through events, services, tools, config schemas, effects;
  the microkernel has no privileged core to patch.

## The API Map

- **The eight seams** - see ./references/api-map.md
  Events, Config, Services, Tools, Effects, Logger, Subprocess/Sandbox,
  Jobs - each seam a capability with the three roles (definition, provider,
  consumer).

## Event Bus - the Five Dispatch Modes

- **The dispatch table** - see ./references/dispatch-modes.md
  `emit | parallel | serial | bail | waterfall`; awaited, order, and return
  semantics per mode; the mode is public contract.
- **Waterfall discipline** - see ./references/waterfall.md
  Observers MUST call `next()`; omitting it silently swallows the default
  behavior downstream; `prepend: true` only when ordering matters.
- **Listener registration and scoping** - see ./references/event-listeners.md
  `ctx.on` returns a disposer owned by the fiber; `ctx.once`; `global?`;
  `Context.filter` consulted on every dispatch; root listeners hear all.

## Plugin Anatomy

- **Export shapes, loading, Inject** - see ./references/plugin-anatomy.md
  Function/Constructor/Object shapes; loud load failure; `inject` array vs
  intercept-object form; never return from `apply`.
- **Typed vocabulary** - see ./references/declaration-merging.md
  Declaration merging into `Context` and `Events` for typed accessors and
  events.

## Config Contract

- **Schema, validation, tunables, volatile, hot-replace** - see
  ./references/config-contract.md
  Real `Schema.object` with defaults, fail-loud validation, every tunable a
  config field (the cordis.yml test), volatile cells, `!!js` scope, config
  edits hot-replace the plugin.

## Services

- **Service base class, provide/get/set, dependency tracking** - see
  ./references/services.md
  `super(ctx, name)`, static hooks, PENDING-until-satisfied (load order
  never matters), optional deps by probing, the no-service archetype.

## Fibers & Effects

- **Lifecycle, disposal order, raw resources, HMR** - see
  ./references/fibers-and-effects.md
  Fiber state machine, reverse-order disposal, async disposers run
  concurrently, wrap raw resources in `ctx.effect`, stable row ids for
  HMR diffs.

## Tools

- **defineTool and the output contract** - see ./references/tools.md
  Typed parameters, one canonical JSON value, pure render, readonly after
  registration, honor `exec.signal`.
- **The execution pipeline and selection rule** - see
  ./references/tool-pipeline.md
  pre-execute -> guard -> execute -> projectContent -> post-execute ->
  finalizeContent -> result; guard monotonic; presenters pure.

## Performance & Pressure Rules

- **emit listeners are synchronous recorders** - see
  ./references/performance-pressure.md
  The fs/observed rule (no awaits, no throws, no I/O), heavy work via
  `ctx.jobs.start`, config-owned throttles, contained exceptions,
  model-visible means logged.

## Packaging & Activation

- **Bundles, patch rows, profiles, layers, installs** - see
  ./references/packaging.md
  `dsh.bundle` patch layers, `- insert:` vs override-by-id (config replaced,
  not merged), layer order, peer deps, the directory-link dev loop,
  same-version reinstall is a no-op.

## Well-Integrated Plugin Checklist

- **The 15-item review list** - see ./references/checklist.md
  Single entry, declared injects, real schema, tunables as config fields,
  effects everywhere, one-disposer teardown, waterfall discipline,
  synchronous emit recorders, seam-only I/O, policy as listeners,
  defineTool rules, declaration merging, logger not console, packaging per
  publish.md, HMR idempotence.

## Pitfalls Catalog (verified on this machine)

- **The 19 verified pitfalls** - see ./references/pitfalls-catalog.md
  FsTarget shape, positional fs/observed payload, bare id rows, ncu argv,
  unawaited emit, unresolvable imports, import.meta.dirname, stale
  versions, shadowed globals, PATH, CJS defaults, activation verification,
  ambiguous-install, emit-throw after mutation, default-object shadowing,
  apply return values, root jobs controller, sandbox policy at root, pnpm
  workspace swallowing.

## Documented Gaps

- **Known incompleteness, don't over-document** - see
  ./references/documented-gaps.md
  No-schema pass-through, Plugin.Transform without examples, the waterfall
  "Awaited? No" cell, cooldowns are not a framework concept.

## Source Documents

- **Where the truth lives** - see ./references/source-documents.md
  The cited docs (cordis-api, user/develop, subsystems, cookbooks) and the
  live template `@local/dsh-hook-package-governor`; live behavior wins on
  conflict.
