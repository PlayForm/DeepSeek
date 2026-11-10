/**
 * @module Report
 *
 * The per-run record: `run.json` (full fidelity) + `REPORT.md` (the human summary), one timestamped directory per run.
 *
 * @remarks
 *
 * WHY A FILE AND NOT JUST THE LEDGER: the ledger is a line-per-event
 * contract that every plugin in the family shares, so it must stay terse
 * and byte-stable. A review needs more than a line - the digest size, the
 * model that answered, the note the reviewer wrote, and every rejection
 * WITH its rule - and that detail is what turns "the review did nothing"
 * into "the review was refused for `negative-claim` eight times, fix the
 * prompt".
 *
 * A report write is BEST-EFFORT: a failure returns "" and the run's result
 * is unchanged. The review already happened; losing its paperwork must not
 * turn a successful pass into an error.
 */
/**
 * One run's record.
 */
export interface RunReport {
    /**
     * ISO UTC timestamp of the run.
     */
    at: string;
    /**
     * The session the review belongs to ("" when unknown).
     */
    session: string;
    /**
     * The outcome class (`applied`/`proposed`/`nothing`/`unavailable`/`failed`).
     */
    outcome: string;
    /**
     * The provider that answered ("" when no call was made).
     */
    provider: string;
    /**
     * The model that answered ("" when no call was made).
     */
    model: string;
    /**
     * The digest's cost shape.
     */
    digest: {
        kept: number;
        collapsed: number;
        trimmed: boolean;
    };
    /**
     * The names that landed in the corpus.
     */
    applied: string[];
    /**
     * The names queued for acceptance.
     */
    proposed: string[];
    /**
     * The refusals, with their rule ids.
     */
    rejected: {
        name: string;
        rule: string;
    }[];
    /**
     * The reviewer's own note, when it wrote one.
     */
    note?: string;
    /**
     * One clause of detail (a skip reason, a failure's cause).
     */
    detail?: string;
    /**
     * Wall time of the review, ms.
     */
    durationMs: number;
}
export default _default;
declare function _default(Root: string, Report: RunReport): Promise<string>;
