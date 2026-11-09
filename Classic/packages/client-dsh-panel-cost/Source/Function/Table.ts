// Table - the table shell: the colgroup, the sticky header row carrying the
// column locale keys, and the body and footer the view composes. Every part
// reads the one resolved definition the view hands down, so the header and
// the widths cannot drift from the cells the rows emit.
import type { TurnsCells } from "@Function/Columns";
import type { ResolvedTable } from "@Interface/Table";
import type { Translate } from "@Interface/Translate";
import { createElement } from "react";

type TableProps = {
	Body: readonly ReturnType<typeof createElement>[];
	Totals: ReturnType<typeof createElement>;
	Resolved: ResolvedTable<TurnsCells>;
	t: Translate;
};

export default function Table(Props: TableProps): ReturnType<typeof createElement> {
	return createElement(
		"table",
		{ className: "playform-cost-table", "aria-label": Props.t("view") },
		createElement(
			"colgroup",
			{},
			Props.Resolved.columns.map((Column) =>
				createElement("col", { key: Column.id, style: { width: `${Column.width}%` } }),
			),
		),
		createElement(
			"thead",
			{},
			createElement(
				"tr",
				{},
				Props.Resolved.columns.map((Column) =>
					createElement(
						"th",
						{
							key: Column.id,
							// The shipped header left-aligns the text and status
							// columns (the first three in the shipped order) and
							// right-aligns the metrics; the kind is what the rule
							// reads, so a reordered column keeps its alignment.
							className:
								Column.kind === "text" || Column.kind === "status"
									? "playform-cost-th-left"
									: "playform-cost-th",
							title: Props.t(`${Column.labelKey}.title`),
						},
						Props.t(Column.labelKey),
					),
				),
			),
		),
		createElement("tbody", {}, Props.Body),
		createElement("tfoot", {}, Props.Totals),
	);
}
