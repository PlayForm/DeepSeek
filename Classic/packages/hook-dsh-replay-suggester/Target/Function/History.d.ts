import type { ReplayRecord } from "../Interface/History.js";
export default _default;
/**
 * Load the store once at apply.
 * @param Path - the configured store path (may be `~`-prefixed).
 * @param Log - the ledger line sink for the load outcome.
 * @returns the records, most recent first; empty when the store is absent
 * or corrupt (the degradation, never a throw).
 */
declare function _default(Path: string, Log: (Line: string) => void): ReplayRecord[];
/**
 * Recall the record whose probe matches the current probe: a record
 * matches when its probe literal occurs in the current probe (or vice
 * versa) - the semantic repetition is the record's job (it was mined with
 * the intent label); the recall is the literal check only. The LONGEST
 * matching probe wins (the most specific record).
 */
export declare const Recall: (Records: ReplayRecord[], Probe: string) => ReplayRecord | undefined;
