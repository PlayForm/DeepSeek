/**
 * @module Evict
 *
 * The disposition pass: the eviction rule of the authority service.
 *
 * @remarks
 * For every residency record (or the named subset), in WEIGHT-DESCENDING
 * order (the weight only RANKS the candidates - it never decides anything),
 * the policy table decides the disposition:
 *
 * - `keep` - the record stays;
 * - `promote` - the record is marked protected;
 * - `defer` - the decision is postponed (kept) until the record's residency
 *   age exceeds the rule's maxResidencyMs, then it is evicted;
 * - `evict` - the record is removed from the residency set but kept in the
 *   graveyard (recoverable);
 * - `discard` - the record is removed permanently (the graveyard entry, if
 *   any, goes too).
 *
 * THE LICENSE DECIDES, THE WEIGHT ONLY RANKS. Two shields force "keep" over
 * the policy: an OPEN, NON-EXPIRED LEASE on the resource, and an ACTIVE
 * CAPABILITY covering it (a revoked capability shields only within the
 * revocation grace - the policy's revocation timing). Every disposition is
 * ledgered: `evicted <resource> (<disposition>)`.
 */
import type State from "../Interface/State.js";
export default _default;
declare function _default(State: State, Resources?: string[]): {
    resource: string;
    disposition: string;
}[];
