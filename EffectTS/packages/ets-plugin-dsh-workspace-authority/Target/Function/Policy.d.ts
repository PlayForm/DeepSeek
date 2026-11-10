/**
 * @module Policy
 *
 * The policy table lookup for one residency record.
 *
 * @remarks
 * The first rule whose kind matches the residency record's kind (exactly or
 * "*") wins. No match returns undefined - the default disposition "keep"
 * applies (the license decides conservatively when unconfigured).
 */
import type PolicyRule from "../Interface/Policy.js";
import type Residency from "../Interface/Residency.js";
export default _default;
declare function _default(Rules: PolicyRule[], Record: Residency): PolicyRule | undefined;
