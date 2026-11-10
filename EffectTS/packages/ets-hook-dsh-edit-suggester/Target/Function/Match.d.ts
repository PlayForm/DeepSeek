/**
 * @module Match
 *
 * Answers whether a judged call names one of a note's companions.
 *
 * @remarks
 * The follow-through's only lookup (completion spec 03-SUGGESTERS section 2: "a named
 * companion subsequently touched").
 *
 * The pack mixes three path bases (repo-relative, package-relative and sibling globs),
 * and a call path may be absolute or cwd-relative, so the rules mirror the existence
 * filter's and the search consumer's graph match:
 *
 * - a literal companion matches an equal call path or one ENDING in `/<companion>` (the
 *   absolute form of a relative companion);
 * - a `*` then `/<rest>` glob matches a call path ending in `/<rest>` (any package);
 * - any other glob is a segment-anchored regex (a double star then a slash = any depth,
 *   `*` = one segment).
 */
export default _default;
declare function _default(
/**
 * The companion path or glob the note named.
 */
Companion: string, 
/**
 * The judged call's path.
 */
CallPath: string): boolean;
