# Typed Vocabulary via Declaration Merging

> Source: SKILL.md, section 3, declaration-merging bullet (checklist item
> 12). Sources: tutorial 03:14-18; tutorial 04:14-21.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

Plugins that add new typed surface (a service accessor on `ctx.<name>`, a
new event) publish the typing with declaration merging:

```ts
declare module '@deepseek-ai/cordis' {
	interface Context {...}
	interface Events {...}
}
```

## Why: The Full Philosophy

1. The harness's seams are typed: `ctx.tools`, `ctx.fs`, `ctx.logger` all
   exist as typed properties because their definitions participate in the
   `Context` interface. A plugin that provides a service should give
   consumers the same experience: `ctx.myService` fully typed, autocompleted,
   and checked.
2. Declaration merging (not inheritance, not a namespace hack) is the
   idiomatic TypeScript mechanism for "this library's interfaces gain
   members when my module is imported". Consumers get the typing for free
   by depending on the plugin - no casts, no `any`.
3. The `Events` interface is the same idea for the event bus: a new event
   declared in `Events` gives every listener and emitter checked argument
   types, which is what makes the dispatch-mode contract enforceable in
   review (see ./references/dispatch-modes.md).

## Examples

### Good

```ts
declare module '@deepseek-ai/cordis' {
	interface Context {
		registry: RegistryService
	}
	interface Events {
		'governor/decision': (payload: GovernorDecision) => void
	}
}
```

### Bad

```ts
// Cast-based vocabulary: consumers must cast every access.
const registry = (ctx as any).registry
```

## Exceptions

- A purely event-listening plugin that adds no new service and no new event
  needs no merging - it only consumes existing typed vocabulary.

## Failure Modes

- Providing a service without merging: consumers fall back to `ctx.get()`
  with stringly-typed names and unchecked values.
- Merging into the wrong module specifier: the augmentation silently does
  nothing (the augmentation must target the module that declares
  `Context`/`Events`).

## Arbiters

- Type check: `tsc` on a consumer file that accesses `ctx.<name>` compiles
  without casts.
- Review: checklist item 12 (see ./references/checklist.md).
