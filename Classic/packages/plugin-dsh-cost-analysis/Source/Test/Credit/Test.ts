// Source/Test/Credit/Test.ts - THE READ CREDIT (Documentation/Plans/
// COST-TRACK-PLUGIN.md section 11, Ring C): reading a file warms the prompt
// cache, so every later call whose surface carries it pays the cache-read
// rate instead of the full input rate - the drain stores that saving on the
// Call row (Call.CacheSaving) and the analysis credits it to the file in
// proportion to the share of the surface the file occupied.
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import LedgerPlugin from "../../../../plugin-dsh-cost/Target/Library.js";
import LedgerDrain from "../../../../plugin-dsh-cost/Target/Function/Drain.js";
import LedgerOpen from "../../../../plugin-dsh-cost/Target/Function/Open.js";
import LedgerRollup from "../../../../plugin-dsh-cost/Target/Function/Rollup.js";
import Analysis from "../../../Target/Function/Analysis.js";
import Reader from "../../../Target/Function/Open.js";
import { Check, Finish, Make, MakeCounter, Validate } from "../Harness.js";

// The ledger half's validated config (the ledger package's own schema): the
// fixture price row - input 1, output 2, cache read 0.1 per million - under
// one client, at the temporary database.
const LedgerConfig = (Home: string): any =>
	(LedgerPlugin.Config as unknown as (Raw: Record<string, unknown>) => any)({
		databasePath: join(Home, "ledger.db"),
		client: "fixture",
		prices: [{ provider: "p", model: "m", input: 1, output: 2, cacheRead: 0.1 }],
	});

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	const Home = await mkdtemp(join(tmpdir(), "dsh-cost-analysis-credit-"));
	try {
		const Priced = LedgerConfig(Home);
		const Read = Validate({ databasePath: join(Home, "ledger.db") });
		const Ledger = LedgerOpen(Priced);
		const At = (Offset: number): number => Date.now() + Offset * 1000;
		try {
			// The replay: a read of a.ts (call 1), then a cached call (call 2)
			// whose surface carries a.ts and whose step writes c.ts - a file
			// that is allocated but never in a surface.
			const Fold = LedgerDrain(Make(Priced).Context, Ledger.Database, Priced);
			const Events = [
				{ seq: 0, type: "session", time: At(0), cwd: Home },
				{
					seq: 1,
					type: "assistant/message",
					time: At(1),
					data: {
						turn: 1,
						step: 1,
						usage: { inputTokens: 0, outputTokens: 10 },
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
				{ seq: 4, type: "step/end", time: At(4), data: { turn: 1, step: 1 } },
				{
					seq: 5,
					type: "assistant/message",
					time: At(5),
					data: {
						turn: 1,
						step: 2,
						usage: { inputTokens: 100, outputTokens: 10, cacheReadTokens: 40 },
						message: { source: { provider: "p", model: "m" } },
					},
				},
				{
					seq: 6,
					type: "tool/call",
					time: At(6),
					data: {
						turn: 1,
						step: 2,
						name: "write",
						callId: "c2",
						arguments: JSON.stringify({ file_path: join(Home, "c.ts"), content: "x" }),
					},
				},
				{ seq: 7, type: "tool/result", time: At(7), data: { turn: 1, step: 2, message: { source: { callId: "c2" } } } },
				{ seq: 8, type: "step/end", time: At(8), data: { turn: 1, step: 2 } },
			];
			Fold({ id: "s", cwd: Home }, Events);
			LedgerRollup(Ledger.Database)();
		} finally {
			Ledger.Close();
		}
		const Opened = Reader(Read);
		try {
			const Views = Analysis(Opened.Database, Read);
			const Found = Views.Credit("file");
			const Cached = join(Home, "a.ts");
			const Never = join(Home, "c.ts");
			const One = Found.find((Reading) => Reading.Key === Cached);
			const Two = Found.find((Reading) => Reading.Key === Never);
			Check(Count, "T1: the credit is positive for the file the surface carried", () => {
				assert.ok(One !== undefined, "a.ts keeps a reading");
				const Credit = One.Rows.find((Row) => Row.Metric === "credit");
				assert.ok(Credit !== undefined, "a.ts carries the credit metric");
				assert.equal(Credit.Unit, "USD");
				assert.ok(Credit.Value > 0, `a.ts credit ${Credit.Value}`);
			});
			Check(Count, "T1: the credit is zero for a file never in a surface", () => {
				assert.ok(Two !== undefined, "c.ts keeps a reading");
				const Credit = Two.Rows.find((Row) => Row.Metric === "credit");
				assert.ok(Credit !== undefined, "c.ts carries the credit metric");
				assert.equal(Credit.Value, 0, `c.ts credit ${Credit.Value}`);
			});
			Check(Count, "T1: the ratio rides along and the readings rank by credit", () => {
				assert.ok(One !== undefined && Two !== undefined, "both readings exist");
				const Ratio = One.Rows.find((Row) => Row.Metric === "credit_ratio");
				assert.ok(Ratio !== undefined, "a.ts carries the credit ratio");
				assert.equal(Ratio.Unit, "ratio");
				assert.ok(Ratio.Value > 0, `a.ts credit ratio ${Ratio.Value}`);
				assert.equal(Found[0]?.Key, Cached, "the readings rank by credit descending");
			});
		} finally {
			Opened.Close();
		}
	} finally {
		await rm(Home, { recursive: true, force: true });
	}
	return Finish(Count, "Credit");
};

// Standalone entry: `node Target/Test/Credit/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Credit`);
}
