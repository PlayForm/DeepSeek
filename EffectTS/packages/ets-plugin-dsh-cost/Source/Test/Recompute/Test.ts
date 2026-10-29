// Source/Test/Recompute/Test.ts - THE RECOMPUTE (Documentation/Plans/
// COST-TRACK-PLUGIN.md section 2.4): every number a formula consumes is
// stored - Call holds the usage and the priced cost columns and the surface
// tokens, Touch holds the byte deltas, ContextMass holds the per-file mass -
// so dropping Allocation and Rollup and rebuilding them from those tables
// alone lands byte-identical totals. No session log is read.
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { DatabaseSync } from "node:sqlite";

import Drain from "../../../Target/Function/Drain.js";
import Open from "../../../Target/Function/Open.js";
import Recompute from "../../../Target/Function/Recompute.js";
import Rollup from "../../../Target/Function/Rollup.js";
import { Check, Finish, Make, MakeCounter, Validate } from "../Harness.js";

// The snapshot: the two rebuilt tables, ordered by their keys, the surrogate
// allocation id and the rollup's refresh stamp excluded (both are reassigned
// by the rebuild; the money is what must be byte-identical).
const Snapshot = (Database: DatabaseSync): { Allocations: unknown[]; Rollups: unknown[] } => ({
	Allocations: Database.prepare(
		"SELECT CallId, FileId, DirectCost, AmortizedCost, ContextTokens, SurfaceTokens, Weight, Method, At " +
			"FROM Allocation ORDER BY CallId, FileId",
	).all(),
	Rollups: Database.prepare(
		"SELECT Scope, Key, Day, DirectCost, AmortizedCost, Cost, Calls, Tokens FROM Rollup ORDER BY Scope, Key, Day",
	).all(),
});

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	const Home = await mkdtemp(join(tmpdir(), "dsh-cost-recompute-"));
	try {
		const Config = Validate({
			databasePath: join(Home, "ledger.db"),
			prices: [{ provider: "p", model: "m", input: 1, output: 2 }],
		});
		const Ledger = Open(Config);
		try {
			const Run = Make(Config);
			const Fold = Drain(Run.Context, Ledger.Database, Config);
			const At = (Hours: number): number => Date.parse("2026-10-27T00:00:00Z") + Hours * 3600000;
			const Events = [
				{ seq: 0, type: "session", time: At(0), cwd: Home },
				{
					seq: 1,
					type: "assistant/message",
					time: At(1),
					data: {
						turn: 1,
						step: 1,
						usage: { inputTokens: 100, outputTokens: 50, cacheReadTokens: 20 },
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
						name: "write",
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
					data: { turn: 1, step: 2, usage: { inputTokens: 200, outputTokens: 30 }, message: { source: { provider: "p", model: "m" } } },
				},
				{ seq: 6, type: "step/end", time: At(6), data: { turn: 1, step: 2 } },
			];
			const Session = { id: "backfill", cwd: Home };
			Fold(Session, Events);
			Rollup(Ledger.Database)();
			const Before = Snapshot(Ledger.Database);
			const Outcome = Recompute(Ledger.Database, Config)();
			const After = Snapshot(Ledger.Database);
			Check(Count, "T4: the drop-and-rebuild lands byte-identical allocation and rollup totals", () => {
				assert.ok(Before.Allocations.length >= 3, "the drain landed allocation rows");
				assert.ok(Before.Rollups.length > 0, "the rollup landed rows");
				const Priced = (Ledger.Database.prepare("SELECT SUM(CostTotal) AS S FROM Call").get() as { S: number }).S;
				assert.ok(Priced > 0, "the calls carry priced money");
				assert.equal(Outcome.Allocations, Before.Allocations.length);
				assert.deepEqual(After.Allocations, Before.Allocations, "the allocation rows are identical");
				assert.deepEqual(After.Rollups, Before.Rollups, "the rollup rows are identical");
			});
		} finally {
			Ledger.Close();
		}
	} finally {
		await rm(Home, { recursive: true, force: true });
	}
	return Finish(Count, "Recompute");
};

// Standalone entry: `node Target/Test/Recompute/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Recompute`);
}
