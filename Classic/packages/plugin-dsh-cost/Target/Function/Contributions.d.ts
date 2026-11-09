import type { DatabaseSync } from "node:sqlite";
import type CostContributionRow from "../Interface/ContributionRow.js";
export default function Contributions(Database: DatabaseSync, Path: string): readonly CostContributionRow[];
