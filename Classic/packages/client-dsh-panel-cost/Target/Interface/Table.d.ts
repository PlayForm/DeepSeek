import type { Translate } from "./Translate.js";
import type { ReactNode } from "react";
export type ColumnKind = "text" | "money" | "number" | "ratio" | "status";
export type SortDefinition = {
    id: string;
    direction: "asc" | "desc";
};
export type TableContext = {
    t: Translate;
};
export type ColumnDefinition<Row> = {
    id: string;
    labelKey: string;
    kind: ColumnKind;
    width: number;
    sortable: boolean;
    render: (row: Row, context: TableContext) => ReactNode;
};
export type ResolvedTable<Row> = {
    columns: readonly ColumnDefinition<Row>[];
    width: number;
};
export type TablePreferences = {
    hidden: readonly string[];
    order?: readonly string[];
};
export type TableDefinition<Row> = {
    id: string;
    version: number;
    columns: readonly ColumnDefinition<Row>[];
    defaultSort: readonly SortDefinition[];
    rowKey: (row: Row) => string;
};
