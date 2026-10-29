// Source/Test/Lines/Test.ts - THE CHURN (Documentation/Plans/
// COST-TRACK-PLUGIN.md sections 16.2 and 17.3): every edit tool call
// produces hunks, the ledger stores each one in the Edit table, and the
// analysis sums the lines a file's hunks added and removed, counts the
// hunks, and divides the file's allocated cost by its added lines.
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { DatabaseSync } from "node:sqlite";

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

// The file's allocated cost, read straight from the ledger before it closes:
// what the analysis's cost per added line must divide.
const Allocated = (Database: DatabaseSync, Path: string): number => {
	const Row = Database.prepare(
		"SELECT COALESCE(SUM(Allocation.DirectCost + Allocation.AmortizedCost), 0) AS Cost " +
			"FROM Allocation JOIN File ON File.FileId = Allocation.FileId WHERE File.Path = ?",
	).get(Path) as { Cost: unknown } | undefined;
	const Cost = Number(Row?.Cost);
	return Number.isFinite(Cost) ? Cost : 0;
};

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	const Home = await mkdtemp(join(tmpdir(), "dsh-cost-analysis-lines-"));
	try {
		const Priced = LedgerConfig(Home);
		const Read = Validate({ databasePath: join(Home, "ledger.db") });
		const Ledger = LedgerOpen(Priced);
		const At = (Offset: number): number => Date.now() + Offset * 1000;
		let Cost = 0;
		try {
			const Fold = LedgerDrain(Make(Priced).Context, Ledger.Database, Priced);
			// The replay: a write of three lines (call 1), then an edit of two
			// added against one removed (call 2), both on a.ts.
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
						name: "write",
						callId: "c1",
						arguments: JSON.stringify({
							file_path: join(Home, "a.ts"),
							content: "one\ntwo\nthree",
						}),
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
						usage: { inputTokens: 0, outputTokens: 10 },
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
						name: "edit",
						callId: "c2",
						arguments: JSON.stringify({
							file_path: join(Home, "a.ts"),
							old_string: "two",
							new_string: "TWO\n!",
						}),
					},
				},
				{ seq: 7, type: "tool/result", time: At(7), data: { turn: 1, step: 2, message: { source: { callId: "c2" } } } },
				{ seq: 8, type: "step/end", time: At(8), data: { turn: 1, step: 2 } },
			];
			Fold({ id: "s", cwd: Home }, Events);
			Cost = Allocated(Ledger.Database, join(Home, "a.ts"));
		} finally {
			Ledger.Close();
		}
		const Opened = Reader(Read);
		try {
			const Views = Analysis(Opened.Database, Read);
			const Found = Views.Lines("file");
			const One = Found.find((Reading) => Reading.Key === join(Home, "a.ts"));
			Check(Count, "T3: the lines added and removed are the hunks' sums", () => {
				assert.ok(One !== undefined, "a.ts keeps a reading");
				const Added = One.Rows.find((Row) => Row.Metric === "lines_added");
				const Removed = One.Rows.find((Row) => Row.Metric === "lines_removed");
				assert.ok(Added !== undefined && Removed !== undefined, "both line metrics exist");
				assert.equal(Added.Unit, "lines");
				assert.equal(Removed.Unit, "lines");
				assert.equal(Added.Value, 5, `lines added ${Added.Value}`);
				assert.equal(Removed.Value, 1, `lines removed ${Removed.Value}`);
			});
			Check(Count, "T3: the hunks are counted per file", () => {
				assert.ok(One !== undefined, "a.ts keeps a reading");
				const Hunks = One.Rows.find((Row) => Row.Metric === "hunks");
				assert.ok(Hunks !== undefined, "the hunk metric exists");
				assert.equal(Hunks.Unit, "hunks");
				assert.equal(Hunks.Value, 2, `hunks ${Hunks.Value}`);
			});
			Check(Count, "T3: the cost per added line is the allocated cost over the added lines", () => {
				assert.ok(One !== undefined, "a.ts keeps a reading");
				const Per = One.Rows.find((Row) => Row.Metric === "cost_per_added_line");
				assert.ok(Per !== undefined, "the cost per added line exists");
				assert.equal(Per.Unit, "USD/line");
				assert.ok(Math.abs(Per.Value - Cost / 5) <= 1e-12, `cost per added line ${Per.Value}`);
			});
		} finally {
			Opened.Close();
		}
	} finally {
		await rm(Home, { recursive: true, force: true });
	}
	return Finish(Count, "Lines");
};

// Standalone entry: `node Target/Test/Lines/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Lines`);
}
