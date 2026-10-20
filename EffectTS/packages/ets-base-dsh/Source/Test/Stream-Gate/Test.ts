// Source/Test/Stream-Gate/Test.ts - one singular test: the stream gate as a
// real `Stream` transformer (the base's own additive surface) - reducer
// equivalence with the Chunk dispatch, per-call raw-marker state, error
// propagation, the completion-only count summary, and fresh state per
// materialization.
// Runs standalone (`node Target/Test/Stream-Gate/Test.js`) AND under the
// aggregate (`Maintain/Run-Smokes.mjs` spawns it).
// This folder is the ETS-only additive coverage re-homed from the ETS core
// smoke's section 10; there is no Classic twin.
import assert from "node:assert/strict";
import { CheckAsync, Finish, MakeCounter } from "../Harness.js";
import { Dashes, Replace } from "../../../../ets-hook-dsh-core/Target/Library.js";
import { Chunk, StreamGate as Gate } from "../../../Target/Library.js";
import { Stream } from "effect";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	// Group: Gate - the stream transformer (EffectTS additive). A replayable
	// async iterable (the reducer-level contract: Stream.flatMap is sequential
	// by default, so one in - one out, strictly sequential).
	{
		// The Check label is the source suite's ok label, verbatim (the em
		// dash is escaped for an ASCII source file).
		await CheckAsync(
			Count,
			"Gate: the stream transformer \u2014 reducer equivalence, per-call raw state, error propagation, completion-only count summary, fresh state per materialization",
			async () => {
				const ToDash = (Text: string) => Replace(Text, Dashes, "-");
				type AnyChunk = { type: string; [key: string]: unknown };
				const Replay = (Chunks: AnyChunk[]) => ({
					[Symbol.asyncIterator]: async function* () {
						yield* Chunks;
					},
				});
				const Collect = async (
					Chunks: AnyChunk[],
					ToolArgs = false,
					OnCount?: (Count: number) => void,
				): Promise<AnyChunk[]> => {
					const Out = Gate(
						Stream.fromAsyncIterable(Replay(Chunks), (Error) => Error),
						ToDash,
						true,
						ToolArgs,
						OnCount,
					);
					return Array.fromAsync(Stream.toAsyncIterable(Out));
				};
				// equivalence with the reducer-level dispatch (the Classic
				// assertions' behaviors, observed through the Stream boundary)
				const GateChunks: AnyChunk[] = [
					{ type: "text-delta", index: 0, text: "a \u2014 b" },
					{ type: "usage", usage: { input: 1, output: 2 } },
					{ type: "text-delta", index: 0, text: "plain" },
				];
				const GateGot = await Collect(GateChunks);
				assert.deepEqual(
					GateGot,
					GateChunks.map((Original) => Chunk(Original, ToDash, true).chunk),
					"the gate stream's output equals the reducer-level Chunk dispatch, in order",
				);
				assert.equal(
					GateGot[1],
					GateChunks[1],
					"usage passes through BY IDENTITY through the stream",
				);
				let GateSum = -1;
				await Collect(GateChunks, false, (Count) => (GateSum = Count));
				assert.equal(
					GateSum,
					1,
					"the count summary reports the stream's total after a NORMAL completion (1 dash in 'a \u2014 b', none in 'plain')",
				);
				// the per-call RAW-marker state machine (CurrentCall/RawCall via
				// Stream.suspend): the first delta of a call opens it, later
				// deltas of the SAME call keep it, and the NEXT call id resets it.
				const GateRaw = {
					type: "tool-call-delta",
					index: 1,
					id: "call_1",
					name: "write",
					argumentsDelta: '{"__normalize":false,"path":"a\u2014b"}',
				};
				const GateRawNext = {
					type: "tool-call-delta",
					index: 1,
					id: "call_1",
					name: "write",
					argumentsDelta: ',"note":"x\u2014y"}',
				};
				const GatePlain = {
					type: "tool-call-delta",
					index: 1,
					id: "call_2",
					name: "write",
					argumentsDelta: '{"path":"c\u2014d"}',
				};
				const GateRawGot = await Collect([GateRaw, GateRawNext, GatePlain], true);
				assert.deepEqual(
					GateRawGot[0],
					{
						type: "tool-call-delta",
						index: 1,
						id: "call_1",
						name: "write",
						argumentsDelta: '{"path":"a\u2014b"}',
					},
					"the raw-marked call's first delta is stripped and UNNORMALIZED",
				);
				assert.equal(
					GateRawGot[1],
					GateRawNext,
					"a later delta of the SAME raw call passes through BY IDENTITY",
				);
				assert.deepEqual(
					GateRawGot[2],
					{
						type: "tool-call-delta",
						index: 1,
						id: "call_2",
						name: "write",
						argumentsDelta: '{"path":"c-d"}',
					},
					"the NEXT call id resets the raw state \u2192 its arguments normalize",
				);
				// upstream failures propagate untouched (the Classic generator's
				// unguarded loop)
				const Boom = new Error("upstream boom");
				async function* Broken() {
					yield { type: "text-delta", index: 0, text: "\u2014x" };
					throw Boom;
				}
				await assert.rejects(
					async () => {
						const Out = Gate(
							Stream.fromAsyncIterable(Broken(), (Error) => Error),
							ToDash,
							true,
						);
						for await (const ChunkOut of Stream.toAsyncIterable(Out)) {
							void ChunkOut;
						}
					},
					(Error) => Error === Boom,
					"an upstream failure propagates through the gate stream untouched",
				);
				// a stream abandoned mid-flight writes NO count summary (the
				// thrown-away generator's unwritten ledger line)
				let AbandonedSum = 0;
				{
					const Out = Gate(
						Stream.fromAsyncIterable(Replay(GateChunks), (Error) => Error),
						ToDash,
						true,
						false,
						(Count) => (AbandonedSum = Count),
					);
					const Iterator = Stream.toAsyncIterable(Out)[Symbol.asyncIterator]();
					await Iterator.next();
					await Iterator.return?.();
					await new Promise((Resolve) => setImmediate(Resolve));
				}
				assert.equal(
					AbandonedSum,
					0,
					"an abandoned stream never reaches the count summary",
				);
				// re-running the SAME gate Stream re-runs the state (fresh per
				// materialization via Stream.suspend - two streams never share
				// CurrentCall/RawCall)
				let TwiceSum = -1;
				{
					const Out = Gate(
						Stream.fromAsyncIterable(Replay([GateRaw, GatePlain]), (Error) => Error),
						ToDash,
						true,
						true,
						(Count) => (TwiceSum = Count),
					);
					const First = await Array.fromAsync(Stream.toAsyncIterable(Out));
					let SecondSum = -1;
					const Again = Gate(
						Stream.fromAsyncIterable(Replay([GateRaw, GatePlain]), (Error) => Error),
						ToDash,
						true,
						true,
						(Count) => (SecondSum = Count),
					);
					const Second = await Array.fromAsync(Stream.toAsyncIterable(Again));
					assert.deepEqual(
						First,
						Second,
						"two materializations of the gate produce identical output",
					);
					assert.equal(
						SecondSum,
						TwiceSum,
						"the per-materialization state is fresh (same count both runs)",
					);
				}
			},
		);
	}
	return Finish(Count, "Stream-Gate");
};

// Standalone entry: `node Target/Test/Stream-Gate/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Stream-Gate`);
}
