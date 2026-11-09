export default _default;
/**
 * @module Match
 *
 * The glob matcher: a minimal double-star, `*`, and `?` translation to a
 * RegExp, anchored at both ends.
 *
 * @remarks
 * A double star crosses directories; a `*` does not. No dependency on an
 * external glob library (the PO C self-containment rule).
 */
declare function _default(Pattern: string): RegExp;
