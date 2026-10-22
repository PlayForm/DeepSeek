// Statistics - the merge hook's honest counts (Interface/Statistics).
export default interface Statistics {
	batches: number;
	applied: number;
	conflicts: number;
	rejected: number;
	recovery: number;
	sequence: number;
}
