# Fibers, Effects, and Tools

## Fibers

A fiber owns the registrations a plugin creates. Its lifecycle:

- created on load;
- disposed in reverse registration order;
- async disposers run concurrently;
- a disposed fiber's registrations stop receiving events.

Wrap raw resources (timers, subprocesses, watchers) in `ctx.effect` so disposal is owned by the
fiber:

```typescript
ctx.effect(() => {
	const Timer = setInterval(Poll, 1000);
	return () => clearInterval(Timer);
});
```

## HMR

- Give every registration a stable row id so the HMR diff can match the old row to the new one.
- HMR idempotence: reloading a plugin must not duplicate its listeners, timers, or jobs.
- A reload that leaves a stale registration is a leak the next disposal will not find.

## Tools

`defineTool`:

```typescript
const Tool = defineTool({
	name: "example",
	description: "...",
	parameters: Schema.object({ ... }),
	execute: async (Arguments, Execution) => {
		// honor Execution.signal
		return { ... };
	},
	render: (Result) => Result.Text,
});
```

Rules:

- Typed parameters; the schema is the contract.
- One canonical JSON value per result.
- `render` is pure: it formats the value, it does not fetch or mutate.
- The tool is readonly after registration.
- Honor `exec.signal`; a cancelled call stops its work.

## The execution pipeline

```text
pre-execute -> guard -> execute -> projectContent -> post-execute
  -> finalizeContent -> result
```

- **guard** is monotonic: it may deny or rewrite, never undo a denial.
- **projectContent** and **finalizeContent** shape what the model sees.
- **post-execute** observers see the result before it returns.
- A throw in a post-execute observer fails the call after the mutation.

## Failure modes

- **Unwrapped resource**: a timer survives disposal; HMR doubles it.
- **Unstable row ids**: the HMR diff cannot match; listeners duplicate.
- **Impure render**: the presenter does work the result did not ask for.
- **Ignored signal**: a cancelled tool keeps running.
- **Throw after mutation**: the tool reports an error for a change that succeeded.
