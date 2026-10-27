import type State from "../Interface/State.js";
export default _default;
declare function _default(
/** The plugin state (the mirror, the handle, the ledger). */
State: State, 
/** The probed storage facility (ctx.storage.domain or ctx.storageDomain). */
Facility: unknown): Promise<void>;
