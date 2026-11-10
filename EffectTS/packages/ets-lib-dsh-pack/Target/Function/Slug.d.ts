export default _default;
/**
 * @module Slug
 *
 * Reads the repo slug: the repo root's basename, lowercased (D2).
 *
 * @remarks
 *
 * A pack may override it with `slug:`; the override is read from the repo
 * layer before the user layer is located.
 */
declare function _default(Root: string): string;
