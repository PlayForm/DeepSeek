import type Lease from "../Interface/Lease.js";
import type State from "../Interface/State.js";
export default _default;
declare function _default(State: State, Holder: string, Resource: string, Kind: string, TtlMs?: number | undefined): Lease | undefined;
