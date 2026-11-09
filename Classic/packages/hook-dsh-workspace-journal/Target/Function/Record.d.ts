/**
 * @module Record
 *
 * The batch-record persistence: one put into the domain's `batches` table,
 * fire-and-forget.
 *
 * @remarks
 * Called from the seal, the recover and the listener's progress checkpoint -
 * the caller is always an async path or a guarded synchronous one, so the put
 * is never awaited by the synchronous listener.
 */
import type BatchRecord from "../Interface/Batch.js";
import type State from "../Interface/State.js";
export default _default;
declare function _default(State: State, Batch: BatchRecord): Promise<void>;
