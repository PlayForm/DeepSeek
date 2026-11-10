import { type Draft } from "@playform/lib-dsh-trace";
export default _default;
/**
 * @module Indexed
 *
 * The `graph/indexed` draft: a record was stored (a new file or a replaced one).
 *
 * @remarks
 *
 * The payload carries the resolved display path, the record's version and the indexRevision the
 * store reached.
 */
declare function _default(Path: string, Version: string, Revision: number): Draft;
