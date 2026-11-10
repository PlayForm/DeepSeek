import type Pack from "../Interface/Pack.js";
export default _default;
/**
 * @module Extends
 *
 * The normalized `extends:` list of a pack: absent is `[]`, a scalar is one
 * name, an array is the list.
 *
 * @remarks
 *
 * `Normalize` also normalizes it, but the chain reads layers that may not have
 * gone through `Normalize`.
 */
declare function _default(Pack: Pack): string[];
