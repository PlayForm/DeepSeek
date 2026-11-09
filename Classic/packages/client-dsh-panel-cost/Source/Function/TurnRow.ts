// TurnRow - the turn row: the toggle button, the turn clock, the scope
// markers, and one cell per resolved column. The row builds the cell source
// from the turn's own aggregates and lets each column's render build its
// cell, so a hidden or reordered column moves the header and the body
// together.
import type { TurnsCells } from "@Function/Columns";
import Stamp from "@Function/Stamp";
import type { ResolvedTable } from "@Interface/Table";
import type { Translate } from "@Interface/Translate";
import type CostTurn from "@Interface/Turn";
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
	Resolved: ResolvedTable<TurnsCells>;
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

export default function TurnRow(Props: TurnRowProps): ReturnType<typeof createElement> {
	const Turn = Props.Turn;
	const t = Props.t;
	const Tag = Money(Turn);
	const Metric = "playform-cost-turn-metric";
	const Row: TurnsCells = {
		Key: `turn:${Turn.turn}`,
		scope: {
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
		},
		model: {
			Cell: "playform-cost-model-cell-turn",
			Provider: Turn.provider,
			Model: Turn.model,
		},
		files: {
			Cell: "playform-cost-turn-files",
			Pills: Turn.files.map((Tally) => ({
				Name: BaseName(Tally.key),
				Path: Tally.key,
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
		},
		tokens: { Cell: Metric, Value: Turn.tokens.total },
		cache: { Cell: Metric, Tokens: Turn.tokens, Hit: Turn.cacheHit },
		cacheRead: { Cell: Metric, Value: Turn.cost.cacheRead, Currency: Tag },
		input: { Cell: Metric, Value: Turn.cost.input, Currency: Tag },
		output: { Cell: Metric, Value: Turn.cost.output, Currency: Tag },
		other: { Cell: Metric, Value: Turn.cost.other, Currency: Tag, Cost: Turn.cost },
		allocation: {
			Cell: Metric,
			Direct: Turn.direct,
			Amortized: Turn.amortized,
			Has: Turn.direct !== 0 || Turn.amortized !== 0,
			Currency: Tag,
		},
		total: {
			Cell: Metric,
			Track: "playform-cost-bar-turn",
			Total: Turn.cost.total,
			Cost: Turn.cost,
			Scale: Props.Scale,
			Currency: Tag,
			Start: null,
		},
	};
	return createElement(
		"tr",
		{
			className: "playform-cost-turn-row",
			"data-turn": String(Turn.turn),
			title: t("turn.toggle.title"),
			onClick: Props.OnToggle,
		},
		...Props.Resolved.columns.map((Column) => Column.render(Row, { t })),
	);
}
