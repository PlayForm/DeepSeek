// Price - the rate resolution and the cost arithmetic
// (Documentation/Plans/COST-TRACK-PLUGIN.md sections 2, 17.1 and 17.2): a
// call is priced at the most specific ledger price row in force at the
// call's own time - an exact Mode or Region match wins over a NULL ("any")
// row, the greatest EffectiveFrom wins among equals, and a call in an
// unpriced mode or region costs zero - falling back to the configured price
// book, which is seeded into the ledger's Price table on first use (Source
// "config", append-only). The arithmetic is the marginal tier walk
// (section 17.2): for each tier row of the resolved row's rate card in
// ascending TierFrom, the tokens inside that tier's window are priced at
// that tier's rate and summed - per bucket, each against its own rate
// column, because a cached prefix that crosses a threshold is priced per
// portion rather than per call. After the tier sum, the total and every
// bucket are multiplied by the product of the applicable modifiers'
// multipliers (section 17.2): a modifier applies when its Provider matches,
// its Model is NULL or equals the model, its Kind matches the call's
// pricing mode, and the call's time is inside its effective window - and a
// model-specific modifier beats a provider-wide one of the same Kind. An
// absent bucket (null tokens or a null rate) costs zero. The input side is
// the UNCACHED remainder plus the cache buckets, never the whole input.
import type { DatabaseSync } from "node:sqlite";

import type Config from "../Interface/Config.js";
import type Price from "../Interface/Price.js";
import type Rule from "../Interface/Rule.js";
import type Usage from "../Interface/Usage.js";

// One tier row of a rate card: the window the tier covers and the rates
// every bucket prices at inside it (a null rate is an unpriced bucket).
type TierRow = {
	readonly TierFrom: number;
	readonly TierTo: number | null;
	readonly InputRate: number;
	readonly OutputRate: number;
	readonly CacheReadRate: number | null;
	readonly CacheWriteRate: number | null;
};

type Costed = {
	Input: number;
	Output: number;
	CacheRead: number;
	CacheWrite: number;
	Reasoning: number;
	Total: number;
	Currency: string;
};

// A config date: one that already parses as-is is used directly, a bare
// date is read as the start of its UTC day, an unparseable one is 0.
const Epoch = (Stamp: string): number => {
	const Direct = Date.parse(Stamp);
	return Number.isFinite(Direct) ? Direct : Date.parse(`${Stamp}T00:00:00Z`);
};

// The product of the applicable modifiers for one pricing mode (section
// 17.2): a rule applies when its Provider matches, its Model is NULL or
// equals the model, its Kind matches the mode, and the call's time is
// inside its effective window - and the most specific rules win, so a
// model-specific rule beats a provider-wide one of the same Kind.
const Product = (
	Rules: readonly Rule[],
	Provider: string,
	Kind: string,
	Model: string,
	At: number,
): number => {
	const Fitting = Rules.filter(
		(Rule) =>
			Rule.Provider === Provider &&
			Rule.Kind === Kind &&
			(Rule.Model === null || Rule.Model === Model) &&
			Rule.EffectiveFrom <= At &&
			(Rule.EffectiveTo === null || At <= Rule.EffectiveTo),
	);
	const Specific = Fitting.some((Rule) => Rule.Model === Model)
		? Fitting.filter((Rule) => Rule.Model === Model)
		: Fitting.filter((Rule) => Rule.Model === null);
	return Specific.reduce((Factor, Rule) => Factor * Rule.Multiplier, 1);
};

// One bucket's marginal tier walk (section 17.2): the tokens inside each
// tier's window, priced at that tier's rate and summed. A tier with a NULL
// TierTo is the open top tier and takes everything above its floor; the
// walk never prices a token twice, because the windows tile the axis.
const Walk = (
	Tokens: number,
	Tiers: readonly TierRow[],
	Rate: (Row: TierRow) => number | null,
): number => {
	let Sum = 0;
	for (const Row of Tiers) {
		const Reach = Tokens - Row.TierFrom;
		const Portion =
			Row.TierTo === null
				? Math.max(0, Reach)
				: Math.max(0, Math.min(Reach, Row.TierTo - Row.TierFrom));
		Sum += (Portion / 1e6) * (Rate(Row) ?? 0);
	}
	return Sum;
};

export default (
	Database: DatabaseSync,
	Config: Config,
): {
	Resolve(
		Provider: string,
		Model: string,
		At: number,
		Mode?: string,
		Region?: string | null,
		Window?: string,
	): Price;
	Cost(Record: Usage, Rate: Price, Modifiers?: readonly Rule[]): Costed;
	Applied(Provider: string, Kind: string, Model: string, At: number): number;
} => {
	const Select = Database.prepare(
		"SELECT Provider, Model, Currency, InputRate, OutputRate, CacheReadRate, CacheWriteRate, ReasoningRate, " +
			"EffectiveFrom, TierFrom, TierTo, Mode, Region " +
			"FROM Price WHERE Provider = ? AND Model = ? AND EffectiveFrom <= ? " +
			"AND (Mode = ? OR Mode IS NULL) AND Region IS ? AND (Window = ? OR Window = 'any') " +
			"ORDER BY (Mode = ?) DESC, (Region = ?) DESC, (Window = ?) DESC, EffectiveFrom DESC LIMIT 1",
	);
	const Tiers = Database.prepare(
		"SELECT TierFrom, TierTo, InputRate, OutputRate, CacheReadRate, CacheWriteRate " +
			"FROM Price WHERE Provider = ? AND Model = ? AND EffectiveFrom = ? AND Mode IS ? AND Region IS ? " +
			"ORDER BY TierFrom ASC",
	);
	const Insert = Database.prepare(
		"INSERT OR IGNORE INTO Price (Provider, Model, Currency, InputRate, OutputRate, CacheReadRate, CacheWriteRate, ReasoningRate, EffectiveFrom, Source) " +
			"VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'config')",
	);

	// The configured modifier rules, parsed once at load: the ledger's own
	// Modifier table is the append-only audit copy; the config's rows are
	// what the arithmetic reads until the factor pass writes that table.
	const Rules: readonly Rule[] = Config.modifiers.map((Row) => ({
		Provider: Row.provider,
		Model: Row.model === undefined || Row.model.length === 0 ? null : Row.model,
		Kind: Row.kind,
		Multiplier: Row.multiplier,
		EffectiveFrom: Epoch(Row.effectiveFrom),
		EffectiveTo:
			Row.effectiveTo === undefined || Row.effectiveTo.length === 0
				? null
				: Epoch(Row.effectiveTo),
	}));

	// The configured book's rows for this provider and model, seeded into the
	// effective-dated table on first use.
	const Seed = (Provider: string, Model: string): void => {
		for (const Row of Config.prices) {
			if (Row.provider !== Provider || Row.model !== Model) {
				continue;
			}
			Insert.run(
				Row.provider,
				Row.model,
				Row.currency.length > 0 ? Row.currency : Config.currency,
				Row.input,
				Row.output,
				Row.cacheRead ?? null,
				Row.cacheWrite ?? null,
				Row.reasoning ?? null,
				Number.isFinite(Epoch(Row.effectiveFrom)) ? Epoch(Row.effectiveFrom) : 0,
			);
		}
	};

	const Resolve = (
		Provider: string,
		Model: string,
		At: number,
		Mode: string = "standard",
		Region: string | null = null,
		Window: string = "any",
	): Price => {
		const When = Number.isFinite(At) ? At : Date.now();
		let Found = Select.get(
			Provider,
			Model,
			When,
			Mode,
			Region,
			Window,
			Mode,
			Region,
			Window,
		) as
			| {
					Provider: string;
					Model: string;
					Currency: string;
					InputRate: number;
					OutputRate: number;
					CacheReadRate: number | null;
					CacheWriteRate: number | null;
					ReasoningRate: number | null;
					EffectiveFrom: number;
					TierFrom: number;
					TierTo: number | null;
					Mode: string;
					Region: string | null;
			  }
			| undefined;
		if (Found === undefined) {
			Seed(Provider, Model);
			Found = Select.get(
				Provider,
				Model,
				When,
				Mode,
				Region,
				Window,
				Mode,
				Region,
				Window,
			) as typeof Found;
		}
		if (Found !== undefined) {
			return {
				Provider: Found.Provider,
				Model: Found.Model,
				Currency: Found.Currency,
				InputRate: Found.InputRate,
				OutputRate: Found.OutputRate,
				CacheReadRate: Found.CacheReadRate,
				CacheWriteRate: Found.CacheWriteRate,
				ReasoningRate: Found.ReasoningRate,
				EffectiveFrom: Found.EffectiveFrom,
				TierFrom: Found.TierFrom,
				TierTo: Found.TierTo,
				Mode: Found.Mode,
				Region: Found.Region,
			};
		}
		// An unpriced model or mode costs zero: the ledger keeps the call (its
		// usage, its surface, its touches) and prices every bucket at zero.
		return {
			Provider,
			Model,
			Currency: Config.currency,
			InputRate: 0,
			OutputRate: 0,
			CacheReadRate: null,
			CacheWriteRate: null,
			ReasoningRate: null,
			EffectiveFrom: 0,
			TierFrom: 0,
			TierTo: null,
			Mode,
			Region,
		};
	};

	const Cost = (Record: Usage, Rate: Price, Modifiers?: readonly Rule[]): Costed => {
		// The rate card's tier rows: every row of the resolved row's own
		// effective-dated family, ascending TierFrom. A card without tiers is
		// the resolved row itself as one open tier - the flat arithmetic the
		// earlier build used.
		const Family = Tiers.all(
			Rate.Provider,
			Rate.Model,
			Rate.EffectiveFrom,
			Rate.Mode ?? null,
			Rate.Region ?? null,
		) as {
			TierFrom: number;
			TierTo: number | null;
			InputRate: number;
			OutputRate: number;
			CacheReadRate: number | null;
			CacheWriteRate: number | null;
		}[];
		const Ladder: readonly TierRow[] =
			Family.length > 0
				? Family
				: [
						{
							TierFrom: 0,
							TierTo: null,
							InputRate: Rate.InputRate,
							OutputRate: Rate.OutputRate,
							CacheReadRate: Rate.CacheReadRate,
							CacheWriteRate: Rate.CacheWriteRate,
						},
					];
		const Factor = Product(
			Modifiers ?? Rules,
			Record.Provider,
			Record.Mode ?? "standard",
			Record.Model,
			Record.At,
		);
		const Input = Walk(Record.InputTokens, Ladder, (Row) => Row.InputRate) * Factor;
		const Output = Walk(Record.OutputTokens, Ladder, (Row) => Row.OutputRate) * Factor;
		const CacheRead =
			Walk(Record.CacheReadTokens ?? 0, Ladder, (Row) => Row.CacheReadRate ?? 0) * Factor;
		const CacheWrite =
			Walk(Record.CacheWriteTokens ?? 0, Ladder, (Row) => Row.CacheWriteRate ?? 0) * Factor;
		// The reasoning bucket carries no tier column of its own; it prices
		// flat against the row's ReasoningRate at the same modifier product.
		const Reasoning =
			((Record.ReasoningTokens ?? 0) / 1e6) * (Rate.ReasoningRate ?? 0) * Factor;
		return {
			Input,
			Output,
			CacheRead,
			CacheWrite,
			Reasoning,
			Total: Input + Output + CacheRead + CacheWrite + Reasoning,
			Currency: Rate.Currency,
		};
	};

	const Applied = (Provider: string, Kind: string, Model: string, At: number): number =>
		Product(Rules, Provider, Kind, Model, Number.isFinite(At) ? At : Date.now());

	return { Resolve, Cost, Applied };
};
