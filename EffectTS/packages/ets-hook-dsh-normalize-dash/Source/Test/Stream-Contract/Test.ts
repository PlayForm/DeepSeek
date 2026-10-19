// Source/Test/Stream-Contract/Test.ts - one singular test: the llm/stream
// waterfall contract - next() called once synchronously before any upstream
// iteration, the deep-frozen options untouched, chunk order/count preserved,
// the passthrough identities, the rewrite groups with their exact ledger
// strings, the reasoning-off passthrough, and the count-0 identity.
// Runs standalone (`node Target/Test/Stream-Contract/Test.js`) AND under the
// aggregate (`Maintain/Run-Smokes.mjs` spawns it).
// Unit smoke of @playform/ets-hook-dsh-normalize-dash: the fake ctx + the REAL
// factory + the REAL dash apply, from the Harness.
import { existsSync, readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { Check, Finish, MakeCounter, Make, Rm, Validate, Ledger } from "../Harness.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	Rm();
	// Group: the waterfall listener, exercised (the source suite's section
	// right after Run 1).
	{
		const Run1 = Make(Validate({ logFile: Ledger }));
		const Listener = Run1.Listeners["llm/stream"];
		const DASHES = "a \u2014 b \u2013 c \u2011 d \u2015 e"; // em, en, U+2011, U+2015
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
		// next(): must be called exactly once, synchronously, BEFORE iteration;
		// its result is the upstream stream we hand back.
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
		// Deep-frozen options - the wrapper must never touch it (a mutation
		// throws; even a read is fine, a write is not - Object.freeze proves it).
		const Request = Object.freeze(Object.freeze({ model: "x", messages: [] }));
		const Wrapped = Listener(Request, Next);
		{
			const Sub = "next() called exactly once, synchronously (before iteration)";
			Check(Count, Sub, () => {
				assert.ok(NextCalls === 1);
			});
		}
		{
			const Sub = "next() was called BEFORE any upstream iteration";
			Check(Count, Sub, () => {
				assert.ok(IteratedAtNext === false);
			});
		}
		{
			const Sub = "deep-frozen options untouched (still frozen)";
			Check(Count, Sub, () => {
				assert.ok(Object.isFrozen(Request));
			});
		}
		const Out: any[] = [];
		for await (const Chunk of Wrapped) {
			Iterated = true;
			Out.push(Chunk);
		}
		{
			const Sub = "chunk order/count preserved (1 in, 1 out)";
			Check(Count, Sub, () => {
				assert.ok(Out.length === Chunks.length);
			});
		}
		{
			const Sub = "chunk type sequence identical to upstream";
			Check(Count, Sub, () => {
				assert.ok(Out.map((C: any) => C.type).join(",") === Chunks.map((C) => C.type).join(","));
			});
		}
		{
			const Sub = "block-start passthrough BY IDENTITY";
			Check(Count, Sub, () => {
				assert.ok(Out[0] === Chunks[0]);
			});
		}
		{
			const Sub = "tool-call-delta passthrough BY IDENTITY (argumentsDelta raw JSON untouched)";
			Check(Count, Sub, () => {
				assert.ok(Out[2] === Chunks[2]);
			});
		}
		{
			const Sub = "argumentsDelta dash still verbatim";
			Check(Count, Sub, () => {
				assert.ok(Out[2].argumentsDelta.includes("\u2014"));
			});
		}
		{
			const Sub = "usage passthrough BY IDENTITY";
			Check(Count, Sub, () => {
				assert.ok(Out[7] === Chunks[7]);
			});
		}
		{
			const Sub = "finish passthrough BY IDENTITY";
			Check(Count, Sub, () => {
				assert.ok(Out[8] === Chunks[8]);
			});
		}
		{
			const Sub = "text-delta normalized (em/en/U+2011/U+2015 \u2192 '-')";
			Check(Count, Sub, () => {
				assert.ok(Out[1].text === "a - b - c - d - e");
			});
		}
		{
			const Sub = "rewritten text-delta is a new object, index preserved";
			Check(Count, Sub, () => {
				assert.ok(Out[1] !== Chunks[1] && Out[1].index === 0);
			});
		}
		{
			const Sub = "reasoning-delta normalized when reasoning=on";
			Check(Count, Sub, () => {
				assert.ok(Out[3].text === "-x-");
			});
		}
		{
			const Sub = "block-end TextBlock.text normalized";
			Check(Count, Sub, () => {
				assert.ok(Out[4].block.text === "-kept -gone");
			});
		}
		{
			const Sub = "block-end ReasoningBlock.text normalized (rc.2 field)";
			Check(Count, Sub, () => {
				assert.ok(Out[5].block.text === "-y");
			});
		}
		{
			const Sub = "block-end runtime `thinking` field normalized (defensive)";
			Check(Count, Sub, () => {
				assert.ok(Out[6].block.thinking === "-z");
			});
		}
		{
			const Sub = "rewritten block-end is a new object";
			Check(Count, Sub, () => {
				assert.ok(Out[5] !== Chunks[5]);
			});
		}
		await new Promise((R) => setTimeout(R, 10));
		const Log1 = existsSync(Ledger) ? readFileSync(Ledger, "utf8") : "";
		{
			const Sub = "count ledger line written after the 10-replacement stream (N>0)";
			Check(Count, Sub, () => {
				assert.ok(Log1.includes("normalized 10 dash char(s) in one stream"));
			});
		}
		{
			const Sub = "exactly ONE count line for the stream";
			Check(Count, Sub, () => {
				assert.ok(Log1.split("\n").filter((L) => L.includes("normalized")).length === 1);
			});
		}
		{
			const Sub =
				"logger line 'hook-dsh-normalize-dash: normalized 10 dash char(s) in one stream' (4 delta + 2 reasoning + 3 block-end + 1 thinking)";
			Check(Count, Sub, () => {
				assert.ok(
					Run1.Lines.filter((L: string) => L.includes("normalized")).length === 1 &&
						Run1.Lines[1] === "hook-dsh-normalize-dash: normalized 10 dash char(s) in one stream",
				);
			});
		}
	}
	// Group: Run 2 - reasoning off.
	{
		Rm();
		const Run2 = Make(Validate({ normalizeReasoning: false, logFile: Ledger }));
		const L2 = Run2.Listeners["llm/stream"];
		const Out2: any[] = [];
		for await (const C of L2(Object.freeze({}), () =>
			(async function* () {
				yield { type: "reasoning-delta", index: 0, text: "\u2014" };
				yield { type: "text-delta", index: 0, text: "plain - text" };
			})(),
		)) {
			Out2.push(C);
		}
		{
			const Sub = "reasoning-delta passthrough (identity) when normalizeReasoning=off";
			Check(Count, Sub, () => {
				assert.ok(Out2[0] && Out2[0].text === "\u2014");
			});
		}
		{
			const Sub = "stream completed with both chunks";
			Check(Count, Sub, () => {
				assert.ok(Out2.length === 2);
			});
		}
		{
			const Sub = "stream completed";
			Check(Count, Sub, () => {
				assert.ok(Out2[1] === undefined || typeof Out2[1] === "object");
			});
		}
		await new Promise((R) => setTimeout(R, 10));
		{
			const Sub = "NO count line when nothing replaced (N=0)";
			Check(Count, Sub, () => {
				assert.ok(!existsSync(Ledger) || !readFileSync(Ledger, "utf8").includes("normalized"));
			});
		}
	}
	// Group: Run 5 - identity when nothing to replace (the journal-count
	// sibling of this check lives in Journal-And-Custom).
	{
		const Run5 = Make(Validate({ logFile: Ledger }));
		const L5 = Run5.Listeners["llm/stream"];
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
			Check(Count, Sub, () => {
				assert.ok(Out5[0] === Keep);
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
