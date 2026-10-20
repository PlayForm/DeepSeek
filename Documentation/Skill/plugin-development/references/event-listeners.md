# Listener Registration: ctx.on, ctx.once, Options, and Scoping

> Source: SKILL.md, section 2, listener and scoping bullets. Sources:
> cordis-api/events.md:125-147, 149-171, 173-187; context.md:177-186;
> glossary.md:13-21; tutorial 02:88.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

`ctx.on(name, listener, options?): () => boolean` - the listener is owned by
the current FIBER and the call returns a disposer. "The listener is removed
on unload - no manual removeListener bookkeeping, ever" (events.md:125-147;
tutorial 02:88). `ctx.once` self-disposes after one call (events.md:149-171).
`EventOptions`: `prepend?: boolean` and `global?: boolean` (receive
regardless of context filter checks) (events.md:173-187).

## Scoping Rules

1. Every dispatch has a `thisArg` overload.
2. `Context.filter` is "consulted on every event dispatch"
   (context.md:177-186) - scoping is not an optimization, it is evaluated
   each time.
3. Scoped events dispatch with the agent's carrier - a subject-less carrier
   admits untagged listeners only (glossary.md:13-21).
4. Root listeners on unscoped events (e.g. `fs/observed`) hear ALL
   dispatches: main agent, subagents, workflow children.

## Why: The Full Philosophy

1. Fiber ownership is what makes unload safe: the framework already knows
   which registrations belong to the loading plugin instance, so unloading
   the fiber removes the listeners automatically. Any manual
   removeListener bookkeeping is a smell that you are holding the listener
   somewhere outside the fiber.
2. `global: true` is an escape hatch with a cost: it bypasses context filter
   checks, so the listener receives events it would otherwise never see.
   Use it only when the listener genuinely must observe across scopes
   (e.g. a recording policy), never as a fix for "my listener is not
   called".
3. The carrier rule explains "my root listener didn't fire": if the
   dispatch carries a subject and your listener is untagged (or vice versa),
   the filter excludes it. Root listeners on unscoped events are the broad
   audience - which is exactly why their listeners must be synchronous
   recorders (see ./references/performance-pressure.md).

## Examples

### Good

```js
// Disposer returned by ctx.on; keep it only if you need early removal.
const off = ctx.on('fs/observed', (target, observation) => {
	// synchronous recorder body
});
// once() self-disposes:
ctx.once('boot/ready', () => logger.info('ready'));
```

### Bad

```js
// Manual bookkeeping outside the fiber:
const off = ctx.on('fs/observed', handler);
globalThis.__myOff = off; // survives unload; leaks across HMR
```

## Exceptions

- `prepend: true` (see ./references/waterfall.md) - ordering-sensitive
  listeners only.
- `global: true` - cross-scope observation only, documented as a deliberate
  filter bypass.

## Failure Modes

- Manual listener arrays: on unload or HMR the old instance's listeners
  remain registered (double dispatch, stale closures).
- Sprinkling `global: true` to make tests pass, then wondering why a scoped
  event handler now fires for subagents.
- Assuming `once` still needs an explicit disposer - it self-disposes; but
  nothing disposes it before its first call except unloading the fiber.

## Arbiters

- Review: no listener references are stored outside the plugin's own
  closure/fiber scope.
- Unload test: after unload (or HMR reload), dispatch the event and assert
  the old listener is gone.
- Scope test: events with subjects must reach only appropriately tagged
  listeners.
