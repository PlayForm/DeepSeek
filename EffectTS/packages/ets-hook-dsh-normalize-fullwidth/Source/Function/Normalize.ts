// Normalize - the COUNT CALLBACK: the fullwidth hook's delegate for the
// CORE's Gate `OnCount` hook. In the Classic flavor this module was the
// stream wrapper itself (an async-generator over the upstream chunk stream
// that yielded each chunk through the pure dispatch and, after a NORMAL loop
// completion, wrote the ledger line when anything was replaced); in the
// Effect adaptation the wrapper has become the CORE's real Stream transformer
// (Stream/Gate), and this module keeps only its TAIL - the post-stream
// ledger write - as the callback the Gate invokes exactly once, after the
// last chunk of a normally-completing stream. The Gate runs it as the final,
// non-emitting section of the stream (`Stream.concat` +
// `Stream.drain(Stream.fromEffect(...))`), so a stream abandoned mid-flight
// or killed by an upstream throw never reaches it - a thrown-away stream
// writes NO ledger line, byte-identical to the Classic post-loop Append.
//
// Invariants carried over unchanged (docs/subsystems/llm-streaming.md:
// 1108-1125, :296-304; docs/cordis-api/events.md:97-123):
//
//   * next() is ALWAYS called by the listener BEFORE this callback can ever
//     run - the listener body (Function/Apply) calls Next() synchronously to
//     build the upstream stream; omitting it would short-circuit the
//     waterfall and the model call never happens (the waterfall discipline:
//     only decision-owners may veto).
//   * options is NEVER touched by this plugin: a LOOP-built request arrives
//     deep-frozen (mutation throws) and its content is a pure function of
//     the session log - listeners read it, never rewrite it.
//   * The ledger line is exactly `hook-dsh-normalize-fullwidth: normalized N
//     fullwidth char(s) in one stream` (via State.Factory.Append - logger +
//     durable file, never throws), written only when N > 0; the callback is
//     invoked with the stream's total count (marker strips excluded - the
//     reducers keep count 0 for those), including 0 for an empty/untouched
//     stream, and no-ops in that case.
//
// Per-stream state - NONE here: the count accumulator lives inside the
// Gate's per-materialization `Stream.suspend` closure (two concurrent
// streams never share it, an HMR reload never inherits stale state, and
// re-running the same Stream value re-runs the thunk - fresh state per
// materialization). This callback closes over only the State (the factory
// service and the ledger file), which is per-apply, never module-level.
import type State from "@Interface/State.js";

export default (State: State) =>
	// The Gate's `OnCount` shape: one call per stream, after the last chunk,
	// with the stream's total NORMALIZED-character count.
	(Count: number): void => {
		switch (true) {
			case Count > 0:
				State.Factory.Append(State, `normalized ${Count} fullwidth char(s) in one stream`);
				// P5 journal - the same count event into the shared storage domain
				// (event "normalized"), best-effort: with no storage facility the
				// wrapper is a silent no-op. Detail byte-identical to the ledger line.
				State.Factory.Journal(
					State,
					"normalized",
					"",
					`normalized ${Count} fullwidth char(s) in one stream`,
				);
				break;
		}
	};
