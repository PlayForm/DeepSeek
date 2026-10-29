// Source/Test/Effectiveness/Test.ts - THE COST PER SURVIVING LINE
// (Documentation/Plans/COST-TRACK-PLUGIN.md section 16.4, with the verdict
// of section 14): a file whose Verdict.State is 'changed' in the window pays
// its allocated cost over the lines its edit hunks added, while a file whose
// verdict is only 'read' yields no row - the read-before-edit effectiveness
// question, answered per file.
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import LedgerPlugin from "../../../../ets-plugin-dsh-cost/Target/Library.js";
import LedgerDrain from "../../../../ets-plugin-dsh-cost/Target/Function/Drain.js";
import LedgerOpen from "../../../../ets-plugin-dsh-cost/Target/Function/Open.js";
import Analysis from "../../../Target/Function/Analysis.js";
import Reader from "../../../Target/Function/Open.js";
import { Check, Finish, Make, MakeCounter, Validate } from "../Harness.js";

// The ledger half's validated config (the ledger package's own schema): the
// fixture price row - input 1, output 2 per million - under one client, at
// the temporary database.
const LedgerConfig = (Home: string): any =>
	(LedgerPlugin.Config as unknown as (Raw: Record<string, unknown>) => any)({
		databasePath: join(Home, "ledger.db"),
		client: "fixture",
		prices: [{ provider: "p", model: "m", input: 1, output: 2 }],
	});

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	const Home = await mkdtemp(join(tmpdir(), "dsh-cost-analysis-effectiveness-"));
	try {
		const Priced = LedgerConfig(Home);
		const Read = Validate({ databasePath: join(Home, "ledger.db") });
		const Ledger = LedgerOpen(Priced);
		const At = (Offset: number): number => Date.now() + Offset * 1000;
		try {
			const Fold = LedgerDrain(Make(Priced).Context, Ledger.Database, Priced);
			// Session 1: two reads and no writes - both files end 'read', so
			// neither may yield a row even though both keep allocations.
			Fold({ id: "s1", cwd: Home }, [
				{ seq: 0, type: "session", time: At(0), cwd: Home },
				{
					seq: 1,
					type: "assistant/message",
					time: At(1),
					data: {
						turn: 1,
						step: 1,
						usage: { inputTokens: 0, outputTokens: 20 },
						message: { source: { provider: "p", model: "m" } },
					},
				},
				{
					seq: 2,
					type: "tool/call",
					time: At(2),
					data: {
						turn: 1,
						step: 1,
						name: "read",
						callId: "c1",
						arguments: JSON.stringify({ file_path: join(Home, "a.ts") }),
					},
				},
				{ seq: 3, type: "tool/result", time: At(3), data: { turn: 1, step: 1, message: { source: { callId: "c1" } } } },
				{
					seq: 4,
					type: "tool/call",
					time: At(4),
					data: {
						turn: 1,
						step: 1,
						name: "read",
						callId: "c2",
						arguments: JSON.stringify({ file_path: join(Home, "b.ts") }),
					},
				},
				{ seq: 5, type: "tool/result", time: At(5), data: { turn: 1, step: 1, message: { source: { callId: "c2" } } } },
				{ seq: 6, type: "step/end", time: At(6), data: { turn: 1, step: 1 } },
				{ seq: 7, type: "turn/end", time: At(7), data: { turn: 1 } },
			]);
			// Session 2: one edit hunk of two lines - c.ts ends 'changed'.
			Fold({ id: "s2", cwd: Home }, [
				{ seq: 0, type: "session", time: At(10), cwd: Home },
				{
					seq: 1,
					type: "assistant/message",
					time: At(11),
					data: {
						turn: 1,
						step: 1,
						usage: { inputTokens: 100, outputTokens: 50 },
						message: { source: { provider: "p", model: "m" } },
					},
				},
				{
					seq: 2,
					type: "tool/call",
					time: At(12),
					data: {
						turn: 1,
						step: 1,
						name: "edit",
						callId: "c3",
						arguments: JSON.stringify({
							file_path: join(Home, "c.ts"),
							old_string: "a",
							new_string: "b\nc",
						}),
					},
				},
				{ seq: 3, type: "tool/result", time: At(13), data: { turn: 1, step: 1, message: { source: { callId: "c3" } } } },
				{ seq: 4, type: "step/end", time: At(14), data: { turn: 1, step: 1 } },
				{ seq: 5, type: "turn/end", time: At(15), data: { turn: 1 } },
			]);
		} finally {
			Ledger.Close();
		}
		const Opened = Reader(Read);
		try {
			const Views = Analysis(Opened.Database, Read);
			const Found = Views.Effectiveness("file");
			const Changed = join(Home, "c.ts");
			const One = Found.find((Reading) => Reading.Key === Changed);
			Check(Count, "T2: the changed file's cost per line is its cost over its lines", () => {
				assert.ok(One !== undefined, "c.ts keeps a reading");
				const Per = One.Rows.find((Row) => Row.Metric === "cost_per_line");
				const Lines = One.Rows.find((Row) => Row.Metric === "surviving_lines");
				const Cost = One.Rows.find((Row) => Row.Metric === "cost");
				assert.ok(Per !== undefined && Lines !== undefined && Cost !== undefined, "the three metrics exist");
				assert.equal(Per.Unit, "USD/line");
				assert.equal(Lines.Unit, "lines");
				assert.equal(Cost.Unit, "USD");
				assert.equal(Lines.Value, 2, "the edit added two lines");
				assert.ok(Cost.Value > 0, "the changed file keeps allocated money");
				assert.ok(Math.abs(Per.Value - Cost.Value / Lines.Value) <= 1e-12, `cost per line ${Per.Value}`);
			});
			Check(Count, "T2: a read-only file yields no row", () => {
				assert.ok(!Found.some((Reading) => Reading.Key === join(Home, "a.ts")), "a.ts is read-only");
				assert.ok(!Found.some((Reading) => Reading.Key === join(Home, "b.ts")), "b.ts is read-only");
			});
		} finally {
			Opened.Close();
		}
	} finally {
		await rm(Home, { recursive: true, force: true });
	}
	return Finish(Count, "Effectiveness");
};

// Standalone entry: `node Target/Test/Effectiveness/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Effectiveness`);
}
