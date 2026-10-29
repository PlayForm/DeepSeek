import type { DatabaseSync } from "node:sqlite";
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
