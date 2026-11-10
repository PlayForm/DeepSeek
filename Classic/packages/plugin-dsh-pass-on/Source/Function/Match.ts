/**
 * @module Match
 *
 * The glob matcher: a minimal double-star, `*`, and `?` translation to a
 * RegExp, anchored at both ends.
 *
 * @remarks
 *
 * A double star crosses directories; a `*` does not. No dependency on an
 * external glob library (the PO C self-containment rule).
 */
export default (Pattern: string): RegExp => {
	const Source = Pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&")
		.replace(/\*\*/g, "\u0000")
		.replace(/\*/g, "[^/]*")
		.replace(/\?/g, "[^/]")
		.replace(/\u0000/g, ".*");
	return new RegExp(`^${Source}$`);
};
