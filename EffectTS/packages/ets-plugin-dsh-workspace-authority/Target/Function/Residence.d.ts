/**
 * @module Residence
 *
 * The residency record path: register or touch one resource's record.
 *
 * @remarks
 * The WHAT STAYS record. The weight is stored in its own field -
 * representation only: it ranks the eviction candidates, it never decides a
 * disposition (the logged license/weight conflation pitfall).
 */
import type Residency from "../Interface/Residency.js";
import type State from "../Interface/State.js";
export default _default;
declare function _default(State: State, Resource: string, Kind: string, Weight: number): Residency | undefined;
