/** One run's record. */
export interface RunReport {
    /** ISO UTC timestamp of the run. */
    at: string;
    /** The session the review belongs to ("" when unknown). */
    session: string;
    /** The outcome class (`applied`/`proposed`/`nothing`/`unavailable`/`failed`). */
    outcome: string;
    /** The provider/model that answered ("" when no call was made). */
    provider: string;
    model: string;
    /** The digest's cost shape. */
    digest: {
        kept: number;
        collapsed: number;
        trimmed: boolean;
    };
    /** The names that landed in the corpus. */
    applied: string[];
    /** The names queued for acceptance. */
    proposed: string[];
    /** The refusals, with their rule ids. */
    rejected: {
        name: string;
        rule: string;
    }[];
    /** The reviewer's own note, when it wrote one. */
    note?: string;
    /** One clause of detail (a skip reason, a failure's cause). */
    detail?: string;
    /** Wall time of the review, ms. */
    durationMs: number;
}
export default _default;
declare function _default(Root: string, Report: RunReport): Promise<string>;
