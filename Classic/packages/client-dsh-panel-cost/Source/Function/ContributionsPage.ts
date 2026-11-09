// ContributionsPage - the Cost tab's Contributions view (Temporary/
// Cost-Research/Plan.md lane B5b; the research's A1 section 8 and A2
// section 7): one file, the conversations that allocated money to it, and -
// one level deeper - the calls of a chosen conversation that allocated money
// to that same file, each row carrying its own evidence.
//
// THE PATH is the pane's own question: a text field the reader types or pastes
// a path into and one Read action that applies it. The field starts with the
// path the Files view filtered by, because the view above this pane already
// holds that filter state, so opening Contributions from a filtered Files
// table asks the question the reader was just looking at. Typing never opens a
// read: only the applied path does, so a half-typed path cannot reach the
// ledger.
//
// THE TWO LEVELS: the first read is the engine's file-scoped contribution
// read (Function/Fetch's Contributions), one row per conversation that paid
// for the file, with its call count, its direct and amortized money, its total
// and its share of the file's whole lifetime. A conversation row expands into
// the engine's file-scoped call read (Function/Fetch's FileCalls), fetched
// lazily on the first open and cached per conversation, so a reopened row
// renders the same calls without a second request. The call table is the
// compact grain: turn and step, the model, the token total, the direct,
// amortized and total money, the stage the file reached in that call, and the
// evidence label.
//
// THE EVIDENCE LABELS are the point of the second level: a call that touched
// the file says "touched" (it paid the file's direct share), and a call that
// only carried the file in its context says "context carry" (it paid the
// amortized share). Both labels carry their own tooltip, so the difference is
// readable without the research document.
//
// EVERY STATE renders a line rather than a crash: the idle pane (no path
// applied), the loading read, the failed read and the empty read for the
// conversation level, and the loading, failed and empty state of one
// conversation's calls. Both fetches resolve instead of throwing, so the pane
// always has a state to show.
import Count from "@Function/Count";
import CountShort from "@Function/CountShort";
import { Contributions, FileCalls } from "@Function/Fetch";
import Price from "@Function/Price";
import Rate from "@Function/Rate";
import Stamp from "@Function/Stamp";
import type CostContributionRow from "@Interface/ContributionRow";
import type { Translate } from "@Interface/Translate";
import type { CostFileCallRow } from "@playform/plugin-dsh-cost/service";
import Dash from "@Variable/Dash";
import EN_DICTIONARY from "@Variable/Locale-en.json";
import { createElement, Fragment, useCallback, useEffect, useState } from "react";

// The conversation table's one column definition: the shipped order, the
// percent widths that add up to the whole table, and the label and tooltip
// keys each column resolves. The header, the colgroup and every body cell read
// this one list, so a column cannot drift from its width.
const CONVERSATION_COLUMNS = [
	"conversation",
	"calls",
	"direct",
	"amortized",
	"total",
	"share",
	"models",
] as const;

type ConversationColumn = (typeof CONVERSATION_COLUMNS)[number];

const CONVERSATION_LABELS: Readonly<Record<ConversationColumn, string>> = {
	conversation: "contributions.column.conversation",
	calls: "contributions.column.calls",
	direct: "contributions.column.direct",
	amortized: "contributions.column.amortized",
	total: "contributions.column.total",
	share: "contributions.column.share",
	models: "contributions.column.models",
};

const CONVERSATION_TITLES: Readonly<Record<ConversationColumn, string | null>> = {
	conversation: null,
	calls: "contributions.column.calls.title",
	direct: null,
	amortized: null,
	total: null,
	share: "contributions.column.share.title",
	models: null,
};

const CONVERSATION_WIDTHS: Record<ConversationColumn, number> = {
	conversation: 30,
	calls: 8,
	direct: 12,
	amortized: 12,
	total: 12,
	share: 10,
	models: 16,
};

// The call table's one column definition, the same way: the compact grain of
// the second level, from the turn and step through the evidence label. The
// scope column reuses the panel's own Turn / step word, because the call grain
// is the same grain the Turns table names.
const CALL_COLUMNS = [
	"scope",
	"model",
	"tokens",
	"direct",
	"amortized",
	"total",
	"stage",
	"evidence",
] as const;

type CallColumn = (typeof CALL_COLUMNS)[number];

const CALL_LABELS: Readonly<Record<CallColumn, string>> = {
	scope: "column.scope",
	model: "contributions.call.column.model",
	tokens: "contributions.call.column.tokens",
	direct: "contributions.column.direct",
	amortized: "contributions.column.amortized",
	total: "contributions.column.total",
	stage: "contributions.call.column.stage",
	evidence: "contributions.call.column.evidence",
};

const CALL_TITLES: Readonly<Record<CallColumn, string | null>> = {
	scope: "contributions.call.column.scope.title",
	model: null,
	tokens: "contributions.call.column.tokens.title",
	direct: null,
	amortized: null,
	total: null,
	stage: "contributions.call.column.stage.title",
	evidence: "contributions.call.column.evidence.title",
};

const CALL_WIDTHS: Record<CallColumn, number> = {
	scope: 12,
	model: 16,
	tokens: 12,
	direct: 12,
	amortized: 12,
	total: 12,
	stage: 10,
	evidence: 14,
};

// The stage tone map the Files, turn and step rows share: the same palette,
// keyed by the same stage words, so a call's stage reads as the same color in
// every view.
const StageTones: Record<string, number> = {
	discover: 5,
	read: 0,
	reread: 0,
	edit: 2,
	verify: 1,
	revert: 3,
};

// Reading - one level's read as the pane holds it: the phase the level renders
// and the rows the answer carried. A level with no read yet is idle, which is
// the state a conversation row starts in before its first open.
type Reading<Row> = {
	Phase: "idle" | "loading" | "ready" | "failed";
	Rows: readonly Row[];
};

const N = (Value: unknown): number =>
	typeof Value === "number" && Number.isFinite(Value) ? Value : 0;

const S = (Value: unknown): string => (typeof Value === "string" ? Value : "");

const Epoch = (Value: unknown): number | null =>
	typeof Value === "number" && Number.isFinite(Value) ? Value : null;

// Models - one contribution row's model list, read defensively: the rows cross
// the route as JSON, and an entry that is not a string is not a model.
const Models = (Value: unknown): readonly string[] =>
	Array.isArray(Value) ? Value.filter((Item: unknown) => typeof Item === "string") : [];

const BaseName = (Path: string): string => {
	const Cut = Path.lastIndexOf("/");
	return Cut === -1 ? Path : Path.slice(Cut + 1);
};

// ShortSession - the session id's short tail: the last eight characters of an
// id the ledger stored no title for, prefixed with an ellipsis when the id is
// longer, so the conversation cell stays a column and not a paragraph.
const ShortSession = (SessionId: string): string =>
	SessionId.length <= 8 ? SessionId : `...${SessionId.slice(-8)}`;

const ToneClass = (Tone: number): string => `playform-cost-tone${Tone}`;

const StageTone = (Stage: string): number => StageTones[Stage] ?? 7;

// Word - the shipped stage.* words; a word the dictionary does not carry is
// shown as the ledger spelled it rather than as a key.
const Word = (Key: string, Fallback: string, t: Translate): string => {
	const Known = (EN_DICTIONARY as unknown as Record<string, string>)[Key];
	return Known === undefined ? Fallback : t(Key);
};

// Value - the text a change event carries. The DOM overload of createElement
// cannot infer the element type from a string tag, so the event arrives as
// unknown and the field is read defensively.
const Value = (Event: unknown): string => {
	const Target = (Event as { target?: unknown } | null)?.target;
	const Text = (Target as { value?: unknown } | null)?.value;
	return typeof Text === "string" ? Text : "";
};

// Key - the key name a keyboard event carries, read the same defensive way.
const Key = (Event: unknown): string => {
	const Named = (Event as { key?: unknown } | null)?.key;
	return typeof Named === "string" ? Named : "";
};

// Label - the conversation's stored title, or the session id's short tail when
// the ledger stored none.
const Label = (Row: CostContributionRow): string => {
	const Title = S(Row.title);
	switch (true) {
		case Title !== "":
			return Title;
		default:
			return ShortSession(S(Row.sessionId));
	}
};

// MoneyCell - one money column of either table: the same formatter and the
// same class every money cell of the panel renders with.
const MoneyCell = (
	Cell: string,
	Value: number,
	Currency: string,
	Title?: string,
): ReturnType<typeof createElement> =>
	createElement(
		"td",
		{ className: Cell, ...(Title === undefined ? {} : { title: Title }) },
		createElement("span", { className: "playform-cost-money" }, Price(Value, Currency)),
	);

// ModelsCell - the conversation's models: the first as one pill and the count
// of the further ones beside it; the tooltip names every model.
const ModelsCell = (Cell: string, List: readonly string[]): ReturnType<typeof createElement> => {
	switch (true) {
		case List.length === 0:
			return createElement("td", { className: Cell }, Dash);
		default: {
			const First = List[0] ?? "";
			return createElement(
				"td",
				{ className: Cell, title: List.join(", ") },
				createElement(
					"div",
					{ className: "playform-cost-pills", style: { flexWrap: "nowrap" } },
					createElement("span", { className: "playform-cost-pill" }, First),
					List.length > 1
						? createElement(
								"span",
								{
									className: "playform-cost-pill playform-cost-pill-muted",
								},
								`+${Count(List.length - 1)}`,
							)
						: null,
				),
			);
		}
	}
};

// StageCell - the stage the file reached in one call: one pill with its tone
// dot, and a dash when the call recorded no touch (the context-only case).
const StageCell = (Cell: string, Stage: string, t: Translate): ReturnType<typeof createElement> => {
	const Title = t("contributions.call.column.stage.title");
	switch (true) {
		case Stage === "":
			return createElement("td", { className: Cell, title: Title }, Dash);
		default:
			return createElement(
				"td",
				{ className: Cell, title: Title },
				createElement(
					"span",
					{ className: "playform-cost-pill" },
					createElement("span", {
						className: `playform-cost-dot ${ToneClass(StageTone(Stage))}`,
					}),
					Word(`stage.${Stage}`, Stage, t),
				),
			);
	}
};

// EvidenceCell - the one evidence fact of a call row: a touched call paid the
// file's direct share and says "touched"; a call that only carried the file
// paid the amortized share and says "context carry". The muted pill separates
// the weaker evidence without adding a color of its own.
const EvidenceCell = (
	Cell: string,
	Touched: boolean,
	t: Translate,
): ReturnType<typeof createElement> =>
	createElement(
		"td",
		{
			className: Cell,
			title: Touched
				? t("contributions.evidence.touched.title")
				: t("contributions.evidence.carry.title"),
		},
		createElement(
			"span",
			{
				className: Touched
					? "playform-cost-pill"
					: "playform-cost-pill playform-cost-pill-muted",
			},
			Touched ? t("contributions.evidence.touched") : t("contributions.evidence.carry"),
		),
	);

// CallRow - one call of the expanded conversation: the turn and step with the
// start time in the title, the model, the token total with its four buckets in
// the title, the three money figures, the stage and the evidence label.
const CallRow = (
	Row: CostFileCallRow,
	Currency: string,
	t: Translate,
): ReturnType<typeof createElement> => {
	const Cell = "playform-cost-step-metric";
	const Identifier = [S(Row.provider), S(Row.model)].filter((Part) => Part !== "").join("/");
	const Input = N(Row.input);
	const Output = N(Row.output);
	const CacheRead = N(Row.cacheRead);
	const CacheWrite = N(Row.cacheWrite);
	return createElement(
		"tr",
		{ key: N(Row.callId) },
		createElement(
			"td",
			{
				className: Cell,
				title: t("step.started.title", { time: Stamp(Epoch(Row.at)) }),
			},
			createElement(
				"span",
				{ className: "playform-cost-num" },
				`${t("turn.label", { turn: N(Row.turn) })} / ${t("step.label", {
					step: N(Row.step),
				})}`,
			),
		),
		createElement(
			"td",
			{ className: Cell, title: Identifier },
			Identifier === ""
				? Dash
				: createElement("span", { className: "playform-cost-model-text" }, Identifier),
		),
		createElement(
			"td",
			{
				className: Cell,
				title: t("contributions.call.tokens.title", {
					input: Count(Input),
					output: Count(Output),
					cacheRead: Count(CacheRead),
					cacheWrite: Count(CacheWrite),
				}),
			},
			createElement(
				"span",
				{ className: "playform-cost-num" },
				CountShort(Input + Output + CacheRead + CacheWrite),
			),
		),
		MoneyCell(Cell, N(Row.direct), Currency),
		MoneyCell(Cell, N(Row.amortized), Currency),
		MoneyCell(Cell, N(Row.total), Currency),
		StageCell(Cell, S(Row.stage), t),
		EvidenceCell(Cell, Row.touched === true, t),
	);
};

// CallTable - the expanded conversation's calls, or the one line of the
// loading, the failed and the empty read. The sub-table is a table of its own,
// because its grain is the call and the conversation table's grain is the
// conversation.
const CallTable = (
	Entry: Reading<CostFileCallRow> | undefined,
	Columns: number,
	Currency: string,
	t: Translate,
): ReturnType<typeof createElement> => {
	const Phase: "idle" | "loading" | "ready" | "failed" =
		Entry === undefined ? "loading" : Entry.Phase;
	const Rows: readonly CostFileCallRow[] = Entry === undefined ? [] : Entry.Rows;
	const Body = ((): ReturnType<typeof createElement> => {
		switch (true) {
			case Phase === "idle":
			case Phase === "loading":
				return createElement(
					"div",
					{ className: "playform-cost-block-empty", role: "status" },
					t("contributions.calls.loading"),
				);
			case Phase === "failed":
				return createElement(
					"div",
					{ className: "playform-cost-block-empty" },
					t("contributions.calls.failed"),
				);
			case Rows.length === 0:
				return createElement(
					"div",
					{ className: "playform-cost-block-empty" },
					t("contributions.calls.empty"),
				);
			default:
				return createElement(
					"table",
					{
						className: "playform-cost-table",
						"aria-label": t("contributions.calls.title"),
					},
					createElement(
						"colgroup",
						{},
						CALL_COLUMNS.map((Id) =>
							createElement("col", {
								key: Id,
								style: { width: `${CALL_WIDTHS[Id]}%` },
							}),
						),
					),
					createElement(
						"thead",
						{},
						createElement(
							"tr",
							{},
							CALL_COLUMNS.map((Id) => {
								const Title = CALL_TITLES[Id];
								return createElement(
									"th",
									{
										key: Id,
										className:
											Id === "scope"
												? "playform-cost-th-left"
												: "playform-cost-th",
										...(Title === null ? {} : { title: t(Title) }),
									},
									t(CALL_LABELS[Id]),
								);
							}),
						),
					),
					createElement(
						"tbody",
						{},
						Rows.map((Row) => CallRow(Row, Currency, t)),
					),
				);
		}
	})();
	return createElement(
		"tr",
		{},
		createElement("td", { className: "playform-cost-detail-cell", colSpan: Columns }, Body),
	);
};

type ContributionsPageProps = {
	path: string;
	currency: string;
	t: Translate;
};

export default function ContributionsPage(
	Props: ContributionsPageProps,
): ReturnType<typeof createElement> {
	const t = Props.t;
	const Currency = Props.currency === "" ? "USD" : Props.currency;
	const Cell = "playform-cost-step-metric";
	const [Needle, SetNeedle] = useState<string>(Props.path);
	const [Applied, SetApplied] = useState<string>(Props.path.trim());
	const [Attempt, SetAttempt] = useState(0);
	const [Read, SetRead] = useState<Reading<CostContributionRow>>({
		Phase: "idle",
		Rows: [],
	});
	const [Calls, SetCalls] = useState<Readonly<Record<string, Reading<CostFileCallRow>>>>({});
	const [Open, SetOpen] = useState<ReadonlySet<string>>(() => new Set<string>());

	// The one conversation-level read: the applied path alone drives it, so a
	// half-typed path never reaches the ledger. A new applied path replaces
	// every row the pane holds - the open conversations and their cached calls
	// belong to the previous file - and the attempt token lets a repeated Read
	// of the same path retry a failed answer.
	useEffect(() => {
		let Live = true;
		SetOpen(new Set<string>());
		SetCalls({});
		switch (true) {
			case Applied === "":
				SetRead({ Phase: "idle", Rows: [] });
				return () => {
					Live = false;
				};
			default: {
				SetRead({ Phase: "loading", Rows: [] });
				new Promise<readonly CostContributionRow[]>((Done) => {
					Done(Contributions(Applied));
				})
					.then((Rows) => {
						if (!Live) return;
						SetRead({ Phase: "ready", Rows });
					})
					.catch(() => {
						if (!Live) return;
						SetRead({ Phase: "failed", Rows: [] });
					});
				return () => {
					Live = false;
				};
			}
		}
	}, [Applied, Attempt]);

	// Apply - the one action that opens a read: the trimmed field becomes the
	// applied path, and the attempt token makes a second Read of the same path
	// run the effect again.
	const Apply = useCallback(() => {
		SetApplied(Needle.trim());
		SetAttempt((Current) => Current + 1);
	}, [Needle]);

	// Toggle - one conversation row's expansion: a collapse closes the row and
	// keeps the answer cached; an expand fetches the conversation's calls on
	// the first open and reuses the cached rows on every later one, so a
	// reopened row never asks the route twice.
	const Toggle = (SessionId: string): void => {
		const Expanded = Open.has(SessionId);
		SetOpen((Current) => {
			const Next = new Set(Current);
			switch (true) {
				case Expanded:
					Next.delete(SessionId);
					break;
				default:
					Next.add(SessionId);
					break;
			}
			return Next;
		});
		switch (true) {
			case Expanded:
			case Calls[SessionId] !== undefined:
				return;
			default: {
				SetCalls((Current) => ({
					...Current,
					[SessionId]: { Phase: "loading", Rows: [] },
				}));
				new Promise<readonly CostFileCallRow[]>((Done) => {
					Done(FileCalls(Applied, SessionId));
				})
					.then((Rows) => {
						SetCalls((Current) => ({
							...Current,
							[SessionId]: { Phase: "ready", Rows },
						}));
					})
					.catch(() => {
						SetCalls((Current) => ({
							...Current,
							[SessionId]: { Phase: "failed", Rows: [] },
						}));
					});
				return;
			}
		}
	};

	// The conversation table: one row per conversation that paid for the file,
	// with the toggle in the conversation cell, its calls, its money, its share
	// of the file's lifetime and its models. The calls sub-table follows the
	// open row.
	const Table = createElement(
		"table",
		{ className: "playform-cost-table", "aria-label": t("contributions.conversations") },
		createElement(
			"colgroup",
			{},
			CONVERSATION_COLUMNS.map((Id) =>
				createElement("col", {
					key: Id,
					style: { width: `${CONVERSATION_WIDTHS[Id]}%` },
				}),
			),
		),
		createElement(
			"thead",
			{},
			createElement(
				"tr",
				{},
				CONVERSATION_COLUMNS.map((Id) => {
					const Title = CONVERSATION_TITLES[Id];
					return createElement(
						"th",
						{
							key: Id,
							className:
								Id === "conversation"
									? "playform-cost-th-left"
									: "playform-cost-th",
							...(Title === null ? {} : { title: t(Title) }),
						},
						t(CONVERSATION_LABELS[Id]),
					);
				}),
			),
		),
		createElement(
			"tbody",
			{},
			Read.Rows.map((Row) => {
				const SessionId = S(Row.sessionId);
				const Expanded = Open.has(SessionId);
				const LabelText = t(Expanded ? "contributions.collapse" : "contributions.expand", {
					conversation: Label(Row),
				});
				const Cells = createElement(
					"tr",
					{},
					createElement(
						"td",
						{ className: Cell, title: SessionId },
						createElement(
							"button",
							{
								type: "button",
								className: "playform-cost-row-toggle",
								"aria-expanded": Expanded,
								"aria-label": LabelText,
								title: LabelText,
								onClick: () => Toggle(SessionId),
							},
							Label(Row),
						),
					),
					createElement(
						"td",
						{ className: Cell },
						createElement(
							"span",
							{ className: "playform-cost-num" },
							Count(N(Row.calls)),
						),
					),
					MoneyCell(Cell, N(Row.direct), Currency),
					MoneyCell(Cell, N(Row.amortized), Currency),
					MoneyCell(Cell, N(Row.total), Currency),
					createElement(
						"td",
						{ className: Cell, title: t("contributions.column.share.title") },
						createElement(
							"span",
							{ className: "playform-cost-num" },
							Rate(N(Row.share)),
						),
					),
					ModelsCell(Cell, Models(Row.models)),
				);
				return createElement(
					Fragment,
					{ key: SessionId },
					Cells,
					Expanded
						? CallTable(Calls[SessionId], CONVERSATION_COLUMNS.length, Currency, t)
						: null,
				);
			}),
		),
	);

	// The conversation level's body: the table, or the one line of the idle,
	// the loading, the failed and the empty read.
	const Conversations = ((): ReturnType<typeof createElement> => {
		switch (true) {
			case Read.Phase === "idle":
				return createElement(
					"div",
					{ className: "playform-cost-block-empty" },
					t("contributions.idle"),
				);
			case Read.Phase === "loading":
				return createElement(
					"div",
					{ className: "playform-cost-block-empty", role: "status" },
					t("contributions.loading"),
				);
			case Read.Phase === "failed":
				return createElement(
					"div",
					{ className: "playform-cost-block-empty" },
					t("contributions.failed"),
				);
			case Read.Rows.length === 0:
				return createElement(
					"div",
					{ className: "playform-cost-block-empty" },
					t("contributions.empty"),
				);
			default:
				return Table;
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
					t("contributions.title"),
				),
				createElement(
					"span",
					{ className: "playform-cost-block-meta" },
					t("contributions.hint"),
				),
			),
			createElement(
				"div",
				{
					className: "playform-cost-controls",
					role: "group",
					"aria-label": t("contributions.title"),
				},
				createElement("input", {
					type: "text",
					className: "playform-cost-button",
					// The chip face carries cursor: pointer; a text field must not.
					style: { cursor: "text" },
					value: Needle,
					placeholder: t("contributions.path"),
					"aria-label": t("contributions.path"),
					onChange: (Event: unknown) => SetNeedle(Value(Event)),
					onKeyDown: (Event: unknown) => {
						if (Key(Event) === "Enter") Apply();
					},
				}),
				createElement(
					"button",
					{ type: "button", className: "playform-cost-button", onClick: Apply },
					t("contributions.read"),
				),
			),
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
					t("contributions.conversations"),
				),
				Applied === ""
					? null
					: createElement(
							"span",
							{ className: "playform-cost-block-meta", title: Applied },
							BaseName(Applied),
						),
			),
			Conversations,
		),
	);
}
