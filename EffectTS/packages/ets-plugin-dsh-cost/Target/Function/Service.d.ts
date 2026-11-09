import type { DatabaseSync } from "node:sqlite";
import { Service, type Context } from "@deepseek-ai/cordis";
import type Catalog from "../Interface/Catalog.js";
import type Config from "../Interface/Config.js";
import type PricingPreview from "../Interface/PricingPreview.js";
import type RateRow from "../Interface/RateRow.js";
import type Revision from "../Interface/Revision.js";
export default class CostPricing extends Service {
    /** The engine the methods delegate to (Function/Pricing over this ledger). */
    private readonly Engine;
    constructor(Context: Context, Database: DatabaseSync, Config: Config);
    /** Every catalog the ledger carries, in creation order. */
    catalogs(): readonly Catalog[];
    /** One catalog's revisions, newest first (the order a history reads). */
    revisions(CatalogId: number): readonly Revision[];
    /** One revision's rate rows in card order. */
    rates(RevisionId: number): readonly RateRow[];
    /** The one write: a published revision and its rate rows, or nothing. */
    publish(CatalogId: number, BaseRevisionId: number | null, Reason: string, Rows: readonly RateRow[]): Revision;
    /** The re-pricing of one session under one revision (nothing persisted). */
    preview(RevisionId: number, SessionId: string): PricingPreview;
}
declare module "@deepseek-ai/cordis" {
    interface Context {
        /** The versioned pricing-catalog service (registered from apply). */
        costPricing: CostPricing;
    }
}
