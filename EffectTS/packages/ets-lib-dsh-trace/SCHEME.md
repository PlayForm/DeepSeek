# SCHEME - @playform/ets-lib-dsh-trace

The trace vocabulary and the detached loop. Everything below is what the code does today; nothing
else is claimed.

## 0. What this library is

The pure, harness-free half of D5: a library, NOT a plugin bundle (no `cordis.patch.yml`, no loader
contract, no `dsh.bundle` entry). The SERVICE (`ctx.trace`) is provided by
`@playform/ets-plugin-dsh-factory`; the event names, the envelope, the coalescing key, the adapter
contract and the loop live here.

## 1. The envelope

```ts
{ trace: string; kind: string; at: number; actor?: object; payload: Record<string, unknown> }
```

- `trace` - the emission's correlation id. `Complete` assigns `trace-<sequence>` (the bus's
  monotonic counter) unless the emitter supplied one.
- `kind` - the event name (`Names`).
- `at` - the emission time in epoch milliseconds. `Complete` assigns `Date.now()` unless the emitter
  supplied one. No timer is created anywhere in the library.
- `actor` - the optional emitting actor object (the same identity the `fs/observed` events carry).
- `payload` - the event's own shape.

An emitter hands the bus a `Draft` (`{ kind, payload, actor?, trace?, at? }`).

## 2. The names (`Names`)

| Key           | Value               | Direction                                  |
| ------------- | ------------------- | ------------------------------------------ |
| `service`     | `trace`             | the service name the factory provides      |
| `observe`     | `observe/stamp`     | the observe hook emits; the graph consumes |
| `indexed`     | `graph/indexed`     | the graph emits                            |
| `invalidated` | `graph/invalidated` | the graph emits; the context consumes      |

## 3. The guards

- `IsEnvelope(value)` - a non-empty string `trace`, a non-empty string `kind`, a number `at`, an
  object `payload`.
- `IsStamp(value)` - a non-empty string `path`, a string `version`, a string `origin`.

Both are type predicates; an adapter uses them to ignore a foreign value instead of crashing
(fail-open).

## 4. The coalescing key (`Key`)

The payload's `path` when it is a non-empty string; else the event name when it is a non-empty
string; else `unknown`. The loop and the graph's per-path debounce key on exactly this value.

## 5. The detached loop (`Loop`)

`Loop(run) => Queue` with `{ Schedule(key), Flush, Dispose() }`.

| Rule                | Behavior                                                                               |
| ------------------- | -------------------------------------------------------------------------------------- |
| one in-flight task  | `Schedule(key)` starts `run(key)` only when no task for that key is in flight          |
| coalescing          | a schedule while the key is in flight is DROPPED (a coalesced pair is ONE run)         |
| no timers           | a microtask chain only - no `setTimeout`, no interval, no wall clock                   |
| fail-open           | a rejected `run` is swallowed; `Flush` never rejects                                   |
| deterministic flush | `Flush` is the promise of every in-flight task; it re-checks until the set is empty    |
| disposer            | `Dispose()` stops future scheduling and clears the queue; in-flight work still settles |

## 6. The ring bound (`Bound`)

256 - the service's fixed ring size. Not a config knob: the trace adds no config schema anywhere.

## 7. Verification

- `prepublishOnly` builds `Target/` and `Target/Test/`, runs the harness selfcheck (the counter's
  deliberate failure + the loop's coalescing proof) and type-checks the Test tree.
- `Loop-And-Vocabulary` prints `10 PASS`.

## 8. The EffectTS twin

Deferred to the ETS parity wave (wave 5 of the completion spec); the Classic tree is the contract
source for it.
