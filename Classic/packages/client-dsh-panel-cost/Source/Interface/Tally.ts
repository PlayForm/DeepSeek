// CostTally - one pill of the files or tools cell: the key, how many steps
// (files) or touched files (tools) it counts, the money it sums, the summed
// line delta, and the stage tone the largest entry carries.
export default interface CostTally {
	key: string;
	count: number;
	total: number;
	direct: number;
	amortized: number;
	lines: number;
	stage: string | null;
}
