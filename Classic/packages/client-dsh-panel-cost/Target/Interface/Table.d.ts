import type { Translate } from "./Translate.js";
import type { ReactNode } from "react";
/**
 * @module Table
 *
 * The table contract: one resolved column definition drives the header, the colgroup widths,
 * every body cell, the totals row and the detail-row span.
 *
 * @remarks
 *
 * A hidden or reordered column cannot desynchronise them. A definition is data: a column names its
 * label key, its kind, its percent width and its renderer, and a preference set may hide or
 * reorder columns but never hides the identity column the definition leads with.
 */
/**
 * ColumnKind - what a column holds: free text, money, a count, a ratio or a state marker. The
 * header alignment reads it, and so does a later sort or export control.
 */
export type ColumnKind = "text" | "money" | "number" | "ratio" | "status";
/**
 * SortDefinition - one entry of a table's default order: a column id and a direction. The Turns
 * table ships the ledger order, so its definition carries an empty list.
 */
export type SortDefinition = {
    /**
     * The column id the entry orders by.
     */
    id: string;
    /**
     * The direction the column is ordered in.
     */
    direction: "asc" | "desc";
};
/**
 * TableContext - what a renderer reads besides its row: the translator that the cell labels and
 * titles resolve through.
 */
export type TableContext = {
    /**
     * The translator the cell labels and titles resolve through.
     */
    t: Translate;
};
/**
 * ColumnDefinition - one column: the identity a preference names, the locale key the header
 * resolves (its `.title` sibling carries the header tooltip), the kind, the percent width, whether
 * a sort control may order by it, and the renderer that builds its cell node from one row.
 */
export type ColumnDefinition<Row> = {
    /**
     * The identity a preference names.
     */
    id: string;
    /**
     * The locale key the header resolves, its `.title` sibling carrying the header tooltip.
     */
    labelKey: string;
    /**
     * What the column holds, read by the header alignment and a later sort or export control.
     */
    kind: ColumnKind;
    /**
     * The column's percent width.
     */
    width: number;
    /**
     * Whether a sort control may order by the column.
     */
    sortable: boolean;
    /**
     * The renderer that builds the column's cell node from one row.
     */
    render: (row: Row, context: TableContext) => ReactNode;
};
/**
 * ResolvedTable - a definition after the preference set: the columns that survive, in their final
 * order, and the percent width they add up to.
 */
export type ResolvedTable<Row> = {
    /**
     * The columns that survive, in their final order.
     */
    columns: readonly ColumnDefinition<Row>[];
    /**
     * The percent width the surviving columns add up to.
     */
    width: number;
};
/**
 * TablePreferences - the user half of a resolution: the column ids to hide and the ids that lead,
 * in order. An id the definition does not carry is ignored rather than bound to another column, so
 * a saved preference that outlives its column degrades instead of crashing.
 */
export type TablePreferences = {
    /**
     * The column ids to hide.
     */
    hidden: readonly string[];
    /**
     * The ids that lead, in order; the unnamed columns keep their definition order.
     */
    order?: readonly string[];
};
/**
 * TableDefinition - one table: its identity, its version, its columns, its default order and the
 * key a row renders under.
 */
export type TableDefinition<Row> = {
    /**
     * The table's identity.
     */
    id: string;
    /**
     * The definition's version.
     */
    version: number;
    /**
     * The table's columns, the first one the identity column.
     */
    columns: readonly ColumnDefinition<Row>[];
    /**
     * The table's default order.
     */
    defaultSort: readonly SortDefinition[];
    /**
     * The key a row renders under.
     */
    rowKey: (row: Row) => string;
};
