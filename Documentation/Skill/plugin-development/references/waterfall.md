# Waterfall Discipline: Observers Call next()

> Source: SKILL.md, section 2, waterfall bullets. Sources:
> cordis-api/events.md:97-123; cordis-primer.md:31, 33; tutorial 04:138;
> framework/events.md:79-81.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

`ctx.waterfall(name, ...args): ReturnType` - each listener receives
`(...args, next)`; calling `next()` delegates to the next listener
(ultimately the built-in behavior); returning without `next()`
short-circuits/vetoes. **An observing or annotating waterfall listener MUST
call `next()`** - omitting it "silently swallows the default behavior for
everyone downstream" (tutorial 04:138; framework/events.md:79-81).
`prepend: true` only when ordering matters (primer:33).

## Why: The Full Philosophy

1. A waterfall is a chain of responsibility, not a broadcast. The return
   value of your listener becomes the chain's result unless you delegate.
   There is no "I was just looking" mode: not calling `next()` IS a veto.
2. The failure is silent by construction: the event still dispatches, your
   listener still runs, no error is thrown. What disappears is the default
   behavior for every consumer downstream - the worst kind of regression
   because nothing in your own code path fails.
3. Hence the arbiter phrasing used in the checklist: observers and
   annotators call `next()`; only decision-owners short-circuit. Before
   writing a waterfall listener, decide explicitly which of the two roles it
   has. If it cannot name the decision it owns, it must call `next()`.
4. `prepend: true` exists so a listener can position itself earlier in the
   registration order - use it only when ordering genuinely matters
   (e.g. you must see the event before an existing decision-owner does);
   gratuitous prepending makes the whole chain order-fragile.

## Examples

### Good

```ts
// Annotating listener: record, then delegate.
ctx.waterfall('fs/write', (target, next) => {
	logger.record(target);
	return next();
});
```

### Bad

```ts
// Observer that forgot next(): silently vetoes the write for everyone.
ctx.waterfall('fs/write', (target) => {
	logger.record(target);
});
```

## Exceptions

- Decision-owners legitimately return without `next()`: that is the veto/
  short-circuit feature. The exception is scoped to plugins that own the
  decision (guard-style listeners) - see ./references/tool-pipeline.md for
  where those roles live.

## Failure Modes

- The silent swallow: a new plugin adds an "observational" waterfall
  listener, omits `next()`, and a feature (writes, reads, a default reply)
  stops working app-wide with no error anywhere.
- Diagnosing it as a bug in the downstream consumer: the blame points away
  from the listener that dropped the chain.
- Prepend without need: an injected plugin reorders an existing chain and
  flips a previously settled decision order.

## Arbiters

- Review: every waterfall listener is classified observer (must call
  `next()`) or decision-owner (may return directly) - the checklist item 7
  (see ./references/checklist.md) enforces this.
- Testing: dispatch the event in a harness and assert the default behavior
  still occurs with the plugin loaded.
