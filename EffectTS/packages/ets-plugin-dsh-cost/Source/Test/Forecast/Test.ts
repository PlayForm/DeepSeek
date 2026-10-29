// Source/Test/Forecast/Test.ts - THE PROJECTION (Documentation/Plans/
// COST-TRACK-PLUGIN.md section 17.5): the forecast stays a query over the
// Rollup - a flat three-day history projects the mean times thirty with the
// band collapsed onto it, an outlier day separates the median from the mean
// and opens the band, and a single-day history projects with no spread.
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";

import Forecast from "../../../Target/Function/Forecast.js";
import { Check, Finish, MakeCounter } from "../Harness.js";

// The Rollup's own shape (the DDL's), enough for the forecast to read.
const Make = (): DatabaseSync => {
	const Database = new DatabaseSync(":memory:");
	Database.exec(
		"CREATE TABLE Rollup (Scope TEXT NOT NULL, Key TEXT NOT NULL, Day TEXT NOT NULL, " +
			"DirectCost REAL NOT NULL, AmortizedCost REAL NOT NULL, Cost REAL NOT NULL, " +
			"Calls INTEGER NOT NULL, Tokens INTEGER NOT NULL, UpdatedAt INTEGER NOT NULL, " +
			"PRIMARY KEY (Scope, Key, Day)) STRICT;",
	);
	return Database;
};

// One priced day of one project key.
const Seed = (Database: DatabaseSync, Day: string, Cost: number, Key = "k"): void => {
	Database.prepare(
		"INSERT INTO Rollup (Scope, Key, Day, DirectCost, AmortizedCost, Cost, Calls, Tokens, UpdatedAt) " +
			"VALUES ('project', ?, ?, 0, 0, ?, 1, 0, 0)",
	).run(Key, Day, Cost);
};

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	Check(Count, "E5: a flat three-day history projects the mean times thirty", () => {
		const Database = Make();
		try {
			Seed(Database, "2026-03-01", 10);
			Seed(Database, "2026-03-02", 10);
			Seed(Database, "2026-03-03", 10);
			const Rows = Forecast(Database)(3);
			assert.equal(Rows.length, 1, `rows ${Rows.length}`);
			const Row = Rows[0];
			assert.ok(Row !== undefined, "the projected row exists");
			assert.equal(Row.Scope, "project");
			assert.equal(Row.Key, "k");
			assert.equal(Row.Mean, 10, `mean ${Row.Mean}`);
			assert.equal(Row.Median, 10, `median ${Row.Median}`);
			assert.equal(Row.LastSeven, 10, `last seven ${Row.LastSeven}`);
			assert.equal(Row.Projected, 300, `projected ${Row.Projected}`);
			assert.equal(Row.Minimum, 300, `minimum ${Row.Minimum}`);
			assert.equal(Row.Maximum, 300, `maximum ${Row.Maximum}`);
		} finally {
			Database.close();
		}
	});
	Check(Count, "E5: the median differs from the mean when one day is an outlier", () => {
		const Database = Make();
		try {
			Seed(Database, "2026-03-01", 10);
			Seed(Database, "2026-03-02", 10);
			Seed(Database, "2026-03-03", 40);
			const Row = Forecast(Database)(3)[0];
			assert.ok(Row !== undefined, "the projected row exists");
			assert.equal(Row.Mean, 20, `mean ${Row.Mean}`);
			assert.equal(Row.Median, 10, `median ${Row.Median}`);
			assert.equal(Row.Projected, 600, `projected ${Row.Projected}`);
			assert.equal(Row.Minimum, 300, `minimum ${Row.Minimum}`);
			assert.equal(Row.Maximum, 1200, `maximum ${Row.Maximum}`);
		} finally {
			Database.close();
		}
	});
	Check(Count, "E5: a single-day history projects without a spread", () => {
		const Database = Make();
		try {
			Seed(Database, "2026-03-02", 12);
			const Row = Forecast(Database)(3)[0];
			assert.ok(Row !== undefined, "the projected row exists");
			assert.equal(Row.Mean, 12, `mean ${Row.Mean}`);
			assert.equal(Row.Projected, 360, `projected ${Row.Projected}`);
			assert.equal(Row.Minimum, 360, `minimum ${Row.Minimum}`);
			assert.equal(Row.Maximum, 360, `maximum ${Row.Maximum}`);
		} finally {
			Database.close();
		}
	});
	return Finish(Count, "Forecast");
};

// Standalone entry: `node Target/Test/Forecast/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Forecast`);
}
