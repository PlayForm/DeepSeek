// TurnRow - the turn row: the toggle button, the turn clock, the scope
// markers, the eleven cells with the turn-level classes, and the turn bar
// scaled against the largest turn total of the loaded window.
import Cells from "@Function/Cells";
import CountShort from "@Function/CountShort";
import Price from "@Function/Price";
import Rate from "@Function/Rate";
import Stamp from "@Function/Stamp";
import Dash from "@Variable/Dash";
import type CostBuckets from "@Interface/Buckets";
import type CostTokens from "@Interface/Tokens";
import type CostTurn from "@Interface/Turn";
import type { Translate } from "@Interface/Translate";
import { createElement } from "react";

const CacheMissThreshold = 0.5;

type Marker = {
	Class: string;
	Text: string;
	Title?: string;
};

type TurnRowProps = {
	Turn: CostTurn;
	Open: boolean;
	Scale: number;
	OnToggle: () => void;
	t: Translate;
};

const BaseName = (Path: string): string => {
	const Cut = Path.lastIndexOf("/");
	return Cut === -1 ? Path : Path.slice(Cut + 1);
};

const StageTones: Record<string, number> = {
	discover: 5,
	read: 0,
	reread: 0,
	edit: 2,
	verify: 1,
	revert: 3,
};

const StageTone = (Stage: string | null): number => {
	if (Stage === null) return 7;
	return StageTones[Stage] ?? 7;
};

const Money = (Turn: CostTurn): string => (Turn.currency !== "" ? Turn.currency : "USD");

const Markers = (Turn: CostTurn, t: Translate): readonly Marker[] => {
	const List: Marker[] = [];
	if (Turn.unpriced > 0)
		List.push({
			Class: "playform-cost-state-unpriced",
			Text: t("state.unpriced"),
			Title: t("state.unpriced.title"),
		});
	if (Turn.errors > 0) {
		let Code = "";
		for (const Step of Turn.steps) {
			if (typeof Step.error === "string" && Step.error !== "") {
				Code = Step.error;
				break;
			}
		}
		List.push({
			Class: "playform-cost-state-error",
			Text: t("state.failed"),
			Title: t("state.failed.title", { code: Code === "" ? t("unknown") : Code }),
		});
	}
	if (Turn.retries > 0)
		List.push({
			Class: "playform-cost-state-attempts",
			Text: t("state.attempts", { count: Turn.retries }),
			Title: t("state.attempts.title", { count: Turn.retries }),
		});
	if (Turn.cacheHit !== null && Turn.cacheHit < CacheMissThreshold)
		List.push({
			Class: "playform-cost-state-attempts",
			Text: t("state.cacheMiss"),
			Title: t("state.cacheMiss.title"),
		});
	return List;
};

const TokenCell = (Cell: string, Value: number): ReturnType<typeof createElement> =>
	createElement(
		"td",
		{ className: Cell },
		createElement("span", { className: "playform-cost-num" }, CountShort(Value)),
	);

const CacheCell = (
	Cell: string,
	Tokens: CostTokens,
	Hit: number | null,
	t: Translate,
): ReturnType<typeof createElement> => {
	const Read = typeof Tokens.cacheRead === "number" ? Tokens.cacheRead : 0;
	const Input = typeof Tokens.input === "number" ? Tokens.input : 0;
	const Write = typeof Tokens.cacheWrite === "number" ? Tokens.cacheWrite : 0;
	const Base = Read + Input + Write;
	switch (true) {
		case Base <= 0:
			return createElement("td", { className: Cell, title: t("unknown") }, Dash);
		case Read > 0 || Write > 0:
			return createElement(
				"td",
				{
					className: Cell,
					title: t("cache.detail", {
						read: CountShort(Read),
						input: CountShort(Input),
						write: CountShort(Write),
					}),
				},
				createElement("span", { className: "playform-cost-num" }, Rate(Hit)),
			);
		default:
			return createElement(
				"td",
				{ className: Cell, title: t("column.cache.title") },
				createElement("span", { className: "playform-cost-num" }, Rate(Hit)),
			);
	}
};

const OtherTitle = (Cost: CostBuckets, Currency: string, t: Translate): string => {
	const Write = typeof Cost.cacheWrite === "number" ? Cost.cacheWrite : 0;
	const Reasoning = typeof Cost.reasoning === "number" ? Cost.reasoning : 0;
	switch (true) {
		case Write > 0 || Reasoning > 0:
			return t("other.detail", {
				write: Price(Write, Currency),
				reasoning: Price(Reasoning, Currency),
				rest: Price(Math.max(0, Cost.other - Write - Reasoning), Currency),
			});
		default:
			return t("column.other.title");
	}
};

export default function TurnRow(Props: TurnRowProps): ReturnType<typeof createElement> {
	const Turn = Props.Turn;
	const t = Props.t;
	const Tag = Money(Turn);
	const Metric = "playform-cost-turn-metric";
	return createElement(
		"tr",
		{
			className: "playform-cost-turn-row",
			"data-turn": String(Turn.turn),
			title: t("turn.toggle.title"),
			onClick: Props.OnToggle,
		},
		Cells.Scope({
			Cell: "playform-cost-turn-cell",
			Toggle: {
				Expanded: Props.Open,
				Label: t("turn.label", { turn: Turn.turn }),
				Aria: t("turn.toggle.aria", { turn: Turn.turn }),
				Title: t("turn.toggle.title"),
				OnToggle: Props.OnToggle,
			},
			Clock: {
				Text: ` - ${Stamp(Turn.at)}`,
				Title: t("turn.started", { time: Stamp(Turn.at) }),
			},
			Markers: Markers(Turn, t),
		}),
		Cells.Model({
			Cell: "playform-cost-model-cell-turn",
			Provider: Turn.provider,
			Model: Turn.model,
		}),
		Cells.Files({
			Cell: "playform-cost-turn-files",
			Pills: Turn.files.map((Tally) => ({
				Name: BaseName(Tally.key),
				Tone: StageTone(Tally.stage),
				Count: Tally.count,
				Lines: Tally.lines,
			})),
			Fail: Turn.errors > 0,
			Saving: Turn.saving,
			Calls: Turn.steps.length,
			Tokens: Turn.tokens.total,
			Currency: Tag,
			ShowMix: Turn.files.length > 0,
			t,
		}),
		TokenCell(Metric, Turn.tokens.total),
		CacheCell(Metric, Turn.tokens, Turn.cacheHit, t),
		Cells.Money({ Cell: Metric, Value: Turn.cost.cacheRead, Currency: Tag }),
		Cells.Money({ Cell: Metric, Value: Turn.cost.input, Currency: Tag }),
		Cells.Money({ Cell: Metric, Value: Turn.cost.output, Currency: Tag }),
		Cells.Money({
			Cell: Metric,
			Value: Turn.cost.other,
			Currency: Tag,
			Title: OtherTitle(Turn.cost, Tag, t),
		}),
		Cells.Alloc({
			Cell: Metric,
			Direct: Turn.direct,
			Amortized: Turn.amortized,
			Has: Turn.direct !== 0 || Turn.amortized !== 0,
			Currency: Tag,
			t,
		}),
		Cells.Bar({
			Cell: Metric,
			Track: "playform-cost-bar-turn",
			Total: Turn.cost.total,
			Cost: Turn.cost,
			Scale: Props.Scale,
			Currency: Tag,
			Start: null,
			t,
		}),
	);
}
