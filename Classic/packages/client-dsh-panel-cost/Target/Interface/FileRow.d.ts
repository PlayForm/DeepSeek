/**
 * @module FileRow
 *
 * One file's row in the Cost tab's Files view.
 *
 * @remarks
 *
 * The row carries the money this conversation spent on the file (direct, amortized, total), the
 * all-conversations lifetime figure and the carry-in before this conversation (`before` =
 * lifetime - total), the last turn's share, the change the conversation produced (lines and bytes
 * from the ledger's Edit rows), the touches by kind, the stages the file moved through, and the
 * session's verdict. The engine (plugin-dsh-cost) produces it; this package mirrors the shape so
 * the browser can fold and render it.
 */
export default interface CostFileRow {
    /**
     * The file's full path.
     */
    path: string;
    /**
     * How many touches this conversation made on the file.
     */
    touches: number;
    /**
     * How many read touches this conversation made.
     */
    reads: number;
    /**
     * How many edit touches this conversation made.
     */
    edits: number;
    /**
     * How many write touches this conversation made.
     */
    writes: number;
    /**
     * How many search touches this conversation made.
     */
    searches: number;
    /**
     * The lines the conversation added.
     */
    added: number;
    /**
     * The lines the conversation removed.
     */
    removed: number;
    /**
     * The bytes the conversation added.
     */
    bytesAdded: number;
    /**
     * The bytes the conversation removed.
     */
    bytesRemoved: number;
    /**
     * The direct money this conversation spent on the file.
     */
    direct: number;
    /**
     * The amortized money this conversation spent on the file.
     */
    amortized: number;
    /**
     * The total money this conversation spent on the file.
     */
    total: number;
    /**
     * The all-conversations lifetime figure, or null.
     */
    lifetime: number | null;
    /**
     * The carry-in before this conversation (`lifetime - total`), or null.
     */
    before: number | null;
    /**
     * The last turn's share, or null.
     */
    turn: number | null;
    /**
     * The stages the file moved through.
     */
    stages: readonly string[];
    /**
     * The session's verdict, or null.
     */
    verdict: string | null;
    /**
     * Whether a read preceded the conversation's edit.
     */
    readBeforeEdit: boolean;
    /**
     * The conversation's first touch time, or null.
     */
    firstAt: number | null;
    /**
     * The conversation's last touch time, or null.
     */
    lastAt: number | null;
}
