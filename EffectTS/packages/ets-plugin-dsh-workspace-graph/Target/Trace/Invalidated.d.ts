import { type Draft } from "@playform/ets-lib-dsh-trace";
export default _default;
/**
 * @module Invalidated
 *
 * The `graph/invalidated` draft: the record the graph held for a path is no
 * longer valid.
 *
 * @remarks
 *
 * Three reasons:
 *
 * - "replaced" - a re-index replaced an existing record (the version the
 *   previous record carried is included);
 * - "removed" - removeFile deleted the record;
 * - "absent" - the observation reported the file absent (the stale record
 *   stays until removeFile, but the consumers must not trust it).
 *
 * The consumers (the context packet cache) drop what they cached for the
 * path; no ledger line is added by this event (the module's strings stay
 * byte-exact).
 */
declare function _default(Path: string, Reason: string, Version?: string): Draft;
