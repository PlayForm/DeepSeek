/**
 * @module Forecast
 *
 * The projection the plan asks to stay a query, not a stored guess
 * (Documentation/Plans/COST-TRACK-PLUGIN.md section 17.5).
 *
 * @remarks
 * Over the Rollup's daily rate per (Scope, Key) across the last window of
 * days - anchored at each key's own latest day, so an old ledger still
 * projects - the mean, the median, the mean of the last seven days, and the
 * projection to a thirty-day period as the mean times thirty with the
 * confidence band from the daily minimum and maximum times thirty. A
 * history of fewer than two days projects with no spread (minimum and
 * maximum both at the projection). The forecast never writes a row; the
 * caller labels it an estimate in every export.
 */
import type { DatabaseSync } from "node:sqlite";
/**
 * One (scope, key) projection row.
 */
type Row = {
    Scope: string;
    Key: string;
    Mean: number;
    Median: number;
    LastSeven: number;
    Projected: number;
    Minimum: number;
    Maximum: number;
};
export default _default;
declare function _default(Database: DatabaseSync): (Days: number) => readonly Row[];
