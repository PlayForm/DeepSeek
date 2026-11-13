import assert from "node:assert/strict";

import { Stream } from "../../../Target/Library.js";
import { Check, Finish, MakeCounter } from "../Harness.js";

/**
 * @module Test
 *
 * One singular test of the llm-stream arm factory.
 *
 * @remarks
 *
 * The test covers the four rules: identity passthrough when nothing is
 * replaced, the count accumulation and the one settle line when something is,
 * the per-call raw marker turning the transform's Raw flag on, and the silence
 * of a failed stream.
 *
 * The file runs standalone (`node Target/Test/Stream/Test.js`) AND under the
 * aggregate (`Maintain/Run/Smokes/Index.mjs`). It is a unit smoke of
 * `@playform/lib-dsh-core`: the REAL built entry only.
 */
type Chunk = { type: string; id?: string; argumentsDelta?: string; text?: string };

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group: Stream - the llm-stream arm factory (state, count, settle).
	{
		const Sub = "Stream: the llm-stream arm factory (state, count, settle)";
		{
			Check(Count, Sub, () => {
				const Lines: string[] = [];
				const Journal: string[] = [];
				const Sink = {
					Append: (_State: unknown, Line: string) => {
						Lines.push(Line);
					},
					Journal: (_State: unknown, Event: string, _Path: string, Value: string) => {
						Journal.push(`${Event}:${Value}`);
					},
				};
				const Arm = Stream<Chunk, { Tag: string }>(
					(Original) => ({ chunk: Original, count: Original.type === "text-delta" ? 2 : 0 }),
					(Total) => `normalized ${Total} dash char(s) in one stream`,
					Sink,
				);
				return (async () => {
					const Upstream = async function* () {
						yield { type: "text-delta", text: "a" } as Chunk;
						yield { type: "block-start" } as Chunk;
					};
					const Seen: Chunk[] = [];
					for await (const Item of Arm(Upstream(), { Tag: "x" })) {
						Seen.push(Item);
					}
					assert.equal(Seen.length, 2, "every upstream chunk is yielded exactly once");
					assert.equal(Seen[0]?.text, "a", "the chunk order and the payload are preserved");
					assert.deepEqual(Lines, ["normalized 2 dash char(s) in one stream"], "one settle line");
					assert.deepEqual(Journal, [
						"normalized:normalized 2 dash char(s) in one stream",
					], "one journal record with the same text");
				})();
			});
			Check(Count, Sub, async () => {
				const SeenRaw: boolean[] = [];
				const Arm = Stream<Chunk, object>(
					(Original, _State, Raw) => {
						SeenRaw.push(Raw);
						return { chunk: Original, count: 0 };
					},
					() => "unused",
					{ Append: () => {}, Journal: () => {} },
				);
				const Upstream = async function* () {
					yield { type: "tool-call-delta", id: "c1", argumentsDelta: '{"__normalize":false,"x":1}' } as Chunk;
					yield { type: "tool-call-delta", id: "c1", argumentsDelta: ',"y":2' } as Chunk;
					yield { type: "tool-call-delta", id: "c2", argumentsDelta: '{"a":1}' } as Chunk;
				};
				for await (const _Item of Arm(Upstream(), {})) {
					// drain
				}
				assert.deepEqual(SeenRaw, [true, true, false], "the raw flag is per call");
			});
			Check(Count, Sub, async () => {
				const Lines: string[] = [];
				const Arm = Stream<Chunk, object>(
					(Original) => ({ chunk: Original, count: 1 }),
					(Total) => `normalized ${Total}`,
					{
						Append: (_State: object, Line: string) => {
							Lines.push(Line);
						},
						Journal: () => {},
					},
				);
				const Upstream = async function* () {
					yield { type: "text-delta", text: "a" } as Chunk;
					throw new Error("upstream failure");
				};
				let Thrown = false;
				try {
					for await (const _Item of Arm(Upstream(), {})) {
						// drain
					}
				} catch {
					Thrown = true;
				}
				assert.equal(Thrown, true, "an upstream throw propagates");
				assert.deepEqual(Lines, [], "a failed stream writes no ledger line");
			});
		}
	}
	return Finish(Count, "Stream");
};

// Standalone entry: `node Target/Test/Stream/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Stream`);
}
