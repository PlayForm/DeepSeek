# Dispatch and Events

## The five modes

| Mode        | Awaited          | Dispatch order  | Return |
| ----------- | ---------------- | --------------- | ------ |
| `emit`      | No               | registration    | No     |
| `waterfall` | Through `next()` | registration    | Yes    |
| `parallel`  | Yes              | all in parallel | No     |
| `serial`    | Yes              | registration    | Yes    |
| `bail`      | No               | until one bails | Yes    |

The mode is part of the event's public contract.

A listener cannot opt out of the mode the producer chose.

## Per-mode semantics

- **`emit`**: `ctx.emit(name, ...args): void`. Returned promises and values are not awaited or
  collected. Listeners are synchronous recorders.
- **`parallel`**: `ctx.parallel(...)`: fan-out with a settle guarantee; the caller waits until every
  listener settles.
- **`serial`**: ordered, awaited, first-wins.
- **`bail`**: synchronous, first-wins; listeners run until one returns a value, and later listeners
  do not run.
- **`waterfall`**: observers must call `next()`; the chain awaits through `next()`, not through the
  dispatch call.

## The waterfall discipline

```typescript
ctx.on("llm/stream", (event, next) => {
	// transform the event
	return next();
});
```

Omitting `next()` silently swallows the default behavior downstream.

The failure has no error and no log; it looks like the default stopped working.

`prepend: true` only when ordering matters.

## Listeners and scoping

- `ctx.on` returns a disposer owned by the fiber.
- `ctx.once` for one-shot listeners.
- `global?` to hear events outside the local scope.
- `Context.filter` is consulted on every dispatch; root listeners hear all.

## The emit performance rule

An `emit` listener is a synchronous recorder:

- no `await`;
- no `throw`;
- no I/O.

A throw in an `emit` listener fails the tool call after the mutation already happened.

The catch-all pattern logs to the logger and the ledger only; it never rethrows.

Heavy work goes to `ctx.jobs.start`; throttles live in config.

## Failure modes

- **Async listener on `emit`**: the promise is dropped; rejections vanish and the work races the
  tool call.
- **Missing `next()`**: the default behavior disappears silently.
- **Return-value reliance on an unawaited event**: the value is dropped.
- **Ordering assumptions on `serial`**: later listeners never see the event once an earlier one
  claims it.
