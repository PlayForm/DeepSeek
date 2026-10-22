export default interface Result {
    /** One file's replay outcome. */
    files: {
        path: string;
        action: "restored" | "removed" | "conflict" | "skipped";
        reason?: string;
    }[];
}
/** A recovery pass: the batches found still `applying` at boot. */
export interface RecoveryReport {
    batchIds: string[];
}
