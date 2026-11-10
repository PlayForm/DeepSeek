/**
 * @module Statistics
 *
 * The operate hook's honest counts: the live table size, the per-kind
 * breakdown, the refusals seen, and the sequence head.
 *
 * @remarks
 *
 * The sequence head is never a wall clock.
 */
export default interface Statistics {
    /**
     * The live proposal table's size.
     */
    proposals: number;
    /**
     * The number of refusals seen.
     */
    refused: number;
    /**
     * The monotonic sequence head.
     */
    sequence: number;
    /**
     * The per-kind breakdown.
     */
    byKind: {
        rename: number;
        connect: number;
        replace: number;
    };
}
