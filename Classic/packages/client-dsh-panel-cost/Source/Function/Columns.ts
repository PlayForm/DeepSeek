// Columns - the Turns table's one column definition: the eleven shipped
// columns in their shipped order and widths. Every render delegates to the
// cell renderers in Cells.ts, so the header, the colgroup, the body cells
// and the totals row all read the same definition and a hidden or reordered
// column cannot desynchronise them. The token, cache and other-title
// renderers live here because Cells.ts ships no renderer for them and this
// lane does not own that file; their markup is the markup the three rows
// carried before.
import Cells from "@Function/Cells";
import CountShort from "@Function/CountShort";
import Price from "@Function/Price";
import Rate from "@Function/Rate";
import type CostBuckets from "@Interface/Buckets";
import type { TableContext, TableDefinition } from "@Interface/Table";
import type CostTokens from "@Interface/Tokens";
import type { Translate } from "@Interface/Translate";
import Dash from "@Variable/Dash";
import { createElement } from "react";

// TurnsCells - the cell source one Turns row hands its definition: the props
// of every column's renderer, already carrying the row's own cell class and
// its values. The three rows that render this table - the turn, the step and
// the totals row - build it from their own aggregates, so the definition
// owns the order and the markup while each row owns its data.
export type TurnsCells = {
	Key: string;
	scope: Parameters<typeof Cells.Scope>[0];
	model: Parameters<typeof Cells.Model>[0];
	files: Omit<Parameters<typeof Cells.Files>[0], "t">;
	tokens: { Cell: string; Value: number };
	cache: { Cell: string; Tokens: CostTokens; Hit: number | null };
	cacheRead: Parameters<typeof Cells.Money>[0];
	input: Parameters<typeof Cells.Money>[0];
	output: Parameters<typeof Cells.Money>[0];
	other: { Cell: string; Value: number; Currency: string; Cost: CostBuckets };
	allocation: Omit<Parameters<typeof Cells.Alloc>[0], "t">;
	total: Omit<Parameters<typeof Cells.Bar>[0], "t">;
};

// Token - the count cell: the compact token figure under the row's own cell
// class. Moved verbatim from the three rows, which carried one copy each.
const Token = (Cell: string, Value: number): ReturnType<typeof createElement> =>
	createElement(
		"td",
		{ className: Cell },
		createElement("span", { className: "playform-cost-num" }, CountShort(Value)),
	);

// Cache - the cache-hit cell: the token-weighted rate, the read/input/write
// detail as its tooltip when the call touched the cache, the column title
// otherwise, and the dash when the call served no prompt tokens at all.
// Moved verbatim from the three rows, which carried one copy each.
const Cache = (
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

// OtherTitle - the residual bucket's tooltip: the cache-write and reasoning
// shares beside the remainder, or the column title when neither was booked.
// Moved verbatim from the three rows, which carried one copy each.
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

// Turns - the definition: the shipped order, the shipped widths, and the
// renderer each column hands its cell. `sortable` names the columns a sort
// control may order; the table ships no sort control and the definition's
// default order is empty, so the ledger order stands.
export default {
	id: "turns",
	version: 1,
	columns: [
		{
			id: "scope",
			labelKey: "column.scope",
			kind: "text",
			width: 11,
			sortable: false,
			render: (Row: TurnsCells) => Cells.Scope(Row.scope),
		},
		{
			id: "model",
			labelKey: "column.model",
			kind: "text",
			width: 15,
			sortable: true,
			render: (Row: TurnsCells) => Cells.Model(Row.model),
		},
		{
			id: "files",
			labelKey: "column.files",
			kind: "status",
			width: 13,
			sortable: false,
			render: (Row: TurnsCells, Context: TableContext) =>
				Cells.Files({ ...Row.files, t: Context.t }),
		},
		{
			id: "tokens",
			labelKey: "column.tokens",
			kind: "number",
			width: 6.5,
			sortable: true,
			render: (Row: TurnsCells) => Token(Row.tokens.Cell, Row.tokens.Value),
		},
		{
			id: "cache",
			labelKey: "column.cache",
			kind: "ratio",
			width: 6.5,
			sortable: true,
			render: (Row: TurnsCells, Context: TableContext) =>
				Cache(Row.cache.Cell, Row.cache.Tokens, Row.cache.Hit, Context.t),
		},
		{
			id: "cacheRead",
			labelKey: "column.cacheRead",
			kind: "money",
			width: 7.5,
			sortable: true,
			render: (Row: TurnsCells) => Cells.Money(Row.cacheRead),
		},
		{
			id: "input",
			labelKey: "column.input",
			kind: "money",
			width: 7,
			sortable: true,
			render: (Row: TurnsCells) => Cells.Money(Row.input),
		},
		{
			id: "output",
			labelKey: "column.output",
			kind: "money",
			width: 7,
			sortable: true,
			render: (Row: TurnsCells) => Cells.Money(Row.output),
		},
		{
			id: "other",
			labelKey: "column.other",
			kind: "money",
			width: 7,
			sortable: true,
			render: (Row: TurnsCells, Context: TableContext) =>
				Cells.Money({
					Cell: Row.other.Cell,
					Value: Row.other.Value,
					Currency: Row.other.Currency,
					Title: OtherTitle(Row.other.Cost, Row.other.Currency, Context.t),
				}),
		},
		{
			id: "allocation",
			labelKey: "column.allocation",
			kind: "money",
			width: 7.5,
			sortable: true,
			render: (Row: TurnsCells, Context: TableContext) =>
				Cells.Alloc({ ...Row.allocation, t: Context.t }),
		},
		{
			id: "total",
			labelKey: "column.total",
			kind: "money",
			width: 12,
			sortable: true,
			render: (Row: TurnsCells, Context: TableContext) =>
				Cells.Bar({ ...Row.total, t: Context.t }),
		},
	],
	defaultSort: [],
	rowKey: (Row: TurnsCells) => Row.Key,
} satisfies TableDefinition<TurnsCells>;
