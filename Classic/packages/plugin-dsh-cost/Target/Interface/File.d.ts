/**
 * @module File
 *
 * One CostFile per FileId a call touched or allocated: the touch fields beside
 * the money the call allocated to the file.
 *
 * @remarks
 *
 * The shape follows Design.md section 9.7. The touch fields come from the
 * call's first Touch row in Seq order and are null when the file carries only
 * an allocation, the money comes from the single Allocation row per (call,
 * file), `total` is the reader's direct + amortized sum, and `touched` false
 * renders the allocation-only marker so the pills never hide money.
 */
export default interface CostFile {
    /**
     * The file's path as the ledger recorded it.
     */
    path: string;
    /**
     * The first touch's kind, null for an allocation-only file.
     */
    kind: string | null;
    /**
     * The first touch's classified stage, null when unclassified.
     */
    stage: string | null;
    /**
     * The tool that produced the first touch, null for allocation-only.
     */
    tool: string | null;
    /**
     * The branch the first touch recorded, null when none.
     */
    branch: string | null;
    /**
     * Whether the file was read before the first mutating touch.
     */
    readBeforeEdit: boolean;
    /**
     * The call's direct money for the file.
     */
    direct: number;
    /**
     * The call's amortized money for the file.
     */
    amortized: number;
    /**
     * The reader's direct + amortized sum.
     */
    total: number;
    /**
     * The first touch's line delta, null when the ledger stores none.
     */
    linesDelta: number | null;
    /**
     * The first touch's byte delta, null when the ledger stores none.
     */
    bytesDelta: number | null;
    /**
     * The tool duration the touch recorded, null when none.
     */
    durationMs: number | null;
    /**
     * Whether the call touched the file at all.
     */
    touched: boolean;
    /**
     * The touch's instant, or the call's for an allocation-only file.
     */
    at: number;
}
