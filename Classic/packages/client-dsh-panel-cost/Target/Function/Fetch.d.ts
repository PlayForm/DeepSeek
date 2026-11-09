import type CostContributionRow from "../Interface/ContributionRow.js";
import type CostResponse from "../Interface/Response.js";
import type { Catalog, RateRow, Revision, ValuationSelection } from "@playform/plugin-dsh-cost/service";
export default function Fetch(SessionId: string, Rows: number, Selection?: ValuationSelection): Promise<CostResponse>;
export declare function Contributions(Path: string): Promise<readonly CostContributionRow[]>;
export type CatalogAnswer = {
    readonly catalogs: readonly Catalog[];
    readonly revisions: readonly Revision[];
};
export declare function Catalogs(): Promise<CatalogAnswer>;
export declare function Rates(RevisionId: number): Promise<readonly RateRow[]>;
