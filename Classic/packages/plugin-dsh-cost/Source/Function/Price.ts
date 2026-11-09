// Price - the rate resolution and the cost arithmetic
// (Documentation/Plans/COST-TRACK-PLUGIN.md sections 2, 6, 17.1 and 17.2): a
// call is priced at the most specific ledger price row in force at the
// call's own time - the row's effective interval is half-open
// (EffectiveFrom <= at < EffectiveTo, a NULL EffectiveTo staying open
// forever), an exact Mode, Region or Window match wins over a NULL or 'any'
// generic row (so a call in an exact region falls back to the generic row
// when its region has no row of its own), and the greatest EffectiveFrom wins
// among equals. A call whose card the book does not carry is UNPRICED: the
// resolution answers no row identity (PriceId null) and zero rates, the call
// row keeps PriceId NULL, and its zero money means no rate exists - never
// that the rate is zero (research section 2.2: a missing rate is unpriced, a
// known free rate is an explicit zero row). The configured price book is the
// fallback, seeded into the ledger's Price table on first use (Source
// "config", append-only), and a configured row whose effective date does not
// parse is skipped rather than stamped at the epoch - a row at EffectiveFrom
// 0 would be the row that turns an unpriced call into a priced one.
//
// The arithmetic is the marginal tier walk (section 17.2): for each tier row
// of the resolved row's rate card in ascending TierFrom, the tokens inside
// that tier's window are priced at that tier's rate and summed - per bucket,
// each against its own rate column, because a cached prefix that crosses a
// threshold is priced per portion rather than per call. A tier row belongs to
// the card of its own Window, Mode and Region, so the family lookup binds the
// resolved Window beside the effective date, the mode and the region, and the
// walk never mixes two windows' bands. After the tier sum, the total and
// every bucket are multiplied by the product of the applicable modifiers'
// multipliers (section 17.2): a modifier applies when its Provider matches,
// its Model is NULL or equals the model, its Kind matches the call's pricing
// mode, and the call's time is inside its effective window - and a
// model-specific modifier beats a provider-wide one of the same Kind.
//
// Two primitives share the arithmetic (research section 2.3, "tiered pricing
// is not one universal calculation"): the MARGINAL bands above, for a
// provider that prices successive portions at different rates, and the
// CONDITIONAL card, for a provider that selects a card from the request's
// total prompt size. A conditional card is a rate row of the same family
// whose Note is "condition:at-or-below" or "condition:above": it applies only
// when the prompt (the uncached input plus both cache buckets) is at or
// below, or above, the row's own TierFrom threshold, and it prices every
// bucket flat at its own rates instead of joining the walk - selected before
// the walk, so a conditional row is never read as a marginal band. A
// "condition:" marker this build does not know prices nothing at all: the row
// leaves the ladder and matches no request, so a typo cannot silently become
// a band. The conditional card fits the existing columns (TierFrom is the
// threshold, Note the marker) because the unique key still excludes Note,
// which is why a conditional threshold may not collide with a marginal tier
// floor of the same family - widening that key to carry Mode, Region, Window
// and a rule discriminator is a schema migration (P5), so it is named here
// and not taken.
//
// An absent bucket (null tokens or a null rate) costs zero. The input side is
// the UNCACHED remainder plus the cache buckets, never the whole input.
import type { DatabaseSync } from "node:sqlite";

import type Config from "../Interface/Config.js";
import type Price from "../Interface/Price.js";
import type Rule from "../Interface/Rule.js";
import type Usage from "../Interface/Usage.js";

// One tier row of a rate card: the window the tier covers, the rates every
// bucket prices at inside it (a null rate is an unpriced bucket) and the Note
// that marks a conditional card.
type TierRow = {
	readonly TierFrom: number;
	readonly TierTo: number | null;
	readonly InputRate: number;
	readonly OutputRate: number;
	readonly CacheReadRate: number | null;
	readonly CacheWriteRate: number | null;
	readonly ReasoningRate: number | null;
	readonly Note: string | null;
};

// The conditional markers a card row's Note carries (research section 2.3):
// the row prices a request only when its total prompt size is at or below, or
// above, the row's own TierFrom threshold. Every other Note is an ordinary
// annotation.
const AtOrBelow = "condition:at-or-below";
const Above = "condition:above";
const Marker = "condition:";

type Conditional = "at-or-below" | "above" | "invalid" | null;

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
// date is read as the start of its UTC day, an unparseable one is NaN.
const Epoch = (Stamp: string): number => {
	const Direct = Date.parse(Stamp);
	return Number.isFinite(Direct) ? Direct : Date.parse(`${Stamp}T00:00:00Z`);
};

// Which conditional bound a card row's Note declares: null for an ordinary
// rate row, "invalid" for a "condition:" marker this build does not know -
// the fail-closed reading, because an unrecognized conditional row must never
// be priced as a marginal band.
const Condition = (Note: string | null): Conditional => {
	switch (true) {
		case Note === null:
			return null;
		case Note === AtOrBelow:
			return "at-or-below";
		case Note === Above:
			return "above";
		case Note !== null && Note.startsWith(Marker):
			return "invalid";
		default:
			return null;
	}
};

// Whether a conditional row's bound covers a request of this prompt size: "at
// or below" includes the threshold and "above" excludes it, so the two
// readings tile the axis at the boundary rather than overlapping there.
const Covers = (Row: TierRow, Prompt: number): boolean => {
	switch (Condition(Row.Note)) {
		case "at-or-below":
			return Prompt <= Row.TierFrom;
		case "above":
			return Prompt > Row.TierFrom;
		default:
			return false;
	}
};

// The conditional card that prices this request: the matching row with the
// greatest threshold wins, and at an equal threshold the "above" row wins
// because it is the one that excludes the boundary.
const Chosen = (Family: readonly TierRow[], Prompt: number): TierRow | undefined => {
	let Found: TierRow | undefined;
	for (const Row of Family) {
		if (!Covers(Row, Prompt)) {
			continue;
		}
		if (Found === undefined) {
			Found = Row;
			continue;
		}
		if (Row.TierFrom > Found.TierFrom) {
			Found = Row;
			continue;
		}
		if (
			Row.TierFrom === Found.TierFrom &&
			Condition(Row.Note) === "above" &&
			Condition(Found.Note) !== "above"
		) {
			Found = Row;
		}
	}
	return Found;
};

// One bucket at a flat rate: the conditional card's arithmetic, which prices
// the whole request at one row's rates rather than through bands.
const Flat = (Tokens: number, Rate: number | null): number => (Tokens / 1e6) * (Rate ?? 0);

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
	// The rate row in force at the call's own time (section 6): the half-open
	// effective interval, the exact-or-generic mode, the exact-or-generic
	// region and the call's own window or the generic "any" window. The most
	// specific row wins, then the greatest EffectiveFrom, so a historical
	// invoice stays reproducible after a provider raises its rates; among a
	// card's own tier rows the floor row resolves, so the identity and the
	// floor rates a caller stores never depend on insertion order. A
	// conditional row is not a card: it never resolves here, because the card
	// it belongs to is what the call is priced against and the conditional
	// bound is selected from the request itself in Cost below.
	const Select = Database.prepare(
		"SELECT PriceId, Provider, Model, Currency, InputRate, OutputRate, CacheReadRate, CacheWriteRate, ReasoningRate, " +
			"EffectiveFrom, TierFrom, TierTo, Mode, Region, Window " +
			"FROM Price WHERE Provider = ? AND Model = ? AND EffectiveFrom <= ? " +
			"AND (EffectiveTo IS NULL OR ? < EffectiveTo) " +
			"AND (Mode = ? OR Mode IS NULL) AND (Region = ? OR Region IS NULL) " +
			"AND (Window = ? OR Window = 'any') " +
			"AND (Note IS NULL OR substr(Note, 1, 10) <> 'condition:') " +
			"ORDER BY (Mode = ?) DESC, COALESCE(Region = ?, 0) DESC, (Window = ?) DESC, EffectiveFrom DESC, TierFrom ASC LIMIT 1",
	);

	// The rate card's rows: the resolved row's own family, which is the same
	// provider, model and effective date in the same mode, region AND window -
	// the window is part of the card's identity, so a peak card's bands are
	// never read into an off-peak walk or the other way round.
	const Tiers = Database.prepare(
		"SELECT TierFrom, TierTo, InputRate, OutputRate, CacheReadRate, CacheWriteRate, ReasoningRate, Note " +
			"FROM Price WHERE Provider = ? AND Model = ? AND EffectiveFrom = ? AND Mode IS ? AND Region IS ? " +
			"AND Window IS ? ORDER BY TierFrom ASC",
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
	// effective-dated table on first use. A row whose effective date does not
	// parse is skipped: stamping it at the epoch would leave a row in force
	// forever that prices calls the book never priced, which is exactly the
	// unpriced-as-free mistake this file prevents.
	const Seed = (Provider: string, Model: string): void => {
		for (const Row of Config.prices) {
			if (Row.provider !== Provider || Row.model !== Model) {
				continue;
			}
			const When = Epoch(Row.effectiveFrom);
			switch (true) {
				case !Number.isFinite(When):
					continue;
				default:
					Insert.run(
						Row.provider,
						Row.model,
						Row.currency.length > 0 ? Row.currency : Config.currency,
						Row.input,
						Row.output,
						Row.cacheRead ?? null,
						Row.cacheWrite ?? null,
						Row.reasoning ?? null,
						When,
					);
			}
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
			When,
			Mode,
			Region,
			Window,
			Mode,
			Region,
			Window,
		) as
			| {
					PriceId: number;
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
					Window: string;
			  }
			| undefined;
		if (Found === undefined) {
			Seed(Provider, Model);
			Found = Select.get(
				Provider,
				Model,
				When,
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
				PriceId: Found.PriceId,
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
				Window: Found.Window,
			};
		}
		// No row resolved: the call is UNPRICED. Its identity stays null and
		// its rates stay absent rather than becoming a zero card, so a caller
		// stores PriceId NULL and a reader labels the row unpriced instead of
		// free (research section 2.2). The usage, the surface and the touches
		// are still recorded - only the rate is missing.
		return {
			PriceId: null,
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
			Window,
		};
	};

	const Cost = (Record: Usage, Rate: Price, Modifiers?: readonly Rule[]): Costed => {
		// The rate card's rows, ascending TierFrom. The conditional rows are
		// separated out first: they select a card from the request, they are
		// not bands of the marginal walk. A card without marginal tiers is the
		// resolved row itself as one open tier - the flat arithmetic the
		// earlier build used.
		const Family = Tiers.all(
			Rate.Provider,
			Rate.Model,
			Rate.EffectiveFrom,
			Rate.Mode,
			Rate.Region,
			Rate.Window,
		) as TierRow[];
		const Marginal = Family.filter((Row) => Condition(Row.Note) === null);
		const Ladder: readonly TierRow[] =
			Marginal.length > 0
				? Marginal
				: [
						{
							TierFrom: 0,
							TierTo: null,
							InputRate: Rate.InputRate,
							OutputRate: Rate.OutputRate,
							CacheReadRate: Rate.CacheReadRate,
							CacheWriteRate: Rate.CacheWriteRate,
							ReasoningRate: Rate.ReasoningRate,
							Note: null,
						},
					];
		const Factor = Product(
			Modifiers ?? Rules,
			Record.Provider,
			Record.Mode ?? "standard",
			Record.Model,
			Record.At,
		);
		// The request's total prompt size, the figure a conditional card
		// selects on: the uncached input plus both cache buckets.
		const Prompt =
			Record.InputTokens + (Record.CacheReadTokens ?? 0) + (Record.CacheWriteTokens ?? 0);
		const Card = Chosen(Family, Prompt);
		if (Card !== undefined) {
			// The conditional card applies to the request as a whole: every
			// bucket prices flat at that card's own rates, and no band of the
			// marginal ladder is consulted.
			const Input = Flat(Record.InputTokens, Card.InputRate) * Factor;
			const Output = Flat(Record.OutputTokens, Card.OutputRate) * Factor;
			const CacheRead = Flat(Record.CacheReadTokens ?? 0, Card.CacheReadRate) * Factor;
			const CacheWrite = Flat(Record.CacheWriteTokens ?? 0, Card.CacheWriteRate) * Factor;
			const Reasoning = Flat(Record.ReasoningTokens ?? 0, Card.ReasoningRate) * Factor;
			return {
				Input,
				Output,
				CacheRead,
				CacheWrite,
				Reasoning,
				Total: Input + Output + CacheRead + CacheWrite + Reasoning,
				Currency: Rate.Currency,
			};
		}
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
