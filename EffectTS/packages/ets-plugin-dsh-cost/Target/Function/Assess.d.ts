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
