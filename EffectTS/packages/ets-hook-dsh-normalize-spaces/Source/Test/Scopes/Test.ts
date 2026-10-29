// Source/Test/Scopes/Test.ts - one singular test: the granular scope gates
// (Run S) - each scope on/off with everything else at defaults, the
// effective-toolInput OR semantics with the deprecated field, and the S5
// volatile scope flip applied to the NEXT stream without remount.
// Runs standalone (`node Target/Test/Scopes/Test.js`) AND under the aggregate
// (`Maintain/Run/Smokes/Index.mjs` spawns it).
// Smoke of @playform/ets-hook-dsh-normalize-spaces: the fake ctx + the REAL
// factory + the REAL spaces apply (the seams live in ../Harness.js).
import assert from "node:assert/strict";
import { Check, Finish, MakeCounter, Ledger, Make } from "../Harness.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// ---------- Run S (additive): the granular scope gates ----------
	// Each scope gate on/off with everything else at defaults; the config is
	// hand-built with a `scopes` volatile cell whose getter returns a mutable
	// object (the stable-reference simulation). Defaults = the previous
	// behavior exactly.
	const SCOPES_DEFAULT = {
		conversation: true,
		reasoning: true,
		toolInput: false,
		toolResults: false,
		files: true,
		batch: false,
	};
	const RunS = (
		Scopes: Record<string, boolean>,
		Flags?: { reasoning?: boolean; toolArgs?: boolean },
	) =>
		Make({
			log: true,
			logFile: Ledger,
			replacement: " ",
			normalizeReasoning: Flags?.reasoning ?? true,
			normalizeToolArguments: Flags?.toolArgs ?? false,
			scopes: { get: () => Scopes },
		});
	const DriveS = async (Run: ReturnType<typeof Make>, Chunks: any[]) => {
		const Out: any[] = [];
		for await (const C of Run.Listeners["llm/stream"]!(
			Object.freeze({ model: "x", messages: [] }),
			() =>
				(async function* () {
					yield* Chunks;
				})(),
		))
			Out.push(C);
		return Out;
	};
	const TextChunkS = { type: "text-delta", index: 0, text: "a\u00A0b" };
	const ReasonChunkS = { type: "reasoning-delta", index: 0, text: "\u00A0x" };
	const TextBlockChunkS = {
		type: "block-end",
		index: 0,
		block: { type: "text", text: "\u00A0kept" },
	};
	const ArgsChunkS = {
		type: "tool-call-delta",
		index: 1,
		id: "call_s",
		name: "bash",
		argumentsDelta: '{"a":"\u00A0"}',
	};

	// S1: conversation off -> text-delta passes by identity (count 0, no line).
	const S1 = RunS({ ...SCOPES_DEFAULT, conversation: false });
	const OutS1 = await DriveS(S1, [TextChunkS]);
	{
		const Sub = "scopes.conversation off: text-delta passes by identity";
		{
			Check(Count, Sub, () => {
				assert.ok(OutS1[0] === TextChunkS, "scopes.conversation off: text-delta passes by identity");
			});
		}
	}
	{
		const Sub = "scopes.conversation off: no count line";
		{
			Check(Count, Sub, () => {
				assert.ok(
					S1.Lines.every((L) => !L.includes("normalized")),
					"scopes.conversation off: no count line",
				);
			});
		}
	}
	// S2: reasoning scope off -> reasoning-delta passes even with normalizeReasoning on.
	const S2 = RunS({ ...SCOPES_DEFAULT, reasoning: false });
	const OutS2 = await DriveS(S2, [ReasonChunkS]);
	{
		const Sub = "scopes.reasoning off: reasoning-delta passes by identity";
		{
			Check(Count, Sub, () => {
				assert.ok(
					OutS2[0] === ReasonChunkS,
					"scopes.reasoning off: reasoning-delta passes by identity",
				);
			});
		}
	}
	// S3: conversation off -> the assembled TEXT block passes by identity too.
	const S3 = RunS({ ...SCOPES_DEFAULT, conversation: false });
	const OutS3 = await DriveS(S3, [TextBlockChunkS]);
	{
		const Sub = "scopes.conversation off: text block passes by identity";
		{
			Check(Count, Sub, () => {
				assert.ok(
					OutS3[0].block === TextBlockChunkS.block,
					"scopes.conversation off: text block passes by identity",
				);
			});
		}
	}
	// S4: the effective toolInput gate is an OR of the deprecated field and the scope.
	const S4 = RunS({ ...SCOPES_DEFAULT }, { toolArgs: true });
	const OutS4 = await DriveS(S4, [ArgsChunkS]);
	{
		const Sub = "effective toolInput (deprecated field on, scope off): still normalizes";
		{
			Check(Count, Sub, () => {
				assert.ok(
					OutS4[0].argumentsDelta === '{"a":" "}',
					"effective toolInput (deprecated field on, scope off): still normalizes",
				);
			});
		}
	}
	const S4b = RunS({ ...SCOPES_DEFAULT }, { toolArgs: false });
	const OutS4b = await DriveS(S4b, [ArgsChunkS]);
	{
		const Sub = "toolInput both off: passes by identity";
		{
			Check(Count, Sub, () => {
				assert.ok(OutS4b[0] === ArgsChunkS, "toolInput both off: passes by identity");
			});
		}
	}
	const S4c = RunS({ ...SCOPES_DEFAULT, toolInput: true });
	const OutS4c = await DriveS(S4c, [ArgsChunkS]);
	{
		const Sub = "effective toolInput (scope on, deprecated field off): normalizes";
		{
			Check(Count, Sub, () => {
				assert.ok(
					OutS4c[0].argumentsDelta === '{"a":" "}',
					"effective toolInput (scope on, deprecated field off): normalizes",
				);
			});
		}
	}
	// S5: the volatile scope flip -> the NEXT stream's gate changes without remount.
	const LiveScopes = { ...SCOPES_DEFAULT };
	const S5 = RunS(LiveScopes);
	LiveScopes.conversation = false;
	S5.Listeners["loader/volatile-update"]!([["scopes", "conversation"]]);
	const OutS5 = await DriveS(S5, [TextChunkS]);
	{
		const Sub = "volatile scope flip: conversation off applies to the NEXT stream without remount";
		{
			Check(Count, Sub, () => {
				assert.ok(
					OutS5[0] === TextChunkS,
					"volatile scope flip: conversation off applies to the NEXT stream without remount",
				);
			});
		}
	}
	return Finish(Count, "Scopes");
};

// Standalone entry: `node Target/Test/Scopes/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Scopes`);
}
