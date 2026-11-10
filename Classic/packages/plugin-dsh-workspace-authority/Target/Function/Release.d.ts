import type State from "@Interface/State.js";
export default _default;
/**
 * @module Release
 *
 * The lease release path: close the record, ledger.
 *
 * @remarks
 * Releasing an unknown or already-closed lease is reported honestly, never
 * faked.
 */
declare function _default(State: State, Id: string): boolean;
