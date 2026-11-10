/**
 * @module Apply
 *
 * The plugin entry function, a THIN MODULE WIRE-UP in the factory family's
 * shape: build the State through `Factory.State`, create the plugin's
 * long-lived Effect Scope, emit the durable activation proof, and register
 * the spaces hook's OWN llm/stream listener.
 *
 * @remarks
 * The State build covers the cell unwrap, the shared mappings
 * Ledger<-logFile / Enabled<-log and the module's own fields via the setup
 * `fields` map (factory SCHEME.md §2.10). The durable activation proof is
 * the module's own string, via Factory.Append - the factory never owns
 * ledger strings.
 *
 * NOT factory machinery, deliberately:
 *   - Factory.Wire is fs/observed-hardwired (the family's SILENCE) - the
 *     spaces hook's normalization must be VISIBLE (it IS the feature), so
 *     the registration here is the plain `ctx.on("llm/stream", ...)`
 *     pattern, fiber-owned, removed on unload, no manual bookkeeping.
 *   - Factory.Attach (P1 jobs controller, P2 inflight disposal, P5 storage
 *     domain) has no consumer here: the spaces hook runs no jobs and holds
 *     no inflight continuations; its only journal traffic is the stream
 *     count record - the `normalized` event of the shared governance domain,
 *     journaled best-effort when the storage facility is present
 *     (Function/Normalize; the human ledger stays the complete record).
 *   - Factory.Schema is not used for Config: it hardcodes the family's
 *     shared block (updateCooldownMs/mutationTools/policyFile/exclude -
 *     fs/observed machinery the spaces hook has none of). The MODULE owns
 *     its Config: Variable/Config.ts defines the spaces hook's own schema.
 *
 * THE EFFECT DELTA (R7a) - THE REAL STREAM PIPELINE (boundary 1 of the
 * plan): the llm/stream listener is a three-adapter waterfall around the
 * CORE's Gate transformer, using these exact Effect v4 APIs:
 *
 *   - Stream.fromAsyncIterable(Next(), onError) - the plain harness seam
 *     INTO the typed world: Next() is called synchronously, exactly once, at
 *     listener invocation (the waterfall discipline: omitting it
 *     short-circuits the model call), and the async iterable is adapted
 *     lazily - the generator body only starts running at the first pull. The
 *     `onError` handler is the identity `(Error) => Error`, which keeps the
 *     failure value UNCHANGED: the object form of the underlying adaptation
 *     carries the raw iterator error as the stream's typed `E`, so an
 *     upstream throw propagates to the consumer with its message intact (the
 *     smoke asserts `transport boom` verbatim) instead of surfacing wrapped.
 *   - Gate(stream, Replace, Reasoning, ToolArgs, OnCount) - the CORE's real
 *     Stream transformer (Stream/Gate): the per-chunk dispatch (which chunk
 *     types, which fields, the identity passthroughs, the reasoning gate,
 *     the three-way tool-args gate with the edit exemption and the per-call
 *     `{"__normalize":false` raw marker) lives there; this file supplies
 *     only the FLAVOR - the Spaces-class transform pinned to the configured
 *     replacement (read from State at chunk time, so a volatile hot-edit
 *     takes effect mid-listener exactly like the Classic per-chunk read),
 *     the two gate flags, and the count callback (Function/Normalize) for
 *     the post-stream ledger line. The Gate is a `Stream.suspend` value:
 *     per-stream state (count, current tool-call id, raw-marker flag) is
 *     created fresh per materialization, never module-level.
 *   - Stream.toAsyncIterable(gated) - back OUT to the plain seam: the
 *     listener returns the plain `AsyncIterable<StreamChunk>` the waterfall
 *     contract requires. On a failure the async iterator throws the squashed
 *     cause, which for a typed fail is the original error object itself - so
 *     the consumer's `for await` sees the upstream throw untouched.
 *
 * The pipeline holds NO services and NO scope: it is a pure value-level
 * transform created fresh per stream (the listener runs per model call), so
 * no `Scope.provide` call site consumes State.Scope here - the same posture
 * as the pinner (R4), with the field kept for the family's uniform shape.
 *
 * The behavioral contract is UNCHANGED from the Classic async-generator
 * wrapper: chunk order preserved (one in, one out, strictly sequential), no
 * buffering (each upstream chunk is pulled, dispatched and emitted before
 * the next pull), upstream throws propagate, the count summary runs only
 * after a NORMAL completion, and every ledger string is byte-identical.
 *
 * The function returns NOTHING - never a value: the loader treats apply
 * return values specially, and a returned State object silently killed event
 * delivery (live-verified, plugin-development skill pitfall 16). Test probes
 * read the state through the `ctx.__hookDshSpacesState` attachment instead.
 *
 * `inject: ["pluginFactory"]` (Library.ts) - the factory is a REQUIRED
 * service; the loader's PENDING state handles the ordering (the plugin loads
 * only when the factory service exists), so bundle-layer order never
 * matters. Nothing else is injected: the ledger append is the factory's own
 * plain-fs exemption, and the chunk vocabulary arrives through the
 * waterfall, not through an import.
 */
import type { Context } from "@deepseek-ai/cordis";
import type Config from "../Interface/Config.js";
export default _default;
declare function _default(Context: Context, Options: Config): void;
