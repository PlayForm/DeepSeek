export default _default;
/**
 * @module Glob
 *
 * The minimal matcher for the config's include/exclude globs.
 *
 * @remarks
 *
 * A double star matches across separators, a single star within one, `?` a
 * single character, everything else literal. A pattern matches at ANY path
 * depth (an implicit double-star-then-slash prefix - the default exclude list
 * is written exactly that way: `node_modules` plus a double star must keep
 * `pkg/node_modules/x.js` out too), and a pattern without a slash also
 * matches the basename (the gitignore convenience). No dependency, no
 * caching - one compiled RegExp per call (v0 volumes).
 */
declare function _default(Pattern: string, Path: string): boolean;
