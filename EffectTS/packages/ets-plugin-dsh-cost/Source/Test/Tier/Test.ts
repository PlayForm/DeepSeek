// Source/Test/Tier/Test.ts - THE MARGINAL TIER WALK (Documentation/Plans/
// COST-TRACK-PLUGIN.md section 17.2): a rate card of tier rows prices a
// prompt that crosses a threshold marginally - the tokens below the
// threshold at the lower rate, only the excess at the higher one, which is
// the only reading that does not produce a cliff where one extra token
// doubles a bill. The walk runs per bucket, each against its own rate
// column, because a cached prefix that crosses the same boundary is priced
// per portion too.
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { DatabaseSync } from "node:sqlite";

import Open from "../../../Target/Function/Open.js";
import Price from "../../../Target/Function/Price.js";
import { Check, Finish, MakeCounter, Validate } from "../Harness.js";

// One tier row of the test's rate card, inserted by hand: tier one prices
// the first 200k tokens of every bucket at the low rates, tier two is the
// open top tier and takes everything above.
const SeedTier = (Database: DatabaseSync) =>
	Database.prepare(
		"INSERT INTO Price (Provider, Model, Currency, InputRate, OutputRate, CacheReadRate, CacheWriteRate, ReasoningRate, EffectiveFrom, Source, TierFrom, TierTo) " +
			"VALUES ('test', 'm', 'USD', ?, 1, ?, NULL, NULL, ?, 'test', ?, ?)",
	);

// The priced usage record, every bucket zeroed except the one under test.
const Usage = (Bucket: string, Tokens: number) => ({
	SessionId: "s",
	Turn: 1,
	Step: 1,
	Seq: 0,
	Provider: "test",
	Model: "m",
	InputTokens: Bucket === "input" ? Tokens : 0,
	OutputTokens: 0,
	CacheReadTokens: Bucket === "read" ? Tokens : 0,
	CacheWriteTokens: Bucket === "write" ? Tokens : 0,
	ReasoningTokens: null,
	TotalTokens: null,
	At: Date.parse("2026-02-01T00:00:00Z"),
});

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	const Home = await mkdtemp(join(tmpdir(), "dsh-cost-tier-"));
	try {
		const Config = Validate({ databasePath: join(Home, "ledger.db"), prices: [] });
		const Ledger = Open(Config);
		try {
			const At = Date.parse("2026-02-01T00:00:00Z");
			const Seed = SeedTier(Ledger.Database);
			Seed.run(2, 0.2, At, 0, 200000);
			Seed.run(4, 0.4, At, 200000, null);
			const Book = Price(Ledger.Database, Config);
			const Rate = Book.Resolve("test", "m", At);
			Check(Count, "T3: a prompt entirely below the threshold prices wholly at the first tier", () => {
				const Costed = Book.Cost(Usage("input", 100_000), Rate);
				assert.ok(Math.abs(Costed.Input - 0.2) <= 1e-9, `input ${Costed.Input}`);
				assert.ok(Math.abs(Costed.Total - 0.2) <= 1e-9, `total ${Costed.Total}`);
			});
			Check(Count, "T3: a prompt crossing the threshold prices the portion below at the first rate and only the excess at the second", () => {
				const Costed = Book.Cost(Usage("input", 300_000), Rate);
				assert.ok(Math.abs(Costed.Input - 0.8) <= 1e-9, `input ${Costed.Input}`);
			});
			Check(Count, "T3: a cached bucket crossing the same threshold splits the same way against its own rate", () => {
				const Costed = Book.Cost(Usage("read", 300_000), Rate);
				assert.ok(Math.abs(Costed.CacheRead - 0.08) <= 1e-9, `cache read ${Costed.CacheRead}`);
			});
			Check(Count, "T3: the sum of the portions equals the prompt tokens", () => {
				const Costed = Book.Cost(Usage("input", 300_000), Rate);
				const Second = (Costed.Input * 1e6 - 2 * 300_000) / (4 - 2);
				const First = 300_000 - Second;
				assert.ok(Math.abs(First - 200_000) <= 1e-9, `first portion ${First}`);
				assert.ok(Math.abs(Second - 100_000) <= 1e-9, `second portion ${Second}`);
				assert.ok(Math.abs(First + Second - 300_000) <= 1e-9, `portion sum ${First + Second}`);
			});
			Check(Count, "T3: the walk is marginal, never the cliff of the top rate over the whole prompt", () => {
				const Costed = Book.Cost(Usage("input", 300_000), Rate);
				assert.ok(Costed.Input < 1.2, `input ${Costed.Input} against the flat top-rate 1.2`);
			});
		} finally {
			Ledger.Close();
		}
	} finally {
		await rm(Home, { recursive: true, force: true });
	}
	return Finish(Count, "Tier");
};

// Standalone entry: `node Target/Test/Tier/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Tier`);
}
