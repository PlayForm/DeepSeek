/**
 * @module Columns
 *
 * The Turns table's one column definition: the eleven shipped columns in their shipped order and
 * widths.
 *
 * @remarks
 * Every render delegates to the cell renderers in `Cells.ts`, so the header, the colgroup, the body
 * cells and the totals row all read the same definition and a hidden or reordered column cannot
 * desynchronise them. The token, cache and other-title renderers live here because `Cells.ts`
 * ships no renderer for them and this lane does not own that file; their markup is the markup the
 * three rows carried before.
 */
import Cells from "./Cells.js";
import type CostBuckets from "../Interface/Buckets.js";
import type { TableContext } from "../Interface/Table.js";
import type CostTokens from "../Interface/Tokens.js";
/**
 * TurnsCells - the cell source one Turns row hands its definition: the props of every column's
 * renderer, already carrying the row's own cell class and its values. The three rows that render
 * this table - the turn, the step and the totals row - build it from their own aggregates, so the
 * definition owns the order and the markup while each row owns its data.
 */
export type TurnsCells = {
    Key: string;
    scope: Parameters<typeof Cells.Scope>[0];
    model: Parameters<typeof Cells.Model>[0];
    files: Omit<Parameters<typeof Cells.Files>[0], "t">;
    tokens: {
        Cell: string;
        Value: number;
    };
    cache: {
        Cell: string;
        Tokens: CostTokens;
        Hit: number | null;
    };
    cacheRead: Parameters<typeof Cells.Money>[0];
    input: Parameters<typeof Cells.Money>[0];
    output: Parameters<typeof Cells.Money>[0];
    other: {
        Cell: string;
        Value: number;
        Currency: string;
        Cost: CostBuckets;
    };
    allocation: Omit<Parameters<typeof Cells.Alloc>[0], "t">;
    total: Omit<Parameters<typeof Cells.Bar>[0], "t">;
};
/**
 * Turns - the definition: the shipped order, the shipped widths, and the renderer each column
 * hands its cell. `sortable` names the columns a sort control may order; the table ships no sort
 * control and the definition's default order is empty, so the ledger order stands.
 */
declare const _default: {
    id: string;
    version: number;
    columns: ({
        id: string;
        labelKey: string;
        kind: "text";
        width: number;
        sortable: false;
        render: (Row: TurnsCells) => import("react").ReactElement<{}, string | import("react").JSXElementConstructor<any>>;
    } | {
        id: string;
        labelKey: string;
        kind: "text";
        width: number;
        sortable: true;
        render: (Row: TurnsCells) => import("react").ReactElement<{}, string | import("react").JSXElementConstructor<any>>;
    } | {
        id: string;
        labelKey: string;
        kind: "status";
        width: number;
        sortable: false;
        render: (Row: TurnsCells, Context: TableContext) => import("react").ReactElement<{}, string | import("react").JSXElementConstructor<any>>;
    } | {
        id: string;
        labelKey: string;
        kind: "number";
        width: number;
        sortable: true;
        render: (Row: TurnsCells) => import("react").ReactElement<{}, string | import("react").JSXElementConstructor<any>>;
    } | {
        id: string;
        labelKey: string;
        kind: "ratio";
        width: number;
        sortable: true;
        render: (Row: TurnsCells, Context: TableContext) => import("react").ReactElement<{}, string | import("react").JSXElementConstructor<any>>;
    } | {
        id: string;
        labelKey: string;
        kind: "money";
        width: number;
        sortable: true;
        render: (Row: TurnsCells, Context: TableContext) => import("react").ReactElement<{}, string | import("react").JSXElementConstructor<any>>;
    })[];
    defaultSort: never[];
    rowKey: (Row: TurnsCells) => string;
};
export default _default;
