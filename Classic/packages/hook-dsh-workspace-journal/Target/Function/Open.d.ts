import type BatchRecord from "../Interface/Batch.js";
import type EntryRecord from "../Interface/Entry.js";
import type State from "../Interface/State.js";
export default _default;
/**
 * @module Open
 *
 * The batch open path: the journal is written BEFORE the batch's writes land.
 *
 * @remarks
 *
 * The caller (the merge step) passes the batch identity plus the per-file
 * pre-images it captured before writing; the entries are the REVERT DATA and
 * land in the domain's `entries` table first, the batch record (state
 * `applying`) second, the ring third. If any part of the open fails, the
 * caller is told so it can refuse to proceed - "the workspace transaction is
 * the ordered set of those writes plus the journal"
 * (WORKSPACE-FAMILY-V4-1.md section 3.8): no journal, no writes.
 *
 * The in-memory maps and the bounded ring are the read surface; the domain
 * persistence is fire-and-forget (`void .catch(...)`), but the FIRST write
 * of the batch record is awaited so a total storage failure is observable.
 */
declare function _default(State: State, Batch: BatchRecord, Entries: EntryRecord[]): Promise<void>;
