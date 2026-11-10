/**
 * @module Assess
 *
 * The analytics surface: one read-only query per call that buckets a session's
 * spend the way a client argues about it, plus the derived cost per surviving
 * line and the edit-grain totals.
 *
 * @remarks
 * The buckets follow `Documentation/Plans/COST-TRACK-PLUGIN.md` section 12 and
 * section 16: delivered (the files whose verdict is "changed"), explored (read
 * or searched, never changed), reverted (changed and then undone), overhead
 * (the unattributed rows - retries, compaction, title generation, tooling) and
 * carry (the amortized input mass, the part a client always disputes). The
 * edit-grain totals (section 17.3) are the hunks' own lines added and removed
 * per session. The ledger always stores the undiscounted truth; this is a view
 * over it, and a discount policy stays an export-time concern (section 12). The
 * money is rounded to six decimals, the reading precision of every other report
 * row.
 */
import type { DatabaseSync } from "node:sqlite";
type Row = {
    SessionId: string;
    Delivered: number;
    Explored: number;
    Reverted: number;
    Overhead: number;
    Carry: number;
    CostPerLine: number;
    LinesAdded: number;
    LinesRemoved: number;
};
export default _default;
declare function _default(Database: DatabaseSync): (SessionId?: string) => readonly Row[];
