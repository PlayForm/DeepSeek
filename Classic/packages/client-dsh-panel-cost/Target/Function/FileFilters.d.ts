import type CostFileRow from "../Interface/FileRow.js";
export type Kind = "all" | "edited" | "written" | "readOnly";
export type Sort = "conversation" | "lifetime" | "lines" | "touches";
export type Filter = {
    Path: string;
    Kind: Kind;
    Stage: string | null;
    Sort: Sort;
};
declare const StagesOf: (Rows: readonly CostFileRow[]) => readonly string[];
declare const Apply: (Rows: readonly CostFileRow[], Current: Filter) => readonly CostFileRow[];
declare const _default: {
    readonly Kinds: readonly Kind[];
    readonly Sorts: readonly Sort[];
    readonly Default: Filter;
    readonly StagesOf: typeof StagesOf;
    readonly Apply: typeof Apply;
};
export default _default;
