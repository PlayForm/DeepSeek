// Catalog - one named pricing catalog of the ledger's valuation model
// (Temporary/Cost-Research/Plan.md lane B4b; the valuation model of
// Temporary/Cost-Research/Backlog.md section 5, restating the research's
// sections 3 and 6): the stable identity a revision hangs from - a workspace
// book, a negotiated arrangement or a hypothetical scenario - named once and
// never renamed by a rate change, because money already recorded must keep
// pointing at the same identity. The "bootstrap" catalog is the one the v5
// rung seeds from the capture-time Price book, so the shipped defaults are an
// identified catalog rather than an untraceable source of truth.
export default interface Catalog {
	readonly CatalogId: number;
	readonly Name: string;
}
