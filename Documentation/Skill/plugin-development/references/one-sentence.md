# The One Sentence: A DSH Plugin Is a Cordis Plugin

> Source: SKILL.md, section 0 "The one sentence". Sources: architecture.md:11,
> architecture.md:141.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

A DSH plugin is a cordis plugin: it receives `ctx` and `config`, declares what
it needs, and integrates ONLY through the API -- events, services, tools,
config schemas, effects. There is no back door.

## Why: The Full Philosophy

1. The harness is a microkernel. Its own architecture document states the
   law twice:

   - "Every part of the product is a plugin ... There is no privileged core
     to patch" (architecture.md:11).
   - "New behavior attaches to a documented extension point"
     (architecture.md:141).

2. "Every part" includes the parts you might think are core: the filesystem
   observation policy, the tools, the config catalog. If the harness itself
   ships features as plugins, a third-party plugin has no excuse for
   bypassing the same seams.
3. "No privileged core to patch" means: no monkey-patching, no reaching into
   module internals, no replacing host objects. The extension points are the
   contract; anything outside them is undefined territory that the next host
   version can (and will) break.
4. The corollary that drives the rest of this manual: free-floating
   Node.js inside a plugin is THE anti-pattern. Timers, watchers, child
   processes, console writes, module-level side effects -- all of it is
   off-contract unless it is expressed through one of the five integration
   surfaces (events, services, tools, config schemas, effects), which is why
   raw resources must be wrapped in `ctx.effect` (see
   ./references/fibers-and-effects.md).

## Examples

### Good

- A plugin that exports `apply(ctx, config)` and inside it registers
  listeners, provides services, registers tools, and wraps every raw
  resource in an effect.
- A policy plugin that adds behavior purely through event gates (see
  ./references/services.md, the "registers NO service" archetype).

### Bad

- A plugin that opens a `fs.watch` at module scope.
- A plugin that patches `ctx` internals or imports host module files by path.
- A plugin that does real work in a module-level import statement.

## Exceptions

None. There is no documented exception to the "integrate only through the
API" law.

## Failure Modes

- Free-floating Node.js: resources that never unwind on unload or HMR, so
  the "old" plugin instance keeps running alongside the new one (double
  listeners, double timers).
- Core patching: works until the host upgrades, then fails in ways no one
  can diagnose from the plugin's own code.
- Undeclared needs: the plugin starts before its dependencies exist and
  throws at first use instead of staying PENDING (see
  ./references/plugin-anatomy.md).

## Arbiters

- Review: any use of Node APIs for side effects outside `ctx.effect` fails
  review.
- The harness's own plugins are the reference behavior: if a shipped plugin
  cannot do it, your plugin should not either.
- Load behavior: a plugin that bypasses the API often shows the "silent
  load" or "double activation" failure modes cataloged in
  ./references/pitfalls-catalog.md.
