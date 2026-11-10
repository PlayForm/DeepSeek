/**
 * @module ContributionRow
 *
 * One row per conversation that ever allocated money to one file (the
 * file-scoped contribution read, the file-to-conversation product surface):
 * the conversation's identity and its stored title, the distinct calls that
 * contributed, the direct and amortized money those calls allocated to the
 * file with their sum in `Total`, the conversation's share of the file's
 * whole lifetime total across every session, the first and last call times,
 * and the distinct provider/model ids the contributing calls used, each
 * written `Provider/Model` and sorted.
 *
 * @remarks
 * The money rounds to six decimals and the share is a ratio in [0, 1]
 * computed from those same rounded totals - this row's total over the
 * file's rounded lifetime - so the rows of one file sum to one up to the
 * rounding and a lifetime that rounds to zero answers a share of zero.
 * `Title` stays null when the ledger stored none, and `FirstAt` and
 * `LastAt` stay null only when the statement stored no call time. The field
 * names are the twin's PascalCase, the field set and the types are the
 * Classic row's.
 */
/**
 * One conversation's contribution to one file.
 */
export default interface ContributionRow {
    /**
     * The conversation's id.
     */
    readonly SessionId: string;
    /**
     * The conversation's stored title (null when the ledger stored none).
     */
    readonly Title: string | null;
    /**
     * The distinct calls that contributed.
     */
    readonly Calls: number;
    /**
     * The direct money the calls allocated to the file.
     */
    readonly Direct: number;
    /**
     * The amortized money the calls allocated to the file.
     */
    readonly Amortized: number;
    /**
     * The sum of the direct and amortized money.
     */
    readonly Total: number;
    /**
     * The conversation's share of the file's lifetime total, in [0, 1].
     */
    readonly Share: number;
    /**
     * The first contributing call's time (null when none is stored).
     */
    readonly FirstAt: number | null;
    /**
     * The last contributing call's time (null when none is stored).
     */
    readonly LastAt: number | null;
    /**
     * The distinct `Provider/Model` ids the calls used, sorted.
     */
    readonly Models: readonly string[];
}
