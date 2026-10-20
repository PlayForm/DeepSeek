// Source/Test/Recompute-And-Ttl/Test.ts - the recompute/changing-value and
// refresh-policy tests: a request-trigger block's rendered value CHANGES
// between two assemblies whose FAKE CLOCK advances (no sleep, no real clock
// dependence), the counters recompute from the pre-step/post-execute
// observers, refresh "ttl" (ttlCalls=2) renders once and REUSES the global
// cache until the TTL expires (then `section rebuilt (ttl 2)`), refresh
// "request" re-renders every assembly, the per-block triggers (ttl/event)
// drive their own staleness, and the tools/change notification clears the
// section cache (`section rebuilt (tools/change)`).
import assert from "node:assert/strict";
import {
	Advance,
	Assemble,
	Block,
	Check,
	ClockBox,
	ExpectedTime,
	Finish,
	LinesWith,
	MakeClocked,
	MakeCounter,
	Post,
	PreStep,
	Validate,
	Ledger,
	rm,
	LiveSection,
} from "../Harness.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	// Group: refresh "ttl" with ttlCalls=2 - one render, one cache reuse, one
	// TTL rebuild (the time block's value CHANGES at the rebuild).
	rm();
	ClockBox.Now = 1700000000000;
	const Run1 = MakeClocked(
		Validate({
			logFile: Ledger,
			enabled: true,
			refresh: "ttl",
			ttlCalls: 2,
			blocks: [Block("t", "time", "{{time}}")],
		}),
	);
	const Out1 = await Assemble(Run1);
	const Text1 = LiveSection(Out1).text;
	{
		Check(Count, "ttl: the first assembly renders and caches", () => {
			assert.ok(LinesWith(Run1, "block rendered t (").length === 1);
			assert.ok(Text1.includes(ExpectedTime(ClockBox.Now)));
		});
		const Out2 = await Assemble(Run1);
		const Text2 = LiveSection(Out2).text;
		Check(Count, "ttl: the second assembly REUSES the cache (byte-identical body)", () => {
			assert.equal(Text2, Text1);
		});
		Check(Count, "ttl: the cache hit re-renders nothing (no new ledger line)", () => {
			assert.equal(LinesWith(Run1, "block rendered t (").length, 1);
		});
		Advance(1000);
		const Out3 = await Assemble(Run1);
		const Text3 = LiveSection(Out3).text;
		Check(Count, "ttl: the expired TTL rebuilds and the time value CHANGES", () => {
			assert.equal(Text3 !== Text1, true);
			assert.ok(Text3.includes(ExpectedTime(ClockBox.Now)));
		});
		Check(Count, "ttl: ledger section rebuilt (ttl 2) byte-exact", () => {
			assert.deepEqual(LinesWith(Run1, "section rebuilt (ttl"), [
				"hook-dsh-live-containers: section rebuilt (ttl 2)",
			]);
		});
		Check(Count, "ttl: the rebuild re-rendered the block (second rendered line)", () => {
			assert.equal(LinesWith(Run1, "block rendered t (").length, 2);
		});
	}
	// Group: refresh "request" - every assembly re-renders.
	rm();
	ClockBox.Now = 1700000000000;
	{
		const Run2 = MakeClocked(
			Validate({
				logFile: Ledger,
				enabled: true,
				refresh: "request",
				blocks: [Block("t", "time", "{{time}}")],
			}),
		);
		const Out1 = await Assemble(Run2);
		const Text1 = LiveSection(Out1).text;
		Advance(1000);
		const Out2 = await Assemble(Run2);
		const Text2 = LiveSection(Out2).text;
		Check(Count, "request: the second assembly re-renders (value changes)", () => {
			assert.equal(Text2 !== Text1, true);
			assert.ok(Text2.includes(ExpectedTime(ClockBox.Now)));
		});
		Check(Count, "request: ledger gains a rendered line per assembly", () => {
			assert.equal(LinesWith(Run2, "block rendered t (").length, 2);
		});
		Check(Count, "request: no global TTL cache line ever", () => {
			assert.equal(LinesWith(Run2, "section rebuilt").length, 0);
		});
	}
	// Group: per-block trigger "ttl" under refresh "request".
	rm();
	ClockBox.Now = 1700000000000;
	{
		const Run3 = MakeClocked(
			Validate({
				logFile: Ledger,
				enabled: true,
				blocks: [Block("p", "note", "stable", { trigger: "ttl", ttlCalls: 2 })],
			}),
		);
		await Assemble(Run3);
		await Assemble(Run3);
		Check(Count, "per-block ttl: the second assembly reuses the block cache", () => {
			assert.equal(LinesWith(Run3, "block rendered p (").length, 1);
		});
		await Assemble(Run3);
		Check(Count, "per-block ttl: the third assembly re-renders (ttlCalls=2 elapsed)", () => {
			assert.equal(LinesWith(Run3, "block rendered p (").length, 2);
		});
	}
	// Group: per-block trigger "event" - dirty only on the observers.
	rm();
	ClockBox.Now = 1700000000000;
	{
		const Run4 = MakeClocked(
			Validate({
				logFile: Ledger,
				enabled: true,
				blocks: [Block("e", "note", "eventful", { trigger: "event" })],
			}),
		);
		await Assemble(Run4);
		await Assemble(Run4);
		Check(Count, "event: steady assemblies reuse the block cache", () => {
			assert.equal(LinesWith(Run4, "block rendered e (").length, 1);
		});
		await Post(Run4, "bash");
		await Assemble(Run4);
		Check(Count, "event: the post-execute observation marks the block dirty", () => {
			assert.equal(LinesWith(Run4, "block rendered e (").length, 2);
		});
	}
	// Group: the per-turn counter reset (the pre-step boundary).
	rm();
	ClockBox.Now = 1700000000000;
	{
		const Run5 = MakeClocked(
			Validate({
				logFile: Ledger,
				enabled: true,
				blocks: [Block("g", "gauge", "s={{sinceLastTool}}")],
			}),
		);
		await Assemble(Run5);
		await Post(Run5, "bash");
		await PreStep(Run5, 1);
		Check(Count, "per-turn reset: the attempts table is cleared on a user message", () => {
			const Shared = [...Run5.State.Registry][0];
			assert.deepEqual(Shared.attempts, {});
			assert.equal(Shared.turns, 1);
		});
	}
	// Group: the tools/change notification clears the section cache.
	rm();
	ClockBox.Now = 1700000000000;
	{
		const Run6 = MakeClocked(
			Validate({
				logFile: Ledger,
				enabled: true,
				refresh: "ttl",
				ttlCalls: 8,
				blocks: [Block("n", "note", "steady")],
			}),
		);
		const Out1 = await Assemble(Run6);
		Run6.Listeners["tools/change"]();
		Check(Count, "tools/change: ledger section rebuilt (tools/change) byte-exact", () => {
			assert.deepEqual(LinesWith(Run6, "section rebuilt (tools/change)"), [
				"hook-dsh-live-containers: section rebuilt (tools/change)",
			]);
		});
		const Out2 = await Assemble(Run6);
		Check(Count, "tools/change: the next assembly rebuilds the section body", () => {
			assert.equal(LiveSection(Out2).text, LiveSection(Out1).text);
			assert.equal(LinesWith(Run6, "section rebuilt (ttl").length, 0);
		});
		Check(Count, "tools/change: steady blocks are not re-rendered", () => {
			assert.equal(LinesWith(Run6, "block rendered n (").length, 1);
		});
	}
	return Finish(Count, "Recompute-And-Ttl");
};

// Standalone entry: `node Target/Test/Recompute-And-Ttl/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Recompute-And-Ttl`);
}
