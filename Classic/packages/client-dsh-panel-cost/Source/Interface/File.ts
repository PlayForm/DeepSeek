// File - one CostFile per FileId a call touched or allocated (Design.md
// section 9.7): the touch fields come from the call's first Touch row in
// Seq order and are null when the file carries only an allocation, the
// money comes from the single Allocation row per (call, file), `total` is
// the reader's direct + amortized sum, and `touched` false renders the
// allocation-only marker so the pills never hide money.
export default interface CostFile {
	path: string;
	kind: string | null;
	stage: string | null;
	tool: string | null;
	branch: string | null;
	readBeforeEdit: boolean;
	direct: number;
	amortized: number;
	total: number;
	linesDelta: number | null;
	bytesDelta: number | null;
	durationMs: number | null;
	touched: boolean;
	at: number;
}
