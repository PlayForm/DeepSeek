import type CostContributionRow from "./ContributionRow.js";
import type CostFileCallRow from "./FileCallRow.js";
import type CostResponse from "./Response.js";
import type ValuationSelection from "./ValuationSelection.js";
import type CostVersionRow from "./VersionRow.js";
export type { default as Catalog } from "./Catalog.js";
export type { default as CostFileCallRow } from "./FileCallRow.js";
export type { default as CostVersionRow } from "./VersionRow.js";
export type { default as PricingService } from "./PricingService.js";
export type { default as RateRow } from "./RateRow.js";
export type { default as Revision } from "./Revision.js";
export type { ValuationBasis } from "./ValuationSelection.js";
export type { ValuationSelection };
export default interface CostService {
    session(SessionId: string, Rows: number, Selection?: ValuationSelection): CostResponse;
    contributions(Path: string): readonly CostContributionRow[];
    fileCalls(Path: string, SessionId: string): readonly CostFileCallRow[];
    history(Path: string): readonly CostVersionRow[];
}
