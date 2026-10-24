// Target - one companion of a pack family: the path or glob, the kind (the
// domain's own vocabulary; "" when the family has no kinds), the static
// prior, the one reason phrase the model reads, and an optional digest hint
// (the short literal a generated index may verify; never parsed at runtime).
export default interface Target {
	/** The companion path or glob (repo-, package- or sibling-relative). */
	path: string;
	/** The companion kind ("doc", "index", "style", "site", ...; "" when unset). */
	kind: string;
	/** The prior: 1.0 canonical, 0.6 family, 0.3 fallback. */
	prior: number;
	/** The one reason phrase the model reads. */
	reason: string;
	/** The digest hint - the short literal a generated index may verify. */
	digest?: string;
}
