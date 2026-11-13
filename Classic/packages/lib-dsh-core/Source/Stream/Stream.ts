/**
 * @module Stream
 *
 * The llm-stream arm factory: the wrapper that every normalization flavor
 * mounts on the harness's `llm/stream` waterfall.
 *
 * @remarks
 *
 * The arm owns the per-invocation state machine of one stream and nothing else:
 *
 *   - the per-call boundary - `CurrentCall` is the tool-call id whose deltas are
 *     currently flowing, and `Raw` records whether THAT call opened its
 *     arguments with the `{"__normalize":false` marker (the FIRST key), so the
 *     flavor's dispatch can pass a raw call through unnormalized;
 *   - the count - `Count` accumulates the replaced characters the flavor's
 *     transform reports;
 *   - the settle - after a NORMAL loop completion, when `Count > 0`, ONE ledger
 *     line and ONE journal record.
 *
 * The state is LOCAL to the generator invocation, never module-level: two
 * concurrent streams must never share it, and a reload must never inherit stale
 * state.
 *
 * The invariants (`docs/subsystems/llm-streaming.md:1108-1125, :296-304`):
 *
 *   - `next()` is ALWAYS called by the listener BEFORE this generator runs -
 *     omitting it short-circuits the waterfall and the model call never happens;
 *   - CHUNK ORDER is preserved: one in, one out, strictly sequential;
 *   - the stream is never buffered: each upstream chunk is yielded before the
 *     next pull, so consumers see deltas live;
 *   - upstream throws PROPAGATE: no try/finally wraps the loop, so a failed
 *     stream passes through untouched and writes NO ledger line (the count line
 *     only follows a normal completion).
 *
 * The flavor is INJECTED: the transform, the ledger-line composer and the sink
 * are the caller's, so this module owns the structure and never a string.
 */
/** The chunk shape the per-call marker detection touches. */
type Shape = { type: string; id?: string; argumentsDelta?: string };

export default <C extends Shape, S>(
	Transform: (Original: C, State: S, Raw: boolean) => { chunk: C; count: number },
	Line: (Count: number) => string,
	Sink: {
		Append: (State: S, Line: string) => void;
		Journal: (State: S, Event: string, Path: string, Value: string) => void;
	},
) =>
	async function* (Upstream: AsyncIterable<C>, State: S): AsyncGenerator<C, void, void> {
		let Count = 0;
		let CurrentCall = "";
		let Raw = false;
		for await (const Original of Upstream) {
			switch (true) {
				case Original.type === "tool-call-delta" &&
					(Original as { id: string }).id !== CurrentCall: {
					CurrentCall = (Original as { id: string }).id;
					Raw = (Original as { argumentsDelta: string }).argumentsDelta.startsWith(
						'{"__normalize":false',
					);
					break;
				}
			}
			const Result = Transform(Original, State, Raw);
			Count += Result.count;
			yield Result.chunk;
		}
		switch (true) {
			case Count > 0: {
				const Text = Line(Count);
				Sink.Append(State, Text);
				Sink.Journal(State, "normalized", "", Text);
				break;
			}
		}
	};
