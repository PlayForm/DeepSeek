// Source/Test/Fold/Test.ts - the fold's smokes over hand-written event arrays
// (the conversation spine's section 3.1): a two-step session folds turn, step
// and both calls with their usage; a tool call with a relative path resolves
// against the session header's cwd; a grep whose path is a directory produces
// no file touch; an unknown event shape is skipped without throwing. No ctx,
// no factory, no fs - the fold is pure.
import assert from "node:assert/strict";
import { resolve } from "node:path";

import { Fold } from "../../../Target/Library.js";
import { Check, Finish, MakeCounter } from "../Harness.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	const Two = Fold([
		{ seq: 0, type: "session", time: 1000, id: "s1", cwd: "/home/u/project" },
		{ seq: 1, type: "turn/start", time: 1100, data: { turn: 1 } },
		{ seq: 2, type: "step/start", time: 1200, data: { turn: 1, step: 1 } },
		{
			seq: 3,
			type: "assistant/message",
			time: 1300,
			data: {
				turn: 1,
				step: 1,
				usage: { inputTokens: 100, outputTokens: 50, cacheReadTokens: 10 },
				message: { source: { provider: "p", model: "m" } },
			},
		},
		{
			seq: 4,
			type: "tool/call",
			time: 1400,
			data: {
				turn: 1,
				step: 1,
				name: "write",
				callId: "c1",
				arguments: JSON.stringify({ file_path: "/home/u/project/a.ts" }),
			},
		},
		{ seq: 5, type: "step/start", time: 1500, data: { turn: 1, step: 2 } },
		{
			seq: 6,
			type: "assistant/message",
			time: 1600,
			data: {
				turn: 1,
				step: 2,
				usage: { inputTokens: 200, outputTokens: 80 },
				message: { source: { provider: "p", model: "m" } },
			},
		},
	]);
	Check(Count, "F1: a two-step session folds turn, step and both calls with their usage", () => {
		assert.equal(Two.Turn, 1, "the turn start advanced the cursor");
		assert.equal(Two.Step, 2, "the second step start advanced the cursor");
		assert.equal(Two.Calls.length, 2, "one call per assistant message");
		const [First, Second] = Two.Calls;
		if (First === undefined || Second === undefined) {
			throw new Error("the two calls are missing");
		}
		assert.equal(First.InputTokens, 100);
		assert.equal(First.OutputTokens, 50);
		assert.equal(First.CacheReadTokens, 10, "a reported bucket is kept");
		assert.equal(First.Provider, "p");
		assert.equal(First.Model, "m");
		assert.equal(First.Turn, 1);
		assert.equal(First.Step, 1);
		assert.equal(Second.InputTokens, 200);
		assert.equal(Second.OutputTokens, 80);
		assert.equal(Second.CacheReadTokens, null, "a missing bucket is null, never guessed");
		assert.equal(Second.Step, 2);
		assert.equal(Two.Tools.length, 1, "the write tool call is folded");
		assert.equal(Two.Touches.length, 1, "the write tool call resolved one touch");
		assert.deepEqual(Two.Files, ["/home/u/project/a.ts"], "the distinct file, once");
	});

	const Relative = Fold([
		{ seq: 0, type: "session", time: 1000, id: "s2", cwd: "/home/u/project" },
		{ seq: 1, type: "turn/start", time: 1100, data: { turn: 1 } },
		{ seq: 2, type: "step/start", time: 1200, data: { turn: 1, step: 1 } },
		{
			seq: 3,
			type: "tool/call",
			time: 1300,
			data: {
				turn: 1,
				step: 1,
				name: "read",
				callId: "c2",
				arguments: JSON.stringify({ file_path: "src/a.ts" }),
			},
		},
	]);
	Check(Count, "F2: a tool call with a relative path resolves against the session header's cwd", () => {
		const [Touch] = Relative.Touches;
		if (Touch === undefined) {
			throw new Error("the touch is missing");
		}
		assert.equal(Touch.Path, resolve("/home/u/project", "src/a.ts"), "the resolved path");
		assert.equal(Touch.Kind, "read");
		assert.equal(Touch.Turn, 1);
		assert.equal(Touch.Step, 1);
		assert.deepEqual(Relative.Files, [resolve("/home/u/project", "src/a.ts")]);
	});

	const Search = Fold([
		{ seq: 0, type: "session", time: 1000, id: "s3", cwd: "/home/u/project" },
		{
			seq: 1,
			type: "tool/call",
			time: 1100,
			data: {
				turn: 1,
				step: 1,
				name: "grep",
				callId: "c3",
				arguments: JSON.stringify({ path: "src" }),
			},
		},
	]);
	Check(Count, "F3: a grep whose path is a directory produces no file touch", () => {
		assert.equal(Search.Touches.length, 0, "a directory is not a file touch");
		assert.equal(Search.Tools.length, 1, "the tool call itself is still folded");
		assert.deepEqual(Search.Files, [], "the distinct-files list stays empty");
	});

	const Unknown = Fold([
		null,
		"not an event",
		{ seq: 1, type: "wat/now", time: 1000, data: { turn: 9 } },
		{ seq: 2, type: "step/end", time: 1100, data: { turn: 1, step: 1 } },
	]);
	Check(Count, "F4: an unknown event shape is skipped without throwing", () => {
		assert.equal(Unknown.Turn, 0, "the alien turn never moved the cursor");
		assert.equal(Unknown.Step, 0);
		assert.equal(Unknown.Calls.length, 0);
		assert.equal(Unknown.Tools.length, 0);
		assert.equal(Unknown.Touches.length, 0);
		assert.deepEqual(Unknown.Files, []);
	});

	return Finish(Count, "Fold");
};

// Standalone entry: `node Target/Test/Fold/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Fold`);
}
