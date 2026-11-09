// Table - the table shell: the fixed eleven-column layout with its
// colgroup, the sticky header row carrying the column locale keys, and the
// body and footer the view composes. The eleven columns are one tuple: the
// header row, the colgroup widths and the view's colSpan all read it.
import type { Translate } from "@Interface/Translate";
import { createElement } from "react";

// The one column definition: the names are the shipped locale keys, in the
// shipped order, and the width record beside it carries the shipped column
// widths. A new column is one tuple entry plus its width.
export const COLUMNS = [
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

type Column = (typeof COLUMNS)[number];

const COLUMN_WIDTHS: Record<Column, number> = {
	scope: 11,
	model: 15,
	files: 13,
	tokens: 6.5,
	cache: 6.5,
	cacheRead: 7.5,
	input: 7,
	output: 7,
	other: 7,
	allocation: 7.5,
	total: 12,
};

type TableProps = {
	Body: readonly ReturnType<typeof createElement>[];
	Totals: ReturnType<typeof createElement>;
	t: Translate;
};

export default function Table(Props: TableProps): ReturnType<typeof createElement> {
	const Cols = COLUMNS.map((Name) =>
		createElement("col", { key: Name, style: { width: `${COLUMN_WIDTHS[Name]}%` } }),
	);
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
				COLUMNS.map((Name, Index) =>
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
