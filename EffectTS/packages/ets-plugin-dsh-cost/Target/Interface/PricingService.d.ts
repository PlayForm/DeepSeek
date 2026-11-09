import type Catalog from "./Catalog.js";
import type PricingPreview from "./PricingPreview.js";
import type RateRow from "./RateRow.js";
import type Revision from "./Revision.js";
export default interface PricingService {
    catalogs(): readonly Catalog[];
    revisions(CatalogId: number): readonly Revision[];
    rates(RevisionId: number): readonly RateRow[];
    publish(CatalogId: number, BaseRevisionId: number | null, Reason: string, Rows: readonly RateRow[]): Revision;
    preview(RevisionId: number, SessionId: string): PricingPreview;
}
