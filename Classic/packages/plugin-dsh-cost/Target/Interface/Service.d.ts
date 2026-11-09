import type CostContributionRow from "./ContributionRow.js";
import type CostResponse from "./Response.js";
export default interface CostService {
    session(SessionId: string, Rows: number): CostResponse;
    contributions(Path: string): readonly CostContributionRow[];
}
