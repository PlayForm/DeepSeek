import type CostFileRow from "../Interface/FileRow.js";
/**
 * @module FileFilters
 *
 * The Files view's client-side filter state and predicate.
 *
 * @remarks
 *
 * The case-insensitive path substring, the touch-kind choice derived from the row's counts, the
 * stage choice over the distinct stage set, and the sort order whose default is this
 * conversation's cost. It is pure and total: no React, no mutation of the envelope's rows, and no
 * input can make it throw.
 */
/**
 * Kind - the four touch-kind choices: every file, the files the conversation edited, the files it
 * wrote, and the files it only read.
 */
export type Kind = "all" | "edited" | "written" | "readOnly";
/**
 * Sort - the four orders: this conversation's cost (the default), the lifetime cost, the changed
 * lines, and the touch count.
 */
export type Sort = "conversation" | "lifetime" | "lines" | "touches";
/**
 * Filter - the one state the view holds: the path needle, the kind, the stage (null for every
 * stage) and the order.
 */
export type Filter = {
    Path: string;
    Kind: Kind;
    Stage: string | null;
    Sort: Sort;
};
/**
 * StagesOf - the distinct stage set the filter chips offer, in first-seen order, over every file
 * of the conversation rather than the filtered ones, so a chosen stage never makes its own chip
 * disappear.
 */
declare const StagesOf: (Rows: readonly CostFileRow[]) => readonly string[];
/**
 * Apply - the one entry the view calls: match, then order, without touching the envelope's own
 * array.
 */
declare const Apply: (Rows: readonly CostFileRow[], Current: Filter) => readonly CostFileRow[];
declare const _default: {
    readonly Kinds: readonly Kind[];
    readonly Sorts: readonly Sort[];
    readonly Default: Filter;
    readonly StagesOf: typeof StagesOf;
    readonly Apply: typeof Apply;
};
export default _default;
