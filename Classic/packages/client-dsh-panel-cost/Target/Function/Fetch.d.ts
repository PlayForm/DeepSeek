import type CostContributionRow from "../Interface/ContributionRow.js";
import type CostResponse from "../Interface/Response.js";
export default function Fetch(SessionId: string, Rows: number): Promise<CostResponse>;
export declare function Contributions(Path: string): Promise<readonly CostContributionRow[]>;
