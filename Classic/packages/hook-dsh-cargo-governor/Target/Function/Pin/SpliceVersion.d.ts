export default _default;
/**
 * @module SpliceVersion
 *
 * Replaces the version string inside a single line's value with the canonical
 * form.
 *
 * @remarks
 * The `version` key is tried FIRST so an inline table that also carries
 * `path`/`git` keys (`dep = { path = "../x", version = "0.1" }`) splices the
 * right string; the quoted-string form (`name = "0.3.4"`, with or without a
 * trailing comment) is the fallback for the simple requirement shape. Returns
 * the line unchanged when no version string is present.
 */
declare function _default(Line: string, To: string): string;
