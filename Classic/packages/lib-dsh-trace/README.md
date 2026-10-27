# @playform/lib-dsh-trace

The TRACE is the pure, harness-free vocabulary of the workspace family's trace bus, following the
completion spec's D5 ("the indexer is inferred from the event bus").

```text
source plugin --adapter--> trace bus --adapter--> consumer plugin
```

- **The bus is a service, not a process.**

    `ctx.trace` is provided once by [`@playform/plugin-dsh-factory`](../plugin-dsh-factory) (the
    family's shared-machinery owner).

    There is no separate indexer process and no separate indexer plugin.

- **This library holds the vocabulary and the loop.**

    Every adapting plugin carries its own `Source/Trace/` adapter and imports these names and types,
    so no plugin imports another plugin.

- **The detached loop** is the "daemon trace": a coalescing queue keyed by path, ONE in-flight task
  per key, no timers in the hot path, fail-open, a `Flush` promise for deterministic smokes, and a
  disposer.

## Install

```sh
pnpm add @playform/lib-dsh-trace
```

## The surface (named exports)

| Export       | Kind  | What it is                                                                                           |
| ------------ | ----- | ---------------------------------------------------------------------------------------------------- |
| `Names`      | value | the service name `trace` and the event names (`observe/stamp`, `graph/indexed`, `graph/invalidated`) |
| `Bound`      | value | the service's fixed ring bound (256)                                                                 |
| `Complete`   | value | `(draft, sequence) => Envelope` - fills `trace-<n>` and `at` when absent                             |
| `IsEnvelope` | value | the envelope type guard                                                                              |
| `IsStamp`    | value | the `observe/stamp` payload guard (path/version/origin)                                              |
| `Key`        | value | the coalescing key (the payload's path, else the event name)                                         |
| `Loop`       | value | the detached-loop helper: `(run) => Queue`                                                           |
| `Envelope`   | type  | `{ trace, kind, at, actor, payload }`                                                                |
| `Draft`      | type  | what an emitter hands the bus (the envelope without the bus fields)                                  |
| `Adapter`    | type  | the bus contract: `emit(draft)`, `on(name, listener) => disposer`                                    |
| `Stamp`      | type  | the `observe/stamp` payload                                                                          |
| `Queue`      | type  | `{ Schedule(key), Flush, Dispose() }`                                                                |

The service's own surface (`emit`, `on`, `flush`, `ring`) is documented in the factory's
README/SCHEME, and this library never provides a service.

## Usage

```ts
import { Key, Loop, Names } from "@playform/lib-dsh-trace";

// A consumer adapter: one in-flight re-index per path, no timer.
const Queue = Loop(async (Path: string) => {
	await Reindex(Path);
});
const Dispose = ctx.trace.on(Names.observe, (Envelope) => {
	Queue.Schedule(Key(Envelope));
});
// await Queue.Flush in a smoke; Dispose + Queue.Dispose on unload.
```

```ts
// A source adapter: one draft per recorded stamp.
ctx.trace.emit({
	kind: Names.observe,
	payload: { path: Stamp.path, version: Stamp.version, origin: Stamp.origin },
});
```

## Build and smoke

```sh
pnpm --dir Classic/packages/lib-dsh-trace run prepublishOnly
node Classic/packages/lib-dsh-trace/Target/Test/Loop-And-Vocabulary/Test.js
```

The test battery is one folder (`Loop-And-Vocabulary`, 10 checks) plus the harness selfcheck that
gates the build.

Contract: [SCHEME.md](./SCHEME.md).

## License

CC0-1.0.
