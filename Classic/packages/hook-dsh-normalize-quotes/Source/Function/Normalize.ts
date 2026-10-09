// Normalize - the stream wrapper: an async-generator over the UPSTREAM chunk
// stream that yields each chunk through the pure dispatch (Function/Chunk)
// and, after a NORMAL loop completion, writes the ledger line when anything
// was replaced. This is the quotes hook's OWN Wire: the factory's Wire is
// fs/observed-hardwired (this family's silence), while the quotes hook's
// normalization must be VISIBLE - it is the feature - so it registers a
// plain `ctx.on("llm/stream", ...)` listener (Function/Apply) whose body is
// exactly `Normalize(Next(), State)`.
//
// Invariants (docs/subsystems/llm-streaming.md:1108-1125, :296-304;
// docs/cordis-api/events.md:97-123):
//
//   * next() is ALWAYS called by the listener BEFORE this generator runs -
//     omitting it short-circuits the waterfall and the model call never
//     happens (the waterfall discipline: only decision-owners may veto).
//   * options is NEVER touched by this plugin: a LOOP-built request arrives
//     deep-frozen (mutation throws) and its content is a pure function of
//     the session log - listeners read it, never rewrite it.
//   * CHUNK ORDER is preserved: one in, one out, strictly sequential.
//   * The stream is never buffered: each upstream chunk is yielded before
//     the next `next()` on the upstream iterator (the for-await loop), so
//     consumers see deltas live.
//   * Upstream throws PROPAGATE: no try/finally wraps the loop, so a failed
//     stream (the LlmRuntime normalizes adapter failures to a terminal
//     `error`/`aborted` finish) passes through untouched - and a thrown-away
//     stream writes NO ledger line (the count line only follows a normal
//     completion).
//   * The ledger line is exactly `hook-dsh-normalize-quotes: normalized N quote
//     char(s) in one stream` (via State.Factory.Append - logger + durable
//     file, never throws), written only when N > 0.
//
// Per-call RAW-marker state - LOCAL variables of THIS generator invocation,
// never module-level (two concurrent streams must never share the state,
// and an HMR reload must never inherit stale state):
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
//   * The edit exemption needs NO state here: the core's dispatch exempts a
//     delta/block whose `name` is "edit" on every chunk individually (the
//     edit tool's `old_string` must match the real file bytes).
import Chunk from "./Chunk.js";
import type { StreamChunk } from "@deepseek-ai/dsh-llm";
import type State from "@Interface/State.js";

export default async function* (
	Upstream: AsyncIterable<StreamChunk>,
	State: State,
): AsyncGenerator<StreamChunk, void, void> {
	let Count = 0;
	let CurrentCall = "";
	let RawCall = false;
	for await (const Original of Upstream) {
		switch (true) {
			case Original.type === "tool-call-delta" && Original.id !== CurrentCall: {
				CurrentCall = Original.id;
				RawCall = Original.argumentsDelta.startsWith('{"__normalize":false');
				break;
			}
		}
		const Result = Chunk(Original, State.Reasoning, State.ToolArgs, RawCall);
		Count += Result.count;
		yield Result.chunk;
	}
	switch (true) {
		case Count > 0:
			State.Factory.Append(State, `normalized ${Count} quote char(s) in one stream`);
			// P5 journal — the same count event into the shared storage domain
			// (event "normalized"), best-effort: with no storage facility the
			// wrapper is a silent no-op. Detail byte-identical to the ledger line.
			State.Factory.Journal(
				State,
				"normalized",
				"",
				`normalized ${Count} quote char(s) in one stream`,
			);
			break;
	}
}
