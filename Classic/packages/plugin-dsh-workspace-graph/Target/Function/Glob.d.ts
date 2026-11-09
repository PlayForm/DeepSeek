export default _default;
/**
 * @module Glob
 *
 * The minimal matcher for the config's include and exclude globs.
 *
 * @remarks
 * `**` matches across separators, `*` within one, `?` a single character, and everything
 * else is literal.
 *
 * A pattern matches at ANY path depth (an implicit `**` + `/` prefix - the default exclude
 * list is written exactly that way: `node_modules/**` must keep `pkg/node_modules/x.js`
 * out too), and a pattern without a slash also matches the basename (the gitignore
 * convenience).
 *
 * The matcher carries no dependency and no caching: one compiled RegExp per call (v0
 * volumes).
 */
declare function _default(Pattern: string, Path: string): boolean;
