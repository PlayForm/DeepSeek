// Source/Test/Tool-Args-Exemptions/Test.ts - one singular test: the tool-args
// gate and its exemption family - the deprecated normalizeToolArguments flag
// on (plain fields + activation line + the delta and block rewrites), the
// edit exemption (byte-contracted old_string passes by identity), the
// per-call raw marker (strip variants, the reset at the next call id), and
// the N=0 negative controls. The journal-count siblings live in
// Journal-And-Custom.
// Runs standalone (`node Target/Test/Tool-Args-Exemptions/Test.js`) AND under
// the aggregate (`Maintain/Run/Smokes/Index.mjs` spawns it).
// Unit smoke of @playform/hook-dsh-normalize-dash: the fake ctx + the REAL
// factory + the REAL dash apply, from the Harness.
import { existsSync, readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { Check, Finish, MakeCounter, Make, Rm, Validate, Ledger } from "../Harness.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	// Group: Run 7 - tool args ON (normalizeToolArguments: true).
	{
		Rm();
		const Run7 = Make(Validate({ normalizeToolArguments: true, logFile: Ledger }));
		{
			const Sub = "plain fields: ToolArgs=true when normalizeToolArguments=on";
			Check(Count, Sub, () => {
				assert.ok(Run7.State.ToolArgs === true);
			});
		}
		{
			const Sub = "activation line reflects toolArgs=on";
			Check(Count, Sub, () => {
				assert.ok(
					Run7.Lines.some(
						(L: string) =>
							L.startsWith("hook-dsh-normalize-dash: activated") && L.includes("toolArgs=on"),
					),
				);
			});
		}
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
			const Sub = "tool-call-delta argumentsDelta normalized when normalizeToolArguments=on";
			Check(Count, Sub, () => {
				assert.ok(Out7[0].argumentsDelta === '{"path":"a-b"}');
			});
		}
		{
			const Sub = "rewritten tool-call-delta is a new object (id/index/name preserved)";
			Check(Count, Sub, () => {
				assert.ok(Out7[0] !== ToolDelta7);
			});
		}
		{
			const Sub = "block-end ToolCallBlock.arguments normalized too (the deltas AND the block agree)";
			Check(Count, Sub, () => {
				assert.ok(Out7[1].block.arguments === '{"path":"a-b"}');
			});
		}
		await new Promise((R) => setTimeout(R, 10));
		{
			const Sub = "count line includes the tool-args replacements (delta + block)";
			Check(Count, Sub, () => {
				assert.ok(readFileSync(Ledger, "utf8").includes("normalized 2 dash char(s) in one stream"));
			});
		}
	}
	// Group: Run 7b - the edit exemption (normalizeToolArguments: on).
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
		const Out7b: any[] = [];
		for await (const C of L7b(Object.freeze({}), () =>
			(async function* () {
				yield EditDelta7b;
				yield EditBlockEnd7b;
			})(),
		)) {
			Out7b.push(C);
		}
		{
			const Sub =
				"edit tool-call-delta passes through BY IDENTITY with the flag on (old_string must match real file bytes)";
			Check(Count, Sub, () => {
				assert.ok(Out7b[0] === EditDelta7b);
			});
		}
		{
			const Sub = "edit argumentsDelta dash still verbatim";
			Check(Count, Sub, () => {
				assert.ok(Out7b[0].argumentsDelta.includes("\u2014"));
			});
		}
		{
			const Sub = "edit ToolCallBlock passes through BY IDENTITY too (the deltas AND the block agree)";
			Check(Count, Sub, () => {
				assert.ok(Out7b[1].block === EditBlockEnd7b.block);
			});
		}
		{
			const Sub = "edit block arguments dash still verbatim";
			Check(Count, Sub, () => {
				assert.ok(Out7b[1].block.arguments.includes("\u2014"));
			});
		}
		await new Promise((R) => setTimeout(R, 10));
		{
			const Sub = "NO count line for an edit-only stream (nothing normalized)";
			Check(Count, Sub, () => {
				assert.ok(!existsSync(Ledger) || !readFileSync(Ledger, "utf8").includes("normalized"));
			});
		}
	}
	// Group: Run 7c - the per-call raw marker (normalizeToolArguments: on).
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
		const Out7c: any[] = [];
		for await (const C of L7c(Object.freeze({}), () =>
			(async function* () {
				yield RawDelta7c;
				yield RawNext7c;
				yield RawBlockEnd7c;
			})(),
		)) {
			Out7c.push(C);
		}
		{
			const Sub = "raw-marked call: the marker entry is stripped from the first delta";
			Check(Count, Sub, () => {
				assert.ok(Out7c[0].argumentsDelta === '{"path":"a\u2014b"}');
			});
		}
		{
			const Sub = "raw-marked arguments pass through UNNORMALIZED (em dash survives)";
			Check(Count, Sub, () => {
				assert.ok(Out7c[0].argumentsDelta.includes("\u2014"));
			});
		}
		{
			const Sub = "subsequent raw-call delta passes through untouched";
			Check(Count, Sub, () => {
				assert.ok(Out7c[1] === RawNext7c);
			});
		}
		{
			const Sub = "raw-marked assembled block: marker stripped, arguments unnormalized";
			Check(Count, Sub, () => {
				assert.ok(Out7c[2].block.arguments === '{"path":"a\u2014b","note":"x\u2013y"}');
			});
		}
		{
			const Sub = "the stripped raw-marked block-end is a new object";
			Check(Count, Sub, () => {
				assert.ok(Out7c[2] !== RawBlockEnd7c);
			});
		}
		{
			const Sub = "the executed arguments carry no __normalize key (no additionalProperties rejection)";
			Check(Count, Sub, () => {
				assert.ok(JSON.parse(Out7c[2].block.arguments).__normalize === undefined);
			});
		}
		await new Promise((R) => setTimeout(R, 10));
		{
			const Sub = "NO count line for a raw-marked stream (the strip is not a normalization)";
			Check(Count, Sub, () => {
				assert.ok(!existsSync(Ledger) || !readFileSync(Ledger, "utf8").includes("normalized"));
			});
		}
	}
	// Group: Run 7d - the marker state resets at the next call id.
	{
		Rm();
		const Run7d = Make(Validate({ normalizeToolArguments: true, logFile: Ledger }));
		const L7d = Run7d.Listeners["llm/stream"];
		const Out7d: any[] = [];
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
			Out7d.push(C);
		}
		{
			const Sub = "the first call is raw-marked: marker stripped, dash unnormalized";
			Check(Count, Sub, () => {
				assert.ok(Out7d[0].argumentsDelta === '{"path":"a\u2014b"}');
			});
		}
		{
			const Sub = "the next call id RESETS the marker state: normalization resumes";
			Check(Count, Sub, () => {
				assert.ok(Out7d[1].argumentsDelta === '{"path":"a-b"}');
			});
		}
		await new Promise((R) => setTimeout(R, 10));
		{
			const Sub = "count line counts only the normalized call (the raw call stays invisible)";
			Check(Count, Sub, () => {
				assert.ok(readFileSync(Ledger, "utf8").includes("normalized 1 dash char(s) in one stream"));
			});
		}
	}
	return Finish(Count, "Tool-Args-Exemptions");
};

// Standalone entry: `node Target/Test/Tool-Args-Exemptions/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Tool-Args-Exemptions`);
}
