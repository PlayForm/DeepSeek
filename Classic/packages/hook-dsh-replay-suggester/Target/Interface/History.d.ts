export interface ReplayRecord {
    /** The intent label the record was mined under (e.g. "Version", "Test"). */
    intent: string;
    /** The probe literal that matched (a grep pattern, a path fragment, a command fragment). */
    probe: string;
    /** The files touched, repo-relative, in touch order. */
    files: string[];
    /** The verification command used last time (e.g. "pnpm run build:classic"). */
    verify: string;
    /** When the record was captured (epoch seconds). */
    at: number;
}
export default interface HistoryStore {
    /** The store schema version. */
    schema: number;
    /** The records, most recent first. */
    records: ReplayRecord[];
}
