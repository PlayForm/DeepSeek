// Source/Test/Stream-Contract/Test.ts - one singular test: the full
// llm/stream waterfall contract of the Run-1 stream - the next() mechanics,
// the untouched options, the passthrough-by-identity groups, the rewrite
// groups, the count ledger line and the P5 journal routing of the count
// event (factory pre-bind buffer, not the per-State queue).
// Runs standalone (`node Target/Test/Stream-Contract/Test.js`) AND under the
// aggregate (`Maintain/Run/Smokes/Index.mjs` spawns it).
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

	// ---------- The waterfall listener, exercised ----------
	rm();
	const Run1 = Make(Validate({ logFile: Ledger }));

	const FULLWIDTH = "\uFF21\uFF11\uFF01\uFF1F"; // four fullwidth glyphs: U+FF21 U+FF11 U+FF01 U+FF1F -> A1!?
	const Listener = Run1.Listeners["llm/stream"]!;

	const Chunks: any[] = [
		{ type: "block-start", index: 0, blockType: "text" },
		{ type: "text-delta", index: 0, text: FULLWIDTH },
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

	// next(): must be called exactly once, synchronously, BEFORE iteration; its
	// result is the upstream stream we hand back.
	let NextCalls = 0;
	let Iterated = false;
	let IteratedAtNext = true;
	const Next = () => {
		NextCalls += 1;
		IteratedAtNext = Iterated;
		return (async function* () {
			yield* Chunks;
		})();
	};

	// Deep-frozen options -- the wrapper must never touch it (a mutation throws;
	// even a read is fine, a write is not -- Object.freeze proves it).
	const Request = Object.freeze(Object.freeze({ model: "x", messages: [] }));
	const Wrapped = Listener(Request, Next);

	const Out: any[] = [];
	for await (const Chunk of Wrapped) {
		Iterated = true;
		Out.push(Chunk);
	}

	// Group: the next() mechanics and the options invariant.
	{
		const Sub = "next() called exactly once, synchronously (before iteration)";
		{
			Check(Count, Sub, () => {
				assert.ok(
					NextCalls === 1,
					"next() called exactly once, synchronously (before iteration)",
				);
			});
		}
	}
	{
		const Sub = "next() was called BEFORE any upstream iteration";
		{
			Check(Count, Sub, () => {
				assert.ok(IteratedAtNext === false, "next() was called BEFORE any upstream iteration");
			});
		}
	}
	{
		const Sub = "deep-frozen options untouched (still frozen)";
		{
			Check(Count, Sub, () => {
				assert.ok(Object.isFrozen(Request), "deep-frozen options untouched (still frozen)");
			});
		}
	}
	// Group: the passthrough-by-identity groups and the pipeline shape.
	{
		const Sub = "chunk order/count preserved (1 in, 1 out)";
		{
			Check(Count, Sub, () => {
				assert.ok(Out.length === Chunks.length, "chunk order/count preserved (1 in, 1 out)");
			});
		}
	}
	{
		const Sub = "chunk type sequence identical to upstream";
		{
			Check(Count, Sub, () => {
				assert.ok(
					Out.map((C) => C.type).join(",") === Chunks.map((C) => C.type).join(","),
					"chunk type sequence identical to upstream",
				);
			});
		}
	}
	{
		const Sub = "block-start passthrough BY IDENTITY";
		{
			Check(Count, Sub, () => {
				assert.ok(Out[0] === Chunks[0], "block-start passthrough BY IDENTITY");
			});
		}
	}
	{
		const Sub = "tool-call-delta passthrough BY IDENTITY (argumentsDelta raw JSON untouched)";
		{
			Check(Count, Sub, () => {
				assert.ok(
					Out[2] === Chunks[2],
					"tool-call-delta passthrough BY IDENTITY (argumentsDelta raw JSON untouched)",
				);
			});
		}
	}
	{
		const Sub = "argumentsDelta full-width letter still verbatim";
		{
			Check(Count, Sub, () => {
				assert.ok(
					Out[2].argumentsDelta.includes("\uFF21"),
					"argumentsDelta full-width letter still verbatim",
				);
			});
		}
	}
	{
		const Sub = "usage passthrough BY IDENTITY";
		{
			Check(Count, Sub, () => {
				assert.ok(Out[7] === Chunks[7], "usage passthrough BY IDENTITY");
			});
		}
	}
	{
		const Sub = "finish passthrough BY IDENTITY";
		{
			Check(Count, Sub, () => {
				assert.ok(Out[8] === Chunks[8], "finish passthrough BY IDENTITY");
			});
		}
	}
	// Group: the rewrite groups (the text-delta, the reasoning-delta and the
	// three block-end fields).
	{
		const Sub =
			"text-delta normalized (\uFF21\u2192A, \uFF11\u21921, \uFF01\u2192!, \uFF1F\u2192?)";
		{
			Check(Count, Sub, () => {
				assert.ok(
					Out[1].text === "A1!?",
					"text-delta normalized (\uFF21\u2192A, \uFF11\u21921, \uFF01\u2192!, \uFF1F\u2192?)",
				);
			});
		}
	}
	{
		const Sub = "rewritten text-delta is a new object, index preserved";
		{
			Check(Count, Sub, () => {
				assert.ok(
					Out[1] !== Chunks[1] && Out[1].index === 0,
					"rewritten text-delta is a new object, index preserved",
				);
			});
		}
	}
	{
		const Sub = "reasoning-delta normalized when reasoning=on (\uFF38\uFF39 \u2192 XY)";
		{
			Check(Count, Sub, () => {
				assert.ok(
					Out[3].text === "XY",
					"reasoning-delta normalized when reasoning=on (\uFF38\uFF39 \u2192 XY)",
				);
			});
		}
	}
	{
		const Sub = "block-end TextBlock.text normalized (\uFF28\uFF49 \u2192 Hi)";
		{
			Check(Count, Sub, () => {
				assert.ok(
					Out[4].block.text === "Hi",
					"block-end TextBlock.text normalized (\uFF28\uFF49 \u2192 Hi)",
				);
			});
		}
	}
	{
		const Sub = "block-end ReasoningBlock.text normalized (rc.2 field)";
		{
			Check(Count, Sub, () => {
				assert.ok(Out[5].block.text === "Y", "block-end ReasoningBlock.text normalized (rc.2 field)");
			});
		}
	}
	{
		const Sub = "block-end runtime `thinking` field normalized (defensive)";
		{
			Check(Count, Sub, () => {
				assert.ok(
					Out[6].block.thinking === "Z",
					"block-end runtime `thinking` field normalized (defensive)",
				);
			});
		}
	}
	{
		const Sub = "rewritten block-end is a new object";
		{
			Check(Count, Sub, () => {
				assert.ok(Out[5] !== Chunks[5], "rewritten block-end is a new object");
			});
		}
	}
	// Group: the ledger and the logger (the count line, exactly once).
	await new Promise((R) => setTimeout(R, 10));
	const Log1 = existsSync(Ledger) ? readFileSync(Ledger, "utf8") : "";
	{
		const Sub = "count ledger line written after the 10-replacement stream (N>0)";
		{
			Check(Count, Sub, () => {
				assert.ok(
					Log1.includes("normalized 10 fullwidth char(s) in one stream"),
					"count ledger line written after the 10-replacement stream (N>0)",
				);
			});
		}
	}
	{
		const Sub = "exactly ONE count line for the stream";
		{
			Check(Count, Sub, () => {
				assert.ok(
					Log1.split("\n").filter((L) => L.includes("normalized")).length === 1,
					"exactly ONE count line for the stream",
				);
			});
		}
	}
	{
		const Sub =
			"logger line 'hook-dsh-normalize-fullwidth: normalized 10 fullwidth char(s) in one stream' (4 delta + 2 reasoning + 2 block-end + 1 thinking)";
		{
			Check(Count, Sub, () => {
				assert.ok(
					Run1.Lines.filter((L) => L.includes("normalized")).length === 1 &&
						Run1.Lines[1] ===
							"hook-dsh-normalize-fullwidth: normalized 10 fullwidth char(s) in one stream",
					"logger line 'hook-dsh-normalize-fullwidth: normalized 10 fullwidth char(s) in one stream' (4 delta + 2 reasoning + 2 block-end + 1 thinking)",
				);
			});
		}
	}
	// Group: the P5 journal - the count event lands in the shared storage
	// domain (the smoke's factory instance has no storageDomain facility and
	// no Open has ever succeeded, so the REAL three-stage routing serves the
	// record from the factory-level PRE-BIND buffer (stage 2, PendingJournal)
	// - not the per-State queue (stage 3). Record shape:
	// { event: "normalized", path: "", detail: <the ledger line>, at: <number> }.
	const JournalRun1 = Furnace.PendingJournal!.filter((R) => R.event === "normalized");
	{
		const Sub = "exactly ONE 'normalized' journal record after the 10-replacement stream";
		{
			Check(Count, Sub, () => {
				assert.ok(
					JournalRun1.length === 1,
					"exactly ONE 'normalized' journal record after the 10-replacement stream",
				);
			});
		}
	}
	{
		const Sub = "the 'normalized' record carries an empty path (stream-level event)";
		{
			Check(Count, Sub, () => {
				assert.ok(
					JournalRun1[0] !== undefined && JournalRun1[0]!.path === "",
					"the 'normalized' record carries an empty path (stream-level event)",
				);
			});
		}
	}
	{
		const Sub = "journal detail byte-identical to the ledger count line";
		{
			Check(Count, Sub, () => {
				assert.ok(
					JournalRun1[0] !== undefined &&
						JournalRun1[0]!.detail === "normalized 10 fullwidth char(s) in one stream",
					"journal detail byte-identical to the ledger count line",
				);
			});
		}
	}
	{
		const Sub = "the 'normalized' record carries a numeric timestamp";
		{
			Check(Count, Sub, () => {
				assert.ok(
					JournalRun1[0] !== undefined && typeof JournalRun1[0]!.at === "number",
					"the 'normalized' record carries a numeric timestamp",
				);
			});
		}
	}
	{
		const Sub = "the record routes to the factory pre-bind buffer (stage 2), not the per-State queue";
		{
			Check(Count, Sub, () => {
				assert.ok(
					Run1.State.Queue.filter((R) => R.event === "normalized").length === 0,
					"the record routes to the factory pre-bind buffer (stage 2), not the per-State queue",
				);
			});
		}
	}
	return Finish(Count, "Stream-Contract");
};

// Standalone entry: `node Target/Test/Stream-Contract/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Stream-Contract`);
}
