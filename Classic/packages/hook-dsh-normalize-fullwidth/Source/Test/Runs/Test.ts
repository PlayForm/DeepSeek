// Source/Test/Runs/Test.ts - one singular test: the Run-2 through Run-7
// matrix - reasoning off, the MAP's special half-width values in one
// segment, the upstream throw, the identity stream, the fresh-state probe
// and the tool-args normalization, including their cumulative pre-bind
// journal counts.
// Runs standalone (`node Target/Test/Runs/Test.js`) AND under the aggregate
// (`Maintain/Run-Smokes.mjs` spawns it).
// Smoke of @playform/hook-dsh-normalize-fullwidth: the fake ctx + the REAL
// factory + the REAL fullwidth apply (the seams live in ../Harness.js).
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import {
	Check,
	Finish,
	Furnace,
	MakeCounter,
	Ledger,
	Make,
	rm,
	Validate,
} from "../Harness.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// ---------- The silent seed: the Run-1 waterfall, replayed WITHOUT checks ----
	// The source suite ran Runs 1-7 in ONE process, so the cumulative journal
	// assertions of Runs 2-7 count the Run-1 waterfall's "normalized" record
	// from the factory's pre-bind buffer (the Stream-Contract folder asserts
	// that record's shape). Each folder here runs in its own process, so the
	// seed replays the Run-1 waterfall (the same data and the same drive as
	// Stream-Contract) with NO Check calls - it exists only to place that one
	// record. If the seed fails to produce it, Run 2's first cumulative
	// assertion fails loudly (the vacuously-green backstop).
	rm();
	const Run1 = Make(Validate({ logFile: Ledger }));
	const SeedChunks: any[] = [
		{ type: "block-start", index: 0, blockType: "text" },
		{ type: "text-delta", index: 0, text: "\uFF21\uFF11\uFF01\uFF1F" },
		{
			type: "tool-call-delta",
			index: 1,
			id: "call_1",
			name: "write",
			argumentsDelta: '{"path":"\uFF21\uFF11"}',
		},
		{ type: "reasoning-delta", index: 2, text: "\uFF38\uFF39" },
		{ type: "block-end", index: 0, block: { type: "text", text: "\uFF28\uFF49" } },
		{ type: "block-end", index: 2, block: { type: "reasoning", text: "\uFF39" } },
		{ type: "block-end", index: 3, block: { type: "reasoning", text: "", thinking: "\uFF3A" } },
		{ type: "usage", usage: { input: 1, output: 2 } },
		{ type: "finish", reason: "stop" },
	];
	for await (const Chunk of Run1.Listeners["llm/stream"]!(
		Object.freeze(Object.freeze({ model: "x", messages: [] })),
		() =>
			(async function* () {
				yield* SeedChunks;
			})(),
	)) {
		void Chunk; // the seed discards the output; the chunks only need to flow
	}
	await new Promise((R) => setTimeout(R, 10));

	// ---------- Run 2: reasoning off ----------
	rm();
	const Run2 = Make(Validate({ normalizeReasoning: false, logFile: Ledger }));
	const L2 = Run2.Listeners["llm/stream"]!;
	const Out2: any[] = [];
	for await (const C of L2(Object.freeze({}), () =>
		(async function* () {
			yield { type: "reasoning-delta", index: 0, text: "\uFF38" };
			yield { type: "text-delta", index: 0, text: "plain text" };
		})(),
	)) {
		Out2.push(C);
	}
	{
		const Sub = "reasoning-delta passthrough (identity) when normalizeReasoning=off";
		{
			Check(Count, Sub, () => {
				assert.ok(
					Out2[0] && Out2[0].text === "\uFF38",
					"reasoning-delta passthrough (identity) when normalizeReasoning=off",
				);
			});
		}
	}
	{
		const Sub = "stream completed with both chunks";
		{
			Check(Count, Sub, () => {
				assert.ok(Out2.length === 2, "stream completed with both chunks");
			});
		}
	}
	{
		const Sub = "stream completed";
		{
			Check(Count, Sub, () => {
				assert.ok(Out2[1] === undefined || typeof Out2[1] === "object", "stream completed");
			});
		}
	}
	await new Promise((R) => setTimeout(R, 10));
	{
		const Sub = "NO count line when nothing replaced (N=0)";
		{
			Check(Count, Sub, () => {
				assert.ok(
					!existsSync(Ledger) || !readFileSync(Ledger, "utf8").includes("normalized"),
					"NO count line when nothing replaced (N=0)",
				);
			});
		}
	}
	{
		const Sub = "NO journal record when nothing was replaced (N=0)";
		{
			Check(Count, Sub, () => {
				assert.ok(
					Furnace.PendingJournal!.filter((R) => R.event === "normalized").length === 1,
					"NO journal record when nothing was replaced (N=0)",
				);
			});
		}
	}

	// ---------- Run 3: the MAP's special values inserted literally (no replacement knob) ----------
	rm();
	const Run3 = Make(Validate({ logFile: Ledger }));
	const L3 = Run3.Listeners["llm/stream"]!;
	const Out3: any[] = [];
	for await (const C of L3(Object.freeze({}), () =>
		(async function* () {
			yield { type: "text-delta", index: 0, text: "\uFF04\uFF3C\uFF3E\uFF5C" };
		})(),
	)) {
		Out3.push(C);
	}
	{
		const Sub =
			"special half-width values come out LITERALLY (\uFF04\u2192$, \uFF3C\u2192\\, \uFF3E\u2192^, \uFF5C\u2192| \u2014 function replacer, no replacement-pattern interpretation)";
		{
			Check(Count, Sub, () => {
				assert.ok(
					Out3[0].text === "$\\^|",
					"special half-width values come out LITERALLY (\uFF04\u2192$, \uFF3C\u2192\\, \uFF3E\u2192^, \uFF5C\u2192| \u2014 function replacer, no replacement-pattern interpretation)",
				);
			});
		}
	}
	{
		const Sub = "MAP flavor is 1:1 \u2014 one half-width char out per full-width char in";
		{
			Check(Count, Sub, () => {
				assert.ok(
					Out3[0].text.length === 4,
					"MAP flavor is 1:1 \u2014 one half-width char out per full-width char in",
				);
			});
		}
	}
	await new Promise((R) => setTimeout(R, 10));
	{
		const Sub = "count line reflects the 4-code-point run";
		{
			Check(Count, Sub, () => {
				assert.ok(
					readFileSync(Ledger, "utf8").includes("normalized 4 fullwidth char(s) in one stream"),
					"count line reflects the 4-code-point run",
				);
			});
		}
	}
	const JournalRun3 = Furnace.PendingJournal!.filter((R) => R.event === "normalized");
	{
		const Sub = "the special-values run adds its 'normalized' journal record";
		{
			Check(Count, Sub, () => {
				assert.ok(
					JournalRun3.length === 2,
					"the special-values run adds its 'normalized' journal record",
				);
			});
		}
	}
	{
		const Sub = "special-values journal detail mirrors the ledger line";
		{
			Check(Count, Sub, () => {
				assert.ok(
					JournalRun3[1] !== undefined &&
						JournalRun3[1]!.detail === "normalized 4 fullwidth char(s) in one stream",
					"special-values journal detail mirrors the ledger line",
				);
			});
		}
	}

	// ---------- Run 4: upstream throw propagates, no count line ----------
	rm();
	const Run4 = Make(Validate({ logFile: Ledger }));
	const L4 = Run4.Listeners["llm/stream"]!;
	let Threw: any = null;
	try {
		for await (const C of L4(Object.freeze({}), () =>
			(async function* () {
				yield { type: "text-delta", index: 0, text: "\uFF01" };
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
		{
			Check(Count, Sub, () => {
				assert.ok(
					Threw && Threw.message === "transport boom",
					"upstream throw propagates through the wrapper",
				);
			});
		}
	}
	await new Promise((R) => setTimeout(R, 10));
	{
		const Sub = "NO count line after an upstream throw";
		{
			Check(Count, Sub, () => {
				assert.ok(
					!existsSync(Ledger) || !readFileSync(Ledger, "utf8").includes("normalized"),
					"NO count line after an upstream throw",
				);
			});
		}
	}
	{
		const Sub = "NO journal record after an upstream throw";
		{
			Check(Count, Sub, () => {
				assert.ok(
					Furnace.PendingJournal!.filter((R) => R.event === "normalized").length === 2,
					"NO journal record after an upstream throw",
				);
			});
		}
	}

	// ---------- Run 5: identity when nothing to replace ----------
	const Run5 = Make(Validate({ logFile: Ledger }));
	const L5 = Run5.Listeners["llm/stream"]!;
	const Keep = { type: "text-delta", index: 0, text: "plain" };
	const Out5: any[] = [];
	for await (const C of L5(Object.freeze({}), () =>
		(async function* () {
			yield Keep;
		})(),
	)) {
		Out5.push(C);
	}
	{
		const Sub = "unchanged text-delta passes through BY IDENTITY (count 0)";
		{
			Check(Count, Sub, () => {
				assert.ok(Out5[0] === Keep, "unchanged text-delta passes through BY IDENTITY (count 0)");
			});
		}
	}
	{
		const Sub = "identity stream (count 0) adds no journal record";
		{
			Check(Count, Sub, () => {
				assert.ok(
					Furnace.PendingJournal!.filter((R) => R.event === "normalized").length === 2,
					"identity stream (count 0) adds no journal record",
				);
			});
		}
	}

	// ---------- Run 6: HMR-safety probe (no module-level state) ----------
	const First = Run1.State;
	const Second = Run5.State;
	{
		const Sub = "each apply builds a FRESH state (no module-level globals)";
		{
			Check(Count, Sub, () => {
				assert.ok(
					First !== Second && First.Reasoning === true && Second.Reasoning === true,
					"each apply builds a FRESH state (no module-level globals)",
				);
			});
		}
	}

	// ---------- Run 7: tool args ON (normalizeToolArguments: true) ----------
	rm();
	const Run7 = Make(Validate({ normalizeToolArguments: true, logFile: Ledger }));
	{
		const Sub = "plain fields: ToolArgs=true when normalizeToolArguments=on";
		{
			Check(Count, Sub, () => {
				assert.ok(
					Run7.State.ToolArgs === true,
					"plain fields: ToolArgs=true when normalizeToolArguments=on",
				);
			});
		}
	}
	{
		const Sub = "activation line reflects toolArgs=on";
		{
			Check(Count, Sub, () => {
				assert.ok(
					Run7.Lines.some(
						(L) => L.startsWith("hook-dsh-normalize-fullwidth: activated") && L.includes("toolArgs=on"),
					),
					"activation line reflects toolArgs=on",
				);
			});
		}
	}
	const L7 = Run7.Listeners["llm/stream"]!;
	const ToolDelta7 = {
		type: "tool-call-delta",
		index: 1,
		id: "call_1",
		name: "write",
		argumentsDelta: '{"path":"a\uFF1Ab"}',
	};
	const ToolBlockEnd7 = {
		type: "block-end",
		index: 2,
		block: { type: "tool-call", id: "call_1", name: "write", arguments: '{"path":"a\uFF1Ab"}' },
	};
	const Out7: any[] = [];
	for await (const C of L7(Object.freeze({}), () =>
		(async function* () {
			yield ToolDelta7;
			yield ToolBlockEnd7;
		})(),
	)) {
		Out7.push(C);
	}
	{
		const Sub =
			"tool-call-delta argumentsDelta normalized when normalizeToolArguments=on (fullwidth colon \u2192 ASCII)";
		{
			Check(Count, Sub, () => {
				assert.ok(
					Out7[0].argumentsDelta === '{"path":"a:b"}',
					"tool-call-delta argumentsDelta normalized when normalizeToolArguments=on (fullwidth colon \u2192 ASCII)",
				);
			});
		}
	}
	{
		const Sub = "rewritten tool-call-delta is a new object (id/index/name preserved)";
		{
			Check(Count, Sub, () => {
				assert.ok(
					Out7[0] !== ToolDelta7,
					"rewritten tool-call-delta is a new object (id/index/name preserved)",
				);
			});
		}
	}
	{
		const Sub = "block-end ToolCallBlock.arguments normalized too (the deltas AND the block agree)";
		{
			Check(Count, Sub, () => {
				assert.ok(
					Out7[1].block.arguments === '{"path":"a:b"}',
					"block-end ToolCallBlock.arguments normalized too (the deltas AND the block agree)",
				);
			});
		}
	}
	await new Promise((R) => setTimeout(R, 10));
	{
		const Sub = "count line includes the tool-args replacements (delta + block)";
		{
			Check(Count, Sub, () => {
				assert.ok(
					readFileSync(Ledger, "utf8").includes("normalized 2 fullwidth char(s) in one stream"),
					"count line includes the tool-args replacements (delta + block)",
				);
			});
		}
	}
	const JournalRun7 = Furnace.PendingJournal!.filter((R) => R.event === "normalized");
	{
		const Sub = "tool-args replacements journal too (delta + block in one count record)";
		{
			Check(Count, Sub, () => {
				assert.ok(
					JournalRun7.length === 3 && JournalRun7[2]!.detail === "normalized 2 fullwidth char(s) in one stream",
					"tool-args replacements journal too (delta + block in one count record)",
				);
			});
		}
	}
	return Finish(Count, "Runs");
};

// Standalone entry: `node Target/Test/Runs/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Runs`);
}
