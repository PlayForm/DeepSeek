import type Residency from "@Interface/Residency.js";
import type State from "@Interface/State.js";
export default _default;
/**
 * @module Residence
 *
 * The residency record path: register or touch the WHAT STAYS record for one
 * resource.
 *
 * @remarks
 * The weight is stored in its own field - representation only: it ranks the
 * eviction candidates, it never decides a disposition (the logged
 * license/weight conflation pitfall).
 */
declare function _default(State: State, Resource: string, Kind: string, Weight: number): Residency | undefined;
