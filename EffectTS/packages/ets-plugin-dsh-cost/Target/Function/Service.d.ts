/**
 * @module Service
 *
 * The `costPricing` service (the twin's service idiom: a cordis Service
 * subclass whose constructor registers the instance on the context, exactly
 * as Function/Service does for the other ets-* plugins).
 *
 * @remarks
 * Apply constructs it over the ledger effect's own write handle, so the WAL
 * pragmas and the foreign keys already in force there are the ones
 * `publish`'s transaction uses, and no second write handle is opened for a
 * rare insert.
 *
 * The methods are thin delegates to Function/Pricing (the engine, which
 * owns every statement): `catalogs`, `revisions` and `rates` are the reads
 * a settings view lists, `publish` is the one write (one transaction that
 * inserts a published revision and its rate rows, or nothing at all), and
 * `preview` is the re-pricing that persists nothing. The service is the
 * surface a panel or another plugin resolves through `ctx.costPricing`;
 * nothing else in this tree calls it.
 *
 * BESIDE THE COST SERVICE: the Classic engine provides this service beside
 * its `cost` read service (Classic's Function/Provide registers both over
 * one handle). The twin has not ported that read service - its file-scoped
 * reads are Functions, not a service - so this is the plugin's only
 * service, and it is provided from the ledger effect where the write handle
 * lives.
 */
import type { DatabaseSync } from "node:sqlite";
import { Service, type Context } from "@deepseek-ai/cordis";
import type Catalog from "../Interface/Catalog.js";
import type Config from "../Interface/Config.js";
import type PricingPreview from "../Interface/PricingPreview.js";
import type RateRow from "../Interface/RateRow.js";
import type Revision from "../Interface/Revision.js";
export default class CostPricing extends Service {
    /**
     * The engine the methods delegate to (Function/Pricing over this
     * ledger).
     */
    private readonly Engine;
    constructor(Context: Context, Database: DatabaseSync, Config: Config);
    /**
     * Every catalog the ledger carries, in creation order.
     */
    catalogs(): readonly Catalog[];
    /**
     * One catalog's revisions, newest first (the order a history reads).
     */
    revisions(CatalogId: number): readonly Revision[];
    /**
     * One revision's rate rows in card order.
     */
    rates(RevisionId: number): readonly RateRow[];
    /**
     * The one write: a published revision and its rate rows, or nothing.
     */
    publish(CatalogId: number, BaseRevisionId: number | null, Reason: string, Rows: readonly RateRow[]): Revision;
    /**
     * The re-pricing of one session under one revision (nothing persisted).
     */
    preview(RevisionId: number, SessionId: string): PricingPreview;
}
declare module "@deepseek-ai/cordis" {
    interface Context {
        /**
         * The versioned pricing-catalog service (registered from apply).
         */
        costPricing: CostPricing;
    }
}
