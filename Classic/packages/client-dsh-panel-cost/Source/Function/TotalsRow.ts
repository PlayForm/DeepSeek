import type { TurnsCells } from "@Function/Columns";
import type CostBuckets from "@Interface/Buckets";
import type CostSummary from "@Interface/Summary";
import type { ResolvedTable } from "@Interface/Table";
import type CostTokens from "@Interface/Tokens";
import type { Translate } from "@Interface/Translate";
import { createElement, type ReactNode } from "react";

/**
 * @module TotalsRow
 *
 * The tfoot row: the session label spanning the identity columns with the call count, the
 * files-column spacer, and one cell per remaining resolved column, each built by that column's
 * render.
 *
 * @remarks
 *
 * The row reads the same resolved definition as the header and the body, so its cell count cannot
 * drift from theirs.
 */
type TotalsRowProps = {
	Summary: CostSummary;
	Resolved: ResolvedTable<TurnsCells>;
	t: Translate;
};

export default function TotalsRow(Props: TotalsRowProps): ReturnType<typeof createElement> {
	const Summary = Props.Summary;
	const t = Props.t;
	const Tag =
		typeof Summary.currency === "string" && Summary.currency !== "" ? Summary.currency : "USD";
	const Metric = "playform-cost-turn-metric";
	const Cost: CostBuckets = Summary.cost ?? {
		input: 0,
		output: 0,
		cacheRead: 0,
		cacheWrite: 0,
		reasoning: 0,
		total: 0,
		other: 0,
	};
	const Tokens: CostTokens = Summary.tokens ?? {
		input: 0,
		output: 0,
		cacheRead: 0,
		cacheWrite: 0,
		reasoning: 0,
		total: 0,
		reported: null,
	};
	const Label = (Span: number): ReturnType<typeof createElement> =>
		createElement(
			"td",
			{ className: "playform-cost-totals-label", colSpan: Span },
			t("totals.session"),
			createElement(
				"span",
				{ className: "playform-cost-totals-meta" },
				` - ${t("totals.calls", {
					calls: typeof Summary.calls === "number" ? Summary.calls : 0,
					unpriced: typeof Summary.unpriced === "number" ? Summary.unpriced : 0,
				})}`,
			),
		);

	// The totals row never renders the identity columns or the files column:
	// its label spans the identity pair and the files column is the empty
	// spacer the shipped footer carries. The bag still names their shape so
	// one row contract serves the turn, the step and the totals row.
	const Row: TurnsCells = {
		Key: "totals:session",
		scope: { Cell: Metric, Markers: [] },
		model: { Cell: Metric, Provider: "", Model: "" },
		files: {
			Cell: Metric,
			Pills: [],
			Fail: false,
			Saving: 0,
			Calls: 0,
			Tokens: 0,
			Currency: Tag,
			ShowMix: false,
		},
		tokens: { Cell: Metric, Value: typeof Tokens.total === "number" ? Tokens.total : 0 },
		cache: {
			Cell: Metric,
			Tokens,
			Hit: typeof Summary.cacheHit === "number" ? Summary.cacheHit : null,
		},
		cacheRead: { Cell: Metric, Value: Cost.cacheRead, Currency: Tag },
		input: { Cell: Metric, Value: Cost.input, Currency: Tag },
		output: { Cell: Metric, Value: Cost.output, Currency: Tag },
		other: { Cell: Metric, Value: Cost.other, Currency: Tag, Cost },
		allocation: {
			Cell: Metric,
			Direct: typeof Summary.direct === "number" ? Summary.direct : 0,
			Amortized: typeof Summary.amortized === "number" ? Summary.amortized : 0,
			Has:
				(typeof Summary.direct === "number" && Summary.direct !== 0) ||
				(typeof Summary.amortized === "number" && Summary.amortized !== 0),
			Currency: Tag,
		},
		total: {
			Cell: Metric,
			Track: "playform-cost-bar-turn",
			Total: Cost.total,
			Cost,
			Scale: typeof Cost.total === "number" ? Cost.total : 0,
			Currency: Tag,
			Start: null,
		},
	};

	// The label takes the place of the first identity column and spans every
	// identity column the resolution keeps, so a hidden or reordered identity
	// column moves the footer with it.
	const Identity = Props.Resolved.columns.filter(
		(Column) => Column.id === "scope" || Column.id === "model",
	).length;
	const Body: ReactNode[] = [];
	let Placed = false;
	for (const Column of Props.Resolved.columns) {
		switch (true) {
			case Column.id === "scope" || Column.id === "model":
				if (!Placed) {
					Body.push(Label(Identity));
					Placed = true;
				}
				break;
			case Column.id === "files":
				Body.push(createElement("td", { className: Metric }));
				break;
			default:
				Body.push(Column.render(Row, { t }));
				break;
		}
	}
	return createElement(
		"tr",
		{ className: "playform-cost-totals-row", title: t("totals.session.title") },
		...Body,
	);
}
