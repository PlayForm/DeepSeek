// Source/Test/Cache/Test.ts - THE CACHE EFFICIENCY (Documentation/Plans/
// COST-TRACK-PLUGIN.md section 16.4): the share of a file's surface-weighted
// input tokens the prompt cache served - the cached tokens over the cached
// plus uncached input, each call weighted by the share of its surface the
// file occupied - the measurable half of "did reading this file make the
// later edit cheaper".
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
	const Home = await mkdtemp(join(tmpdir(), "dsh-cost-analysis-cache-"));
	try {
		const Priced = LedgerConfig(Home);
		const Read = Validate({ databasePath: join(Home, "ledger.db") });
		const Ledger = LedgerOpen(Priced);
		const At = (Offset: number): number => Date.now() + Offset * 1000;
		try {
			const Fold = LedgerDrain(Make(Priced).Context, Ledger.Database, Priced);
			// The replay: a read of a.ts (call 1), then a call with 40 of its
			// 100 input tokens cached (call 2) whose surface carries a.ts -
			// the file occupies half of that call's surface, so its weighted
			// cached tokens are 20 against 50 weighted input tokens.
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
						usage: { inputTokens: 60, outputTokens: 10, cacheReadTokens: 40 },
						message: { source: { provider: "p", model: "m" } },
					},
				},
				{ seq: 6, type: "step/end", time: At(6), data: { turn: 1, step: 2 } },
			];
			Fold({ id: "s", cwd: Home }, Events);
		} finally {
			Ledger.Close();
		}
		const Opened = Reader(Read);
		try {
			const Views = Analysis(Opened.Database, Read);
			const Found = Views.Cache("file");
			const One = Found.find((Reading) => Reading.Key === join(Home, "a.ts"));
			Check(Count, "T5: the cache ratio sits between zero and one", () => {
				assert.ok(One !== undefined, "a.ts keeps a reading");
				const Ratio = One.Rows.find((Row) => Row.Metric === "cache_ratio");
				assert.ok(Ratio !== undefined, "a.ts carries the cache ratio");
				assert.equal(Ratio.Unit, "ratio");
				assert.ok(Ratio.Value > 0 && Ratio.Value < 1, `a.ts cache ratio ${Ratio.Value}`);
			});
			Check(Count, "T5: the ratio is the cached over the cached plus uncached tokens", () => {
				assert.ok(One !== undefined, "a.ts keeps a reading");
				const Ratio = One.Rows.find((Row) => Row.Metric === "cache_ratio");
				const Cached = One.Rows.find((Row) => Row.Metric === "cached_tokens");
				const Whole = One.Rows.find((Row) => Row.Metric === "input_tokens");
				assert.ok(Ratio !== undefined && Cached !== undefined && Whole !== undefined, "the three metrics exist");
				assert.equal(Cached.Unit, "tokens");
				assert.equal(Whole.Unit, "tokens");
				assert.equal(Cached.Value, 20, `cached tokens ${Cached.Value}`);
				assert.equal(Whole.Value, 50, `input tokens ${Whole.Value}`);
				assert.ok(Math.abs(Ratio.Value - Cached.Value / Whole.Value) <= 1e-12, `ratio ${Ratio.Value}`);
			});
		} finally {
			Opened.Close();
		}
	} finally {
		await rm(Home, { recursive: true, force: true });
	}
	return Finish(Count, "Cache");
};

// Standalone entry: `node Target/Test/Cache/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Cache`);
}
