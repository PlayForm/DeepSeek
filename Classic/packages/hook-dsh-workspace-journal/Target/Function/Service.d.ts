import { Service, type Context } from "@deepseek-ai/cordis";
import type BatchRecord from "../Interface/Batch.js";
import type EntryRecord from "../Interface/Entry.js";
import type Result from "../Interface/Result.js";
import type { RecoveryReport } from "../Interface/Result.js";
import type State from "../Interface/State.js";
/**
 * @module Service
 *
 * The `workspaceJournal` service: extends the cordis Service base and is
 * REGISTERED FROM APPLY.
 *
 * @remarks
 *
 * The Service base constructor calls ctx.reflect.provide("workspaceJournal",
 * this), so `ctx.workspaceJournal` resolves. Declaration merging below gives
 * the typed accessor.
 *
 * The methods are thin delegates (one Function module each):
 *
 *   open(batch, entries) - journal a batch BEFORE its writes land; throws
 *                          if storage is down (no journal, no writes);
 *   seal(batchId, next, reason?) - close the batch (verified |
 *                          recovery-required);
 *   revert(batchId)      - replay the batch backward; returns the per-file
 *                          report;
 *   recover()            - the boot pass: mark still-applying batches
 *                          recovery-required;
 *   batch(batchId)       - one batch record, or undefined;
 *   batches()            - all batch records (ring order);
 *   entries(batchId)     - one batch's revert data;
 *   statistics()         - { batches, entries, applying }.
 *
 * THE CALL-TIME MASTER SWITCH: the mutating paths (open, seal, revert) read
 * State.On at the moment of the call and refuse by throwing the byte-stable
 * `journal: disabled (enabled=false)` error with ZERO ledger lines while the
 * hook is disabled (the existing throw-refusal shape, "no journal, no
 * writes"; the live-flip law - a volatile flip acts on the very next call).
 * recover() answers the honest empty report `{ batchIds: [] }` (Function/
 * Recover). The read surface answers from the state and writes nothing, so
 * it needs no flag.
 */
export default class WorkspaceJournal extends Service {
    /**
     * The apply-built state the methods read and write.
     */
    State: State;
    constructor(Context: Context, State: State);
    /**
     * Journal a batch and its revert data BEFORE the writes land.
     */
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
    /**
     * Close the batch: "verified" or "recovery-required".
     */
    seal(BatchId: string, Next: "verified" | "recovery-required", Reason?: string): Promise<BatchRecord>;
    /**
     * Replay the batch backward; per-file report.
     */
    revert(BatchId: string): Promise<Result>;
    /**
     * The boot pass: mark still-applying batches recovery-required.
     */
    recover(): Promise<RecoveryReport>;
    /**
     * One batch record, or undefined.
     */
    batch(BatchId: string): BatchRecord | undefined;
    /**
     * All batch records (ring order).
     */
    batches(): BatchRecord[];
    /**
     * One batch's revert data (its entries), file order.
     */
    entries(BatchId: string): EntryRecord[];
    /**
     * The statistics triple.
     */
    statistics(): {
        batches: number;
        entries: number;
        applying: number;
    };
}
declare module "@deepseek-ai/cordis" {
    interface Context {
        /**
         * The workspace-journal hook's service (registered from apply).
         */
        workspaceJournal: WorkspaceJournal;
    }
}
