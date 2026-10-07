# DSH Family - Effect-TS v4 Re-Implementation Plan (register #13)

Status: **RESEARCH COMPLETE, PLAN (read-only at the time; nothing edited, nothing committed) — IMPLEMENTED SINCE: all twelve packages now live in `EffectTS/packages/` with 746 checks green (the per-suite counts in §2 are the real ones).** Scope: the
twelve Classic packages (`Classic/packages/`, behavior contract), the local Effect-TS v4.0.1
checkout, the DSH seam docs
(the deepseek-harness docs checkout), the family docs
(`DeepSeek/Documentation/Handoff/Register.md` #13/#14, `Documentation/Guides/Governor-SCHEME.md`,
`Documentation/Reports/Commonalization-AUDIT.md`). Deliverable
dir: `DeepSeek/EffectTS/` (already in the root `pnpm-workspace.yaml` as `EffectTS/packages/*`).

Goal restated: re-implement all twelve packages on **Effect-TS 4.0.1** so the family gains (a)
composition with other Effect transformers, (b) external trace-ability via Effect spans, (c)
ecosystem interop - while the **ledger strings stay byte-identical** (Classic
smokes are the arbiter; the EffectTS smokes add coverage - 746 checks vs Classic's 733) and
**#14 (the parallel-govern toggle)** is designed in.

---

## 1. The Effect v4 construct mapping

Exact v4.0.1 API names verified in the checkout (`packages/effect/src/*.ts`):
`Context.Service`/`Context.Reference` (Context.ts:201/:1327), `Layer.succeed/effect/provide/merge`
(Layer.ts:805/:1012/:1429/:1296), `Effect.gen/tryPromise/acquireRelease/forEach/all` with
`Effect.all`'s options `{ concurrency, discard, mode }` (Effect.ts:491), `Effect.withSpan`/
`withSpanScoped` (Effect.ts:8388/:8429), `Effect.annotateCurrentSpan` (Effect.ts:8106),
`Effect.timed` (Effect.ts:4732), `Effect.runPromise(effect, options?: RunOptions)` with
`RunOptions { signal }` (Effect.ts:9051/:8833), `Effect.runFork` (Effect.ts:8869),
`Effect.forkChild/forkIn/forkScoped/forkDetach` (Effect.ts:8595/:8638/:8681/:8721 — v4 has NO
`fork`/`forkDaemon`; `forkChild` auto-supervises, `forkIn(scope)` ties the fiber to a given Scope),
containment via `Effect.ignore` (Effect.ts:4251), `Effect.catchIf`/ `catchCause`/`onError`
(Effect.ts:3418/:3258/:6851 — NO `catchAll` in v4), `Fiber.join/interrupt/interruptAll`
(Fiber.ts:304/:379/:472),
`Stream.fromAsyncIterable/map/mapEffect/flatMap/concat/suspend/toAsyncIterable`
(Stream.ts:1284/:1696/:1861/:2268/:2860/…/:11612 — NO `mapConcat` in v4; multi-emission per element
is `Stream.flatMap` + `Stream.fromIterable`), `Queue.unbounded/bounded/offer/take`
(Queue.ts:630/:519/:664/:1453), `Tracer` interface (Tracer.ts:29) - plus `@effect/opentelemetry`
`NodeSdk.layer` (packages/opentelemetry/src/NodeSdk.ts:113) and `@effect/platform-node`
`NodeFileSystem.layer` (packages/platform/node/src/NodeFileSystem.ts:21), `@effect/vitest`
`it.effect/layer/prop` (packages/vitest/src/index.ts:198/:249/:282).

### 1.1 hook-dsh-core - the pure helpers

| Classic piece                                                                                           | Effect-TS v4 decision                                                                                                                                                                                                                                                                                                                                                            | Why                                                                                                      |
| ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `Normalize/Replace`, `ReplaceMap`, the six tables (`Dashes/Quotes/Ellipsis/Spaces/Invisible/Fullwidth`) | **Stay pure data/functions, byte-identical.** Exported unchanged; wrapped, not rewritten                                                                                                                                                                                                                                                                                         | Parity: the tables are the smoke contract's engine; a rewrite risks drift for zero gain                  |
| `Stream/Chunk`, `Stream/Block`, `Stream/Strip` (the stateful chunk reducer)                             | Keep the reducer pure; expose it as a real **`Stream<A, E, R>` transformer**: `Stream.suspend(() => state)` for the per-call state (the CurrentCall/RawCall map by tool-call id), `Stream.map` per chunk, `Stream.flatMap` + `Stream.fromIterable` where a chunk fans out, `Stream.concat` where sections merge                                                                  | A genuine `Stream` is the ecosystem hook point - other Effect transformers `pipe` directly onto the gate |
| `Function/Update` (the Dispatch/Settle envelope builder)                                                | Re-issued as an **Effect builder**: same `Dependencies` shape, but returns `{ Dispatch: Effect<...>, Settle: Effect<number> }`; the detached continuation via `Effect.forkIn(pluginScope)` (in-flight fibers interrupted at plugin dispose - the Classic inflight-disposal semantics for free) or `Effect.forkDetach` for the unobserved fallback; abort via `RunOptions.signal` | Typed errors, interruption, and a span around every stage                                                |
| `Function/Activate` (the activation-line composer)                                                      | Pure function unchanged                                                                                                                                                                                                                                                                                                                                                          | It only formats the byte-identical string                                                                |
| `Suppress`, `Policy`, `Refusal`                                                                         | Pure functions unchanged (used inside effects)                                                                                                                                                                                                                                                                                                                                   | No I/O, no need for effect wrappers                                                                      |

The core keeps **zero harness dependencies** but gains exactly one runtime dependency: `effect`
(this is the register's stated goal - the core becomes a composable Effect library).

### 1.2 plugin-dsh-factory - the service machinery

The factory's **harness shell stays a cordis `Service` class** (`extends Service`, the
default-export object with `inject: ["fs"]`, the instance state SharedJournal/
PendingJournal/RegisterGovern) - that shell is the loader contract and is not an Effect concept.
Behind it, every piece of machinery becomes an **`Context.Service`** (`Context.Service("...")`)
provided by `Layer.effect`/`Layer.succeed` layers, composed with `Layer.merge`/`Layer.provide`; the
shell delegates into the runtime:

| Classic                                                                                                                      | Effect service / layer                                                                                                                                                                                                                                                                                                                                                                                                            |
| ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `State` (the per-module state builder)                                                                                       | `Layer.effect` producing the module's state; mutable maps stay plain `Map`/`Set` (single-fiber ownership; `Ref` only where concurrent access is designed)                                                                                                                                                                                                                                                                         |
| `Append` (the ledger file)                                                                                                   | `LedgerService.append(msg): Effect<void>` - logger first (`${module}: ${msg}`), then `[ISO-8601 timestamp] msg` appended via plain `node:fs` (the documented exemption - `ctx.fs` has no append); `Effect.withSpan("dsh.ledger.append")` + `Effect.timed`; never fails the caller (`Effect.ignore` wrapping)                                                                                                                      |
| `Journal` (the P5 storage domain)                                                                                            | `JournalService.record(event, path, detail)` - wraps the plain `ctx.storageDomain` domain handle (see 1.4); the routing (SharedJournal → PendingJournal buffer cap 256 → per-State queue) stays in the shell; domain `package_governance` v2, `layout: "per-record"`, `compatibleVersions: [1]`, `invalidRecords: "backup-and-skip"`, `events` table (the enum `activated/governed/dispatched/update-failed/excluded/normalized`) |
| `Write`/`GuardedWrite` (the shared write executor per `Documentation/Reports/Commonalization-AUDIT.md` §3)                                         | `WriteService.write(target, content, Over): Effect<FsWriteOutcome>` - the audit's option bundle (`intent/signal/policy/actor/observe/stash/transform`) becomes the record's argument shape                                                                                                                                                                                                                                        |
| `Govern` (the direct fold)                                                                                                   | `govern(target, selection): Effect<void>` - see 1.3                                                                                                                                                                                                                                                                                                                                                                               |
| `Continue`/`Refresh`/`Attach`/`Wire`/`Seam`/`Schema`/`Gate`/`Match`/`Discover`/`Parse`/`Unwrap`/`UpdateKey`/`Resolve`/`Open` | Each a service method on the same `FactoryService` interface; `Gate`/`Match` stay pure inside                                                                                                                                                                                                                                                                                                                                     |

The factory owns **the runtime**: `apply()` builds one `Layer` graph, `Effect.runtime` materializes
it, and the plain-async seams call back into it through `Effect.runPromise(effect, { signal })` /
`Effect.runFork` (see 1.4).

### 1.3 The governance chain + tracing spans + the #14 toggle

The chain (event path `Observe → Gate → Discover → Read → Transform → Write → Refresh → Dispatch`,
and the direct `Govern` fold) becomes typed effects, each wrapped in a span:

- root: `Effect.withSpan("dsh.govern", { attributes: { target, basename } })`
- steps: `dsh.gate`, `dsh.discover`, `dsh.chain-pass`, `dsh.write` (intent + policy as span
  attributes), `dsh.refresh`, `dsh.update.dispatch`, `dsh.update.stage`, `dsh.journal`,
  `dsh.ledger.append` - nested automatically by `withSpan`; extra facts via
  `Effect.annotateCurrentSpan("step", name)` / `("exitCode", code)`; durations free via
  `Effect.timed` where a count is journaled.
- **#14 toggle, designed in from the start**: the `govern` Selection gains a parallel marker (the
  same flag shape, e.g. a `Selection` object `{ steps, parallel }` alongside the legacy
  boolean/string/array form). Implementation is a single switch: sequential =
  `Effect.forEach(steps, run, { concurrency: 1, discard: true })`; parallel =
  `Effect.all(steps.map(run), { concurrency: "unbounded", mode: "default", discard: true })` -
  Effect's `Fiber` scheduling replaces `Promise.all`. Documented safety condition (unchanged from
  #14): disjoint targets only; same-file steps race. Default stays sequential (the live-verified
  race fix; confirmed: no parallel hooks exist in the Classic code). Every step keeps its own
  contained error (`Effect.ignore`/`Effect.catchIf`/`Effect.onError`) for the silence invariant.
- The event path's ordering guarantee: one consumer **fiber** per module draining a
  `Queue.unbounded` in FIFO order (see 1.4), so the idempotence (`Stash.get(targetKey)`) and
  version-guard (`replaceIfVersion`) semantics are unchanged.
- Verified invariants to preserve exactly (from the Classic sources): the write version is a **fresh
  stat after the transform** (never the observed version - the fold-convergence fix); the Stash
  pre-registration happens before the same-actor re-emit; the update stage's in-flight key is
  namespaced `update:<targetKey>` so the chain pass's plain-key cleanup cannot clobber it; the Gate
  order is `target → govern → actor → kind → idempotent → basename → excluded`.

### 1.4 The DSH seams - the boundary design

The harness seams are plain async (verified in `docs/subsystems/filesystem.md:185-526`,
`docs/subsystems/llm-streaming.md:1125`, `docs/cookbook/adding-a-tool.md:12-47`,
`docs/subsystems/storage.md`); the Effect side wraps them at exactly four boundary types:

1. **`llm/stream` waterfall** - plain signature `(options, next) => AsyncIterable<StreamChunk>`. The
   listener builds `Stream.fromAsyncIterable(next(), onError)` → pipes the gate stream (1.1) →
   returns `Stream.toAsyncIterable(stream)`. Pure-adapter boundary; no fibers leak.
2. **`fs/observed`** - a _synchronous, side-effect-only_ broadcast (filesystem.md:185): the
   registered listener is a plain sync function that does exactly one thing:
   `Effect.runSync(Queue.offer(queue, event))`. A dedicated consumer fiber (`Effect.runFork`,
   started in `apply` from a `Layer.scoped` whose release closes the fiber) drains `Queue.take` →
   the govern effect (`Effect.runPromise` + swallowed `Exit`) - the Classic "sync listener +
   detached continuation" shape, typed.
3. **`fs/write-intent` / tool exec / storage domain** - plain `Promise` seams: each Effect
   implementation runs through `Effect.runPromise(effect, { signal: exec.signal })`
   (`RunOptions.signal` maps the harness abort to fiber interruption - adding-a-tool.md:44-47).
   `ctx.storageDomain` stays plain; it is acquired once in a service layer (`Effect.acquireRelease`
   around `open(spec)`/`close()`).
4. **Plugin lifecycle** - the loader contract is unchanged (default-export object with
   `name/apply/Config/inject`; `apply` returns nothing - Governor-SCHEME.md §7 (now
   `Documentation/Guides/Governor-SCHEME.md`), HANDOFF fixes 1-2).
   `apply` starts the runtime (layers + fibers); the plugin's dispose effect (registered via the
   harness's effect-disposal seam) closes the scope, interrupting all forked fibers
   (`Fiber.interruptAll` semantics via the Scope).

### 1.5 The module leaves (what the factory never absorbs - unchanged in kind)

- Transforms: pure functions, byte-identical outputs.
- Update engines: ncu (library import inside the continuation / `ncuBin` via
  `ctx.subprocess.resolveExecutable` + spawn) wrapped in `Effect.tryPromise`; the child stage keeps
  its exit-code mapping; `ctx.subprocess` stays a plain seam.
- Ledger strings: every string in a module-owned `Lines` const object, byte-identical (e.g.
  `governed <path> → <version>`,
  `update stage dispatched for <dir> (mode=bin, ncu via <ncuBin>, built-in default policy)`,
  `normalized N spaces char(s) in one stream`, the `activated (...)` line) - asserted by the smokes
  verbatim.

---

## 2. The per-bundle package plan

Implementation order (dependency order; one coder package per bundle, smokes as the arbiter, nothing
committed by agents - the user commits):

| #    | Package (`EffectTS/packages/<name>`, same identity as Classic)  | Depends on     | Smoke     |
| ---- | --------------------------------------------------------------- | -------------- | --------- |
| 1    | `hook-dsh-core` (lib; one `effect` runtime dep)                 | -              | 17 checks |
| 2    | `plugin-dsh-factory`                                            | core           | 41        |
| 3    | `hook-dsh-normalize-spaces` (the flavor pattern pilot)          | core + factory | 62        |
| 4    | `hook-dsh-governor-package` (the deep consumer)                 | core + factory | 81        |
| 5    | `hook-dsh-pinner-package`                                       | core + factory | 32        |
| 6    | `hook-dsh-governor-cargo`                                       | core + factory | 62        |
| 7-11 | `hook-dsh-normalize-{dash,quotes,ellipsis,invisible,fullwidth}` | core + factory | 132, 62×4 |
| 12   | `hook-dsh-normalize-file`                                       | core + factory | 71        |

**Source layout** mirrors Classic (`Source/Function|Interface|Variable`, `Library.ts`,
`Configuration/ESBuild.ts`, `cordis.patch.yml`) so diffs between the two releases are mechanical:
pure helpers keep their file names; each factory API gains a sibling `Service/*.ts` (the
`Context.Service` + `Layer` definitions) while the `Function/*` files become the effect bodies. New
files only where the runtime lives: `Source/Runtime.ts` (the layer graph + the run helpers) per
package that starts fibers.

**Smoke parity approach.** The Classic smokes stay the behavioral reference, untouched. The EffectTS
smokes reuse the _same harness pattern_ (fake-ctx + real built factory) with two small adaptations
and zero assertion changes:

- The fake ctx stays plain; all Effect execution stays _inside_ the plugin code, behind the four
  boundaries of 1.4 - so the smokes observe the same plain seams and the same ledger files. Each
  smoke file is the Classic file with the import path pointed at
  `EffectTS/packages/<bundle>/Target/Library.js`.
- Where a smoke needs a value an Effect API produces (e.g. draining a queue in tests), the smoke
  calls `Effect.runPromise` on the exported effect directly - additive, not replacing the arbiter.
- Optional additive second suite (not the arbiter): `@effect/vitest` (`it.effect`, the `layer`
  helper) for the service layers, enabling typed-error and interruption tests.

---

## 3. The tracing design

What gets traced (span names, per 1.3) and how it leaves the process:

- **Default**: Effect's no-op `Tracer` - zero cost, no behavior change (silence invariant).
- **External surface, option A (recommended default)**: `@effect/opentelemetry`
  `NodeSdk.layer({ spanProcessor })` provided at the runtime root (factory's `Source/Runtime.ts`),
  with an OTLP `SpanProcessor`/exporter when configured - spans land in any OTel collector
  (Tempo/Jaeger; the pattern is the v4 docs' `NodeSdk.layer` example,
  `effect-ts-website/.../v4/observability/tracing.mdx:225-171`).
- **Option B (harness-native)**: a custom `Tracer` service implementing Effect's `Tracer`/`Span`
  interface (Tracer.ts:29/:372) that forwards spans onto the harness's own otel subsystem
  (`docs/subsystems/otel.md`) - spans then appear in DSH's existing telemetry pipeline. Design the
  `Tracer.make`-shaped adapter behind a config knob; implement only if the harness otel seam is
  reachable from a root plugin.
- Span hygiene: spans never alter ledger strings, ordering, or timing-sensitive gates; attributes
  are read-only facts (path, basename, step, mode, exit code, counts). The trace can be
  added/removed without smoke changes (a smoke run with tracing on must produce byte-identical
  ledgers - add that as an extra smoke mode).

---

## 4. Risks + sequencing

**Harness-integration risks**

1. `fs/observed` listeners must be sync and side-effect-only (filesystem.md:185) - the queue +
   consumer-fiber bridge (1.4) is mandatory; a violation breaks the tool call.
2. Generator early-return: the harness may abandon the `llm/stream` iterable;
   `Stream.toAsyncIterable` must propagate the abort (verify with a cancellation smoke before the
   flavors land).
3. `runPromise` boundaries everywhere: never let a rejected promise escape a listener
   (`Effect.runPromiseExit` + swallow) - the silence invariant is a _containment_ property.
4. Dispose/lifecycle: plugin effects and forked fibers must close on unload; map the harness
   effect-disposal to Scope close; interrupted writes must not half-journal.
5. Dual-implementation coexistence: the EffectTS bundles ride the same desktop profile alongside
   Classic while onboard - distinct bundle entry ids and ledger file names (`~/.dsh/hook-dsh-*.log`
   collision risk) are required; decide the id suffix at the release step (#15 naming), the smoke
   parity is name-agnostic.

**Parity risks**

6. Ledger strings byte-identical: keep every string module-owned; the smoke diff (Classic vs
   EffectTS outputs on identical fixtures) is the release gate.
7. Ordering/timing: the single-consumer-fiber FIFO (1.3) preserves the sequential-fold and
   idempotence semantics; the parallel toggle is opt-in only.
8. The cordis patch config replaces wholesale (FSOBSERVED-DELIVERY.md, now
   `Documentation/Reports/FSOBSERVED-DELIVERY.md`) - the EffectTS
   `cordis.patch.yml` files must repeat the full config object, including `raw-write` in
   `mutationTools`.

**Rollout (per `Documentation/Handoff/Register.md` #13: research first, then a coder package per bundle)**

- R1: core (stream gate + tables + Update envelope in Effect) → smoke 17/17.
- R2: factory (services, layers, runtime, govern toggle) → smoke 41/41.
- R3: governor-package (the full chain end-to-end, tracing spans on) → 81/81.
- R4-R6: pinner → cargo → normalize-file; R7: the six flavors (pilot spaces first).
- R8: tracing wiring (`NodeSdk.layer`) + the parallel-mode smoke scenarios (sequential order
  assertions + parallel race-verified scenarios, per #14).
- Each stage: coder subagent → smoke green → user commits; Classic stays live throughout; the
  EffectTS ships smoke-covered before any switchover (the swap happens only after its smokes prove
  parity).
