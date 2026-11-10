/**
 * @module Recompute
 *
 * The drop-and-rebuild: every number a formula consumes is stored, so the
 * Allocation and Rollup tables can be dropped and rebuilt from those tables
 * alone and land byte-identical totals.
 *
 * @remarks
 * The rebuild follows `Documentation/Plans/COST-TRACK-PLUGIN.md` section 2.4.
 * Call holds the usage and the priced cost columns and the surface tokens,
 * Touch holds the byte deltas, ContextMass holds the per-file mass. No session
 * log is read.
 */
import type { DatabaseSync } from "node:sqlite";
import type Config from "../Interface/Config.js";
export default _default;
declare function _default(Database: DatabaseSync, Config: Config): () => {
    Allocations: number;
    Rollups: number;
};
