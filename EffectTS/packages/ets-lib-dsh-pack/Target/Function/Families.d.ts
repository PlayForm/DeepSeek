/**
 * @module Families
 *
 * Returns one suggester domain's families, in priority order.
 *
 * @remarks
 * A family lives in the pack under `<domain>/<id>`; the projection drops the
 * other domains, sorts by priority (lower wins) and memoizes the list per pack
 * object and domain, so the hot path allocates once per loaded pack.
 */
import type Family from "../Interface/Family.js";
import type Pack from "../Interface/Pack.js";
export default _default;
declare function _default(Pack: Pack, Domain: string): Family[];
