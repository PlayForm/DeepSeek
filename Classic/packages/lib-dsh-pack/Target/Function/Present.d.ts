export default _default;
/**
 * @module Present
 *
 * Whether a directory can be a workspace at all: it carries a repo layer, a
 * user layer for its slug, or the default signature.
 *
 * @remarks
 * The locator skips every other ancestor without loading a pack, so the walk
 * stays cheap on a deep path.
 */
declare function _default(Root: string, Home: string): boolean;
