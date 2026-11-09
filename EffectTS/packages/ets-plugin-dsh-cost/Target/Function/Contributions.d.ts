import type { DatabaseSync } from "node:sqlite";
import type ContributionRow from "@Interface/ContributionRow.js";
import type FileCallRow from "@Interface/FileCallRow.js";
export default _default;
declare function _default(Database: DatabaseSync): {
    Contributions: (Path: string) => readonly ContributionRow[];
    FileCalls: (Path: string, SessionId: string) => readonly FileCallRow[];
};
