# Services: Base Class, provide/get/set, Dependency Tracking, the No-Service Archetype

> Source: SKILL.md, section 5 "Services". Sources: cordis-api/service.md:1-12,
> 25-101; user/develop/framework/service.md:38-85; context.md:286-314,
> 237-284; tutorial 03:59, 76-78, 82-90; filesystem.md:278.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

- Service base class: the subclass calls `super(ctx, name)`; the service is
  registered immediately and removed with its fiber (service.md:1-12).
  Static hooks: `init`, `check`, `invoke` (callable services like
  `ctx.logger()`), `extend`, `tracker` (service.md:25-101).
- Class plugin:

```ts
export default class X extends Service {
	static inject = ['tools']
	constructor(ctx) { super(ctx, 'x') }
}
```

  (user/develop/framework/service.md:38-85)

- `ctx.provide(name, value): () => void` - owned by the fiber; throws if
  the name is already provided in scope (context.md:286-314).
  `ctx.get(name, strict?)` / `ctx.set(name, value)` (context.md:237-284).
- Dependency tracking: a plugin with `inject` stays PENDING until every
  injected service exists - load order in `cordis.yml` does not matter
  (tutorial 03:59). If a required service disappears, dependents unload and
  reload when it returns (tutorial 03:76-78). Optional dependency: skip
  `inject`, probe `ctx.get('x')` (tutorial 03:82-90).
- Registering NO service is a legitimate archetype: "`dsh-fs-observation-
  policy` registers no service - it adds policy through the `fs/*` event
  gate" (filesystem.md:278).

## Why: The Full Philosophy

1. Services are the typed capability seam (see ./references/api-map.md):
   the Service class is the definition that owns `ctx.<name>` - which is
   why it is a class and "never a TypeScript `interface`" (glossary.md:9).
2. Fiber ownership of `provide` gives the same unload-safety as listeners:
   when the providing plugin unloads, the service goes away, dependents are
   notified, and the framework reloads them when it returns. Nothing is
   manual.
3. PENDING-until-satisfied is what makes load order irrelevant: you declare
   needs; the runtime sequences. Any plugin that "waits" by being ordered
   later in `cordis.yml` is broken by design - correctness must not depend
   on a config file's row order.
4. Optional dependencies are handled by probing, not by lying: putting a
   service in `inject` declares a HARD dependency; probing `ctx.get`
   declares a soft one. Choose deliberately.
5. The no-service archetype shows the design space: policy can live
   entirely in event listeners. If your plugin's value is behavior at event
   time, it may need no service at all - see
   ./references/performance-pressure.md ("policy as listeners").

## Examples

### Good

```ts
// Provider with proper super() and inject:
export default class Registry extends Service {
	static inject = ['tools']
	constructor(ctx) { super(ctx, 'registry') }
}
// Consumer of an optional service:
const policy = ctx.get('fsPolicy')
if (policy) { /* soft integration */ }
```

### Bad

```ts
// Ordering-based dependency (no inject):
// "cordis.yml lists fs-provider above me, so ctx.fs exists" - wrong.
```

```ts
// Hard inject for something the plugin can work without:
static inject = ['fsPolicy']  // plugin now unloads whenever it unloads
```

## Exceptions

- The no-service archetype (filesystem.md:278) - a plugin that adds policy
  purely through event gates registers nothing.
- Optional dependencies legitimately skip `inject` and probe.

## Failure Modes

- Missing `super(ctx, name)`: the service never registers on the context.
- Duplicate provide in scope: `ctx.provide` throws - two plugins providing
  the same name is a design collision, not a merge.
- Treating a disappearing service as fatal in apply: the framework already
  handles unload/reload of dependents; re-checking by throwing breaks the
  cycle.
- Probing an optional service once at load and caching the result: the
  service may arrive later - probe at use time.

## Arbiters

- Review: every required service appears in `static inject`; no plugin
  relies on load order (checklist item 2, see ./references/checklist.md).
- Runtime: a PENDING plugin in `--dump-config` means an unsatisfied inject,
  which points at the missing provider, not at row order.
- The live governor plugin (`@local/dsh-hook-package-governor`) is the
  shipped example of listener-based policy with minimal service surface.
