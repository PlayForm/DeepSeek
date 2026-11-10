/**
 * @module FileTable
 *
 * The Files view table: one row per file the conversation touched, the ten columns of the
 * research's section 5, the share bar that puts this conversation over the file's lifetime, and
 * the totals row.
 *
 * @remarks
 * A file row expands into the conversations that contributed to that file's cost: the toggle in
 * the File cell fetches the engine's contribution read the first time the row opens and caches the
 * answer per path, so a reopen renders the same rows without a second request. The expansion is
 * the table's own state - the view above it never learns which row is open.
 */
import { Tooltip } from "@deepseek-ai/dsh-client-ui-primitives";
import Count from "@Function/Count";
import { Contributions } from "@Function/Fetch";
import Lines from "@Function/Lines";
import Price from "@Function/Price";
import Rate from "@Function/Rate";
import Stamp from "@Function/Stamp";
import type CostContributionRow from "@Interface/ContributionRow";
import type CostFileRow from "@Interface/FileRow";
import type { Translate } from "@Interface/Translate";
import Dash from "@Variable/Dash";
import EN_DICTIONARY from "@Variable/Locale-en.json";
import { createElement, Fragment, useState } from "react";

/**
 * The one column definition: the names are the shipped locale keys under `files.column`, in the
 * shipped order, and the width record beside it carries the shipped column widths. A new column is
 * one tuple entry plus its width.
 */
const COLUMNS = [
	"file",
	"touches",
	"lines",
	"lifetime",
	"before",
	"conversation",
	"turn",
	"share",
	"stage",
	"verdict",
] as const;

type Column = (typeof COLUMNS)[number];

const COLUMN_WIDTHS: Record<Column, number> = {
	file: 20,
	touches: 14,
	lines: 8,
	lifetime: 8,
	before: 8,
	conversation: 9,
	turn: 8,
	share: 11,
	stage: 8,
	verdict: 6,
};

/**
 * The stage tone map the turn and step rows share: the same palette, keyed by the same stage
 * words, so a file's first stage reads as the same color in every view.
 */
const StageTones: Record<string, number> = {
	discover: 5,
	read: 0,
	reread: 0,
	edit: 2,
	verify: 1,
	revert: 3,
};

const N = (Value: unknown): number =>
	typeof Value === "number" && Number.isFinite(Value) ? Value : 0;

const S = (Value: unknown): string => (typeof Value === "string" ? Value : "");

const Epoch = (Value: unknown): number | null =>
	typeof Value === "number" && Number.isFinite(Value) ? Value : null;

/**
 * StageList - one row's stage set, read defensively: the envelope may carry no stage list at all,
 * and a stage that is not a string is not a stage.
 */
const StageList = (Value: unknown): readonly string[] =>
	Array.isArray(Value) ? Value.filter((Item: unknown) => typeof Item === "string") : [];

const BaseName = (Path: string): string => {
	const Cut = Path.lastIndexOf("/");
	return Cut === -1 ? Path : Path.slice(Cut + 1);
};

/**
 * ShortSession - the session id's short tail: the last eight characters of an id the ledger stored
 * no title for, prefixed with an ellipsis when the id is longer, so the conversation cell stays a
 * column and not a paragraph.
 */
const ShortSession = (SessionId: string): string =>
	SessionId.length <= 8 ? SessionId : `...${SessionId.slice(-8)}`;

/**
 * Models - one contribution row's model list, read defensively: the rows cross the route as JSON,
 * and an entry that is not a string is not a model.
 */
const Models = (Value: unknown): readonly string[] =>
	Array.isArray(Value) ? Value.filter((Item: unknown) => typeof Item === "string") : [];

const ToneClass = (Tone: number): string => `playform-cost-tone${Tone}`;

const StageTone = (Stage: string): number => StageTones[Stage] ?? 7;

/**
 * Word - the shipped `stage.*` and `files.verdict.*` words; a word the dictionary does not carry
 * is shown as the ledger spelled it rather than as a key.
 */
const Word = (Key: string, Fallback: string, t: Translate): string => {
	const Known = (EN_DICTIONARY as unknown as Record<string, string>)[Key];
	return Known === undefined ? Fallback : t(Key);
};

/**
 * VerdictClass - the one tone a verdict carries: a change that survived, a change that was
 * reverted, and the neutral read.
 */
const VerdictClass = (Verdict: string): string | null => {
	switch (true) {
		case Verdict === "changed":
			return "playform-cost-added";
		case Verdict === "reverted":
			return "playform-cost-removed";
		default:
			return null;
	}
};

/**
 * ContributionEntry - one file's contribution read as the table holds it: the phase the expanded
 * row renders (the fetch is lazy, so an open row starts in "loading") and the rows the answer
 * carried.
 */
type ContributionEntry = {
	Phase: "loading" | "ready" | "failed";
	Rows: readonly CostContributionRow[];
};

/**
 * The contribution sub-table's one column definition: the names are the locale keys under
 * `files.contributions.column`, in the shipped order.
 */
const CONTRIBUTION_COLUMNS = [
	"conversation",
	"calls",
	"direct",
	"amortized",
	"total",
	"share",
	"models",
] as const;

/**
 * ContributionLabel - the conversation's stored title, or the session id's short tail when the
 * ledger stored none.
 */
const ContributionLabel = (Row: CostContributionRow): string => {
	const Title = S(Row.title);
	switch (true) {
		case Title !== "":
			return Title;
		default:
			return ShortSession(S(Row.sessionId));
	}
};

/**
 * ModelsCell - the contribution's models: the first as one pill and the count of the further ones
 * beside it; the tooltip names every model.
 */
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

/**
 * ContributionRow - the expanded row under one file: the head naming the file, then the
 * conversations that paid for it - the conversation, its calls, the direct and amortized money,
 * their total, its share of the file's lifetime total, and its models - with one line for the
 * loading, the failed, and the empty read.
 */
const ContributionRow = (
	Path: string,
	Entry: ContributionEntry | undefined,
	Currency: string,
	t: Translate,
): ReturnType<typeof createElement> => {
	const Phase: "loading" | "ready" | "failed" = Entry === undefined ? "loading" : Entry.Phase;
	const Rows: readonly CostContributionRow[] = Entry === undefined ? [] : Entry.Rows;
	const Cell = "playform-cost-step-metric";
	const Table = createElement(
		"table",
		{ className: "playform-cost-table" },
		createElement(
			"thead",
			{},
			createElement(
				"tr",
				{},
				CONTRIBUTION_COLUMNS.map((Key) =>
					createElement(
						"th",
						{ key: Key, className: Cell },
						t(`files.contributions.column.${Key}`),
					),
				),
			),
		),
		createElement(
			"tbody",
			{},
			Rows.map((Row, Index) =>
				createElement(
					"tr",
					{ key: Index },
					createElement(
						"td",
						{ className: Cell, title: S(Row.sessionId) },
						ContributionLabel(Row),
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
					createElement(
						"td",
						{ className: Cell },
						createElement(
							"span",
							{ className: "playform-cost-money" },
							Price(N(Row.direct), Currency),
						),
					),
					createElement(
						"td",
						{ className: Cell },
						createElement(
							"span",
							{ className: "playform-cost-money" },
							Price(N(Row.amortized), Currency),
						),
					),
					createElement(
						"td",
						{ className: Cell },
						createElement(
							"span",
							{ className: "playform-cost-money" },
							Price(N(Row.total), Currency),
						),
					),
					createElement(
						"td",
						{ className: Cell },
						createElement(
							"span",
							{ className: "playform-cost-num" },
							Rate(N(Row.share)),
						),
					),
					ModelsCell(Cell, Models(Row.models)),
				),
			),
		),
	);
	const Body = ((): ReturnType<typeof createElement> => {
		switch (true) {
			case Phase === "loading":
				return createElement(
					"div",
					{ className: "playform-cost-block-empty", role: "status" },
					t("files.contributions.loading"),
				);
			case Phase === "failed":
				return createElement(
					"div",
					{ className: "playform-cost-block-empty" },
					t("files.contributions.failed"),
				);
			case Rows.length === 0:
				return createElement(
					"div",
					{ className: "playform-cost-block-empty" },
					t("files.contributions.empty"),
				);
			default:
				return Table;
		}
	})();
	return createElement(
		"tr",
		{},
		createElement(
			"td",
			{ className: "playform-cost-detail-cell", colSpan: COLUMNS.length },
			createElement(
				"div",
				{ className: "playform-cost-detail-head" },
				createElement(
					"span",
					{ className: "playform-cost-detail-title" },
					t("files.contributions.title"),
				),
				createElement(
					"span",
					{ className: "playform-cost-block-meta" },
					` - ${BaseName(Path)}`,
				),
			),
			Body,
		),
	);
};

type FileTableProps = {
	Files: readonly CostFileRow[];
	Currency: string;
	t: Translate;
};

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

/**
 * TouchPill - one compact kind pill: the kind's locale word and its count through Count. No tone
 * dot: three of these share a narrow column, and the word is what tells them apart.
 */
const TouchPill = (Key: string, Value: number, t: Translate): ReturnType<typeof createElement> =>
	createElement(
		"span",
		{ key: Key, className: "playform-cost-pill" },
		`${t(Key)} ${Count(Value)}`,
	);

/**
 * ShareCell - this conversation over the file's lifetime: a linear bar (a share is a proportion,
 * not a magnitude) with the percentage beside it.
 */
const ShareCell = (
	Cell: string,
	Total: number,
	Lifetime: number,
	t: Translate,
): ReturnType<typeof createElement> => {
	const Ratio = Lifetime > 0 ? Math.max(0, Math.min(1, Total / Lifetime)) : null;
	return createElement(
		"td",
		{ className: Cell, title: t("files.column.share.title") },
		createElement(
			"div",
			{ className: "playform-cost-bar-wrap" },
			createElement(
				"div",
				{ className: "playform-cost-bar-step" },
				Ratio === null
					? null
					: createElement(
							"div",
							{
								className: "playform-cost-bar-fill",
								style: { width: `${Math.round(Ratio * 100)}%` },
							},
							createElement("span", {
								className: "playform-cost-bar-segment playform-cost-bar-input",
								style: { flexGrow: 1 },
							}),
						),
			),
			createElement("span", { className: "playform-cost-bar-value" }, Rate(Ratio)),
		),
	);
};

/**
 * StageCell - the first stage as one pill, with the count of the further stages beside it; the
 * tooltip names every stage the file reached.
 */
const StageCell = (
	Cell: string,
	Stages: readonly string[],
	t: Translate,
): ReturnType<typeof createElement> => {
	const Title = t("files.column.stage.title");
	switch (true) {
		case Stages.length === 0:
			return createElement("td", { className: Cell, title: Title }, Dash);
		default: {
			const First = Stages[0] ?? "";
			return createElement(
				"td",
				{
					className: Cell,
					title: Stages.map((Stage) => Word(`stage.${Stage}`, Stage, t)).join(" | "),
				},
				createElement(
					"div",
					{ className: "playform-cost-pills", style: { flexWrap: "nowrap" } },
					createElement(
						"span",
						{ className: "playform-cost-pill" },
						createElement("span", {
							className: `playform-cost-dot ${ToneClass(StageTone(First))}`,
						}),
						Word(`stage.${First}`, First, t),
					),
					Stages.length > 1
						? createElement(
								"span",
								{
									className: "playform-cost-pill playform-cost-pill-muted",
								},
								`+${Count(Stages.length - 1)}`,
							)
						: null,
				),
			);
		}
	}
};

/**
 * VerdictCell - the session outcome as one word, toned for a change that survived and for a change
 * that was reverted.
 */
const VerdictCell = (
	Cell: string,
	Verdict: string,
	t: Translate,
): ReturnType<typeof createElement> => {
	const Title = t("files.column.verdict.title");
	switch (true) {
		case Verdict === "":
			return createElement("td", { className: Cell, title: Title }, Dash);
		default: {
			const Class = VerdictClass(Verdict);
			return createElement(
				"td",
				{ className: Cell, title: Title },
				createElement(
					"span",
					{ ...(Class === null ? {} : { className: Class }) },
					Word(`files.verdict.${Verdict}`, Verdict, t),
				),
			);
		}
	}
};

/**
 * LinesCell - the change contribution: the added lines, the removed lines, and a dash when the
 * conversation changed no line at all.
 */
const LinesCell = (
	Cell: string,
	Added: number,
	Removed: number,
	BytesAdded: number,
	BytesRemoved: number,
	t: Translate,
): ReturnType<typeof createElement> => {
	const Title = t("files.column.lines.title", {
		added: Count(Added),
		removed: Count(Removed),
		bytesAdded: Count(BytesAdded),
		bytesRemoved: Count(BytesRemoved),
	});
	switch (true) {
		case Added === 0 && Removed === 0:
			return createElement("td", { className: Cell, title: Title }, Dash);
		default: {
			const Marks: Array<ReturnType<typeof createElement>> = [];
			if (Added > 0)
				Marks.push(
					createElement(
						"span",
						{ key: "added", className: "playform-cost-added" },
						Lines(Added),
					),
				);
			if (Added > 0 && Removed > 0)
				Marks.push(
					createElement(
						"span",
						{ key: "sep", className: "playform-cost-files-sep" },
						"/",
					),
				);
			if (Removed > 0)
				Marks.push(
					createElement(
						"span",
						{ key: "removed", className: "playform-cost-removed" },
						Lines(-Removed),
					),
				);
			return createElement("td", { className: Cell, title: Title }, Marks);
		}
	}
};

export default function FileTable(Props: FileTableProps): ReturnType<typeof createElement> {
	const t = Props.t;
	const Tag = Props.Currency === "" ? "USD" : Props.Currency;
	const Metric = "playform-cost-step-metric";
	const Plain = "playform-cost-step-files";
	const [Open, SetOpen] = useState<ReadonlySet<string>>(() => new Set<string>());
	const [Cache, SetCache] = useState<Readonly<Record<string, ContributionEntry>>>({});
	let SumTouches = 0;
	let SumAdded = 0;
	let SumRemoved = 0;
	let SumLifetime = 0;
	let SumBefore = 0;
	let SumTotal = 0;
	let SumTurn = 0;
	for (const Row of Props.Files) {
		SumTouches += N(Row.touches);
		SumAdded += N(Row.added);
		SumRemoved += N(Row.removed);
		SumLifetime += N(Row.lifetime);
		SumBefore += N(Row.before);
		SumTotal += N(Row.total);
		SumTurn += N(Row.turn);
	}
	// Toggle - one file row's expansion: a collapse closes the row and keeps
	// the answer cached; an expand fetches the contribution read on the first
	// open and reuses the cached rows on every later one, so a reopened row
	// never asks the route twice.
	const Toggle = (Path: string): void => {
		const Expanded = Open.has(Path);
		SetOpen((Current) => {
			const Next = new Set(Current);
			switch (true) {
				case Expanded:
					Next.delete(Path);
					break;
				default:
					Next.add(Path);
					break;
			}
			return Next;
		});
		switch (true) {
			case Expanded:
			case Cache[Path] !== undefined:
				return;
			default:
				SetCache((Current) => ({
					...Current,
					[Path]: { Phase: "loading", Rows: [] },
				}));
				new Promise<readonly CostContributionRow[]>((Done) => {
					Done(Contributions(Path));
				})
					.then((Rows) => {
						SetCache((Current) => ({
							...Current,
							[Path]: { Phase: "ready", Rows },
						}));
					})
					.catch(() => {
						SetCache((Current) => ({
							...Current,
							[Path]: { Phase: "failed", Rows: [] },
						}));
					});
				return;
		}
	};
	const Entry = (Row: CostFileRow): ReturnType<typeof createElement> => {
		const Path = S(Row.path);
		const Expanded = Open.has(Path);
		const Label = t(Expanded ? "files.collapse" : "files.expand", {
			path: BaseName(Path),
		});
		const Reads = N(Row.reads);
		const Edits = N(Row.edits);
		const Writes = N(Row.writes);
		const Searches = N(Row.searches);
		const Touches = N(Row.touches);
		const Added = N(Row.added);
		const Removed = N(Row.removed);
		const BytesAdded = N(Row.bytesAdded);
		const BytesRemoved = N(Row.bytesRemoved);
		const Lifetime = N(Row.lifetime);
		const Before = N(Row.before);
		const Total = N(Row.total);
		const Turn = N(Row.turn);
		const Stages = StageList(Row.stages);
		const Verdict = S(Row.verdict);
		const Pills: Array<ReturnType<typeof createElement>> = [];
		if (Edits > 0) Pills.push(TouchPill("files.touch.edit", Edits, t));
		if (Writes > 0) Pills.push(TouchPill("files.touch.write", Writes, t));
		if (Reads > 0) Pills.push(TouchPill("files.touch.read", Reads, t));
		const Cells = createElement(
			"tr",
			{},
			createElement(
				"td",
				{ className: Plain, title: Path },
				createElement(
					"button",
					{
						type: "button",
						className: "playform-cost-row-toggle",
						"aria-expanded": Expanded,
						"aria-label": Label,
						title: Label,
						onClick: () => Toggle(Path),
					},
					createElement(Tooltip, {
						label: Path,
						portal: true,
						disabled: Path === "",
						children: createElement(
							"span",
							{
								className: "playform-cost-model-text",
								// The tooltip's anchor contract is all-optional, so the
								// span must name one of its keys for the weak-type
								// check; the primitive clones the child and injects
								// its own handler at runtime.
								onPointerEnter: undefined,
							},
							BaseName(Path),
						),
					}),
				),
			),
			createElement(
				"td",
				{
					className: Plain,
					title: t("files.column.touches.title", {
						touches: Count(Touches),
						reads: Count(Reads),
						edits: Count(Edits),
						writes: Count(Writes),
						searches: Count(Searches),
						first: Stamp(Epoch(Row.firstAt)),
						last: Stamp(Epoch(Row.lastAt)),
					}),
				},
				createElement(
					"div",
					{ className: "playform-cost-pills", style: { flexWrap: "nowrap" } },
					Pills.length === 0
						? createElement(
								"span",
								{
									className: "playform-cost-pill playform-cost-pill-muted",
								},
								t("files.touch.total", { count: Count(Touches) }),
							)
						: Pills,
				),
			),
			LinesCell(Metric, Added, Removed, BytesAdded, BytesRemoved, t),
			MoneyCell(Metric, Lifetime, Tag, t("files.column.lifetime.title")),
			MoneyCell(Metric, Before, Tag, t("files.column.before.title")),
			MoneyCell(Metric, Total, Tag, t("files.column.conversation.title")),
			MoneyCell(Metric, Turn, Tag, t("files.column.turn.title")),
			ShareCell(Metric, Total, Lifetime, t),
			StageCell(Plain, Stages, t),
			VerdictCell(Plain, Verdict, t),
		);
		return createElement(
			Fragment,
			{ key: Path },
			Cells,
			Expanded ? ContributionRow(Path, Cache[Path], Tag, t) : null,
		);
	};
	return createElement(
		"table",
		{ className: "playform-cost-table", "aria-label": t("view.files") },
		createElement(
			"colgroup",
			{},
			COLUMNS.map((Key) =>
				createElement("col", {
					key: Key,
					style: { width: `${COLUMN_WIDTHS[Key]}%` },
				}),
			),
		),
		createElement(
			"thead",
			{},
			createElement(
				"tr",
				{},
				COLUMNS.map((Key, Index) =>
					createElement(
						"th",
						{
							key: Key,
							className: Index === 0 ? "playform-cost-th-left" : "playform-cost-th",
							title: t(`files.column.${Key}.title`),
						},
						t(`files.column.${Key}`),
					),
				),
			),
		),
		createElement(
			"tbody",
			{},
			Props.Files.map((Row) => Entry(Row)),
		),
		createElement(
			"tfoot",
			{},
			createElement(
				"tr",
				{ className: "playform-cost-totals-row" },
				createElement(
					"td",
					{ className: "playform-cost-totals-label" },
					t("files.totals"),
					createElement(
						"span",
						{ className: "playform-cost-totals-meta" },
						` - ${t("files.totals.meta", {
							files: Count(Props.Files.length),
							touches: Count(SumTouches),
						})}`,
					),
				),
				createElement(
					"td",
					{ className: Metric },
					createElement("span", { className: "playform-cost-num" }, Count(SumTouches)),
				),
				createElement(
					"td",
					{ className: Metric },
					createElement(
						"span",
						{ className: "playform-cost-added" },
						`+${Count(SumAdded)}`,
					),
					createElement("span", { className: "playform-cost-files-sep" }, "/"),
					createElement(
						"span",
						{ className: "playform-cost-removed" },
						`-${Count(SumRemoved)}`,
					),
				),
				MoneyCell(Metric, SumLifetime, Tag),
				MoneyCell(Metric, SumBefore, Tag),
				MoneyCell(Metric, SumTotal, Tag),
				MoneyCell(Metric, SumTurn, Tag),
				ShareCell(Metric, SumTotal, SumLifetime, t),
				createElement("td", { className: Metric }),
				createElement("td", { className: Metric }),
			),
		),
	);
}
