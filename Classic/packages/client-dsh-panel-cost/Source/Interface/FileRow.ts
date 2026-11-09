// FileRow - one file's row in the Cost tab's Files view: the money this
// conversation spent on the file (direct, amortized, total), the all-
// conversations lifetime figure and the carry-in before this conversation
// (`before` = lifetime - total), the last turn's share, the change the
// conversation produced (lines and bytes from the ledger's Edit rows), the
// touches by kind, the stages the file moved through, and the session's
// verdict. The engine (plugin-dsh-cost) produces it; this package mirrors the
// shape so the browser can fold and render it.
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
