// PricingSettings - the Cost tab's Pricing view (Temporary/Cost-Research/
// Plan.md lane B4f; the research's A4 sections 1-3 and A6 section 6): the
// rate book of one published catalog revision, the local draft one Edit
// action opens, the impact preview that prices the selected session under the
// revision, and the one publish action that turns the draft into a new
// revision.
//
// THE READS: the catalogs route answers every catalog and revision the ledger
// carries, the rates route answers one revision's rate rows. Both are the
// host half's own GETs (Function/Fetch), and both resolve to an empty answer
// instead of throwing, so a ledger without a pricing surface renders a state
// rather than a crash.
//
// THE SELECTOR lists published revisions only: the engine can preview a draft
// revision, but a settings view pins what a valuation may select, and only a
// published revision may be pinned. The first read adopts the first catalog
// and its newest published revision; a read after a publish keeps the user's
// selection and only refreshes the options, because the publish selects the
// new revision itself.
//
// THE DRAFT is local state: Edit opens the row's five rate fields, its
// valid-from and valid-until instants and the revision's reason, and every
// keystroke writes React state alone. Nothing reaches the ledger until
// Publish, and a publish the engine refuses leaves the draft exactly as it
// was. The table itself always shows the selected revision's recorded rates,
// so a draft value is never mixed into the book it is being compared against.
//
// THE PUBLISH posts the whole edited row set with the base revision and the
// reason - the engine inserts one published revision and its rate rows in one
// transaction, and touches nothing observed - then refreshes the catalogs
// answer, selects the new revision, drops the draft and shows the new
// revision id, or the one actionable line of the refusal, inline.
//
// THE IMPACT PREVIEW is the research's before-you-save question: recorded
// total, revised total, difference and the unpriced count, read from the
// session route with the selected revision pinned. It is shown only for a
// published revision with no unpublished edit; while the draft differs from
// the book there is no published revision to price it, so the pane says
// "available after publish" instead of inventing a figure. The unpriced count
// is the session read's own count of calls the ledger could not price, and
// its tooltip says so.
//
// THE RATE UNIT: every rate is money per 1,000,000 tokens in the row's own
// currency, and a rate the book does not separately price is a dash with the
// "not separately priced" title - never a zero, because a missing rate is
// unpriced and a zero is a free bucket.
import Count from "@Function/Count";
import Fetch, {
	Catalogs,
	Rates as ReadRates,
	Publish as Submit,
	type CatalogAnswer,
	type PublishAnswer,
	type PublishRow,
} from "@Function/Fetch";
import Price from "@Function/Price";
import type CostResponse from "@Interface/Response";
import type { Valuation } from "@Interface/Response";
import type { Translate } from "@Interface/Translate";
import type { RateRow, Revision } from "@playform/plugin-dsh-cost/service";
import Dash from "@Variable/Dash";
import { createElement, Fragment, useCallback, useEffect, useState } from "react";

// The one column definition of the rate table: the shipped order, the widths
// that add up to the full table, and the columns the sheet left-aligns. The
// header, the colgroup and every body cell read this one list, so a column
// cannot drift from its width.
const Columns = [
	"provider",
	"model",
	"currency",
	"input",
	"output",
	"cacheRead",
	"cacheWrite",
	"reasoning",
	"validFrom",
	"validTo",
	"mode",
	"region",
	"window",
	"tierFrom",
	"tierTo",
	"edit",
] as const;

type Column = (typeof Columns)[number];

const Widths: Record<Column, number> = {
	provider: 10,
	model: 10,
	currency: 5,
	input: 6,
	output: 6,
	cacheRead: 6,
	cacheWrite: 6,
	reasoning: 6,
	validFrom: 7,
	validTo: 7,
	mode: 5,
	region: 5,
	window: 4,
	tierFrom: 5,
	tierTo: 5,
	edit: 7,
};

// Left - the text columns: the identity fields read as text, every rate and
// bound as a metric.
const Left: ReadonlySet<Column> = new Set<Column>([
	"provider",
	"model",
	"currency",
	"mode",
	"region",
	"window",
]);

// Titles - the header tooltips whose column the label alone does not explain:
// the rate unit, the half-open interval and the tiling tier bands. A column
// without an entry renders no title, which is why the record is the key set.
const Titles: Readonly<Record<string, string>> = {
	input: "pricing.column.input.title",
	output: "pricing.column.output.title",
	cacheRead: "pricing.column.cacheRead.title",
	cacheWrite: "pricing.column.cacheWrite.title",
	reasoning: "pricing.column.reasoning.title",
	validFrom: "pricing.column.validFrom.title",
	validTo: "pricing.column.validTo.title",
	tierFrom: "pricing.column.tierFrom.title",
	tierTo: "pricing.column.tierTo.title",
};

// Draft - one row's editable fields as the form holds them: text, because a
// half-typed number is not a number yet. The five rate fields, the two
// instants and the row's identity are the whole draft; the revision's reason
// rides beside it and is shared by every row.
type Draft = {
	readonly Input: string;
	readonly Output: string;
	readonly CacheRead: string;
	readonly CacheWrite: string;
	readonly Reasoning: string;
	readonly ValidFrom: string;
	readonly ValidTo: string;
};

// PublishOutcome - the publish answer as the bar renders it: the new
// revision's id, or the one line that says why nothing was published.
type PublishOutcome = {
	readonly Kind: "published" | "failed";
	readonly RevisionId: number | null;
	readonly Message: string | null;
};

// PreviewState - the impact preview's one state record, flat so the renderer
// reads a field rather than narrowing a union: the phase, the comparison
// block when one was read, the session's own unpriced count, its currency and
// the failure line.
type PreviewState = {
	readonly Phase: "idle" | "loading" | "ready" | "failed";
	readonly Block: Valuation | null;
	readonly Unpriced: number;
	readonly Currency: string;
	readonly Message: string | null;
};

// RatePhase - the rate read's three states.
type RatePhase = "idle" | "loading" | "failed";

// Answer - one numeric draft field: the value the row will publish and
// whether the text was usable. A required field falls back to the rate the
// revision already carries so the merged row stays well formed, and Ok is
// what the publish button reads.
type Answer = { readonly Value: number; readonly Ok: boolean };

// OptionalAnswer - one optional rate field: an empty text is a bucket the
// book does not separately price, which is a valid null, never a zero.
type OptionalAnswer = { readonly Value: number | null; readonly Ok: boolean };

// Built - the whole draft as the publish body: the rows the revision would
// carry and the first problem the form holds, or null when it can publish.
type Built = { readonly Rows: readonly PublishRow[]; readonly Problem: string | null };

const Pad = (Value: number): string => String(Value).padStart(2, "0");

// Written - the text a change event carries. The DOM overload of
// createElement cannot infer the element type from a string tag, so the event
// arrives as unknown and the field is read defensively.
const Written = (Event: unknown): string => {
	const Target = (Event as { target?: unknown } | null)?.target;
	const Text = (Target as { value?: unknown } | null)?.value;
	return typeof Text === "string" ? Text : "";
};

// Day - one instant as the table and the form show it: the local date and
// minute, zero padded, and the empty string for a missing or malformed value
// (the caller renders the dash). An invalid Date is what a non-finite input
// becomes, so the formatter needs no separate guard.
const Day = (Value: number | null): string => {
	const Moment = new Date(
		typeof Value === "number" && Number.isFinite(Value) ? Value : Number.NaN,
	);
	switch (true) {
		case Number.isNaN(Moment.getTime()):
			return "";
		default:
			return `${Moment.getFullYear()}-${Pad(Moment.getMonth() + 1)}-${Pad(
				Moment.getDate(),
			)} ${Pad(Moment.getHours())}:${Pad(Moment.getMinutes())}`;
	}
};

// Instant - one typed instant: a local date and minute, or a bare date read
// as local midnight so a typed date never lands on the previous day through
// the UTC reading of a date-only string. Unparseable text is null.
const Instant = (Text: string): number | null => {
	const Trimmed = Text.trim();
	switch (true) {
		case Trimmed === "":
			return null;
		default: {
			const Normalized =
				Trimmed.includes("T") || Trimmed.includes(" ")
					? Trimmed.replace(" ", "T")
					: `${Trimmed}T00:00`;
			const Parsed = Date.parse(Normalized);
			return Number.isFinite(Parsed) ? Parsed : null;
		}
	}
};

// Required - one required rate: a non-negative finite number, else the
// fallback the revision already carries and Ok false.
const Required = (Text: string, Fallback: number): Answer => {
	const Trimmed = Text.trim();
	switch (true) {
		case Trimmed === "":
			return { Value: Fallback, Ok: false };
		default: {
			const Parsed = Number(Trimmed);
			switch (true) {
				case !Number.isFinite(Parsed) || Parsed < 0:
					return { Value: Fallback, Ok: false };
				default:
					return { Value: Parsed, Ok: true };
			}
		}
	}
};

// Optional - one optional rate: an empty text is null, a non-negative finite
// number is itself, and anything else keeps the fallback and fails.
const Optional = (Text: string, Fallback: number | null): OptionalAnswer => {
	const Trimmed = Text.trim();
	switch (true) {
		case Trimmed === "":
			return { Value: null, Ok: true };
		default: {
			const Parsed = Number(Trimmed);
			switch (true) {
				case !Number.isFinite(Parsed) || Parsed < 0:
					return { Value: Fallback, Ok: false };
				default:
					return { Value: Parsed, Ok: true };
			}
		}
	}
};

// From - the valid-from instant: the exact instant the revision already
// carries while the form still shows it (opening a form and publishing it
// cannot move the boundary by a second), the parsed instant once the text
// changes, and the fallback with Ok false when the text does not parse.
const From = (Text: string, Shown: string, Fallback: number): Answer => {
	const Trimmed = Text.trim();
	switch (true) {
		case Trimmed === Shown:
			return { Value: Fallback, Ok: true };
		default: {
			const Parsed = Instant(Trimmed);
			return { Value: Parsed === null ? Fallback : Parsed, Ok: Parsed !== null };
		}
	}
};

// Until - the valid-until instant: the same exactness rule as From, with the
// empty text as the open end every row may declare.
const Until = (Text: string, Shown: string, Fallback: number | null): OptionalAnswer => {
	const Trimmed = Text.trim();
	switch (true) {
		case Trimmed === Shown:
			return { Value: Fallback, Ok: true };
		default: {
			const Parsed = Instant(Trimmed);
			return { Value: Parsed === null ? Fallback : Parsed, Ok: Parsed !== null };
		}
	}
};

// DraftOf - one row as the form opens it: every rate and instant the revision
// carries, and an empty text for a bucket the book does not separately price.
const DraftOf = (Source: RateRow): Draft => ({
	Input: String(Source.InputRate),
	Output: String(Source.OutputRate),
	CacheRead: Source.CacheReadRate === null ? "" : String(Source.CacheReadRate),
	CacheWrite: Source.CacheWriteRate === null ? "" : String(Source.CacheWriteRate),
	Reasoning: Source.ReasoningRate === null ? "" : String(Source.ReasoningRate),
	ValidFrom: Day(Source.ValidFrom),
	ValidTo: Source.ValidTo === null ? "" : Day(Source.ValidTo),
});

// Row - one recorded rate row as the publish body carries it: every field the
// engine inserts, and neither ledger-assigned id, because the publish assigns
// the revision and the row ids itself.
const Row = (Source: RateRow): PublishRow => ({
	Provider: Source.Provider,
	Model: Source.Model,
	Currency: Source.Currency,
	InputRate: Source.InputRate,
	OutputRate: Source.OutputRate,
	CacheReadRate: Source.CacheReadRate,
	CacheWriteRate: Source.CacheWriteRate,
	ReasoningRate: Source.ReasoningRate,
	ValidFrom: Source.ValidFrom,
	ValidTo: Source.ValidTo,
	Mode: Source.Mode,
	Region: Source.Region,
	Window: Source.Window,
	TierFrom: Source.TierFrom,
	TierTo: Source.TierTo,
	Note: Source.Note,
});

// Merged - one draft over its recorded row: the fields the form edits, the
// first problem the form holds, and the recorded values everywhere else. The
// interval order is checked here as well as in the transport, so a publish
// button never sends a book the route would only refuse.
const Merged = (
	Source: RateRow,
	Draft: Draft,
	t: Translate,
): { readonly Row: PublishRow; readonly Problem: string | null } => {
	const Input = Required(Draft.Input, Source.InputRate);
	const Output = Required(Draft.Output, Source.OutputRate);
	const CacheRead = Optional(Draft.CacheRead, Source.CacheReadRate);
	const CacheWrite = Optional(Draft.CacheWrite, Source.CacheWriteRate);
	const Reasoning = Optional(Draft.Reasoning, Source.ReasoningRate);
	const ValidFrom = From(Draft.ValidFrom, Day(Source.ValidFrom), Source.ValidFrom);
	const ValidTo = Until(Draft.ValidTo, Day(Source.ValidTo), Source.ValidTo);
	const Problem = ((): string | null => {
		switch (true) {
			case !Input.Ok:
				return t("pricing.problem.number", { field: t("pricing.column.input") });
			case !Output.Ok:
				return t("pricing.problem.number", { field: t("pricing.column.output") });
			case !CacheRead.Ok:
				return t("pricing.problem.number", { field: t("pricing.column.cacheRead") });
			case !CacheWrite.Ok:
				return t("pricing.problem.number", { field: t("pricing.column.cacheWrite") });
			case !Reasoning.Ok:
				return t("pricing.problem.number", { field: t("pricing.column.reasoning") });
			case !ValidFrom.Ok:
				return t("pricing.problem.moment", { field: t("pricing.column.validFrom") });
			case !ValidTo.Ok:
				return t("pricing.problem.moment", { field: t("pricing.column.validTo") });
			case ValidTo.Value !== null && ValidTo.Value <= ValidFrom.Value:
				return t("pricing.problem.order");
			default:
				return null;
		}
	})();
	return {
		Row: {
			...Row(Source),
			InputRate: Input.Value,
			OutputRate: Output.Value,
			CacheReadRate: CacheRead.Value,
			CacheWriteRate: CacheWrite.Value,
			ReasoningRate: Reasoning.Value,
			ValidFrom: ValidFrom.Value,
			ValidTo: ValidTo.Value,
		},
		Problem,
	};
};

// Build - the whole edited row set: every rate row of the revision, each with
// its draft applied when one is open, and the first problem any draft holds.
const Build = (
	Book: readonly RateRow[],
	Drafts: Readonly<Record<number, Draft>>,
	t: Translate,
): Built => {
	const Rows: PublishRow[] = [];
	let Problem: string | null = null;
	for (const Source of Book) {
		const Draft = Drafts[Source.RateRowId];
		// Early continue, because the narrowing has to survive into the merge;
		// a switch (true) arm cannot carry it.
		if (Draft === undefined) {
			Rows.push(Row(Source));
			continue;
		}
		const MergedOne = Merged(Source, Draft, t);
		Problem = Problem === null ? MergedOne.Problem : Problem;
		Rows.push(MergedOne.Row);
	}
	return { Rows, Problem };
};

// Newest - the catalog's newest published revision: the one the view opens
// on, because a valuation may pin only a published revision.
const Newest = (Revisions: readonly Revision[], CatalogId: number): number | null => {
	let Found: number | null = null;
	for (const One of Revisions) {
		if (One.CatalogId !== CatalogId || One.Status !== "published") continue;
		if (Found === null || One.RevisionId > Found) Found = One.RevisionId;
	}
	return Found;
};

// Comparison - the envelope's valuation block, or undefined when the read
// carried none. The block is read defensively like every other envelope
// field: a malformed body must not throw and must not render a half-filled
// comparison.
const Comparison = (Envelope: CostResponse): Valuation | undefined => {
	// Early returns, because the narrowing has to survive into the figure
	// checks; a switch (true) arm cannot carry it.
	if (Envelope.ok !== true) return undefined;
	const Block = Envelope.valuation;
	if (Block === undefined) return undefined;
	if (
		typeof Block.recorded !== "number" ||
		typeof Block.revised !== "number" ||
		typeof Block.difference !== "number"
	) {
		return undefined;
	}
	return Block;
};

// Picker - one native select of the settings block: the house pattern for an
// enum, wrapped in its label so the visible word is the control's accessible
// name.
const Picker = (
	Label: string,
	Value: string,
	Options: readonly { readonly value: string; readonly label: string }[],
	OnPick: (Text: string) => void,
): ReturnType<typeof createElement> =>
	createElement(
		"label",
		{ className: "playform-cost-controls" },
		createElement("span", { className: "playform-cost-control-label" }, Label),
		createElement(
			"select",
			{
				className: "playform-cost-button",
				value: Value,
				style: { fontFamily: "inherit" },
				onChange: (Event: unknown) => OnPick(Written(Event)),
			},
			Options.map((Option) =>
				createElement("option", { key: Option.value, value: Option.value }, Option.label),
			),
		),
	);

// Field - one draft input: the label, the text field the chip face styles,
// and the one change handler.
const Field = (
	Label: string,
	Value: string,
	OnInput: (Text: string) => void,
): ReturnType<typeof createElement> =>
	createElement(
		"label",
		{ className: "playform-cost-controls" },
		createElement("span", { className: "playform-cost-control-label" }, Label),
		createElement("input", {
			type: "text",
			className: "playform-cost-button",
			// The chip face carries cursor: pointer; a text field must not.
			style: { cursor: "text" },
			value: Value,
			"aria-label": Label,
			onChange: (Event: unknown) => OnInput(Written(Event)),
		}),
	);

// FormProps - the draft form's one props bag: the row it edits, the draft it
// shows, the shared reason and the four actions the block offers.
type FormProps = {
	readonly Row: RateRow;
	readonly Current: Draft;
	readonly Reason: string;
	readonly OnChange: (Patch: Partial<Draft>) => void;
	readonly OnReason: (Text: string) => void;
	readonly OnRevert: () => void;
	readonly OnDone: () => void;
	readonly t: Translate;
};

// Form - the local draft of one rate row: the five rate fields, the two
// instants and the revision's reason, with the revert and done actions. Every
// keystroke goes to the parent's local state, so nothing here can write.
const Form = (Props: FormProps): ReturnType<typeof createElement> => {
	const Row = Props.Row;
	const Current = Props.Current;
	const t = Props.t;
	return createElement(
		"div",
		{ className: "playform-cost-block" },
		createElement(
			"div",
			{ className: "playform-cost-block-head" },
			createElement(
				"span",
				{ className: "playform-cost-block-path" },
				`${Row.Provider} / ${Row.Model}`,
			),
			createElement("span", { className: "playform-cost-block-meta" }, t("pricing.draft")),
			createElement(
				"span",
				{ className: "playform-cost-block-meta" },
				Row.Currency === "" ? Dash : Row.Currency,
			),
		),
		createElement(
			"div",
			{ className: "playform-cost-block-body" },
			createElement(
				"div",
				{ className: "playform-cost-controls" },
				Field(t("pricing.column.input"), Current.Input, (Text) =>
					Props.OnChange({ Input: Text }),
				),
				Field(t("pricing.column.output"), Current.Output, (Text) =>
					Props.OnChange({ Output: Text }),
				),
				Field(t("pricing.column.cacheRead"), Current.CacheRead, (Text) =>
					Props.OnChange({ CacheRead: Text }),
				),
				Field(t("pricing.column.cacheWrite"), Current.CacheWrite, (Text) =>
					Props.OnChange({ CacheWrite: Text }),
				),
				Field(t("pricing.column.reasoning"), Current.Reasoning, (Text) =>
					Props.OnChange({ Reasoning: Text }),
				),
				Field(t("pricing.column.validFrom"), Current.ValidFrom, (Text) =>
					Props.OnChange({ ValidFrom: Text }),
				),
				Field(t("pricing.column.validTo"), Current.ValidTo, (Text) =>
					Props.OnChange({ ValidTo: Text }),
				),
				Field(t("pricing.reason"), Props.Reason, Props.OnReason),
			),
			createElement(
				"div",
				{ className: "playform-cost-controls" },
				createElement(
					"button",
					{ type: "button", className: "playform-cost-button", onClick: Props.OnRevert },
					t("pricing.draft.revert"),
				),
				createElement(
					"button",
					{ type: "button", className: "playform-cost-button", onClick: Props.OnDone },
					t("pricing.draft.done"),
				),
			),
		),
	);
};

// MoneyCell - one required rate cell: the per-million amount in the row's own
// currency, through the panel's one money formatter.
const MoneyCell = (
	Cell: string,
	Value: number,
	Currency: string,
): ReturnType<typeof createElement> =>
	createElement(
		"td",
		{ className: Cell },
		createElement("span", { className: "playform-cost-money" }, Price(Value, Currency)),
	);

// OptionalCell - one optional rate cell: the dash with the "not separately
// priced" title for a bucket the book leaves unpriced.
const OptionalCell = (
	Cell: string,
	Value: number | null,
	Currency: string,
	t: Translate,
): ReturnType<typeof createElement> =>
	createElement(
		"td",
		{ className: Cell, title: t("pricing.rate.included") },
		Value === null
			? Dash
			: createElement("span", { className: "playform-cost-money" }, Price(Value, Currency)),
	);

// InstantCell - one instant cell: the local date and minute, or the dash with
// the "open end" title for a NULL bound.
const InstantCell = (
	Cell: string,
	Value: number | null,
	t: Translate,
): ReturnType<typeof createElement> => {
	const Shown = Day(Value);
	return createElement(
		"td",
		{ className: Cell, title: Shown === "" ? t("pricing.rate.open") : Shown },
		Shown === "" ? Dash : createElement("span", { className: "playform-cost-num" }, Shown),
	);
};

// BodyCell - one body cell of the rate table: the identity columns as text,
// the five rates as money, the two instants as local dates, the bounds as
// counts and the last column as the Edit action of that row.
const BodyCell = (
	Id: Column,
	Row: RateRow,
	Editing: number | null,
	OnEdit: (RateRowId: number) => void,
	t: Translate,
): ReturnType<typeof createElement> => {
	const Currency = Row.Currency === "" ? "USD" : Row.Currency;
	const Metric = "playform-cost-step-metric";
	const Plain = "playform-cost-step-files";
	const Tier = (Value: number | null): ReturnType<typeof createElement> =>
		createElement(
			"span",
			{ className: "playform-cost-num" },
			Value === null ? Dash : Count(Value),
		);
	switch (Id) {
		case "provider":
			return createElement("td", { className: Plain, title: Row.Provider }, Row.Provider);
		case "model":
			return createElement("td", { className: Plain, title: Row.Model }, Row.Model);
		case "currency":
			return createElement(
				"td",
				{ className: Plain },
				Row.Currency === "" ? Dash : Row.Currency,
			);
		case "input":
			return MoneyCell(Metric, Row.InputRate, Currency);
		case "output":
			return MoneyCell(Metric, Row.OutputRate, Currency);
		case "cacheRead":
			return OptionalCell(Metric, Row.CacheReadRate, Currency, t);
		case "cacheWrite":
			return OptionalCell(Metric, Row.CacheWriteRate, Currency, t);
		case "reasoning":
			return OptionalCell(Metric, Row.ReasoningRate, Currency, t);
		case "validFrom":
			return InstantCell(Metric, Row.ValidFrom, t);
		case "validTo":
			return InstantCell(Metric, Row.ValidTo, t);
		case "mode":
			return createElement("td", { className: Plain }, Row.Mode === "" ? Dash : Row.Mode);
		case "region":
			return createElement(
				"td",
				{ className: Plain },
				Row.Region === null || Row.Region === "" ? Dash : Row.Region,
			);
		case "window":
			return createElement("td", { className: Plain }, Row.Window === "" ? Dash : Row.Window);
		case "tierFrom":
			return createElement("td", { className: Metric }, Tier(Row.TierFrom));
		case "tierTo":
			return createElement("td", { className: Metric }, Tier(Row.TierTo));
		case "edit":
			return createElement(
				"td",
				{ className: Metric },
				createElement(
					"button",
					{
						type: "button",
						className:
							Editing === Row.RateRowId
								? "playform-cost-chip playform-cost-chip-on"
								: "playform-cost-chip",
						"aria-pressed": Editing === Row.RateRowId,
						onClick: () => OnEdit(Row.RateRowId),
					},
					t("pricing.edit"),
				),
			);
		default:
			return createElement("td", { className: Metric }, Dash);
	}
};

// PricingSettingsProps - what the view hands the pane: the session the
// preview reads, the row budget it reads with, the translator, and the
// callback that pins a freshly published revision as the panel's valuation.
type PricingSettingsProps = {
	readonly sessionId: string;
	readonly rows: number;
	readonly t: Translate;
	readonly onPublished?: (RevisionId: number) => void;
};

export default function PricingSettings(
	Props: PricingSettingsProps,
): ReturnType<typeof createElement> {
	const t = Props.t;
	const [Listing, SetListing] = useState<CatalogAnswer | null>(null);
	const [CatalogId, SetCatalogId] = useState<number | null>(null);
	const [RevisionId, SetRevisionId] = useState<number | null>(null);
	const [Book, SetBook] = useState<readonly RateRow[]>([]);
	const [Reading, SetReading] = useState<RatePhase>("idle");
	const [Drafts, SetDrafts] = useState<Readonly<Record<number, Draft>>>({});
	const [Editing, SetEditing] = useState<number | null>(null);
	const [Reason, SetReason] = useState("");
	const [Outcome, SetOutcome] = useState<PublishOutcome | null>(null);
	const [Publishing, SetPublishing] = useState(false);
	const [Attempt, SetAttempt] = useState(0);
	const [Preview, SetPreview] = useState<PreviewState>({
		Phase: "idle",
		Block: null,
		Unpriced: 0,
		Currency: "USD",
		Message: null,
	});

	// The catalogs read: every catalog and revision the route answers. The
	// first read adopts the first catalog and its newest published revision;
	// a read after a publish keeps the user's selection and only refreshes
	// the selector's options, because the publish selects the new revision.
	const Read = useCallback((Adopt: boolean): void => {
		new Promise<CatalogAnswer>((Done) => {
			Done(Catalogs());
		})
			.then((Answer) => {
				SetListing(Answer);
				// Early returns, because the narrowing has to survive into the
				// constructed selection; a switch (true) arm cannot carry it.
				if (!Adopt) return;
				const First = Answer.catalogs[0];
				if (First === undefined) {
					SetCatalogId(null);
					SetRevisionId(null);
					return;
				}
				SetCatalogId(First.CatalogId);
				SetRevisionId(Newest(Answer.revisions, First.CatalogId));
			})
			.catch(() => undefined);
	}, []);

	useEffect(() => {
		Read(true);
	}, [Read]);

	// The rate read: the selected revision's rate rows, in the card order the
	// engine answers. A failed read is a state with a retry, never a throw.
	useEffect(() => {
		let Live = true;
		// Early returns, because the narrowing has to survive into the
		// promise's callback; a switch (true) arm cannot carry it.
		if (RevisionId === null) {
			SetBook([]);
			SetReading("idle");
			return () => {
				Live = false;
			};
		}
		const Stated = RevisionId;
		SetReading("loading");
		new Promise<readonly RateRow[]>((Done) => {
			Done(ReadRates(Stated));
		})
			.then((Rows) => {
				if (!Live) return;
				SetBook(Rows);
				SetReading("idle");
			})
			.catch(() => {
				if (!Live) return;
				SetReading("failed");
			});
		return () => {
			Live = false;
		};
	}, [RevisionId, Attempt]);

	// Whether the draft differs from the book at all: the impact preview is
	// honest only for a published revision with no unpublished edit, so this
	// one flag is what turns the figures into "available after publish".
	const Dirty = Object.keys(Drafts).length > 0;

	// The impact preview: the session read with the selected revision pinned,
	// which is the same preview the engine answers for the valuation block.
	// Nothing is written; the preview computes and the ledger stays read-only.
	useEffect(() => {
		let Live = true;
		// Early returns, because the narrowing has to survive into the
		// promise's callback and the constructed selection; a switch (true)
		// arm cannot carry it.
		if (RevisionId === null || Dirty || Props.sessionId === "") {
			SetPreview({
				Phase: "idle",
				Block: null,
				Unpriced: 0,
				Currency: "USD",
				Message: null,
			});
			return () => {
				Live = false;
			};
		}
		const Stated = RevisionId;
		SetPreview({
			Phase: "loading",
			Block: null,
			Unpriced: 0,
			Currency: "USD",
			Message: null,
		});
		new Promise<CostResponse>((Done) => {
			Done(
				Fetch(Props.sessionId, Props.rows, {
					basis: "corrected",
					revisionId: Stated,
				}),
			);
		})
			.then((Envelope) => {
				if (!Live) return;
				const Block = Comparison(Envelope);
				if (Block !== undefined) {
					SetPreview({
						Phase: "ready",
						Block,
						Unpriced:
							typeof Envelope.summary?.unpriced === "number"
								? Envelope.summary.unpriced
								: 0,
						Currency:
							typeof Envelope.currency === "string" && Envelope.currency !== ""
								? Envelope.currency
								: "USD",
						Message: null,
					});
					return;
				}
				SetPreview({
					Phase: "failed",
					Block: null,
					Unpriced: 0,
					Currency: "USD",
					Message: Envelope.ok === false ? Envelope.message : null,
				});
			})
			.catch(() => {
				if (!Live) return;
				SetPreview({
					Phase: "failed",
					Block: null,
					Unpriced: 0,
					Currency: "USD",
					Message: null,
				});
			});
		return () => {
			Live = false;
		};
	}, [Props.sessionId, Props.rows, RevisionId, Dirty]);

	const Listed = Listing === null ? [] : Listing.catalogs;
	const Revisions = Listing === null ? [] : Listing.revisions;
	const Published =
		CatalogId === null
			? []
			: Revisions.filter((One) => One.CatalogId === CatalogId && One.Status === "published");
	const Selected = Listed.find((One) => One.CatalogId === CatalogId);
	const CatalogLabel = Selected === undefined ? "" : Selected.Name;
	const CatalogOptions = Listed.map((One) => ({
		value: String(One.CatalogId),
		label: One.Name,
	}));
	const RevisionOptions = Published.map((One) => ({
		value: String(One.RevisionId),
		label: t("valuation.revision", { revision: One.RevisionId }),
	}));

	// One catalog choice: the catalog's newest published revision becomes the
	// selection, and the old draft, form and outcome are dropped because they
	// belong to another book.
	const ChooseCatalog = (Text: string): void => {
		const Id = Number(Text);
		switch (true) {
			case !Number.isInteger(Id) || Id <= 0:
				return;
			default:
				SetCatalogId(Id);
				SetRevisionId(Newest(Revisions, Id));
				SetDrafts({});
				SetEditing(null);
				SetOutcome(null);
		}
	};

	// One revision choice: the draft belongs to the revision it was opened
	// on, so a switch drops it rather than carrying an edit into a book that
	// never saw it.
	const ChooseRevision = (Text: string): void => {
		const Id = Number(Text);
		switch (true) {
			case !Number.isInteger(Id) || Id <= 0:
				return;
			default:
				SetRevisionId(Id);
				SetDrafts({});
				SetEditing(null);
				SetOutcome(null);
		}
	};

	// Edit toggles one row's form. Opening a row writes no draft entry, so a
	// form that is only looked at cannot turn the preview into "after
	// publish".
	const Open = useCallback((RateRowId: number) => {
		SetEditing((Current) => (Current === RateRowId ? null : RateRowId));
	}, []);

	const Close = useCallback(() => {
		SetEditing(null);
	}, []);

	// Change writes one field of the open row's draft: the first keystroke is
	// what creates the draft entry, from the recorded row.
	const Change = useCallback(
		(Patch: Partial<Draft>): void => {
			// Early returns, because the narrowing has to survive into the
			// index and the constructed record; a switch (true) arm cannot
			// carry it.
			if (Editing === null) return;
			const Source = Book.find((One) => One.RateRowId === Editing);
			if (Source === undefined) return;
			const Base = Drafts[Editing] ?? DraftOf(Source);
			SetDrafts({ ...Drafts, [Editing]: { ...Base, ...Patch } });
		},
		[Editing, Book, Drafts],
	);

	// Revert drops the open row's draft entry, so the row publishes exactly
	// what the revision already records.
	const Revert = useCallback((): void => {
		if (Editing === null) return;
		const Next: Record<number, Draft> = {};
		for (const [Key, Value] of Object.entries(Drafts)) {
			if (Number(Key) === Editing) continue;
			Next[Number(Key)] = Value;
		}
		SetDrafts(Next);
	}, [Editing, Drafts]);

	const Retry = useCallback(() => {
		SetAttempt((Current) => Current + 1);
	}, []);

	const Drafted = Build(Book, Drafts, t);
	const Blocked =
		Publishing ||
		CatalogId === null ||
		RevisionId === null ||
		Book.length === 0 ||
		Reason.trim() === "" ||
		Drafted.Problem !== null;
	const OutcomeLine = ((): string | null => {
		// Early returns, because the narrowing has to survive into the
		// constructed line; a switch (true) arm cannot carry it.
		if (Outcome !== null) {
			return Outcome.Kind === "published"
				? t("pricing.published", { revision: Outcome.RevisionId ?? 0 })
				: Outcome.Message;
		}
		return Reason.trim() === "" ? t("pricing.problem.reason") : Drafted.Problem;
	})();

	// The one write: the whole edited row set, the base revision and the
	// reason go to the publish route; the answer either names the new
	// revision, which is then selected and pinned, or the one line the bar
	// shows. A refused publish leaves the draft untouched.
	const Publish = (): void => {
		const Stated = Reason.trim();
		const Catalog = CatalogId ?? 0;
		const Base = RevisionId ?? 0;
		switch (true) {
			case Publishing:
				return;
			case Catalog === 0 || Base === 0:
				SetOutcome({
					Kind: "failed",
					RevisionId: null,
					Message: t("pricing.problem.revision"),
				});
				return;
			case Stated === "":
				SetOutcome({
					Kind: "failed",
					RevisionId: null,
					Message: t("pricing.problem.reason"),
				});
				return;
			case Drafted.Rows.length === 0:
				SetOutcome({
					Kind: "failed",
					RevisionId: null,
					Message: t("pricing.problem.empty"),
				});
				return;
			case Drafted.Problem !== null:
				SetOutcome({ Kind: "failed", RevisionId: null, Message: Drafted.Problem });
				return;
			default:
				SetPublishing(true);
				SetOutcome(null);
				new Promise<PublishAnswer>((Done) => {
					Done(
						Submit({
							catalogId: Catalog,
							baseRevisionId: Base,
							reason: Stated,
							rows: Drafted.Rows,
						}),
					);
				})
					.then((Reply) => {
						SetPublishing(false);
						const Revision = Reply.revision;
						// Early return, because the narrowing has to survive
						// into the constructed outcome; a switch (true) arm
						// cannot carry it.
						if (Revision === null) {
							SetOutcome({
								Kind: "failed",
								RevisionId: null,
								Message: Reply.message,
							});
							return;
						}
						SetOutcome({
							Kind: "published",
							RevisionId: Revision.RevisionId,
							Message: null,
						});
						SetDrafts({});
						SetEditing(null);
						SetReason("");
						SetRevisionId(Revision.RevisionId);
						Read(false);
						if (Props.onPublished !== undefined) Props.onPublished(Revision.RevisionId);
					})
					.catch((Caught) => {
						SetPublishing(false);
						SetOutcome({
							Kind: "failed",
							RevisionId: null,
							Message: Caught instanceof Error ? Caught.message : String(Caught),
						});
					});
		}
	};

	// The settings block's body: the two pickers, or the state line that says
	// why there is nothing to pick.
	const PickerRow = ((): ReturnType<typeof createElement> => {
		switch (true) {
			case Listing === null:
				return createElement(
					"div",
					{ className: "playform-cost-block-empty", role: "status" },
					t("pricing.loading"),
				);
			case Listed.length === 0:
				return createElement(
					"div",
					{ className: "playform-cost-block-empty" },
					t("pricing.empty"),
				);
			case Published.length === 0:
				return createElement(
					"div",
					{ className: "playform-cost-block-empty" },
					t("pricing.revisions.empty"),
				);
			default:
				return createElement(
					"div",
					{ className: "playform-cost-controls" },
					Picker(
						t("pricing.catalog"),
						CatalogId === null ? "" : String(CatalogId),
						CatalogOptions,
						ChooseCatalog,
					),
					Picker(
						t("pricing.revision"),
						RevisionId === null ? "" : String(RevisionId),
						RevisionOptions,
						ChooseRevision,
					),
				);
		}
	})();

	// The rate table's body: the table, or the one line of the loading, the
	// failed and the empty read. The table always shows the revision's own
	// rates, never the draft's.
	const TableBody = ((): ReturnType<typeof createElement> => {
		switch (true) {
			case RevisionId === null:
				return createElement(
					"div",
					{ className: "playform-cost-block-empty" },
					t("pricing.rates.empty"),
				);
			case Reading === "loading":
				return createElement(
					"div",
					{ className: "playform-cost-block-empty", role: "status" },
					t("pricing.rates.loading"),
				);
			case Reading === "failed":
				return createElement(
					"div",
					{ className: "playform-cost-block-empty" },
					t("pricing.rates.failed"),
					createElement(
						"button",
						{ type: "button", className: "playform-cost-button", onClick: Retry },
						t("retry"),
					),
				);
			case Book.length === 0:
				return createElement(
					"div",
					{ className: "playform-cost-block-empty" },
					t("pricing.rates.empty"),
				);
			default:
				return createElement(
					"table",
					{ className: "playform-cost-table", "aria-label": t("pricing.rates") },
					createElement(
						"colgroup",
						{},
						Columns.map((Id) =>
							createElement("col", {
								key: Id,
								style: { width: `${Widths[Id]}%` },
							}),
						),
					),
					createElement(
						"thead",
						{},
						createElement(
							"tr",
							{},
							Columns.map((Id) => {
								const Title = Titles[Id];
								return createElement(
									"th",
									{
										key: Id,
										className: Left.has(Id)
											? "playform-cost-th-left"
											: "playform-cost-th",
										...(Title === undefined ? {} : { title: t(Title) }),
									},
									t(`pricing.column.${Id}`),
								);
							}),
						),
					),
					createElement(
						"tbody",
						{},
						Book.map((One) =>
							createElement(
								"tr",
								{ key: One.RateRowId },
								Columns.map((Id) => BodyCell(Id, One, Editing, Open, t)),
							),
						),
					),
				);
		}
	})();

	// The draft form: the open row and its draft, or nothing. A row whose
	// draft was dropped still opens on the recorded values.
	const EditingRow = Editing === null ? undefined : Book.find((One) => One.RateRowId === Editing);
	const Current =
		EditingRow === undefined ? null : (Drafts[EditingRow.RateRowId] ?? DraftOf(EditingRow));
	const FormBlock = ((): ReturnType<typeof createElement> | null => {
		// Early return, because the narrowing has to survive into the form's
		// props; a conditional expression cannot carry it here.
		if (EditingRow === undefined || Current === null) return null;
		return Form({
			Row: EditingRow,
			Current,
			Reason,
			OnChange: Change,
			OnReason: SetReason,
			OnRevert: Revert,
			OnDone: Close,
			t,
		});
	})();

	// The impact preview: the four figures under the selected revision, or
	// the one line of the state the pane is in.
	const PreviewBody = ((): ReturnType<typeof createElement> => {
		switch (Preview.Phase) {
			case "idle":
				return createElement(
					"div",
					{ className: "playform-cost-block-empty" },
					Props.sessionId === ""
						? t("pricing.preview.noSession")
						: t("pricing.preview.pending"),
				);
			case "loading":
				return createElement(
					"div",
					{ className: "playform-cost-block-empty", role: "status" },
					t("pricing.preview.loading"),
				);
			case "failed":
				return createElement(
					"div",
					{ className: "playform-cost-block-empty" },
					t("pricing.preview.failed"),
					Preview.Message === null
						? null
						: createElement(
								"span",
								{ className: "playform-cost-block-meta" },
								` - ${Preview.Message}`,
							),
				);
			default: {
				const Block = Preview.Block;
				// Early return, because the narrowing has to survive into the
				// four figures; a switch (true) arm cannot carry it.
				if (Block === null) {
					return createElement(
						"div",
						{ className: "playform-cost-block-empty" },
						t("pricing.preview.failed"),
					);
				}
				return createElement(
					"div",
					{ className: "playform-cost-block-body" },
					createElement(
						"div",
						{
							className: "playform-cost-controls",
							title: t("pricing.preview.title", {
								revision: Block.revisionId,
							}),
						},
						createElement(
							"span",
							{ className: "playform-cost-control-label" },
							t("valuation.recorded", {
								value: Price(Block.recorded, Preview.Currency),
							}),
						),
						createElement(
							"span",
							{ className: "playform-cost-control-label" },
							t("valuation.revised", {
								value: Price(Block.revised, Preview.Currency),
							}),
						),
						createElement(
							"span",
							{ className: "playform-cost-control-label" },
							t("valuation.difference", {
								value: Price(Block.difference, Preview.Currency),
							}),
						),
						createElement(
							"span",
							{
								className: "playform-cost-control-label",
								title: t("pricing.preview.unpriced.title"),
							},
							t("pricing.preview.unpriced", {
								count: Count(Preview.Unpriced),
							}),
						),
					),
				);
			}
		}
	})();

	return createElement(
		Fragment,
		{},
		createElement(
			"div",
			{ className: "playform-cost-block" },
			createElement(
				"div",
				{ className: "playform-cost-block-head" },
				createElement(
					"span",
					{ className: "playform-cost-block-path" },
					t("pricing.title"),
				),
				createElement(
					"span",
					{ className: "playform-cost-block-meta" },
					CatalogLabel === ""
						? t("pricing.empty")
						: RevisionId === null
							? CatalogLabel
							: `${CatalogLabel} - ${t("valuation.revision", {
									revision: RevisionId,
								})}`,
				),
			),
			createElement("div", { className: "playform-cost-block-sub" }, t("pricing.notice")),
			PickerRow,
		),
		createElement(
			"div",
			{ className: "playform-cost-block" },
			createElement(
				"div",
				{ className: "playform-cost-block-head" },
				createElement(
					"span",
					{ className: "playform-cost-block-path" },
					t("pricing.rates"),
				),
				createElement(
					"span",
					{ className: "playform-cost-block-meta" },
					t("pricing.rate.unit"),
				),
			),
			TableBody,
		),
		FormBlock,
		createElement(
			"div",
			{ className: "playform-cost-block" },
			createElement(
				"div",
				{ className: "playform-cost-block-head" },
				createElement(
					"span",
					{ className: "playform-cost-block-path" },
					t("pricing.preview"),
				),
				RevisionId === null
					? null
					: createElement(
							"span",
							{ className: "playform-cost-block-meta" },
							t("valuation.revision", { revision: RevisionId }),
						),
			),
			PreviewBody,
		),
		createElement(
			"div",
			{
				className: "playform-cost-controls",
				role: "group",
				"aria-label": t("pricing.publish"),
			},
			createElement(
				"button",
				{
					type: "button",
					className: Blocked ? "playform-cost-button-off" : "playform-cost-button",
					disabled: Blocked,
					onClick: Publish,
				},
				Publishing ? t("pricing.publishing") : t("pricing.publish"),
			),
			OutcomeLine === null
				? null
				: createElement(
						"span",
						{
							className:
								Outcome !== null && Outcome.Kind === "failed"
									? "playform-cost-removed"
									: "playform-cost-block-meta",
							role: "status",
						},
						OutcomeLine,
					),
		),
	);
}
