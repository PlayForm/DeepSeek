import type { DatabaseSync } from "node:sqlite";
import type Config from "../Interface/Config.js";
export default _default;
/**
 * @module Recompute
 *
 * The drop-and-rebuild (Documentation/Plans/COST-TRACK-PLUGIN.md section
 * 2.4): every number a formula consumes is stored.
 *
 * @remarks
 *
 * Call holds the usage and the priced cost columns and the surface tokens,
 * Touch holds the byte deltas, ContextMass holds the per-file mass - so the
 * Allocation and Rollup tables can be dropped and rebuilt from those tables
 * alone and land byte-identical totals. No session log is read.
 */
declare function _default(Database: DatabaseSync, Config: Config): () => {
    Allocations: number;
    Rollups: number;
};
