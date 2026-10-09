// Apply - the plugin entry function, a THIN MODULE WIRE-UP in the factory
// family's shape: build the State through `Factory.State` (the cell unwrap,
// the shared mappings Ledger<-logFile / Enabled<-log and the module's own
// fields via the setup `fields` map - factory SCHEME.md §2.10), create the
// plugin's long-lived Effect Scope (THE EFFECT DELTA, R7a - see Interface/
// State), emit the durable activation proof (the module's own string, via
// Factory.Append - the factory never owns ledger strings), and register the
// quotes hook's OWN llm/stream listener.
//
// NOT factory machinery, deliberately:
//   * Factory.Wire is fs/observed-hardwired (the family's SILENCE) - the
//     quotes hook's normalization must be VISIBLE (it IS the feature), so
//     the registration here is the plain `ctx.on("llm/stream", ...)` pattern,
//     fiber-owned, removed on unload, no manual bookkeeping.
//   * Factory.Attach (P1 jobs controller, P2 inflight disposal, P5 storage
//     domain) has no consumer here: the quotes hook runs no jobs and holds no
//     inflight continuations; its only journal traffic is the stream count
//     record - the `normalized` event of the shared governance domain,
//     journaled best-effort when the storage facility is present
//     (Function/Normalize; the human ledger stays the complete record).
//   * Factory.Schema is not used for Config: it hardcodes the family's
//     shared block (updateCooldownMs/mutationTools/policyFile/exclude -
//     fs/observed machinery the quotes hook has none of). The MODULE owns
//     its Config: Variable/Config.ts defines the quotes hook's own schema.
//
// THE EFFECT DELTA (R7a) - THE REAL STREAM PIPELINE (boundary 1 of the plan):
// the llm/stream listener is now a three-adapter waterfall around the CORE's
// Gate transformer, using these exact Effect v4 APIs:
//
//   Stream.fromAsyncIterable(Next(), onError)
//     - the plain harness seam INTO the typed world: Next() is called
//       synchronously, exactly once, at listener invocation (the waterfall
//       discipline: omitting it short-circuits the model call), and the
//       async iterable is adapted lazily - the generator body only starts
//       running at the first pull. The `onError` handler is the identity
//       `(Error) => Error`, which keeps the failure value UNCHANGED: the
//       object form of the underlying adaptation carries the raw iterator
//       error as the stream's typed `E`, so an upstream throw propagates to
//       the consumer with its message intact (the smoke asserts
//       `transport boom` verbatim) instead of surfacing wrapped.
//   Gate(stream, Replace, Reasoning, ToolArgs, OnCount)
//     - the CORE's real Stream transformer (Stream/Gate): the per-chunk
//       dispatch (which chunk types, which fields, the identity
//       passthroughs, the reasoning gate, the three-way tool-args gate with
//       the edit exemption and the per-call `{"__normalize":false` raw
//       marker) lives there; this file supplies only the FLAVOR - the
//       Quotes-table transform (a MAP flavor has NO configured knob to pin,
//       so the transform reads nothing from State at chunk time), the two
//       gate flags, and the count callback (Function/Normalize) for the
//       post-stream ledger line. The Gate is a `Stream.suspend` value:
//       per-stream state (count, current tool-call id, raw-marker flag) is
//       created fresh per materialization, never module-level.
//   Stream.toAsyncIterable(gated)
//     - back OUT to the plain seam: the listener returns the plain
//       `AsyncIterable<StreamChunk>` the waterfall contract requires. On a
//       failure the async iterator throws the squashed cause, which for a
//       typed fail is the original error object itself - so the consumer's
//       `for await` sees the upstream throw untouched.
//
// The pipeline holds NO services and NO scope: it is a pure value-level
// transform created fresh per stream (the listener runs per model call), so
// no `Scope.provide` call site consumes State.Scope here - the same posture
// as the pinner (R4), with the field kept for the family's uniform shape.
//
// The behavioral contract is UNCHANGED from the Classic async-generator
// wrapper: chunk order preserved (one in, one out, strictly sequential),
// no buffering (each upstream chunk is pulled, dispatched and emitted before
// the next pull), upstream throws propagate, the count summary runs only
// after a NORMAL completion, and every ledger string is byte-identical.
//
// The function returns NOTHING - never a value: the loader treats apply
// return values specially, and a returned State object silently killed event
// delivery (live-verified, plugin-development skill pitfall 16). Test probes
// read the state through the `ctx.__hookDshQuotesState` attachment instead.
//
// `inject: ["pluginFactory"]` (Library.ts) - the factory is a REQUIRED
// service; the loader's PENDING state handles the ordering (the plugin loads
// only when the factory service exists), so bundle-layer order never
// matters. Nothing else is injected: the ledger append is the factory's own
// plain-fs exemption, and the chunk vocabulary arrives through the
// waterfall, not through an import.
import { Effect, Scope, Stream } from "effect";
import Normalize from "./Normalize.js";
import Replace from "./Replace.js";
import { Activate, StreamGate as Gate } from "@playform/ets-dsh-hook";
import type Config from "@Interface/Config.js";
import type State from "@Interface/State.js";
import type { Context } from "@deepseek-ai/cordis";

export default (Context: Context, Options: Config): void => {
	// The injected factory service (typed via Interface/Factory's Context
	// augmentation; guaranteed present by the inject declaration).
	const Factory = Context.pluginFactory;
	// The State: the factory's shared shape plus the quotes hook's own
	// fields, copied from the (cell-unwrapped) validated config by the setup
	// map. A MAP flavor has NO replacement field: the substitution is the
	// core's Quotes table, not a configured knob.
	const State: State = Factory.State<State>(Context, Options, {
		module: "hook-dsh-normalize-quotes",
		fields: {
			Reasoning: "normalizeReasoning",
			ToolArgs: "normalizeToolArguments",
		},
	});
	State.Factory = Factory;

	// THE EFFECT DELTA (R7a, see Interface/State): the plugin's long-lived
	// Effect Scope - a synchronous `Scope.make` run through `Effect.runSync`
	// (apply is a sync seam; a sync `Scope.make` under runSync is fully
	// synchronous, so no async boundary is introduced). Unused at runtime by
	// this module (the Stream pipeline runs with no services and no scope);
	// kept for the family's uniform State shape.
	State.Scope = Effect.runSync(Scope.make());

	// Durable activation proof - "did it activate" must be answerable from the
	// ledger alone. Format (asserted by the smoke):
	//   hook-dsh-normalize-quotes: activated (reasoning=on, toolArgs=off, logFile=...)
	// The line's string mechanics live in the core's Activate composer; the
	// FIELD LIST is the module's own - a MAP flavor has NO replacement field,
	// so the `replacement=` pair is simply absent from the list.
	Factory.Append(
		State,
		Activate([
			["reasoning", State.Reasoning ? "on" : "off"],
			["toolArgs", State.ToolArgs ? "on" : "off"],
			["logFile", State.Ledger],
		]),
	);

	// The quotes hook's own Wire: one llm/stream waterfall listener, owned by
	// the current fiber (removed on unload - no manual removeListener
	// bookkeeping, ever). The waterfall discipline:
	//   * next() is ALWAYS called, unconditionally, first - omitting it
	//     short-circuits the waterfall and the model call never happens (the
	//     `Stream.fromAsyncIterable(Next(), ...)` argument list evaluates
	//     Next() synchronously at listener invocation, before any iteration);
	//   * options (the request, `_Request` - never read, NEVER touched) is a
	//     LOOP-built deep-frozen object whose content is a pure function of
	//     the session log: listeners read it, never rewrite it;
	//   * the returned wrapped iterable is what every downstream consumer
	//     (live UI and durable transcript) sees - the normalization is
	//     VISIBLE by construction.
	Context.on("llm/stream", (_Request, Next) =>
		Stream.toAsyncIterable(
			Gate(
				// The plain harness seam in: Next() called exactly once,
				// synchronously; the identity onError keeps the upstream error
				// object intact so the consumer's `for await` rethrows it verbatim.
				Stream.fromAsyncIterable(Next(), (Error) => Error),
				// The FLAVOR: the core's Quotes table - a MAP flavor has NO
				// replacement knob, so the transform closes over nothing per-chunk.
				(Text) => Replace(Text),
				State.Reasoning,
				State.ToolArgs,
				// The post-stream ledger line (only when anything was replaced).
				Normalize(State),
			),
		),
	);

	// The loader ignores any return value; the smoke harness probes the built
	// State through this debug attachment instead (a bare `return State` is
	// avoided: loader behavior on apply return values is untrusted).
	(Context as { __hookDshQuotesState?: State }).__hookDshQuotesState = State;
};
