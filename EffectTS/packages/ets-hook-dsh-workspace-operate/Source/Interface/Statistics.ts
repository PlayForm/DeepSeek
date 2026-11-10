/**
 * @module Statistics
 *
 * The operate hook's honest counts (Interface/Statistics).
 *
 * @remarks
 * They cover the live table size, the per-kind breakdown, the refusals
 * seen, and the sequence head (never a wall clock).
 */
export default interface Statistics {
	proposals: number;
	refused: number;
	sequence: number;
	byKind: { rename: number; connect: number; replace: number };
}
