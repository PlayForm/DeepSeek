# Plugin Anatomy: Export Shapes, Loading, and Inject

> Source: SKILL.md, section 3 "Plugin anatomy". Sources: registry.md:58-121,
> 35-56, 8-33, 123-152; user/develop/basic/index.md:17-27; tutorial 01:81-89,
> 03:14-18, 04:14-21.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

Accepted export shapes (registry.md:58-121):

```ts
type Plugin = Function | Constructor | Object
// Function: (ctx, config) => any   - the common form
// Constructor: new (ctx, config) => any  - use when providing a service
// Object: { apply(ctx, config) }   - also fine (e.g. export default { name, apply })
// Base: { name?, Config?, inject?, provide?, intercept? }
```

Harness idiom (user/develop/basic/index.md:17-27):

```js
export const name = "my-plugin"          // display metadata (optional)
export function apply(ctx, config) { ... } // framework calls apply on load
```

- `ctx.plugin(plugin, ...args)` loads a plugin; awaiting it settles once
  loading finished and rejects on config or startup errors (registry.md:35-56).
- `ctx.inject(deps, cb)` runs a callback when services are available
  (registry.md:8-33).
- Load failure is LOUD: "A plugin that fails to load is a loud failure, not
  a skipped entry" (tutorial 01:81-89).
- `Inject = string[] | { [key]: interceptConfig }` - array for plain
  dependencies, object form to pass intercept config (registry.md:123-152).
- Declaration merging for typed vocabulary:
  `declare module '@deepseek-ai/cordis' { interface Context {...} interface Events {...} }`
  (tutorial 03:14-18; tutorial 04:14-21). See
  ./references/declaration-merging.md for the full treatment.

## Why: The Full Philosophy

1. The shape is flexible but the contract is not: whatever the shape, the
   plugin receives `ctx` and validated `config`, and everything it does
   must happen through the API (see ./references/one-sentence.md).
2. The Constructor shape exists for service-providing plugins because a
   Service subclass wants `new` semantics with `super(ctx, name)` - see
   ./references/services.md.
3. Loud failure is a design choice that protects users: a half-loaded
   plugin that "skips quietly" produces systems whose features randomly do
   not exist. The loud contract means config errors and startup errors
   propagate as rejections, and any silence you observe (e.g. an entry that
   never appears in activation output) is a bug to diagnose, not a mode
   (see ./references/pitfalls-catalog.md, items 6 and 12).
4. The two `inject` forms separate the common case (a list of service
   names) from the interception case (per-key intercept config), so
   declaring dependencies stays declarative even when the dependency needs
   configuration.

## Examples

### Good

```js
export const name = "governor"
export function apply(ctx, config) {
	ctx.on('fs/observed', (t, o) => { /* recorder */ })
}
```

```js
// Service provider as a class plugin:
export default class Registry extends Service {
	static inject = ['tools']
	constructor(ctx) { super(ctx, 'registry') }
}
```

### Bad

```js
// Returning a value from apply (the loader treats it specially):
export function apply(ctx) { return buildState() }
```

```js
// A default-object export whose inject is only on named exports (pitfall 15):
export default { name: "x", apply }
export const inject = ['fs']  // invisible to the default object
```

## Exceptions

- The Object shape (`export default { name, apply }`) is fine - but note
  pitfall 15: a default object SHADOWS the named exports, so `inject` and
  `Config` must also be on the default object or service accessors throw
  `cannot get property "fs" without inject` (verified live 2026-10-03).
- Never `return` a value from `apply` (pitfall 16): returning a State object
  silently killed event delivery (verified live 2026-10-03). Expose state
  via a context attachment (`ctx.__governorState = State`) for test probes.

## Failure Modes

- Silent non-activation: a module-level import of an unresolvable package
  crashes the whole bundle load (pitfall 6), which can look like the plugin
  "was never there" instead of failing loudly.
- Load-order thinking: relying on another plugin being loaded first instead
  of declaring `inject` - see ./references/services.md.
- Missing inject on default objects: accessors throw at first use, long
  after load.

## Arbiters

- Source: registry.md:58-121 defines the accepted shapes; anything outside
  them is not a plugin.
- Activation verification: `dsh --profile <name> --dump-config` at pack
  time and the Inspect + ledger probe at runtime (see
  ./references/packaging.md and pitfall 12).
- A smoke that calls `apply` directly never catches the default-object
  shadowing - the arbiter must be a live-activation check, not just the
  smoke.
