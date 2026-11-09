// TotalsRow - the tfoot row: the session label with the call count, the
// files-column spacer, the seven session metrics, and the session bar that
// always fills its track because its scale is the session total itself.
import Cells from "@Function/Cells";
import CountShort from "@Function/CountShort";
import Price from "@Function/Price";
import Rate from "@Function/Rate";
import Dash from "@Variable/Dash";
import type CostBuckets from "@Interface/Buckets";
import type CostSummary from "@Interface/Summary";
import type CostTokens from "@Interface/Tokens";
import type { Translate } from "@Interface/Translate";
import { createElement } from "react";

type TotalsRowProps = {
	Summary: CostSummary;
	t: Translate;
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

export default function TotalsRow(Props: TotalsRowProps): ReturnType<typeof createElement> {
	const Summary = Props.Summary;
	const t = Props.t;
	const Tag =
		typeof Summary.currency === "string" && Summary.currency !== "" ? Summary.currency : "USD";
	const Metric = "playform-cost-turn-metric";
	const Cost: CostBuckets =
		Summary.cost === null || Summary.cost === undefined
			? { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, reasoning: 0, total: 0, other: 0 }
			: Summary.cost;
	const Tokens: CostTokens =
		Summary.tokens === null || Summary.tokens === undefined
			? { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, reasoning: 0, total: 0, reported: null }
			: Summary.tokens;
	return createElement(
		"tr",
		{ className: "playform-cost-totals-row", title: t("totals.session.title") },
		createElement(
			"td",
			{ className: "playform-cost-totals-label", colSpan: 2 },
			t("totals.session"),
			createElement(
				"span",
				{ className: "playform-cost-totals-meta" },
				` - ${t("totals.calls", {
					calls: typeof Summary.calls === "number" ? Summary.calls : 0,
					unpriced: typeof Summary.unpriced === "number" ? Summary.unpriced : 0,
				})}`,
			),
		),
		createElement("td", { className: Metric }),
		TokenCell(Metric, typeof Tokens.total === "number" ? Tokens.total : 0),
		CacheCell(Metric, Tokens, typeof Summary.cacheHit === "number" ? Summary.cacheHit : null, t),
		Cells.Money({ Cell: Metric, Value: Cost.cacheRead, Currency: Tag }),
		Cells.Money({ Cell: Metric, Value: Cost.input, Currency: Tag }),
		Cells.Money({ Cell: Metric, Value: Cost.output, Currency: Tag }),
		Cells.Money({
			Cell: Metric,
			Value: Cost.other,
			Currency: Tag,
			Title: OtherTitle(Cost, Tag, t),
		}),
		Cells.Alloc({
			Cell: Metric,
			Direct: typeof Summary.direct === "number" ? Summary.direct : 0,
			Amortized: typeof Summary.amortized === "number" ? Summary.amortized : 0,
			Has:
				(typeof Summary.direct === "number" && Summary.direct !== 0) ||
				(typeof Summary.amortized === "number" && Summary.amortized !== 0),
			Currency: Tag,
			t,
		}),
		Cells.Bar({
			Cell: Metric,
			Track: "playform-cost-bar-turn",
			Total: Cost.total,
			Cost,
			Scale: typeof Cost.total === "number" ? Cost.total : 0,
			Currency: Tag,
			Start: null,
			t,
		}),
	);
}
