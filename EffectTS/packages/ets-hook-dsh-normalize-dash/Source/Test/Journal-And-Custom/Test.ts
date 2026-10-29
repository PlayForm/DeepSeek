// Source/Test/Journal-And-Custom/Test.ts - one singular test: the journaling
// mechanics and the custom-replacement run - the P5 record shape and routing,
// the N=0/throw/identity negative controls, the custom $-literal replacement
// (config unwrap, literal insertion, its count line and its journal record),
// and the transport-boom error path. The suite's journal arithmetic is
// CUMULATIVE on the factory-level PendingJournal, so this folder replays the
// generating streams (Run 1's 10-replacement stream, Run 2, Run 3, Run 4,
// Run 5, Run 7, 7b, 7c, 7d) as silent fixtures in suite order - every check
// below is byte-verbatim and the arithmetic reproduces the source suite's
// values exactly when run standalone OR under the aggregate.
// Runs standalone (`node Target/Test/Journal-And-Custom/Test.js`) AND under
// the aggregate (`Maintain/Run/Smokes/Index.mjs` spawns it).
// Unit smoke of @playform/ets-hook-dsh-normalize-dash: the fake ctx + the REAL
// factory + the REAL dash apply, from the Harness.
import { existsSync, readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { Check, Finish, MakeCounter, Make, Rm, Validate, Furnace, Ledger } from "../Harness.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	Rm();
	// Fixture: Run 1's 10-replacement waterfall stream (the journal record's
	// generator - its assertions live in Stream-Contract).
	{
		const Run1 = Make(Validate({ logFile: Ledger }));
		const DASHES = "a \u2014 b \u2013 c \u2011 d \u2015 e";
		const Chunks = [
			{ type: "block-start", index: 0, blockType: "text" },
			{ type: "text-delta", index: 0, text: DASHES },
			{
				type: "tool-call-delta",
				index: 1,
				id: "call_1",
				name: "write",
				argumentsDelta: '{"path":"a\u2014b"}',
			},
			{ type: "reasoning-delta", index: 2, text: "\u2014x\u2013" },
			{ type: "block-end", index: 0, block: { type: "text", text: "\u2014kept \u2013gone" } },
			{ type: "block-end", index: 2, block: { type: "reasoning", text: "\u2014y" } },
			{ type: "block-end", index: 3, block: { type: "reasoning", text: "", thinking: "\u2014z" } },
			{ type: "usage", usage: { input: 1, output: 2 } },
			{ type: "finish", reason: "stop" },
		];
		const Wrapped = Run1.Listeners["llm/stream"](
			Object.freeze(Object.freeze({ model: "x", messages: [] })),
			() =>
				(async function* () {
					yield* Chunks;
				})(),
		);
		for await (const Chunk of Wrapped) {
			void Chunk;
		}
		// Group: Run 1 (P5 journal) - the count event lands in the shared
		// storage domain. The smoke's factory instance has no storageDomain
		// facility and no Open has ever succeeded, so the REAL three-stage
		// routing (Function/Journal) serves the record from the factory-level
		// PRE-BIND buffer (stage 2, PendingJournal) - not the per-State queue
		// (stage 3). Record shape:
		// { event: "normalized", path: "", detail: <the ledger line>, at: <number> }.
		const JournalRun1 = Furnace.PendingJournal.filter((R: any) => R.event === "normalized");
		{
			const Sub = "exactly ONE 'normalized' journal record after the 10-replacement stream";
			Check(Count, Sub, () => {
				assert.ok(JournalRun1.length === 1);
			});
		}
		{
			const Sub = "the 'normalized' record carries an empty path (stream-level event)";
			Check(Count, Sub, () => {
				assert.ok(JournalRun1[0] !== undefined && JournalRun1[0].path === "");
			});
		}
		{
			const Sub = "journal detail byte-identical to the ledger count line";
			Check(Count, Sub, () => {
				assert.ok(
					JournalRun1[0] !== undefined &&
						JournalRun1[0].detail === "normalized 10 dash char(s) in one stream",
				);
			});
		}
		{
			const Sub = "the 'normalized' record carries a numeric timestamp";
			Check(Count, Sub, () => {
				assert.ok(JournalRun1[0] !== undefined && typeof JournalRun1[0].at === "number");
			});
		}
		{
			const Sub = "the record routes to the factory pre-bind buffer (stage 2), not the per-State queue";
			Check(Count, Sub, () => {
				assert.ok(Run1.State.Queue.filter((R: any) => R.event === "normalized").length === 0);
			});
		}
	}
	// Fixture: Run 2's reasoning-off stream (0 records; its own assertions
	// live in Stream-Contract).
	{
		Rm();
		const Run2 = Make(Validate({ normalizeReasoning: false, logFile: Ledger }));
		const L2 = Run2.Listeners["llm/stream"];
		for await (const C of L2(Object.freeze({}), () =>
			(async function* () {
				yield { type: "reasoning-delta", index: 0, text: "\u2014" };
				yield { type: "text-delta", index: 0, text: "plain - text" };
			})(),
		)) {
			void C;
		}
		{
			const Sub = "NO journal record when nothing was replaced (N=0)";
			Check(Count, Sub, () => {
				assert.ok(Furnace.PendingJournal.filter((R: any) => R.event === "normalized").length === 1);
			});
		}
	}
	// Group: Run 3 - custom replacement + $-literal safety.
	{
		Rm();
		const Run3 = Make(Validate({ replacement: "$&", logFile: Ledger }));
		{
			const Sub = "volatile unwrap: custom replacement unwrapped";
			Check(Count, Sub, () => {
				assert.ok(Run3.State.Replacement === "$&");
			});
		}
		const L3 = Run3.Listeners["llm/stream"];
		const Out3: any[] = [];
		for await (const C of L3(Object.freeze({}), () =>
			(async function* () {
				yield { type: "text-delta", index: 0, text: "\u2014end" };
			})(),
		)) {
			Out3.push(C);
		}
		{
			const Sub = "custom replacement inserted LITERALLY (function replacer, no $-pattern interpretation)";
			Check(Count, Sub, () => {
				assert.ok(Out3[0].text === "$&end");
			});
		}
		await new Promise((R) => setTimeout(R, 10));
		{
			const Sub = "count line reflects custom-replacement run";
			Check(Count, Sub, () => {
				assert.ok(readFileSync(Ledger, "utf8").includes("normalized 1 dash char(s) in one stream"));
			});
		}
		const JournalRun3 = Furnace.PendingJournal.filter((R: any) => R.event === "normalized");
		{
			const Sub = "the custom-replacement run adds its 'normalized' journal record";
			Check(Count, Sub, () => {
				assert.ok(JournalRun3.length === 2);
			});
		}
		{
			const Sub = "custom-replacement journal detail mirrors the ledger line";
			Check(Count, Sub, () => {
				assert.ok(
					JournalRun3[1] !== undefined &&
						JournalRun3[1].detail === "normalized 1 dash char(s) in one stream",
				);
			});
		}
	}
	// Group: Run 4 - upstream throw propagates, no count line.
	{
		Rm();
		const Run4 = Make(Validate({ logFile: Ledger }));
		const L4 = Run4.Listeners["llm/stream"];
		let Threw: any = null;
		try {
			for await (const C of L4(Object.freeze({}), () =>
				(async function* () {
					yield { type: "text-delta", index: 0, text: "\u2014" };
					throw new Error("transport boom");
				})(),
			)) {
				void C;
			}
		} catch (E) {
			Threw = E;
		}
		{
			const Sub = "upstream throw propagates through the wrapper";
			Check(Count, Sub, () => {
				assert.ok(Threw && Threw.message === "transport boom");
			});
		}
		await new Promise((R) => setTimeout(R, 10));
		{
			const Sub = "NO count line after an upstream throw";
			Check(Count, Sub, () => {
				assert.ok(!existsSync(Ledger) || !readFileSync(Ledger, "utf8").includes("normalized"));
			});
		}
		{
			const Sub = "NO journal record after an upstream throw";
			Check(Count, Sub, () => {
				assert.ok(Furnace.PendingJournal.filter((R: any) => R.event === "normalized").length === 2);
			});
		}
	}
	// Fixture: Run 5's identity stream (count 0 - its identity assertion
	// lives in Stream-Contract).
	{
		const Run5 = Make(Validate({ logFile: Ledger }));
		const L5 = Run5.Listeners["llm/stream"];
		const Keep = { type: "text-delta", index: 0, text: "plain" };
		for await (const C of L5(Object.freeze({}), () =>
			(async function* () {
				yield Keep;
			})(),
		)) {
			void C;
		}
		{
			const Sub = "identity stream (count 0) adds no journal record";
			Check(Count, Sub, () => {
				assert.ok(Furnace.PendingJournal.filter((R: any) => R.event === "normalized").length === 2);
			});
		}
	}
	// Fixture: Run 7's tool-args stream (1 record; its own assertions live in
	// Tool-Args-Exemptions).
	{
		Rm();
		const Run7 = Make(Validate({ normalizeToolArguments: true, logFile: Ledger }));
		const L7 = Run7.Listeners["llm/stream"];
		const ToolDelta7 = {
			type: "tool-call-delta",
			index: 1,
			id: "call_1",
			name: "write",
			argumentsDelta: '{"path":"a\u2014b"}',
		};
		const ToolBlockEnd7 = {
			type: "block-end",
			index: 2,
			block: { type: "tool-call", id: "call_1", name: "write", arguments: '{"path":"a\u2014b"}' },
		};
		for await (const C of L7(Object.freeze({}), () =>
			(async function* () {
				yield ToolDelta7;
				yield ToolBlockEnd7;
			})(),
		)) {
			void C;
		}
		const JournalRun7 = Furnace.PendingJournal.filter((R: any) => R.event === "normalized");
		{
			const Sub = "tool-args replacements journal too (delta + block in one count record)";
			Check(Count, Sub, () => {
				assert.ok(
					JournalRun7.length === 3 && JournalRun7[2].detail === "normalized 2 dash char(s) in one stream",
				);
			});
		}
	}
	// Fixture: Run 7b's edit-exemption stream (0 records).
	{
		Rm();
		const Run7b = Make(Validate({ normalizeToolArguments: true, logFile: Ledger }));
		const L7b = Run7b.Listeners["llm/stream"];
		const EditDelta7b = {
			type: "tool-call-delta",
			index: 1,
			id: "call_9",
			name: "edit",
			argumentsDelta: '{"old_string":"a\u2014b","new_string":"x"}',
		};
		const EditBlockEnd7b = {
			type: "block-end",
			index: 2,
			block: {
				type: "tool-call",
				id: "call_9",
				name: "edit",
				arguments: '{"old_string":"a\u2014b"}',
			},
		};
		for await (const C of L7b(Object.freeze({}), () =>
			(async function* () {
				yield EditDelta7b;
				yield EditBlockEnd7b;
			})(),
		)) {
			void C;
		}
		{
			const Sub = "NO journal record for an edit-only stream (nothing normalized)";
			Check(Count, Sub, () => {
				assert.ok(Furnace.PendingJournal.filter((R: any) => R.event === "normalized").length === 3);
			});
		}
	}
	// Fixture: Run 7c's raw-marked stream (0 records).
	{
		Rm();
		const Run7c = Make(Validate({ normalizeToolArguments: true, logFile: Ledger }));
		const L7c = Run7c.Listeners["llm/stream"];
		const RawDelta7c = {
			type: "tool-call-delta",
			index: 1,
			id: "call_7",
			name: "write",
			argumentsDelta: '{"__normalize":false,"path":"a\u2014b"}',
		};
		const RawNext7c = {
			type: "tool-call-delta",
			index: 1,
			id: "call_7",
			name: "write",
			argumentsDelta: ',"note":"x\u2013y"}',
		};
		const RawBlockEnd7c = {
			type: "block-end",
			index: 2,
			block: {
				type: "tool-call",
				id: "call_7",
				name: "write",
				arguments: '{"__normalize":false,"path":"a\u2014b","note":"x\u2013y"}',
			},
		};
		for await (const C of L7c(Object.freeze({}), () =>
			(async function* () {
				yield RawDelta7c;
				yield RawNext7c;
				yield RawBlockEnd7c;
			})(),
		)) {
			void C;
		}
		{
			const Sub = "NO journal record for a raw-marked stream (the strip is not a normalization)";
			Check(Count, Sub, () => {
				assert.ok(Furnace.PendingJournal.filter((R: any) => R.event === "normalized").length === 3);
			});
		}
	}
	// Fixture: Run 7d's raw-marker-reset stream (1 record).
	{
		Rm();
		const Run7d = Make(Validate({ normalizeToolArguments: true, logFile: Ledger }));
		const L7d = Run7d.Listeners["llm/stream"];
		for await (const C of L7d(Object.freeze({}), () =>
			(async function* () {
				yield {
					type: "tool-call-delta",
					index: 0,
					id: "call_7",
					name: "write",
					argumentsDelta: '{"__normalize":false,"path":"a\u2014b"}',
				};
				yield {
					type: "tool-call-delta",
					index: 1,
					id: "call_8",
					name: "write",
					argumentsDelta: '{"path":"a\u2014b"}',
				};
			})(),
		)) {
			void C;
		}
		const JournalRun7d = Furnace.PendingJournal.filter((R: any) => R.event === "normalized");
		{
			const Sub = "the run 7d record journals only the normalized call (the raw call stays invisible)";
			Check(Count, Sub, () => {
				assert.ok(
					JournalRun7d.length === 4 &&
						JournalRun7d[3].detail === "normalized 1 dash char(s) in one stream",
				);
			});
		}
	}
	return Finish(Count, "Journal-And-Custom");
};

// Standalone entry: `node Target/Test/Journal-And-Custom/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Journal-And-Custom`);
}
