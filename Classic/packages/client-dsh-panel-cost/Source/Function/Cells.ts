// Cells - the six cell renderers the table rows compose, exported as one
// default object in the Slots.ts pattern: Scope, Model, Files, Money, Bar
// and Alloc. Every renderer emits exactly the classes and locale keys of
// the design's sections 2 to 6, reads every field defensively, and never
// throws on a malformed envelope.
import Clock from "@Function/Clock";
import CountShort from "@Function/CountShort";
import Lines from "@Function/Lines";
import Price from "@Function/Price";
import Share from "@Function/Share";
import type CostBuckets from "@Interface/Buckets";
import type { Translate } from "@Interface/Translate";
import Dash from "@Variable/Dash";
import { createElement } from "react";

const FilePillLimit = 3;

type Marker = {
	Class: string;
	Text: string;
	Title?: string;
};

type ScopeCellProps = {
	Cell: string;
	Toggle?: {
		Expanded: boolean;
		Label: string;
		Aria: string;
		Title: string;
		OnToggle: () => void;
	};
	Label?: string;
	Clock?: { Text: string; Title: string };
	Hint?: string;
	Markers: readonly Marker[];
};

type ModelCellProps = {
	Cell: string;
	Provider: string;
	Model: string;
	Mode?: string;
	Region?: string;
	Tier?: number | null;
	When?: { Text: string };
	Title?: string;
};

type FilePill = {
	Name: string;
	Tone: number;
	Count: number;
	Lines: number | null;
};

type FilesCellProps = {
	Cell: string;
	Pills: readonly FilePill[];
	Fail: boolean;
	Saving: number;
	Calls: number;
	Tokens: number;
	Currency: string;
	ShowMix: boolean;
	t: Translate;
};

type MoneyCellProps = {
	Cell: string;
	Value: number;
	Currency: string;
	Title?: string;
};

type AllocCellProps = {
	Cell: string;
	Direct: number;
	Amortized: number;
	Has: boolean;
	Currency: string;
	t: Translate;
};

type BarCellProps = {
	Cell: string;
	Track: string;
	Total: number;
	Cost: CostBuckets;
	Scale: number;
	Currency: string;
	Start: number | null;
	t: Translate;
};

const ToneClass = (Tone: number): string => `playform-cost-tone${Tone}`;

const MarkerSpan = (Marker: Marker, Index: number): ReturnType<typeof createElement> =>
	createElement(
		"span",
		{
			key: Index,
			className: Marker.Class,
			...(Marker.Title === undefined ? {} : { title: Marker.Title }),
		},
		Marker.Text,
	);

const Scope = (Props: ScopeCellProps): ReturnType<typeof createElement> => {
	const Toggle = Props.Toggle;
	const ClockCell = Props.Clock;
	const Hint = Props.Hint;
	return createElement(
		"td",
		{ className: Props.Cell },
		Toggle === undefined
			? (Props.Label ?? null)
			: createElement(
					"button",
					{
						type: "button",
						className: "playform-cost-row-toggle",
						"aria-expanded": Toggle.Expanded,
						"aria-label": Toggle.Aria,
						title: Toggle.Title,
						onClick: (Event) => {
							Event.stopPropagation();
							Toggle.OnToggle();
						},
					},
					Toggle.Label,
				),
		ClockCell === undefined
			? null
			: createElement(
					"span",
					{ className: "playform-cost-turn-clock", title: ClockCell.Title },
					ClockCell.Text,
				),
		Hint === undefined
			? null
			: createElement("span", { className: "playform-cost-detail-hint" }, Hint),
		Props.Markers.map(MarkerSpan),
	);
};

const Model = (Props: ModelCellProps): ReturnType<typeof createElement> => {
	const Mode = Props.Mode;
	const Region = Props.Region;
	const Tier = Props.Tier;
	const When = Props.When;
	return createElement(
		"td",
		{
			className: Props.Cell,
			...(Props.Title === undefined ? {} : { title: Props.Title }),
		},
		When === undefined
			? null
			: createElement(
					"span",
					{ className: "playform-cost-step-when" },
					createElement("span", { className: "playform-cost-step-clock" }, When.Text),
				),
		createElement(
			"span",
			{ className: "playform-cost-model-clip" },
			createElement("span", { className: "playform-cost-model-pill" }, Props.Provider),
			createElement("span", { className: "playform-cost-model-text" }, Props.Model),
			Mode === undefined || Mode === ""
				? null
				: createElement("span", { className: "playform-cost-pill" }, Mode),
			Region === undefined || Region === ""
				? null
				: createElement("span", { className: "playform-cost-pill" }, Region),
			typeof Tier === "number"
				? createElement("span", { className: "playform-cost-pill" }, String(Tier))
				: null,
		),
	);
};

const Files = (Props: FilesCellProps): ReturnType<typeof createElement> => {
	const Shown = Props.Pills.slice(0, FilePillLimit);
	const Extra = Props.Pills.length - Shown.length;
	const Quiet = !Props.Fail && Props.Pills.length === 0 && !(Props.Saving > 0);
	return createElement(
		"td",
		{ className: Props.Cell },
		Quiet
			? createElement(
					"span",
					{ className: "playform-cost-files-clip" },
					createElement(
						"span",
						{ className: "playform-cost-files-stat" },
						Props.t("files.contextOnly", { tokens: CountShort(Props.Tokens) }),
					),
				)
			: [
					createElement(
						"div",
						{
							className: "playform-cost-pills",
							...(Props.Pills.length === 0
								? {}
								: {
										title: Props.t("files.title", {
											calls: Props.Calls,
											files: Props.Pills.map((Pill) => Pill.Name).join(" | "),
										}),
									}),
						},
						Props.Fail
							? createElement(
									"span",
									{ className: "playform-cost-fail-pill" },
									Props.t("state.failed"),
								)
							: null,
						Shown.map((Pill, Index) =>
							createElement(
								"span",
								{
									key: Index,
									className: "playform-cost-pill",
									...(Pill.Lines === null || Pill.Lines === 0
										? {}
										: {
												title: Props.t("files.lines", {
													lines: Lines(Pill.Lines),
												}),
											}),
								},
								createElement("span", {
									className: `playform-cost-dot ${ToneClass(Pill.Tone)}`,
								}),
								Pill.Name,
							),
						),
						Extra > 0
							? createElement(
									"span",
									{ className: "playform-cost-pill playform-cost-pill-muted" },
									Props.t("files.more", { count: Extra }),
								)
							: null,
						Props.Saving > 0
							? createElement(
									"span",
									{
										className: "playform-cost-pill playform-cost-pill-muted",
										title: Props.t("files.saving.title"),
									},
									Props.t("files.saving", {
										value: Price(Props.Saving, Props.Currency),
									}),
								)
							: null,
					),
					Props.ShowMix && Props.Pills.length > 0
						? createElement(
								"div",
								{ className: "playform-cost-mix" },
								Props.Pills.map((Pill, Index) =>
									createElement("span", {
										key: Index,
										className: `playform-cost-mix-segment ${ToneClass(Pill.Tone)}`,
										style: { flexGrow: Pill.Count },
										title: Props.t("files.count", { count: Pill.Count }),
									}),
								),
							)
						: null,
				],
	);
};

const Money = (Props: MoneyCellProps): ReturnType<typeof createElement> =>
	createElement(
		"td",
		{
			className: Props.Cell,
			...(Props.Title === undefined ? {} : { title: Props.Title }),
		},
		createElement(
			"span",
			{ className: "playform-cost-money" },
			Price(Props.Value, Props.Currency),
		),
	);

const Alloc = (Props: AllocCellProps): ReturnType<typeof createElement> =>
	createElement(
		"td",
		{
			className: Props.Cell,
			...(Props.Has ? {} : { title: Props.t("unknown") }),
		},
		Props.Has
			? [
					createElement(
						"span",
						{ key: "direct", className: "playform-cost-num" },
						Price(Props.Direct, Props.Currency),
					),
					createElement(
						"span",
						{ key: "amortized", className: "playform-cost-num-delta" },
						Price(Props.Amortized, Props.Currency),
					),
				]
			: Dash,
	);

const Segment = (
	Key: string,
	Class: string,
	Value: number,
): ReturnType<typeof createElement> | null =>
	Value > 0
		? createElement("span", {
				key: Key,
				className: `playform-cost-bar-segment ${Class}`,
				style: { flexGrow: Value },
			})
		: null;

const Bar = (Props: BarCellProps): ReturnType<typeof createElement> => {
	const Figure = (Value: number): number =>
		typeof Value === "number" && Number.isFinite(Value) ? Value : 0;
	const Total = Figure(Props.Total);
	const CacheRead = Math.max(0, Figure(Props.Cost.cacheRead));
	const Input = Math.max(0, Figure(Props.Cost.input));
	const Output = Math.max(0, Figure(Props.Cost.output));
	const Other = Math.max(0, Total - CacheRead - Input - Output);
	const Tag = (Value: number): string => Price(Value, Props.Currency);
	const Parts = [
		...(Props.Start === null ? [] : [Props.t("bar.start", { clock: Clock(Props.Start) })]),
		Props.t("bar.cacheRead", { value: Tag(CacheRead) }),
		Props.t("bar.input", { value: Tag(Input) }),
		Props.t("bar.output", { value: Tag(Output) }),
		Props.t("bar.other", { value: Tag(Other) }),
		Props.t("bar.total", { value: Tag(Total) }),
	];
	return createElement(
		"td",
		{ className: Props.Cell, title: Parts.join(" | ") },
		createElement(
			"div",
			{ className: "playform-cost-bar-wrap" },
			createElement(
				"div",
				{ className: Props.Track },
				createElement(
					"div",
					{
						className: "playform-cost-bar-fill",
						style: { width: `${Math.round(Share(Total, Props.Scale) * 100)}%` },
					},
					Segment("cacheRead", "playform-cost-bar-cache", CacheRead),
					Segment("input", "playform-cost-bar-input", Input),
					Segment("output", "playform-cost-bar-output", Output),
					Segment("other", "playform-cost-bar-other", Other),
				),
			),
			createElement("span", { className: "playform-cost-bar-value" }, Tag(Total)),
		),
	);
};

export default { Scope, Model, Files, Money, Bar, Alloc } as const;
