// Source/Test/Pricing/Test.ts - THE PRICING FIXTURE SET (Temporary/
// Cost-Research/Plan.md lane B4a; Documentation/Plans/COST-TRACK-PLUGIN.md
// sections 6 and 17.2; the research's sections 2.2 and 2.3): one fixed set of
// calls is booked through the drain against a plain card, a card with a
// cache-read rate, a windowed card, a region-specific card, a tiered card,
// two conditional cards and an unknown model, and the read answers the exact
// per-bucket money, the exact total and the unpriced coverage.
//
// Three properties carry the lane. The windowed and region-specific checks
// are the family-binding ones: a card's tier rows are read inside the card's
// own window and region, an exact match beats a NEWER generic row, and the
// other window's band never enters the walk. The unpriced check is the
// accounting one: a call whose rate card the book does not carry stores zero
// money, keeps its usage, and is counted as unpriced rather than free. The
// conditional checks are the selection one: a card selected from the
// request's total prompt size prices the whole request flat and never joins
// the marginal ladder.
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { DatabaseSync } from "node:sqlite";

import Drain from "../../../Target/Function/Drain.js";
import Open from "../../../Target/Function/Open.js";
import Price from "../../../Target/Function/Price.js";
import Reader from "../../../Target/Function/Reader.js";
import Report from "../../../Target/Function/Report.js";
import { Check, Finish, Make, MakeCounter, Validate } from "../Harness.js";

// The effective dates the hand-inserted cards carry: the generic row is the
// NEWER one, so an exact window or region match has to win over the greater
// EffectiveFrom for the specific call - the half of the selection rule a
// generic-only book cannot show.
const Early = Date.parse("2026-01-01T00:00:00Z");
const Late = Date.parse("2026-02-01T00:00:00Z");

// The fixture's clock: 2026-03-01 plus a UTC hour, so every card is in force
// and the configured peak window (12 to 18 UTC) is the one hour 14 falls in.
const When = (Hour: number): number => Date.parse("2026-03-01T00:00:00Z") + Hour * 3600000;

// One hand-inserted card row: the columns the config book cannot carry - the
// window, the region, the tier bounds and the conditional marker. A card is
// the family of these rows that share an effective date, a mode, a region and
// a window, one row per TierFrom.
type Card = {
	Model: string;
	Window?: string;
	Region?: string | null;
	TierFrom?: number;
	TierTo?: number | null;
	InputRate: number;
	OutputRate: number;
	CacheReadRate?: number | null;
	Note?: string | null;
	EffectiveFrom: number;
};

const Seed = (Database: DatabaseSync, Card: Card): void => {
	Database.prepare(
		"INSERT INTO Price (Provider, Model, Currency, InputRate, OutputRate, CacheReadRate, CacheWriteRate, ReasoningRate, EffectiveFrom, Source, Window, TierFrom, TierTo, Mode, Region, Note) " +
			"VALUES ('test', ?, 'USD', ?, ?, ?, NULL, NULL, ?, 'test', ?, ?, ?, 'standard', ?, ?)",
	).run(
		Card.Model,
		Card.InputRate,
		Card.OutputRate,
		Card.CacheReadRate ?? null,
		Card.EffectiveFrom,
		Card.Window ?? "any",
		Card.TierFrom ?? 0,
		Card.TierTo ?? null,
		Card.Region ?? null,
		Card.Note ?? null,
	);
};

// One booked call: the step it lands on, the UTC hour it ran at, the model and
// the provider's own usage buckets.
type Ask = {
	Step: number;
	Hour: number;
	Provider: string;
	Model: string;
	Input: number;
	Output: number;
	CacheRead?: number;
	Region?: string;
};

// The fixture's calls, in the order the drain books them.
const Asks: readonly Ask[] = [
	// 1: the plain card, both rate columns exercised.
	{ Step: 1, Hour: 9, Provider: "test", Model: "plain", Input: 1_000_000, Output: 500_000 },
	// 2: the cache-read card.
	{
		Step: 2,
		Hour: 9,
		Provider: "test",
		Model: "cached",
		Input: 1_000_000,
		Output: 0,
		CacheRead: 2_000_000,
	},
	// 3: the windowed card, called inside the peak window.
	{ Step: 3, Hour: 14, Provider: "test", Model: "windowed", Input: 300_000, Output: 0 },
	// 4: the region-specific card, called with the region it names.
	{
		Step: 4,
		Hour: 9,
		Provider: "test",
		Model: "regioned",
		Input: 100_000,
		Output: 0,
		Region: "us",
	},
	// 5: the same model with no region, so the generic row prices it.
	{ Step: 5, Hour: 9, Provider: "test", Model: "regioned", Input: 100_000, Output: 0 },
	// 6: the tiered card, a prompt that crosses the threshold.
	{ Step: 6, Hour: 9, Provider: "test", Model: "tiered", Input: 300_000, Output: 0 },
	// 7: the at-or-below conditional card, a prompt inside its bound.
	{ Step: 7, Hour: 9, Provider: "test", Model: "conditioned", Input: 100_000, Output: 0 },
	// 8: the same card, a prompt above its bound: the base card prices it.
	{ Step: 8, Hour: 9, Provider: "test", Model: "conditioned", Input: 300_000, Output: 0 },
	// 9: the above conditional card, a prompt above its bound.
	{ Step: 9, Hour: 9, Provider: "test", Model: "banded", Input: 300_000, Output: 0 },
	// 10: the same card, a prompt inside its bound: the base card prices it.
	{ Step: 10, Hour: 9, Provider: "test", Model: "banded", Input: 100_000, Output: 0 },
	// 11: the unknown model: no card resolves, so the call is unpriced.
	{
		Step: 11,
		Hour: 9,
		Provider: "ghost",
		Model: "unpriced",
		Input: 1_000,
		Output: 500,
		CacheRead: 200,
	},
];

// The session log the fixture replays: the header record and one assistant
// message per step, so the drain books exactly one call per Ask.
const Records = (Cwd: string): readonly unknown[] => [
	{ seq: 0, type: "session", time: When(0), cwd: Cwd },
	...Asks.map((One, Index) => ({
		seq: Index + 1,
		type: "assistant/message",
		time: When(One.Hour),
		data: {
			turn: 1,
			step: One.Step,
			usage: {
				inputTokens: One.Input,
				outputTokens: One.Output,
				cacheReadTokens: One.CacheRead,
			},
			message: { source: { provider: One.Provider, model: One.Model } },
			region: One.Region,
		},
	})),
];

// One money assertion: the sixth decimal is the precision every stored figure
// lands on, so the tolerance is the last place of the rounded sum.
const Near = (Actual: number, Expected: number, Label: string): void => {
	assert.ok(Math.abs(Actual - Expected) <= 1e-9, `${Label}: ${Actual} against ${Expected}`);
};

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	const Home = await mkdtemp(join(tmpdir(), "dsh-cost-pricing-"));
	try {
		const Config = Validate({
			databasePath: join(Home, "ledger.db"),
			prices: [
				{
					provider: "test",
					model: "plain",
					input: 2,
					output: 4,
					effectiveFrom: "2026-01-01",
				},
				{
					provider: "test",
					model: "cached",
					input: 2,
					output: 4,
					cacheRead: 0.5,
					effectiveFrom: "2026-01-01",
				},
			],
			priceWindows: [{ label: "peak", startUtcHour: 12, endUtcHour: 18 }],
		});
		const Ledger = Open(Config);
		try {
			// The windowed card: a peak floor and a peak band at the older
			// effective date, a probe band in another window at the same date
			// (a row the peak walk must never read), and a newer generic row
			// the peak call must still beat.
			Seed(Ledger.Database, {
				Model: "windowed",
				Window: "peak",
				TierFrom: 0,
				TierTo: 200_000,
				InputRate: 10,
				OutputRate: 20,
				EffectiveFrom: Early,
			});
			Seed(Ledger.Database, {
				Model: "windowed",
				Window: "peak",
				TierFrom: 200_000,
				InputRate: 20,
				OutputRate: 40,
				EffectiveFrom: Early,
			});
			Seed(Ledger.Database, {
				Model: "windowed",
				Window: "offpeak",
				TierFrom: 100_000,
				InputRate: 99,
				OutputRate: 99,
				EffectiveFrom: Early,
			});
			Seed(Ledger.Database, {
				Model: "windowed",
				InputRate: 1,
				OutputRate: 2,
				EffectiveFrom: Late,
			});
			// The region-specific card: the exact region at the older date and
			// the generic row at the newer one.
			Seed(Ledger.Database, {
				Model: "regioned",
				Region: "us",
				InputRate: 10,
				OutputRate: 20,
				EffectiveFrom: Early,
			});
			Seed(Ledger.Database, {
				Model: "regioned",
				InputRate: 1,
				OutputRate: 2,
				EffectiveFrom: Late,
			});
			// The tiered card: two marginal bands of one effective-dated card.
			Seed(Ledger.Database, {
				Model: "tiered",
				TierFrom: 0,
				TierTo: 200_000,
				InputRate: 3,
				OutputRate: 6,
				EffectiveFrom: Early,
			});
			Seed(Ledger.Database, {
				Model: "tiered",
				TierFrom: 200_000,
				InputRate: 6,
				OutputRate: 12,
				EffectiveFrom: Early,
			});
			// The two conditional cards: a base card each, plus one row whose
			// Note selects it at or below, or above, its TierFrom threshold.
			Seed(Ledger.Database, {
				Model: "conditioned",
				InputRate: 10,
				OutputRate: 20,
				EffectiveFrom: Early,
			});
			Seed(Ledger.Database, {
				Model: "conditioned",
				TierFrom: 150_000,
				InputRate: 5,
				OutputRate: 10,
				Note: "condition:at-or-below",
				EffectiveFrom: Early,
			});
			Seed(Ledger.Database, {
				Model: "banded",
				InputRate: 10,
				OutputRate: 20,
				EffectiveFrom: Early,
			});
			Seed(Ledger.Database, {
				Model: "banded",
				TierFrom: 150_000,
				InputRate: 40,
				OutputRate: 80,
				Note: "condition:above",
				EffectiveFrom: Early,
			});

			const Run = Make(Config);
			const Fold = Drain(Run.Context, Ledger.Database, Config);
			Fold({ id: "pricing", cwd: Home }, Records(Home));

			const Response = Reader(Ledger.Database, "pricing", 200);
			const Views = Report(Ledger.Database);
			const Book = Price(Ledger.Database, Config);

			// The call the fixture booked at one step: the reader answers
			// ascending by (turn, step) and every call is turn one, so the
			// step is the index.
			const Booked = (Step: number) => {
				const One = Response.calls[Step - 1];
				assert.ok(One !== undefined, `the fixture booked step ${Step}`);
				assert.equal(One.step, Step, `step ${Step} is the call at that index`);
				return One;
			};

			Check(Count, "B4a: a plain card prices every bucket at its own rate", () => {
				const One = Booked(1);
				assert.equal(One.priced, true, "the call carries a price row");
				Near(One.cost.input, 2, "input");
				Near(One.cost.output, 2, "output");
				Near(One.cost.cacheRead, 0, "cache read");
				Near(One.cost.total, 4, "total");
			});
			Check(
				Count,
				"B4a: a cache-read rate prices the cached bucket at its own rate, never the input rate",
				() => {
					const One = Booked(2);
					Near(One.cost.input, 2, "input");
					Near(One.cost.cacheRead, 1, "cache read");
					Near(One.cost.total, 3, "total");
				},
			);
			Check(
				Count,
				"B4a: a windowed card is selected inside its window and its bands stay in that window",
				() => {
					const Rate = Book.Resolve("test", "windowed", When(14), "standard", null, "peak");
					assert.equal(Rate.Window, "peak", "the resolved card names the window");
					Near(Rate.InputRate, 10, "the peak floor rate, not the newer generic row");
					assert.notEqual(Rate.PriceId, null, "the resolved row has its own identity");
					Near(Booked(3).cost.total, 4, "the peak walk, with the other window's band excluded");
				},
			);
			Check(
				Count,
				"B4a: a region-specific card wins for its own region and the generic row prices a call with none",
				() => {
					const Named = Book.Resolve("test", "regioned", When(9), "standard", "us");
					assert.equal(Named.Region, "us", "the exact region row resolved");
					Near(Named.InputRate, 10, "the region row's rate, not the newer generic row");
					Near(Booked(4).cost.total, 1, "the region-priced call");
					const Generic = Book.Resolve("test", "regioned", When(9), "standard", null);
					assert.equal(Generic.Region, null, "the generic row resolved");
					Near(Booked(5).cost.total, 0.1, "the generic-priced call");
				},
			);
			Check(
				Count,
				"B4a: a tiered card prices the portion below the threshold at the lower rate and only the excess above",
				() => {
					Near(Booked(6).cost.input, 1.2, "the marginal split");
					Near(Booked(6).cost.total, 1.2, "total");
				},
			);
			Check(
				Count,
				"B4a: an unknown card leaves the call unpriced, its usage recorded and its money zero",
				() => {
					const One = Booked(11);
					assert.equal(One.priced, false, "the call carries no price row");
					assert.equal(One.cost.total, 0, "no rate, so no money");
					assert.equal(One.tokens.input, 1000, "the usage is kept");
					assert.equal(One.tokens.output, 500, "the output is kept");
					assert.equal(One.tokens.cacheRead, 200, "the cache read is kept");
					assert.equal(
						Book.Resolve("ghost", "unpriced", When(9)).PriceId,
						null,
						"the resolution carries no row identity",
					);
				},
			);
			Check(Count, "B4a: the coverage counts the priced and the unpriced calls", () => {
				assert.equal(Response.coverage.calls, 11, "calls");
				assert.equal(Response.coverage.priced, 10, "priced");
				assert.equal(Response.coverage.unpriced, 1, "unpriced");
				assert.equal(Response.summary.unpriced, 1, "the summary's own count agrees");
			});
			Check(Count, "B4a: the coverage carries the unpriced calls' token buckets", () => {
				const Tokens = Response.coverage.unpricedTokens;
				assert.equal(Tokens.input, 1000, "input");
				assert.equal(Tokens.output, 500, "output");
				assert.equal(Tokens.cacheRead, 200, "cache read");
				assert.equal(Tokens.cacheWrite, 0, "cache write");
				assert.equal(Tokens.reasoning, 0, "reasoning");
				assert.equal(Tokens.total, 1700, "total");
				assert.equal(Tokens.reported, null, "the log reported no total");
			});
			Check(Count, "B4a: the report read states the unpriced calls beside the priced ones", () => {
				const Row = Views.Coverage("pricing")[0];
				assert.ok(Row !== undefined, "the session has a coverage row");
				assert.equal(Row.Calls, 11, "calls");
				assert.equal(Row.Priced, 10, "priced");
				assert.equal(Row.Unpriced, 1, "unpriced");
				assert.equal(Row.UnpricedTokens, 1700, "the unpriced token buckets");
			});
			Check(
				Count,
				"B4a: a conditional card at or below its threshold prices the whole request flat",
				() => {
					Near(Booked(7).cost.input, 0.5, "the conditional rate, not the base card's 1.0");
					Near(Booked(7).cost.total, 0.5, "total");
				},
			);
			Check(
				Count,
				"B4a: a request above the conditional threshold falls back to the base card, which never inherits the conditional band",
				() => {
					Near(Booked(8).cost.total, 3, "the base card flat, never the mixed ladder's 3.75");
				},
			);
			Check(
				Count,
				"B4a: a conditional card above its threshold prices the whole request at its own rates",
				() => {
					Near(Booked(9).cost.total, 12, "the above-threshold rate, not the base card's 3.0");
				},
			);
			Check(
				Count,
				"B4a: a request inside an above-threshold card's bound keeps the base card",
				() => {
					Near(Booked(10).cost.total, 1, "the base card");
				},
			);
			Check(Count, "B4a: the fixture's priced money sums to the exact total", () => {
				Near(Response.summary.cost.total, 29.8, "the session's priced money");
				assert.equal(Response.summary.calls, 11, "every call is in the summary");
			});
		} finally {
			Ledger.Close();
		}
	} finally {
		await rm(Home, { recursive: true, force: true });
	}
	return Finish(Count, "Pricing");
};

// Standalone entry: `node Target/Test/Pricing/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Pricing`);
}
