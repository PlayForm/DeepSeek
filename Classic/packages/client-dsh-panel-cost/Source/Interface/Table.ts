// Table - the table contract: one resolved column definition drives the
// header, the colgroup widths, every body cell, the totals row and the
// detail-row span, so a hidden or reordered column cannot desynchronise
// them. A definition is data: a column names its label key, its kind, its
// percent width and its renderer, and a preference set may hide or reorder
// columns but never hides the identity column the definition leads with.
import type { Translate } from "@Interface/Translate";
import type { ReactNode } from "react";

// ColumnKind - what a column holds: free text, money, a count, a ratio or a
// state marker. The header alignment reads it, and so does a later sort or
// export control.
export type ColumnKind = "text" | "money" | "number" | "ratio" | "status";

// SortDefinition - one entry of a table's default order: a column id and a
// direction. The Turns table ships the ledger order, so its definition
// carries an empty list.
export type SortDefinition = {
	id: string;
	direction: "asc" | "desc";
};

// TableContext - what a renderer reads besides its row: the translator that
// the cell labels and titles resolve through.
export type TableContext = {
	t: Translate;
};

// ColumnDefinition - one column: the identity a preference names, the locale
// key the header resolves (its `.title` sibling carries the header tooltip),
// the kind, the percent width, whether a sort control may order by it, and
// the renderer that builds its cell node from one row.
export type ColumnDefinition<Row> = {
	id: string;
	labelKey: string;
	kind: ColumnKind;
	width: number;
	sortable: boolean;
	render: (row: Row, context: TableContext) => ReactNode;
};

// ResolvedTable - a definition after the preference set: the columns that
// survive, in their final order, and the percent width they add up to.
export type ResolvedTable<Row> = {
	columns: readonly ColumnDefinition<Row>[];
	width: number;
};

// TablePreferences - the user half of a resolution: the column ids to hide
// and the ids that lead, in order. An id the definition does not carry is
// ignored rather than bound to another column, so a saved preference that
// outlives its column degrades instead of crashing.
export type TablePreferences = {
	hidden: readonly string[];
	order?: readonly string[];
};

// TableDefinition - one table: its identity, its version, its columns, its
// default order and the key a row renders under.
export type TableDefinition<Row> = {
	id: string;
	version: number;
	columns: readonly ColumnDefinition<Row>[];
	defaultSort: readonly SortDefinition[];
	rowKey: (row: Row) => string;
};
