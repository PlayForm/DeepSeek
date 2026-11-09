// Catalog - one named pricing catalog of the ledger's valuation model (the
// cost research's sections 3 and 6): the stable identity a revision hangs
// from - a workspace book, a negotiated arrangement or a hypothetical
// scenario - named once and never renamed by a rate change, because money
// already recorded must keep pointing at the same identity. The "bootstrap"
// catalog is the one the v7 rung seeds from the capture-time Price book, so
// the shipped defaults are an identified catalog rather than an untraceable
// source of truth. The field names are the ledger's own column names, exactly
// as the row mappers of Function/Pricing read them.
export default interface Catalog {
	readonly CatalogId: number;
	readonly Name: string;
}
