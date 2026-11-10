export default _default;
/**
 * @module SplitPath
 *
 * Splits a TOML header's inner content on dots that are not inside quotes, then
 * unquotes each segment.
 *
 * @remarks
 *
 * The result is the same normalized path Function/Decode derives from the
 * parsed document (the surgical rewrite's scanner-state input).
 */
declare function _default(Inner: string): string[];
