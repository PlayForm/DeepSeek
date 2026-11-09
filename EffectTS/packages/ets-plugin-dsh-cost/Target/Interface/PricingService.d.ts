import type Catalog from "@Interface/Catalog.js";
import type PricingPreview from "@Interface/PricingPreview.js";
import type RateRow from "@Interface/RateRow.js";
import type Revision from "@Interface/Revision.js";
export default interface PricingService {
    catalogs(): readonly Catalog[];
    revisions(CatalogId: number): readonly Revision[];
    rates(RevisionId: number): readonly RateRow[];
    publish(CatalogId: number, BaseRevisionId: number | null, Reason: string, Rows: readonly RateRow[]): Revision;
    preview(RevisionId: number, SessionId: string): PricingPreview;
}
