import { basename } from "node:path";

/**
 * @module Slug
 *
 * The repo slug: the repo root's basename, lowercased (D2).
 *
 * @remarks
 * A pack may override it with `slug:`; the override is read from the repo layer
 * before the user layer is located.
 */

export default (Root: string): string => basename(Root).toLowerCase();
