import type CostContributionRow from "../Interface/ContributionRow.js";
import type CostResponse from "../Interface/Response.js";
import type { Catalog, CostFileCallRow, CostVersionRow, RateRow, Revision, ValuationSelection } from "@playform/plugin-dsh-cost/service";
export default function Fetch(SessionId: string, Rows: number, Selection?: ValuationSelection): Promise<CostResponse>;
export declare function Contributions(Path: string): Promise<readonly CostContributionRow[]>;
export declare function FileCalls(Path: string, SessionId: string): Promise<readonly CostFileCallRow[]>;
export declare function History(Path: string): Promise<readonly CostVersionRow[]>;
export type CatalogAnswer = {
    readonly catalogs: readonly Catalog[];
    readonly revisions: readonly Revision[];
};
export declare function Catalogs(): Promise<CatalogAnswer>;
export declare function Rates(RevisionId: number): Promise<readonly RateRow[]>;
export type PublishRow = Omit<RateRow, "RateRowId" | "RevisionId">;
export type PublishRequest = {
    readonly catalogId: number;
    readonly baseRevisionId: number | null;
    readonly reason: string;
    readonly rows: readonly PublishRow[];
};
export type PublishAnswer = {
    readonly ok: boolean;
    readonly revision: Revision | null;
    readonly code: string;
    readonly message: string | null;
    readonly path: string;
};
export declare function Publish(Request: PublishRequest): Promise<PublishAnswer>;
