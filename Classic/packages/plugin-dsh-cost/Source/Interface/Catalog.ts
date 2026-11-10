/**
 * @module Catalog
 *
 * One named pricing catalog of the ledger's valuation model: the stable
 * identity a revision hangs from, named once and never renamed by a rate
 * change.
 *
 * @remarks
 *
 * The shape follows `Temporary/Cost-Research/Plan.md` lane B4b and the
 * valuation model of `Temporary/Cost-Research/Backlog.md` section 5, restating
 * the research's sections 3 and 6. A catalog names a workspace book, a
 * negotiated arrangement or a hypothetical scenario; money already recorded
 * must keep pointing at the same identity. The "bootstrap" catalog is the one
 * the v5 rung seeds from the capture-time Price book, so the shipped defaults
 * are an identified catalog rather than an untraceable source of truth.
 */
export default interface Catalog {
	/**
	 * The ledger's own catalog row id.
	 */
	readonly CatalogId: number;
	/**
	 * The catalog's unique name, "bootstrap" for the seeded book.
	 */
	readonly Name: string;
}
