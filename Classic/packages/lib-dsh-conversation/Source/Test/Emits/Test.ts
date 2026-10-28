// Source/Test/Emits/Test.ts - the emission's smokes over hand-written event
// arrays (the conversation spine's section 3.1): the envelopes carry the
// source event's seq and time; a tool call with two file arguments emits two
// touches; the session end emits exactly one end envelope; an unknown event
// shape emits nothing. No ctx, no factory, no fs - the emission is pure.
import assert from "node:assert/strict";
import { resolve } from "node:path";

import { Emits, Names } from "../../../Target/Library.js";
import { Check, Finish, MakeCounter } from "../Harness.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	const Emitted = Emits([
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
				usage: { inputTokens: 100, outputTokens: 50 },
				message: { source: { provider: "p", model: "m" } },
			},
		},
	]);
	Check(Count, "E1: the emits carry the source event's seq and time", () => {
		assert.equal(Emitted.length, 3, "the session header emits nothing");
		const [Turn, Step, Call] = Emitted;
		if (Turn === undefined || Step === undefined || Call === undefined) {
			throw new Error("the three envelopes are missing");
		}
		assert.equal(Turn.Kind, Names.turn);
		assert.equal(Turn.Seq, 1);
		assert.equal(Turn.At, 1100);
		assert.equal(Step.Kind, Names.step);
		assert.equal(Step.Seq, 2);
		assert.equal(Step.At, 1200);
		assert.equal(Call.Kind, Names.call);
		assert.equal(Call.Seq, 3);
		assert.equal(Call.At, 1300);
		assert.equal(Turn.SessionId, "s1", "the session header's id is carried");
		assert.equal(Turn.Turn, 1);
		assert.equal(Step.Step, 1);
	});

	const Two = Emits([
		{
			seq: 0,
			type: "tool/call",
			time: 1000,
			data: {
				turn: 1,
				step: 1,
				name: "write",
				callId: "c1",
				arguments: JSON.stringify({ files: ["/p/a.ts", "/p/b.ts"] }),
			},
		},
	]);
	Check(Count, "E2: a tool call with two file arguments emits two touches", () => {
		assert.equal(Two.length, 3, "one tool envelope plus two touch envelopes");
		const [Tool, First, Second] = Two;
		if (Tool === undefined || First === undefined || Second === undefined) {
			throw new Error("the three envelopes are missing");
		}
		assert.equal(Tool.Kind, Names.tool);
		assert.equal(First.Kind, Names.touch);
		assert.equal(Second.Kind, Names.touch);
		assert.equal(First.Seq, 0, "the touches copy the source event's seq");
		assert.equal(First.At, 1000, "the touches copy the source event's time");
		const FirstTouch = First.Data as { Path: string; Kind: string };
		const SecondTouch = Second.Data as { Path: string; Kind: string };
		assert.equal(FirstTouch.Path, resolve("/p/a.ts"));
		assert.equal(SecondTouch.Path, resolve("/p/b.ts"));
		assert.equal(FirstTouch.Kind, "write");
		assert.equal(SecondTouch.Kind, "write");
	});

	const Ended = Emits([
		{ seq: 0, type: "turn/start", time: 1000, data: { turn: 1 } },
		{ seq: 1, type: "session/disposed", time: 2000 },
	]);
	Check(Count, "E3: the session end emits exactly one end envelope", () => {
		assert.equal(Ended.length, 2, "the turn start plus the one end");
		const End = Ended[1];
		if (End === undefined) {
			throw new Error("the end envelope is missing");
		}
		assert.equal(End.Kind, Names.end);
		assert.equal(End.Seq, 1);
		assert.equal(End.At, 2000);
		const Turned = Emits([{ seq: 0, type: "turn/end", time: 3000, data: { turn: 1 } }]);
		assert.equal(Turned.length, 1, "turn/end is the one end envelope");
		const TurnEnd = Turned[0];
		if (TurnEnd === undefined) {
			throw new Error("the end envelope is missing");
		}
		assert.equal(TurnEnd.Kind, Names.end);
	});

	Check(Count, "E4: an unknown event shape emits nothing", () => {
		assert.deepEqual(
			Emits([{ seq: 0, type: "wat/now", time: 1000 }, null, "not an event"]),
			[],
			"the alien shapes are skipped, never thrown on",
		);
	});

	return Finish(Count, "Emits");
};

// Standalone entry: `node Target/Test/Emits/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Emits`);
}
