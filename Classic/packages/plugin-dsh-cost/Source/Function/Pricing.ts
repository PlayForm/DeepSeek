// Pricing - the versioned pricing-catalog service over the ledger's v5
// valuation tables (Temporary/Cost-Research/Plan.md lane B4c; the research's
// sections 3, 5, 6 and 7): the reads a settings view lists - catalogs, the
// revisions of one catalog, the rate rows of one revision - the one write
// that publishes a revision, and the preview that re-prices one session's
// recorded usage under a selected revision.
//
// THE READS are plain SELECTs. `catalogs` answers every catalog in creation
// order; `revisions` answers one catalog's revisions newest first, the order
// a history reads; `rates` answers one revision's rate rows in card order -
// provider, model, mode, region, window, then the effective date ascending,
// then the tier floor - so a rate-card table reads as the book it is. The
// Revision row is immutable: a correction is a new revision whose
// ParentRevisionId names the one it corrects, and its rate rows keep the
// original ValidFrom.
//
// THE ONE WRITE is `publish`, and it is one transaction: the Revision row is
// inserted already 'published' with ParentRevisionId = BaseRevisionId and the
// caller's reason, every supplied RateRow is inserted against the new
// revision id, and the COMMIT is what makes the revision visible. A failure
// anywhere - a duplicate rate, a broken foreign key, an unbound value - rolls
// the whole thing back, so a failed publish leaves no revision and never a
// half-written book. The transaction IS the draft state, which is why no row
// is ever visible with Status 'draft'.
//
// THE BASE-REVISION GUARD is the concurrency contract (the research's answer
// 4, "Backend boundary": save against a base revision, and when someone else
// has published a newer revision, return a conflict instead of silently
// overwriting their changes). The catalog's head is its newest published
// Revision by RevisionId - the insert order is the publish order, and this
// service never writes a draft - so a base that is not the head means someone
// else published first. The head is read INSIDE the publish transaction,
// after BEGIN IMMEDIATE takes the write lock, so two publishes against the
// same base cannot both pass the check. A null base is the first publish, and
// it is legal only while the catalog is empty; on a catalog that already
// carries a revision it is the same conflict. The refusal is an Error whose
// message starts "plugin-dsh-cost: pricing conflict - " and names the base
// and the head, so the caller can tell it from a validation failure while the
// interface shape stays as it is and every validation line stays unchanged.
//
// The caller's RateRow.RateRowId and RevisionId are placeholders: the ledger
// assigns both, and the returned Revision carries the new RevisionId.
// Nothing observed is touched - Price, Call, Allocation, Touch and every
// other recorded fact stay as captured (research section 3: observed facts
// are stored once; a pricing catalog is an assumption, and only Revision and
// RateRow receive rows).
//
// THE PREVIEW is the revaluation the research asks for before a publish
// (section 7: "Preview first; publish a catalog revision second"). It reads
// the session's calls - provider, model, mode, region, the recorded tier, the
// token buckets, the instant and the recorded money - resolves a rate row of
// the selected revision for each call with the capture path's own rules, and
// prices the same recorded usage again. Nothing is persisted: the preview
// computes, and the ledger is read-only for it.
//
// THE RESOLUTION RULES are the capture path's (Function/Price.ts and the
// drain's call site), restated here because that engine is bound to the Price
// table and its configured modifiers while a revision lives in RateRow: the
// effective interval is half-open (ValidFrom <= at < ValidTo, a NULL ValidTo
// staying open), an exact Mode, Region or Window match beats a NULL or 'any'
// generic row, the greatest ValidFrom wins among equals, and a conditional
// row never resolves as the card. The call's time-of-day window is not
// recorded on the Call row, so it is re-derived from the call's own instant
// through the configured price windows - the drain's rule at capture time -
// and a config whose windows changed since then can select a different window
// card: that is the one dimension the call row does not preserve.
//
// THE ARITHMETIC is the same two primitives: the marginal tier walk over the
// resolved card's family (each bucket priced per portion at its own tier's
// rate, the reasoning bucket flat at the resolved row's reasoning rate) and
// the conditional card (a row whose Note is "condition:at-or-below" or
// "condition:above", selected by the request's prompt size and priced flat).
// The family is the same provider, model, valid-from, mode, region and
// window, so one window's bands are never read into another's walk. The
// factor layer's modifiers are NOT applied: a revision's rate rows are the
// whole book it declares, and the v5 catalog carries no modifier column.
//
// THE MONEY: one currency per row, six-decimal rounding at the aggregate, and
// a missing rate stays unpriced. The preview totals one currency - the
// session's first recorded call's currency, else the configured one - and a
// call recorded in, or re-priced into, another currency counts as unpriced
// rather than being added across unlike units; this service converts nothing.
// Both totals cover the same calls (the ones the revision prices in that
// currency), so `difference` compares like with like.
import type { DatabaseSync, SQLOutputValue } from "node:sqlite";

import type Catalog from "@Interface/Catalog.js";
import type Config from "@Interface/Config.js";
import type PricingService from "@Interface/PricingService.js";
import type { PricingPreview } from "@Interface/PricingService.js";
import type RateRow from "@Interface/RateRow.js";
import type Revision from "@Interface/Revision.js";

// One rate row as the engine reads it: the resolved row and every row of its
// family share this shape, so one mapper serves the resolution and the walk.
type Rate = {
	readonly Provider: string;
	readonly Model: string;
	readonly Currency: string;
	readonly InputRate: number;
	readonly OutputRate: number;
	readonly CacheReadRate: number | null;
	readonly CacheWriteRate: number | null;
	readonly ReasoningRate: number | null;
	readonly ValidFrom: number;
	readonly TierFrom: number;
	readonly TierTo: number | null;
	readonly Mode: string;
	readonly Region: string | null;
	readonly Window: string;
	readonly Note: string | null;
};

// One recorded call as the preview reads it: the pricing dimensions the
// capture path resolved (mode, region and the tier it chose), the provider's
// own buckets, the instant and the money the ledger stored. The recorded Tier
// is evidence of the capture-time band, never an input: the walk re-derives
// the band from the buckets, which is exactly what a rate change can move.
type CallRow = {
	readonly Provider: string;
	readonly Model: string;
	readonly Mode: string;
	readonly Region: string | null;
	readonly Tier: number | null;
	readonly InputTokens: number;
	readonly OutputTokens: number;
	readonly CacheReadTokens: number;
	readonly CacheWriteTokens: number;
	readonly ReasoningTokens: number;
	readonly At: number;
	readonly CostTotal: number;
	readonly Currency: string;
};

// The conditional markers a card row's Note carries (research section 2.3):
// the row prices a request only when its total prompt size is at or below, or
// above, the row's own TierFrom threshold. Every other Note is an ordinary
// annotation.
const AtOrBelow = "condition:at-or-below";
const Above = "condition:above";
const Marker = "condition:";

type Conditional = "at-or-below" | "above" | "invalid" | null;

// One configured window's coverage: a half-open span of UTC hours that starts
// at the window's first hour and runs for its length - so an end past 24 (or
// an end before the start) wraps into the next day - and covers nothing when
// the two hours are equal. This is the drain's own rule, restated because the
// Call row records no window column and the preview must re-derive the window
// from the call's instant.
const Covered = (Hour: number, Start: number, End: number): boolean => {
	const From = ((Start % 24) + 24) % 24;
	const Span = End - Start <= 0 ? End - Start + 24 : End - Start;
	switch (true) {
		case Start === End:
			return false;
		case Span >= 24:
			return true;
		default: {
			const Into = (((Hour - From) % 24) + 24) % 24;
			return Into < Span;
		}
	}
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
const Covers = (Row: Rate, Prompt: number): boolean => {
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
const Chosen = (Family: readonly Rate[], Prompt: number): Rate | undefined => {
	let Found: Rate | undefined;
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

// One bucket's marginal tier walk: the tokens inside each tier's window,
// priced at that tier's rate and summed. A tier with a NULL TierTo is the
// open top tier and takes everything above its floor; the walk never prices a
// token twice, because the windows tile the axis.
const Walk = (
	Tokens: number,
	Tiers: readonly Rate[],
	Rate: (Row: Rate) => number | null,
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

// The money rounding every aggregate lands on: six decimals, the ledger's
// precision, so two reads of the same sum agree.
const Money = (Value: number): number => Math.round(Value * 1e6) / 1e6;

// The read-only column helpers: the same narrowing the session reader uses, so
// a NULL column stays null and a stored number never becomes a guess.
const Text = (Row: Record<string, SQLOutputValue>, Key: string): string | null => {
	const Value = Row[Key];
	return typeof Value === "string" ? Value : null;
};

const Figure = (Row: Record<string, SQLOutputValue>, Key: string): number | null => {
	const Value = Row[Key];
	return typeof Value === "number" && Number.isFinite(Value) ? Value : null;
};

const Stored = (Row: Record<string, SQLOutputValue>, Key: string): number => Figure(Row, Key) ?? 0;

const CatalogOf = (Row: Record<string, SQLOutputValue>): Catalog => ({
	CatalogId: Stored(Row, "CatalogId"),
	Name: Text(Row, "Name") ?? "",
});

// One revision as the contract reads it: Status is narrowed fail-closed -
// anything but the literal 'published' reads as a draft, because only a
// published revision may be pinned by a valuation.
const RevisionOf = (Row: Record<string, SQLOutputValue>): Revision => ({
	RevisionId: Stored(Row, "RevisionId"),
	CatalogId: Stored(Row, "CatalogId"),
	ParentRevisionId: Figure(Row, "ParentRevisionId"),
	CreatedAt: Stored(Row, "CreatedAt"),
	Reason: Text(Row, "Reason") ?? "",
	Status: Text(Row, "Status") === "published" ? "published" : "draft",
});

const RateRowOf = (Row: Record<string, SQLOutputValue>): RateRow => ({
	RateRowId: Stored(Row, "RateRowId"),
	RevisionId: Stored(Row, "RevisionId"),
	Provider: Text(Row, "Provider") ?? "",
	Model: Text(Row, "Model") ?? "",
	Currency: Text(Row, "Currency") ?? "",
	InputRate: Stored(Row, "InputRate"),
	OutputRate: Stored(Row, "OutputRate"),
	CacheReadRate: Figure(Row, "CacheReadRate"),
	CacheWriteRate: Figure(Row, "CacheWriteRate"),
	ReasoningRate: Figure(Row, "ReasoningRate"),
	ValidFrom: Stored(Row, "ValidFrom"),
	ValidTo: Figure(Row, "ValidTo"),
	Mode: Text(Row, "Mode") ?? "standard",
	Region: Text(Row, "Region"),
	Window: Text(Row, "Window") ?? "any",
	TierFrom: Stored(Row, "TierFrom"),
	TierTo: Figure(Row, "TierTo"),
	Note: Text(Row, "Note"),
});

const RateOf = (Row: Record<string, SQLOutputValue>): Rate => ({
	Provider: Text(Row, "Provider") ?? "",
	Model: Text(Row, "Model") ?? "",
	Currency: Text(Row, "Currency") ?? "",
	InputRate: Stored(Row, "InputRate"),
	OutputRate: Stored(Row, "OutputRate"),
	CacheReadRate: Figure(Row, "CacheReadRate"),
	CacheWriteRate: Figure(Row, "CacheWriteRate"),
	ReasoningRate: Figure(Row, "ReasoningRate"),
	ValidFrom: Stored(Row, "ValidFrom"),
	TierFrom: Stored(Row, "TierFrom"),
	TierTo: Figure(Row, "TierTo"),
	Mode: Text(Row, "Mode") ?? "standard",
	Region: Text(Row, "Region"),
	Window: Text(Row, "Window") ?? "any",
	Note: Text(Row, "Note"),
});

const CallOf = (Row: Record<string, SQLOutputValue>): CallRow => ({
	Provider: Text(Row, "Provider") ?? "unknown",
	Model: Text(Row, "Model") ?? "unknown",
	Mode: Text(Row, "Mode") ?? "standard",
	Region: Text(Row, "Region"),
	Tier: Figure(Row, "Tier"),
	InputTokens: Stored(Row, "InputTokens"),
	OutputTokens: Stored(Row, "OutputTokens"),
	CacheReadTokens: Stored(Row, "CacheReadTokens"),
	CacheWriteTokens: Stored(Row, "CacheWriteTokens"),
	ReasoningTokens: Stored(Row, "ReasoningTokens"),
	At: Stored(Row, "At"),
	CostTotal: Stored(Row, "CostTotal"),
	Currency: Text(Row, "Currency") ?? "",
});

// The twelve statements the service runs: the four reads, the resolution and
// its family (both against RateRow, the revision's own table), the three
// integrity checks `publish` and `preview` make, the head read that
// `publish`'s transaction makes, and the two inserts it holds. The resolution
// statement mirrors the capture path's Price.Select with ValidFrom in place
// of EffectiveFrom - the half-open interval, the exact-or-generic mode,
// region and window, the conditional rows excluded, the floor row of the
// winning card - and the family statement binds the same provider, model,
// valid-from, mode, region and window, so a windowed card's bands are read
// inside that window only. The head statement is one catalog's newest
// published revision, the row a publish must name as its base.
const Query = {
	Catalogs: `SELECT CatalogId, Name FROM Catalog ORDER BY CatalogId ASC;`,

	Revisions: `SELECT RevisionId, CatalogId, ParentRevisionId, CreatedAt, Reason, Status
FROM Revision
WHERE CatalogId = ?
ORDER BY RevisionId DESC;`,

	Rates: `SELECT RateRowId, RevisionId, Provider, Model, Currency, InputRate, OutputRate,
    CacheReadRate, CacheWriteRate, ReasoningRate, ValidFrom, ValidTo, Mode, Region, Window,
    TierFrom, TierTo, Note
FROM RateRow
WHERE RevisionId = ?
ORDER BY Provider ASC, Model ASC, Mode ASC, Region ASC, Window ASC, ValidFrom ASC, TierFrom ASC;`,

	Calls: `SELECT Provider, Model, Mode, Region, Tier, InputTokens, OutputTokens,
    CacheReadTokens, CacheWriteTokens, ReasoningTokens, At, CostTotal, Currency
FROM Call
WHERE SessionId = ?
ORDER BY Turn ASC, Step ASC, Seq ASC;`,

	Resolve: `SELECT Provider, Model, Currency, InputRate, OutputRate, CacheReadRate, CacheWriteRate,
    ReasoningRate, ValidFrom, TierFrom, TierTo, Mode, Region, Window, Note
FROM RateRow
WHERE RevisionId = ? AND Provider = ? AND Model = ? AND ValidFrom <= ?
    AND (ValidTo IS NULL OR ? < ValidTo)
    AND (Mode = ? OR Mode IS NULL) AND (Region = ? OR Region IS NULL)
    AND (Window = ? OR Window = 'any')
    AND (Note IS NULL OR substr(Note, 1, 10) <> 'condition:')
ORDER BY (Mode = ?) DESC, COALESCE(Region = ?, 0) DESC, (Window = ?) DESC, ValidFrom DESC,
    TierFrom ASC
LIMIT 1;`,

	Family: `SELECT Provider, Model, Currency, InputRate, OutputRate, CacheReadRate, CacheWriteRate,
    ReasoningRate, ValidFrom, TierFrom, TierTo, Mode, Region, Window, Note
FROM RateRow
WHERE RevisionId = ? AND Provider = ? AND Model = ? AND ValidFrom = ? AND Mode IS ?
    AND Region IS ? AND Window IS ?
ORDER BY TierFrom ASC;`,

	Catalog: `SELECT CatalogId FROM Catalog WHERE CatalogId = ?;`,

	Revision: `SELECT CatalogId FROM Revision WHERE RevisionId = ?;`,

	Present: `SELECT RevisionId FROM Revision WHERE RevisionId = ?;`,

	Head: `SELECT RevisionId FROM Revision
WHERE CatalogId = ? AND Status = 'published'
ORDER BY RevisionId DESC
LIMIT 1;`,

	InsertRevision: `INSERT INTO Revision (CatalogId, ParentRevisionId, CreatedAt, Reason, Status)
VALUES (?, ?, ?, ?, 'published');`,

	InsertRate: `INSERT INTO RateRow (RevisionId, Provider, Model, Currency, InputRate, OutputRate,
    CacheReadRate, CacheWriteRate, ReasoningRate, ValidFrom, ValidTo, Mode, Region, Window,
    TierFrom, TierTo, Note)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
} as const;

export default (Database: DatabaseSync, Config: Config): PricingService => {
	const SelectCatalogs = Database.prepare(Query.Catalogs);
	const SelectRevisions = Database.prepare(Query.Revisions);
	const SelectRates = Database.prepare(Query.Rates);
	const SelectCalls = Database.prepare(Query.Calls);
	const SelectRate = Database.prepare(Query.Resolve);
	const SelectFamily = Database.prepare(Query.Family);
	const SelectCatalog = Database.prepare(Query.Catalog);
	const SelectRevision = Database.prepare(Query.Revision);
	const SelectPresent = Database.prepare(Query.Present);
	const SelectHead = Database.prepare(Query.Head);
	const InsertRevision = Database.prepare(Query.InsertRevision);
	const InsertRate = Database.prepare(Query.InsertRate);

	// The call's own time-of-day window: the configured window whose UTC hours
	// cover the call's instant, else "any" - the generic row every book falls
	// back to when no window matches. The drain's own rule, because the Call
	// row records Mode, Region and Tier but no window.
	const WindowOf = (At: number): string => {
		const Hour = new Date(At).getUTCHours();
		for (const Window of Config.priceWindows) {
			const Start = Math.round(Window.startUtcHour);
			const End = Math.round(Window.endUtcHour);
			if (Covered(Hour, Start, End)) {
				return Window.label;
			}
		}
		return "any";
	};

	// The rate row of this revision in force at the call's own instant: the
	// half-open interval, the exact-or-generic mode and region, the call's
	// window or the generic "any" row, and the conditional rows excluded
	// because they select a card from the request rather than being the card.
	// Undefined means the revision carries no rate for this call - the call is
	// unpriced, never free.
	const Resolve = (RevisionId: number, Call: CallRow): Rate | undefined => {
		// A non-finite instant resolves nothing rather than today's row: the
		// fail-closed reading, because a corrupt timestamp must never turn an
		// unpriced call into a priced one.
		const When = Number.isFinite(Call.At) ? Call.At : 0;
		const Window = WindowOf(When);
		const Found = SelectRate.get(
			RevisionId,
			Call.Provider,
			Call.Model,
			When,
			When,
			Call.Mode,
			Call.Region,
			Window,
			Call.Mode,
			Call.Region,
			Window,
		);
		return Found === undefined ? undefined : RateOf(Found);
	};

	// One call priced under one revision: the same two primitives the capture
	// path applies - the conditional card selected by the request's prompt
	// size, else the marginal tier walk over the resolved card's family. The
	// factor layer's modifiers are not applied: a revision's rate rows are the
	// whole book it declares.
	const Cost = (RevisionId: number, Call: CallRow, Rate: Rate): number => {
		const Family = SelectFamily.all(
			RevisionId,
			Rate.Provider,
			Rate.Model,
			Rate.ValidFrom,
			Rate.Mode,
			Rate.Region,
			Rate.Window,
		).map(RateOf);
		// A conditional row is not a band of the marginal walk: the two
		// readings are separated first, and a card without marginal tiers is
		// the resolved row itself as one open tier - the flat arithmetic.
		const Marginal = Family.filter((Row) => Condition(Row.Note) === null);
		const Ladder: readonly Rate[] =
			Marginal.length > 0 ? Marginal : [{ ...Rate, TierFrom: 0, TierTo: null, Note: null }];
		// The request's total prompt size, the figure a conditional card
		// selects on: the uncached input plus both cache buckets.
		const Prompt = Call.InputTokens + Call.CacheReadTokens + Call.CacheWriteTokens;
		const Card = Chosen(Family, Prompt);
		if (Card !== undefined) {
			return (
				Flat(Call.InputTokens, Card.InputRate) +
				Flat(Call.OutputTokens, Card.OutputRate) +
				Flat(Call.CacheReadTokens, Card.CacheReadRate) +
				Flat(Call.CacheWriteTokens, Card.CacheWriteRate) +
				Flat(Call.ReasoningTokens, Card.ReasoningRate)
			);
		}
		const Input = Walk(Call.InputTokens, Ladder, (Row) => Row.InputRate);
		const Output = Walk(Call.OutputTokens, Ladder, (Row) => Row.OutputRate);
		const CacheRead = Walk(Call.CacheReadTokens, Ladder, (Row) => Row.CacheReadRate ?? 0);
		const CacheWrite = Walk(Call.CacheWriteTokens, Ladder, (Row) => Row.CacheWriteRate ?? 0);
		// The reasoning bucket carries no tier column of its own; it prices
		// flat against the resolved row's ReasoningRate.
		const Reasoning = (Call.ReasoningTokens / 1e6) * (Rate.ReasoningRate ?? 0);
		return Input + Output + CacheRead + CacheWrite + Reasoning;
	};

	// The one write: validate what a revision must carry, then insert the
	// revision and its rate rows inside ONE transaction. The validation guards
	// run before the transaction opens, so a rejected publish never starts
	// one; the base-revision guard is the one check that must run inside it,
	// because the head it reads is current only under the write lock. A
	// failure inside the transaction rolls back whole, so a failed publish
	// leaves no revision behind, and a refused publish leaves the head the
	// caller did not name exactly where it was.
	const Publish = (
		CatalogId: number,
		BaseRevisionId: number | null,
		Reason: string,
		Rows: readonly RateRow[],
	): Revision => {
		const Stated = Reason.trim();
		switch (true) {
			case Stated.length === 0:
				throw new Error(
					"plugin-dsh-cost: a published revision needs a reason - say what changed and why",
				);
			case Rows.length === 0:
				throw new Error(
					"plugin-dsh-cost: a published revision needs at least one rate row - an empty book prices nothing",
				);
			case SelectCatalog.get(CatalogId) === undefined:
				throw new Error(
					`plugin-dsh-cost: catalog ${CatalogId} is not in the ledger - publish into a catalog the ledger carries`,
				);
			default:
		}
		if (BaseRevisionId !== null) {
			const Parent = SelectRevision.get(BaseRevisionId);
			switch (true) {
				case Parent === undefined:
					throw new Error(
						`plugin-dsh-cost: base revision ${BaseRevisionId} is not in the ledger`,
					);
				case Parent !== undefined && Stored(Parent, "CatalogId") !== CatalogId:
					throw new Error(
						`plugin-dsh-cost: base revision ${BaseRevisionId} belongs to another catalog - a revision corrects its own catalog`,
					);
				default:
			}
		}
		for (const Row of Rows) {
			switch (true) {
				case Row.Currency.length === 0:
					throw new Error(
						`plugin-dsh-cost: the rate row for ${Row.Provider}/${Row.Model} carries no currency - one currency per row`,
					);
				case !Number.isFinite(Row.ValidFrom):
					throw new Error(
						`plugin-dsh-cost: the rate row for ${Row.Provider}/${Row.Model} carries no valid-from instant`,
					);
				default:
			}
		}
		// CreatedAt is the second date: the instant the system accepted these
		// rates, as opposed to ValidFrom, when they apply to usage.
		const CreatedAt = Date.now();
		// BEGIN IMMEDIATE, not a deferred BEGIN: the write lock is taken
		// before the head is read, so no other publish can commit between the
		// check and the insert this transaction holds.
		Database.exec("BEGIN IMMEDIATE");
		try {
			// The head: the catalog's newest published revision, read here
			// because this is the one reading no concurrent publish can slip
			// past. A base that is not the head means someone else published
			// first; a null base on a catalog that already carries a revision
			// is the same conflict, because null is the first publish of an
			// empty catalog and nothing else.
			const Head = SelectHead.get(CatalogId);
			const HeadRevisionId = Head === undefined ? null : Stored(Head, "RevisionId");
			switch (true) {
				case HeadRevisionId === BaseRevisionId:
					break;
				case BaseRevisionId === null:
					throw new Error(
						`plugin-dsh-cost: pricing conflict - catalog ${CatalogId} already carries ` +
							`revision ${HeadRevisionId} and this publish names no base revision - ` +
							`name revision ${HeadRevisionId} as the base, because null is the ` +
							`first publish of an empty catalog`,
					);
				case HeadRevisionId === null:
					throw new Error(
						`plugin-dsh-cost: pricing conflict - catalog ${CatalogId} carries no ` +
							`published revision, so base revision ${BaseRevisionId} is not its ` +
							`head - publish against a published revision of this catalog`,
					);
				default:
					throw new Error(
						`plugin-dsh-cost: pricing conflict - catalog ${CatalogId} is at ` +
							`revision ${HeadRevisionId}, not the base revision ${BaseRevisionId} - ` +
							`reload the catalog and publish against revision ${HeadRevisionId}`,
					);
			}
			const Inserted = InsertRevision.run(CatalogId, BaseRevisionId, CreatedAt, Stated);
			const RevisionId = Number(Inserted.lastInsertRowid);
			for (const Row of Rows) {
				InsertRate.run(
					RevisionId,
					Row.Provider,
					Row.Model,
					Row.Currency,
					Row.InputRate,
					Row.OutputRate,
					Row.CacheReadRate,
					Row.CacheWriteRate,
					Row.ReasoningRate,
					Row.ValidFrom,
					Row.ValidTo,
					Row.Mode,
					Row.Region,
					Row.Window,
					Row.TierFrom,
					Row.TierTo,
					Row.Note,
				);
			}
			Database.exec("COMMIT");
			return {
				RevisionId,
				CatalogId,
				ParentRevisionId: BaseRevisionId,
				CreatedAt,
				Reason: Stated,
				Status: "published",
			};
		} catch (Failure) {
			Database.exec("ROLLBACK");
			throw Failure;
		}
	};

	// The revaluation: the session's calls read once, each resolved and priced
	// under the selected revision, and the two totals kept over the same call
	// set - the calls the revision prices in the preview's currency. A draft
	// is previewable by definition; a revision the ledger does not carry is
	// one actionable line, never a silent all-unpriced answer.
	const Preview = (RevisionId: number, SessionId: string): PricingPreview => {
		switch (true) {
			case SelectPresent.get(RevisionId) === undefined:
				throw new Error(
					`plugin-dsh-cost: revision ${RevisionId} is not in the ledger - preview a revision the catalog carries`,
				);
			default:
		}
		const Calls = SelectCalls.all(SessionId).map(CallOf);
		const First = Calls[0];
		// One currency per preview: the session's first recorded call names it,
		// and an empty session falls back to the configured currency.
		const Currency =
			First !== undefined && First.Currency.length > 0 ? First.Currency : Config.currency;
		let Priced = 0;
		let Unpriced = 0;
		let Current = 0;
		let Revised = 0;
		for (const Call of Calls) {
			const Rate = Resolve(RevisionId, Call);
			if (Rate === undefined) {
				Unpriced++;
				continue;
			}
			// Unlike units are never added: a call the revision cannot express
			// in the preview's currency is unpriced here, on both sides.
			if (Call.Currency !== Currency || Rate.Currency !== Currency) {
				Unpriced++;
				continue;
			}
			Priced++;
			Current += Call.CostTotal;
			Revised += Cost(RevisionId, Call, Rate);
		}
		const Recorded = Money(Current);
		const Repriced = Money(Revised);
		return {
			sessionId: SessionId,
			calls: Calls.length,
			priced: Priced,
			unpriced: Unpriced,
			current: Recorded,
			revised: Repriced,
			difference: Money(Repriced - Recorded),
			currency: Currency,
		};
	};

	return {
		catalogs: (): readonly Catalog[] => SelectCatalogs.all().map(CatalogOf),
		revisions: (CatalogId: number): readonly Revision[] =>
			SelectRevisions.all(CatalogId).map(RevisionOf),
		rates: (RevisionId: number): readonly RateRow[] =>
			SelectRates.all(RevisionId).map(RateRowOf),
		publish: Publish,
		preview: Preview,
	};
};
