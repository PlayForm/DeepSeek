import type CostContributionRow from "./ContributionRow.js";
import type CostResponse from "./Response.js";
import type ValuationSelection from "./ValuationSelection.js";
export type { default as Catalog } from "./Catalog.js";
export type { default as PricingService } from "./PricingService.js";
export type { default as RateRow } from "./RateRow.js";
export type { default as Revision } from "./Revision.js";
export type { ValuationBasis } from "./ValuationSelection.js";
export type { ValuationSelection };
export default interface CostService {
    session(SessionId: string, Rows: number, Selection?: ValuationSelection): CostResponse;
    contributions(Path: string): readonly CostContributionRow[];
}
