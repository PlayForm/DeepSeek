# The Event Bus: The Five Dispatch Modes

> Source: SKILL.md, section 2 "Event bus - the five dispatch modes".
> Sources: cordis-api/events.md:204, cordis-primer.md:27 and 19-25,
> events.md:31-49, 51-72, 74-95, 97-123, 8-29; tutorial 04:86.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

`DispatchMode = 'emit' | 'parallel' | 'serial' | 'bail' | 'waterfall'`
(events.md:204). The mode is part of the event's public contract
(primer:27) - it is not an implementation detail you may reinterpret per
listener. The exact dispatch table (primer:19-25):

| Mode | Awaited? | Dispatch Order | Has Return? |
|---|---|---|---|
| `emit` | No | registration order | No |
| `waterfall` | No (awaiting happens through `next()`) | registration order | Yes |
| `parallel` | Yes | all in parallel | No |
| `serial` | Yes | registration order | Yes |
| `bail` | No | order until one bails | Yes |

## The Per-Mode Semantics

1. **`emit`** - `ctx.emit(name, ...args): void`, a synchronous broadcast.
   "Returned promises and values are not awaited or collected"
   (events.md:31-49; tutorial 04:86). Fire-and-forget in the strictest
   sense: whatever a listener returns disappears.
2. **`parallel`** - `ctx.parallel(...): Promise<void>`, fan-out with settle
   guarantee (events.md:8-29): the caller waits until every listener
   settles.
3. **`serial`** - `ctx.serial(...)`, ordered first-wins, awaited
   (events.md:51-72).
4. **`bail`** - `ctx.bail(...)`, synchronous first-wins (events.md:74-95):
   listeners run in order until one returns a value; that value becomes the
   result and later listeners do not run.
5. **`waterfall`** - see ./references/waterfall.md for its full contract,
   including the `next()` discipline.

## Why: The Full Philosophy

1. The mode determines who waits, in what order listeners run, and whether
   a return value exists - i.e. the entire failure surface of a listener
   differs per mode. A listener that is safe under `parallel` (async, may
   reject) can be catastrophic under `emit` (see
   ./references/performance-pressure.md for the fs/observed disaster case).
2. Because the mode is public contract, a listener author can rely on it -
   but must also honor it: writing an async listener for an unawaited event
   means the promise is silently dropped, not deferred.
3. "Awaited? No" for waterfall does not mean the chain does not await
   anything: awaiting happens through `next()`. This is the single most
   confusing cell in the table and is a documented gap (see
   ./references/documented-gaps.md).

## Examples

### Good

- An annotation listener on an `emit` event that records state synchronously
  and returns nothing.
- A decision listener on a `bail` event that returns its decision value.

### Bad

- An async listener with important side effects on an `emit` event - the
  promise is not collected, so the work races the tool call and rejections
  vanish.
- Treating `serial`'s first-wins as "all listeners get the value" - later
  listeners never see the event once an earlier one claims it.

## Exceptions

- The `thisArg` overload exists for every dispatch (scoping - see
  ./references/event-listeners.md); it changes the receiver, not the mode
  semantics.

## Failure Modes

- Writing an async listener on `emit`: unawaited rejection, potentially
  surfacing as a tool `isError` after a mutation already succeeded.
- Assuming parallel execution on `serial` (or vice versa): ordering
  violations that only show under real concurrency.
- Relying on the return value of an unawaited event: the value is dropped.

## Arbiters

- Source check: the event's declaration in the API docs states its mode;
  the docs table above is authoritative.
- Review: any listener on a non-awaiting event must be synchronous and
  side-effect-only (see ./references/performance-pressure.md).
- The five dispatch modes are enforced by the framework itself - a listener
  cannot opt out of the mode the producer chose.
