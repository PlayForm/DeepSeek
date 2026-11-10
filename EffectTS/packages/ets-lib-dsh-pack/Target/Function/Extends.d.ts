import type Pack from "../Interface/Pack.js";
export default _default;
/**
 * @module Extends
 *
 * Reads the normalized `extends:` list of a pack.
 *
 * @remarks
 *
 * An absent `extends` is an empty list, a scalar is one name, and an array is
 * the list. Normalize also normalizes it, but the chain reads layers that may
 * not have gone through Normalize.
 */
declare function _default(Pack: Pack): string[];
