/**
 * @module Release
 *
 * The lease release path: close the record, ledger.
 *
 * @remarks
 * Releasing an unknown or already-closed lease is reported honestly, never
 * faked.
 */
import type State from "../Interface/State.js";
export default _default;
declare function _default(State: State, Id: string): boolean;
