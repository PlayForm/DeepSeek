// Gate - the STREAM TRANSFORMER: the Effect-TS v4 hook point of the
// stream-normalization family. The pure reducers (Stream/Chunk, Stream/Block,
// Stream/Strip) stay byte-identical; this module lifts them into a REAL
// `Stream<A, E, R>` so the waterfall boundary (docs/subsystems/
// llm-streaming.md, the plan's boundary 1) becomes pure adapter code:
//
//   Stream.fromAsyncIterable(next(), onError)   the plain harness seam
//     .pipe(Gate(Replace, Reasoning, ToolArgs, onCount?))
//   Stream.toAsyncIterable(stream)              back to the plain seam
//
// - other Effect transformers pipe directly onto the gate, and the
// `llm/stream` listener keeps its plain `(options, next) => AsyncIterable`
// signature with no fibers leaked.
//
// The behavior is EQUIVALENT to the Classic per-flavor async-generator
// wrapper (hook-dsh-normalize-*/Source/Function/Normalize.ts), which the
// smoke asserts at the reducer level (Stream/Chunk) - this transformer is
// the same state machine, expressed with Stream combinators:
//
//   * CHUNK ORDER is preserved: one in, one out, strictly sequential -
//     `Stream.flatMap` is sequential by default (an undefined concurrency
//     is sequential in Effect v4), and each element fans out through
//     `Stream.fromIterable` over a one-element result (the multi-emission
//     hook point: a future gate that splits or injects chunks changes only
//     the array, not the pipeline);
//   * UPSTREAM FAILURES PROPAGATE untouched: the reducer is pure and adds
//     no error handling, so a failed stream fails the gate stream with the
//     same error (the Classic generator's unguarded for-await);
//   * THE STREAM IS NEVER BUFFERED: each upstream chunk is pulled, reduced
//     and emitted before the next pull - consumers see deltas live;
//   * THE COUNT SUMMARY runs only after a NORMAL completion (the Classic
//     post-loop Append): the summary is appended as a final, non-emitting
//     section (`Stream.concat` + `Stream.drain(Stream.fromEffect(...))`),
//     so a stream abandoned mid-flight never reaches it - a thrown-away
//     stream writes NO ledger line, byte-identical semantics. With no
//     `OnCount` the gate is a pure chunk-to-chunk transformer.
//
// Per-call RAW-marker state - LOCAL to this `Stream.suspend` thunk, never
// module-level (two concurrent streams must never share the state, an HMR
// reload must never inherit stale state, and re-running the SAME Stream
// value re-runs the thunk - fresh state per materialization):
//
//   * `CurrentCall` - the tool-call id whose deltas are currently flowing;
//     the id is the per-call state boundary (the real 0.2.0-rc.2
//     ToolCallDelta carries it on every delta, alongside its optional
//     `name`).
//   * `RawCall` - whether THAT call opened its arguments with the
//     `{"__normalize":false` marker (the FIRST key): a raw call passes
//     through the tool-args gate UNNORMALIZED - its explicit per-call
//     opt-out - with the marker entry itself stripped by the core
//     (Stream/Strip), so the executed call carries no unknown key.
//   * The marker is detected on the FIRST delta of the call - the delta
//     that carries the arguments start. A pathologically tiny first delta
//     (shorter than the marker) is the documented edge: its split text is
//     invisible to the startsWith probe and the call normalizes normally.
//   * The edit/raw-write/normalize-file exemptions need NO state here: the
//     core's dispatch (Stream/Chunk) exempts a delta/block whose `name`
//     matches on every chunk individually.
//
// The chunk/block shapes are STRUCTURAL copies of the reducers' internal
// ones (the family convention: the shapes are not exported, each consumer
// compiles against its own structural copy). The injected `Replace`
// transform must be pure and total on any string; `OnCount` receives the
// stream's total NORMALIZED-character count (marker strips excluded - the
// reducers keep count 0 for those) exactly once, after the last chunk.
import { Effect, Stream } from "effect";
import Chunk from "./Chunk.js";

type BlockShape =
	| { type: "text"; text: string }
	| { type: "reasoning"; text?: string | undefined }
	| { type: string };

type ChunkShape =
	| { type: "text-delta"; text: string }
	| { type: "reasoning-delta"; text: string }
	| {
			type: "tool-call-delta";
			id?: string;
			name?: string;
			argumentsDelta: string;
	  }
	| { type: "block-end"; block: BlockShape }
	| { type: string };

export default <T extends ChunkShape, E, R>(
	Upstream: Stream.Stream<T, E, R>,
	Replace: (Text: string) => { text: string; count: number },
	Reasoning: boolean,
	ToolArgs = false,
	OnCount?: (Count: number) => void,
): Stream.Stream<T, E, R> =>
	Stream.suspend(() => {
		// The per-materialization state (see the header).
		let Count = 0;
		let CurrentCall = "";
		let RawCall = false;
		const Gated: Stream.Stream<T, E, R> = Stream.flatMap(Upstream, (Original: T) => {
			switch (true) {
				case Original.type === "tool-call-delta" &&
					(Original as { id?: string }).id !== CurrentCall: {
					CurrentCall = (Original as { id?: string }).id ?? "";
					RawCall = (Original as { argumentsDelta: string }).argumentsDelta.startsWith(
						'{"__normalize":false',
					);
					break;
				}
			}
			const Result = Chunk(Original, Replace, Reasoning, ToolArgs, RawCall);
			Count += Result.count;
			// The fan-out: one chunk in, the (possibly rewritten) chunk out -
			// sequential by default, so the order contract holds by construction.
			return Stream.fromIterable([Result.chunk]);
		});
		const Sink = OnCount;
		// The count summary (see the header): the Classic post-loop Append,
		// re-homed as the gate stream's final non-emitting section.
		return Sink
			? Stream.concat(Gated, Stream.drain(Stream.fromEffect(Effect.sync(() => Sink(Count)))))
			: Gated;
	});
