import type Pack from "../Interface/Pack.js";
export default _default;
/**
 * @module Signature
 *
 * Decides whether a directory matches a pack's signature.
 *
 * @remarks
 *
 * At least ONE of the pack's marker paths exists under it (OR, not AND: a repo
 * may carry more than one marker and any one identifies it). A pack without a
 * signature falls back to the default marker, so the pre-pack gate's behaviour
 * is preserved.
 */
declare function _default(Pack: Pack, Root: string): boolean;
