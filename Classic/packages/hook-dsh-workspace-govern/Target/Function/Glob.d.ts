export default _default;
/**
 * @module Glob
 *
 * One glob match: the tiny matcher the gate uses for the scope allowlist and
 * the exclusion list.
 *
 * @remarks
 *
 * Supported syntax, deliberately minimal: `**` (a double star) crosses
 * directory separators, `*` matches within one segment, `?` matches one
 * character; everything else is literal. A pattern without a slash anchors at
 * the start of the path either way (the match is always full-path, never
 * suffix).
 */
declare function _default(Path: string, Pattern: string): boolean;
