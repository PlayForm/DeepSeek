import type CostFileRow from "@Interface/FileRow";

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

const Kinds: readonly Kind[] = ["all", "edited", "written", "readOnly"];

const Sorts: readonly Sort[] = ["conversation", "lifetime", "lines", "touches"];

const Default: Filter = { Path: "", Kind: "all", Stage: null, Sort: "conversation" };

const N = (Value: unknown): number =>
	typeof Value === "number" && Number.isFinite(Value) ? Value : 0;

const S = (Value: unknown): string => (typeof Value === "string" ? Value : "");

/**
 * Stages - one row's stage set, read defensively: the envelope may carry no stage list at all, and
 * a stage that is not a string is not a stage.
 */
const Stages = (Value: unknown): readonly string[] =>
	Array.isArray(Value) ? Value.filter((Item: unknown) => typeof Item === "string") : [];

/**
 * Match - the predicate: the needle is a case-insensitive substring of the full path, the kind
 * reads the edit and write counts, and the stage is one of the row's own stages.
 */
const Match = (Row: CostFileRow, Current: Filter): boolean => {
	const Path = S(Row.path).toLowerCase();
	const Needle = Current.Path.trim().toLowerCase();
	const Edits = N(Row.edits);
	const Writes = N(Row.writes);
	switch (true) {
		case Needle !== "" && !Path.includes(Needle):
			return false;
		case Current.Kind === "edited" && Edits === 0:
			return false;
		case Current.Kind === "written" && Writes === 0:
			return false;
		case Current.Kind === "readOnly" && (Edits > 0 || Writes > 0):
			return false;
		case Current.Stage !== null && !Stages(Row.stages).includes(Current.Stage):
			return false;
		default:
			return true;
	}
};

/**
 * Weight - the sort key of one order, every order descending.
 */
const Weight = (Row: CostFileRow, Choice: Sort): number => {
	switch (true) {
		case Choice === "lifetime":
			return N(Row.lifetime);
		case Choice === "lines":
			return N(Row.added) + N(Row.removed);
		case Choice === "touches":
			return N(Row.touches);
		default:
			return N(Row.total);
	}
};

/**
 * Compare - the tie break every order shares: the full path ascending.
 */
const Compare = (Left: CostFileRow, Right: CostFileRow): number => {
	const A = S(Left.path);
	const B = S(Right.path);
	switch (true) {
		case A < B:
			return -1;
		case A > B:
			return 1;
		default:
			return 0;
	}
};

const Sorted = (Rows: readonly CostFileRow[], Choice: Sort): readonly CostFileRow[] =>
	[...Rows].sort((A, B) => Weight(B, Choice) - Weight(A, Choice) || Compare(A, B));

/**
 * StagesOf - the distinct stage set the filter chips offer, in first-seen order, over every file
 * of the conversation rather than the filtered ones, so a chosen stage never makes its own chip
 * disappear.
 */
const StagesOf = (Rows: readonly CostFileRow[]): readonly string[] => {
	const Seen = new Set<string>();
	for (const Row of Rows) for (const Stage of Stages(Row.stages)) Seen.add(Stage);
	return [...Seen];
};

/**
 * Apply - the one entry the view calls: match, then order, without touching the envelope's own
 * array.
 */
const Apply = (Rows: readonly CostFileRow[], Current: Filter): readonly CostFileRow[] =>
	Sorted(
		Rows.filter((Row) => Match(Row, Current)),
		Current.Sort,
	);

export default { Kinds, Sorts, Default, StagesOf, Apply } as const;
