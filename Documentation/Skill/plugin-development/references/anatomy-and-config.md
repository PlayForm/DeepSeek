# Anatomy, Config, and Services

## The export shapes

A plugin is a function, a constructor, or an object:

```typescript
export const name = "hook-example";
export const inject = ["fs"];
export const Config = Schema.object({ ... });
export function apply(Context) { ... }
export default { name, inject, Config, apply };
```

Rules:

- `apply` returns nothing.
- The default object must also carry `inject` and `Config`. A default
  object that omits them shadows the named exports: the loader sees
  neither, and service access throws
  `cannot get property "fs" without inject`.
- A bad config fails loud at load.

## Config

- A real `Schema.object` with defaults, not a plain object.
- Every tunable is a config field; the cordis.yml test asks whether the
  behavior could be configured from the file alone.
- Volatile cells apply on the next dispatch without a remount.
- `!!js` scope for computed values.
- A config edit hot-replaces the plugin.
- A plugin with no configurable behavior still ships a schema (an empty
  object is fine) so the validation surface stays uniform.

## Services

- Extend `Service`, call `super(Context, name)`.
- `provide`/`get`; static hooks for typed access.
- PENDING-until-satisfied: a plugin whose services are not yet available
  waits; load order never matters.
- Optional dependencies by probing, not by requiring.
- A plugin that provides no service is a valid archetype.

## Declaration merging

Merge into `Context` and `Events` to give the plugin typed accessors and
typed event payloads:

```typescript
declare module "@deepseek-ai/cordis" {
	interface Context {
		pluginFactory: Factory;
	}
	interface Events {
		"fs/observed": (target: Target, observation: Observation, actor: Actor) => void;
	}
}
```

The merge is compile-time only; it adds no runtime surface.

## Failure modes

- **Default object shadowing**: `export default { name, apply }` with the
  named `inject`/`Config` invisible to the loader. A smoke that calls
  `apply` directly never catches it.
- **Lazy config**: defaults applied after load; a bad config boots.
- **Greedy inject**: the boot order stops being deterministic.
- **Missing inject**: the plugin reads `undefined` at first use.
