export default _default;
/**
 * @module SplitPath
 *
 * Split a TOML header's inner content on dots that are not inside quotes.
 *
 * @remarks
 * It then unquotes each segment, producing the same normalized path
 * Function/Decode derives from the parsed document (the surgical rewrite's
 * scanner-state input).
 */
declare function _default(Inner: string): string[];
