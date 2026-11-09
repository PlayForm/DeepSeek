// Table - the table shell: the fixed eleven-column layout with its
// colgroup, the sticky header row carrying the column locale keys, and the
// body and footer the view composes.
import type { Translate } from "@Interface/Translate";
import { createElement } from "react";

const WIDTHS = [11, 15, 13, 6.5, 6.5, 7.5, 7, 7, 7, 7.5, 12] as const;

const HEADERS = [
	"scope",
	"model",
	"files",
	"tokens",
	"cache",
	"cacheRead",
	"input",
	"output",
	"other",
	"allocation",
	"total",
] as const;

type TableProps = {
	Body: readonly ReturnType<typeof createElement>[];
	Totals: ReturnType<typeof createElement>;
	t: Translate;
};

export default function Table(Props: TableProps): ReturnType<typeof createElement> {
	const Cols: Array<ReturnType<typeof createElement>> = [];
	for (let Index = 0; Index < WIDTHS.length; Index += 1)
		Cols.push(createElement("col", { key: Index }));
	return createElement(
		"table",
		{ className: "playform-cost-table", "aria-label": Props.t("view") },
		createElement("colgroup", {}, Cols),
		createElement(
			"thead",
			{},
			createElement(
				"tr",
				{},
				HEADERS.map((Name, Index) =>
					createElement(
						"th",
						{
							key: Name,
							className: Index < 3 ? "playform-cost-th-left" : "playform-cost-th",
							title: Props.t(`column.${Name}.title`),
						},
						Props.t(`column.${Name}`),
					),
				),
			),
		),
		createElement("tbody", {}, Props.Body),
		createElement("tfoot", {}, Props.Totals),
	);
}
