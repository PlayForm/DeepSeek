// Source/Test/Telemetry/Test.ts - THE TELEMETRY THE LOG ALREADY CARRIES
// (Documentation/Plans/COST-TRACK-PLUGIN.md section 17.4): one session's
// records walked in order - the assistant/attempt events between a step/start
// and the assistant/message counted as the retry count, the step-to-message
// distance as the latency, the first stream record's time0 as the perceived
// first-token latency (null when the stream is empty or the field is
// absent), the utilization as the surface over the context window (null when
// the window is absent) - and an unknown shape never throws.
import assert from "node:assert/strict";

import Telemetry from "../../../Target/Function/Telemetry.js";
import { Check, Finish, MakeCounter } from "../Harness.js";

// One step start and one assistant message, hand-built the way the session
// log carries them (the timestamp under the record's data).
const Step = { type: "step/start", data: { time: 1000 } };
const Message = (Time: number, Extra: Record<string, unknown> = {}): unknown => ({
	type: "assistant/message",
	data: { time: Time, usage: { outputTokens: 200 }, ...Extra },
});

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	Check(Count, "E4: two attempts between the step and the message are counted", () => {
		const One = Telemetry([Step, { type: "assistant/attempt" }, { type: "assistant/attempt" }, Message(3000)], 0);
		assert.equal(One.Attempts, 2, `attempts ${One.Attempts}`);
	});
	Check(Count, "E4: the latency is the step-to-message distance and the rate follows", () => {
		const One = Telemetry([Step, Message(3000)], 0);
		assert.equal(One.LatencyMs, 2000, `latency ${One.LatencyMs}`);
		assert.ok(
			One.TokensPerSecond !== null && Math.abs(One.TokensPerSecond - 100) <= 1e-9,
			`rate ${One.TokensPerSecond}`,
		);
	});
	Check(Count, "E4: a missing or empty stream yields a null first-token latency", () => {
		assert.equal(Telemetry([Step, Message(3000)], 0).FirstTokenMs, null, "no stream field");
		assert.equal(
			Telemetry([Step, Message(3000, { stream: [] })], 0).FirstTokenMs,
			null,
			"an empty stream",
		);
		assert.equal(
			Telemetry([Step, Message(3000, { stream: [{ other: 1 }] })], 0).FirstTokenMs,
			null,
			"an absent time0",
		);
		assert.equal(
			Telemetry([Step, Message(3000, { stream: [{ time0: 1500 }] })], 0).FirstTokenMs,
			1500,
			"the first stream record's time0",
		);
	});
	Check(Count, "E4: utilization is the surface over the window, null when the window is absent", () => {
		const Windowed = Telemetry(
			[Step, Message(3000), { type: "request/context", data: { contextWindow: 1000 } }],
			250,
		);
		assert.equal(Windowed.ContextWindow, 1000, `window ${Windowed.ContextWindow}`);
		assert.ok(
			Windowed.Utilization !== null && Math.abs(Windowed.Utilization - 0.25) <= 1e-9,
			`utilization ${Windowed.Utilization}`,
		);
		const Blind = Telemetry([Step, Message(3000)], 250);
		assert.equal(Blind.ContextWindow, null, "the window is absent");
		assert.equal(Blind.Utilization, null, "the utilization is unknown");
	});
	Check(Count, "E4: an unknown shape never throws and the attempts default to one", () => {
		const One = Telemetry(
			[null, 42, { type: "step/start" }, {}, { type: "assistant/message" }],
			0,
		);
		assert.equal(One.Attempts, 1, `attempts ${One.Attempts}`);
		assert.equal(One.LatencyMs, null, "no readable times, no latency");
		assert.equal(One.ErrorCode, null, "no failure, no code");
	});
	return Finish(Count, "Telemetry");
};

// Standalone entry: `node Target/Test/Telemetry/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Telemetry`);
}
