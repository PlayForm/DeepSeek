import type { DatabaseSync } from "node:sqlite";
/**
 * @module Forecast
 *
 * The projection the plan asks to stay a query, not a stored guess: the daily
 * rate per (Scope, Key) over the Rollup's last window of days, projected to a
 * thirty-day period with its confidence band.
 *
 * @remarks
 *
 * The projection follows `Documentation/Plans/COST-TRACK-PLUGIN.md` section
 * 17.5. It is anchored at each key's own latest day, so an old ledger still
 * projects, and answers the mean, the median, the mean of the last seven days,
 * and the projection to a thirty-day period as the mean times thirty with the
 * confidence band from the daily minimum and maximum times thirty. A history of
 * fewer than two days projects with no spread (minimum and maximum both at the
 * projection). The forecast never writes a row; the caller labels it an
 * estimate in every export.
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
