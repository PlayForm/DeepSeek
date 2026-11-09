import Cells from "./Cells.js";
import type CostBuckets from "../Interface/Buckets.js";
import type { TableContext } from "../Interface/Table.js";
import type CostTokens from "../Interface/Tokens.js";
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
