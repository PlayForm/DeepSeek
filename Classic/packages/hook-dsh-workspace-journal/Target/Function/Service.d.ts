import { Service, type Context } from "@deepseek-ai/cordis";
import type BatchRecord from "../Interface/Batch.js";
import type EntryRecord from "../Interface/Entry.js";
import type Result from "../Interface/Result.js";
import type { RecoveryReport } from "../Interface/Result.js";
import type State from "../Interface/State.js";
export default class WorkspaceJournal extends Service {
    /** The apply-built state the methods read and write. */
    State: State;
    constructor(Context: Context, State: State);
    /** Journal a batch and its revert data BEFORE the writes land. */
    open(Batch: {
        batchId: string;
        operation: string;
        parent?: string;
        files: string[];
    }, Entries: {
        path: string;
        state: "present" | "absent";
        version: string;
        content: string;
    }[]): Promise<BatchRecord>;
    /** Close the batch: "verified" or "recovery-required". */
    seal(BatchId: string, Next: "verified" | "recovery-required", Reason?: string): Promise<BatchRecord>;
    /** Replay the batch backward; per-file report. */
    revert(BatchId: string): Promise<Result>;
    /** The boot pass: mark still-applying batches recovery-required. */
    recover(): Promise<RecoveryReport>;
    /** One batch record, or undefined. */
    batch(BatchId: string): BatchRecord | undefined;
    /** All batch records (ring order). */
    batches(): BatchRecord[];
    /** One batch's revert data (its entries), file order. */
    entries(BatchId: string): EntryRecord[];
    /** The statistics triple. */
    statistics(): {
        batches: number;
        entries: number;
        applying: number;
    };
}
declare module "@deepseek-ai/cordis" {
    interface Context {
        /** The workspace-journal hook's service (registered from apply). */
        workspaceJournal: WorkspaceJournal;
    }
}
