import type { DatabaseSync } from "node:sqlite";
import type CostContributionRow from "@Interface/ContributionRow.js";
import type CostFileCallRow from "@Interface/FileCallRow.js";
import type CostVersionRow from "@Interface/VersionRow.js";
export default function Contributions(Database: DatabaseSync, Path: string): readonly CostContributionRow[];
export declare function FileCalls(Database: DatabaseSync, Path: string, SessionId: string): readonly CostFileCallRow[];
export declare function History(Database: DatabaseSync, Path: string): readonly CostVersionRow[];
