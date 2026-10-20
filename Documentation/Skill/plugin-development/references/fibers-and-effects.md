# Fibers and Effects: Lifecycle, Disposal Order, Raw Resources, HMR

> Source: SKILL.md, section 6 "Fibers & effects". Sources: fiber.md:6,
> 8-37, 276-309; tutorial 02:70-80, 5, 84-92; framework/index.md:63;
> tutorial 06:23-59.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

- "A fiber is one loaded plugin instance: lifecycle state, validated
  config, registered effects" (fiber.md:6). State machine:
  `PENDING → LOADING → ACTIVE → UNLOADING → DISPOSED` (tutorial 02:70-80).
  PENDING = a required service is missing; FAILED = apply/config threw.
- `ctx.effect(execute, label?)` - execute runs immediately; collected
  disposers run in reverse registration order on unload; async disposers
  run concurrently, so keep order-dependent cleanup inside ONE disposer
  (fiber.md:8-37, 276-309; framework/index.md:63).
- Anything raw (timers, watchers, connections, child processes) must be
  wrapped in `ctx.effect(() => disposer)` - module-level side effects are
  not unwound (tutorial 02:5, 84-92).
- HMR: `dsh-hmr` watches files; the old instance unloads (all effects
  unwind), new code loads, apply runs again (tutorial 06:23-59). Stable
  `id`s in patch rows are required so config edits diff correctly - an
  entry without one gets a generated id and remounts on every edit.

## Why: The Full Philosophy

1. The fiber is the unit of correctness: everything a plugin registered -
   listeners, services, effects - belongs to the fiber and disappears with
   it. This is why "no manual bookkeeping, ever" holds for listeners (see
   ./references/event-listeners.md) and services (see
   ./references/services.md).
2. Reverse-order disposal mirrors registration: later registrations may
   depend on earlier ones still being live while they unwind. But because
   async disposers run CONCURRENTLY, ordering between async disposers is
   not guaranteed - any cleanup sequence that matters (e.g. "close the
   connection, then flush the buffer") must be a single disposer with the
   sequence inside it.
3. The "wrap everything raw" rule exists because module-level side effects
   are owned by the module, not the fiber: they survive unload and HMR,
   leaving zombie timers and watchers from the "old" plugin instance
   running next to the new one. This is the concrete mechanism behind
   checklist item 15 (idempotence under HMR).
4. Stable patch-row ids are the config-diff contract: HMR and config edits
   diff rows by `id`; a generated id makes every edit look like remove +
   add, forcing an unnecessary remount (full unload/reload) on every edit.
   This connects to the volatile-cell mechanism in
   ./references/config-contract.md.

## Examples

### Good

```js
// Raw resource wrapped, with order-dependent cleanup in ONE disposer:
ctx.effect(() => {
	const timer = setInterval(tick, config.intervalMs)
	const watcher = fs.watch(config.dir, onEvent)
	return () => {
		clearInterval(timer)
		watcher.close()
	}
}, 'poll-and-watch')
```

### Bad

```js
// Module-level side effect - never unwound:
const timer = setInterval(tick, 1000) // top of module
```

```js
// Two async disposers whose order matters:
ctx.effect(() => async () => { await closeConn() })
ctx.effect(() => async () => { await flushBuffer() }) // may run FIRST
```

## Exceptions

- Pure registrations that the framework already owns as effects (`ctx.on`,
  `ctx.provide`, tool registration) do not need explicit `ctx.effect`
  wrapping - they are effects by construction (checklist item 5).
- Volatile-only config edits do not remount (see
  ./references/config-contract.md) - the exception to the HMR-style
  reload cycle.

## Failure Modes

- Zombie resources after unload/HMR: double listeners, double timers,
  watchers on stale paths - the classic symptom of unwrapped raw resources.
- Interleaved async teardown: buffer flushed after the connection closed,
  data lost.
- Generated row ids: every config edit remounts the plugin, discarding
  volatile state and churn the whole fiber.
- Confusing FAILED with PENDING: a throw in apply is a code bug; PENDING is
  a missing dependency - different fixes.

## Arbiters

- Unload test: unload the plugin (or trigger HMR) and assert no resources
  remain (no open handles, no further listener callbacks).
- Code review: scan for module-level side effects; every raw resource must
  be inside `ctx.effect` (checklist items 5-6).
- Patch review: every row has a stable explicit `id` (checklist item 14,
  see ./references/packaging.md).
