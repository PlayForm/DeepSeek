/**
 * @module File
 *
 * One CostFile per FileId a call touched or allocated.
 *
 * @remarks
 *
 * The shape is the Design.md section 9.7 one: the touch fields come from the call's first Touch
 * row in Seq order and are null when the file carries only an allocation, the money comes from the
 * single Allocation row per (call, file), `total` is the reader's direct + amortized sum, and
 * `touched` false renders the allocation-only marker so the pills never hide money.
 */
export default interface CostFile {
    /**
     * The file's full path.
     */
    path: string;
    /**
     * The touch's kind, or null when the file carries only an allocation.
     */
    kind: string | null;
    /**
     * The touch's stage, or null when the file carries only an allocation.
     */
    stage: string | null;
    /**
     * The tool the touch ran, or null when the file carries only an allocation.
     */
    tool: string | null;
    /**
     * The branch the touch recorded, or null.
     */
    branch: string | null;
    /**
     * Whether a read preceded the touch's edit.
     */
    readBeforeEdit: boolean;
    /**
     * The direct money the Allocation row stored.
     */
    direct: number;
    /**
     * The amortized money the Allocation row stored.
     */
    amortized: number;
    /**
     * The reader's direct + amortized sum.
     */
    total: number;
    /**
     * The touch's line delta, or null.
     */
    linesDelta: number | null;
    /**
     * The touch's byte delta, or null.
     */
    bytesDelta: number | null;
    /**
     * The touch's duration in milliseconds, or null.
     */
    durationMs: number | null;
    /**
     * Whether the call actually touched the file rather than only allocating to it.
     */
    touched: boolean;
    /**
     * The touch's instant in epoch milliseconds.
     */
    at: number;
}
