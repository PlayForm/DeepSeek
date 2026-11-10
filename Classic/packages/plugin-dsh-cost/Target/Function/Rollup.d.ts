/**
 * @module Rollup
 *
 * The materialized aggregate refresh: the Rollup table rebuilt for one UTC day
 * (or every day that has priced calls) over the ledger's scopes, from
 * Allocation joined Call, File, Project, Session and Client.
 *
 * @remarks
 * The refresh follows `Documentation/Plans/COST-TRACK-PLUGIN.md` section 3 and
 * covers the file, project, client, model and session scopes. The rebuild is a
 * pure upsert over a GROUP BY, so a recompute lands byte-identical totals. It
 * returns the row count written.
 */
import type { DatabaseSync } from "node:sqlite";
export default _default;
declare function _default(Database: DatabaseSync): (Day?: string | readonly number[]) => number;
