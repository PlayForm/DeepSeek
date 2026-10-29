// Source/Test/Overhead/Test.ts - THE EXPLORATION SHARE (Documentation/Plans/
// COST-TRACK-PLUGIN.md section 12): the money a call spent that no file paid
// for - the Allocation rows with FileId IS NULL - over the session's total,
// so the ratio is 1 when nothing is attributed and 0 when everything is.
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
	const Home = await mkdtemp(join(tmpdir(), "dsh-cost-analysis-overhead-"));
	try {
		const Priced = LedgerConfig(Home);
		const Read = Validate({ databasePath: join(Home, "ledger.db") });
		const Ledger = LedgerOpen(Priced);
		const At = (Offset: number): number => Date.now() + Offset * 1000;
		try {
			const Fold = LedgerDrain(Make(Priced).Context, Ledger.Database, Priced);
			// Session 1: one call with no tool touches - its whole price goes
			// to the unattributed bucket, so the ratio is 1.
			Fold({ id: "s1", cwd: Home }, [
				{ seq: 0, type: "session", time: At(0), cwd: Home },
				{
					seq: 1,
					type: "assistant/message",
					time: At(1),
					data: {
						turn: 1,
						step: 1,
						usage: { inputTokens: 100, outputTokens: 50 },
						message: { source: { provider: "p", model: "m" } },
					},
				},
				{ seq: 2, type: "step/end", time: At(2), data: { turn: 1, step: 1 } },
			]);
			// Session 2: a read with no input tokens, then a write whose
			// surface is exactly the file's mass - every cent attributed to
			// a.ts, so the ratio is 0.
			Fold({ id: "s2", cwd: Home }, [
				{ seq: 0, type: "session", time: At(10), cwd: Home },
				{
					seq: 1,
					type: "assistant/message",
					time: At(11),
					data: {
						turn: 1,
						step: 1,
						usage: { inputTokens: 0, outputTokens: 50 },
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
						name: "read",
						callId: "c1",
						arguments: JSON.stringify({ file_path: join(Home, "a.ts") }),
					},
				},
				{ seq: 3, type: "tool/result", time: At(13), data: { turn: 1, step: 1, message: { source: { callId: "c1" } } } },
				{ seq: 4, type: "step/end", time: At(14), data: { turn: 1, step: 1 } },
				{
					seq: 5,
					type: "assistant/message",
					time: At(15),
					data: {
						turn: 1,
						step: 2,
						usage: { inputTokens: 0, outputTokens: 50 },
						message: { source: { provider: "p", model: "m" } },
					},
				},
				{
					seq: 6,
					type: "tool/call",
					time: At(16),
					data: {
						turn: 1,
						step: 2,
						name: "write",
						callId: "c2",
						arguments: JSON.stringify({ file_path: join(Home, "a.ts"), content: "x" }),
					},
				},
				{ seq: 7, type: "tool/result", time: At(17), data: { turn: 1, step: 2, message: { source: { callId: "c2" } } } },
				{ seq: 8, type: "step/end", time: At(18), data: { turn: 1, step: 2 } },
			]);
		} finally {
			Ledger.Close();
		}
		const Opened = Reader(Read);
		try {
			const Views = Analysis(Opened.Database, Read);
			const Found = Views.Overhead("session");
			const One = Found.find((Reading) => Reading.Key === "s1");
			const Two = Found.find((Reading) => Reading.Key === "s2");
			Check(Count, "T4: the ratio is 1 when nothing is attributed", () => {
				assert.ok(One !== undefined, "s1 keeps a reading");
				const Overhead = One.Rows.find((Row) => Row.Metric === "overhead");
				const Ratio = One.Rows.find((Row) => Row.Metric === "overhead_ratio");
				assert.ok(Overhead !== undefined && Ratio !== undefined, "both metrics exist");
				assert.equal(Overhead.Unit, "USD");
				assert.equal(Ratio.Unit, "ratio");
				assert.ok(Overhead.Value > 0, `s1 overhead ${Overhead.Value}`);
				assert.ok(Math.abs(Ratio.Value - 1) <= 1e-12, `s1 ratio ${Ratio.Value}`);
			});
			Check(Count, "T4: the ratio is 0 when everything is attributed", () => {
				assert.ok(Two !== undefined, "s2 keeps a reading");
				const Ratio = Two.Rows.find((Row) => Row.Metric === "overhead_ratio");
				assert.ok(Ratio !== undefined, "the ratio metric exists");
				assert.equal(Ratio.Unit, "ratio");
				assert.ok(Math.abs(Ratio.Value - 0) <= 1e-12, `s2 ratio ${Ratio.Value}`);
			});
		} finally {
			Opened.Close();
		}
	} finally {
		await rm(Home, { recursive: true, force: true });
	}
	return Finish(Count, "Overhead");
};

// Standalone entry: `node Target/Test/Overhead/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Overhead`);
}
