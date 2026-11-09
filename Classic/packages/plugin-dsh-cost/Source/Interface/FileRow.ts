// FileRow - one CostFileRow per FileId this session touched or allocated
// (the FILES view): the session's money for the file beside the file's
// lifetime money across every conversation that ever allocated it, the
// carry-in before this conversation (`before`, the lifetime total minus this
// session's own share), this session's last turn's allocation to the file,
// and the change the conversation produced at the edit grain. The touch
// fields carry the kind counts, the stage set, the verdict, the
// read-before-edit flag and the first and last touch times; every count is a
// stored figure or zero, `lifetime` and `before` stay null when no
// allocation ever priced the file, and `turn` stays null when the session's
// last turn did not allocate it. The money rounds to six decimals.
export default interface CostFileRow {
	path: string;
	touches: number;
	reads: number;
	edits: number;
	writes: number;
	searches: number;
	added: number;
	removed: number;
	bytesAdded: number;
	bytesRemoved: number;
	direct: number;
	amortized: number;
	total: number;
	lifetime: number | null;
	before: number | null;
	turn: number | null;
	stages: readonly string[];
	verdict: string | null;
	readBeforeEdit: boolean;
	firstAt: number | null;
	lastAt: number | null;
}
