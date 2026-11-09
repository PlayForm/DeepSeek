/**
 * @module Remove
 *
 * The removeFile body: resolve, delete the record from the mirror and the store, bump the
 * indexRevision, persist the meta record, and ledger the byte-exact `removed <path>` line.
 *
 * @remarks
 * A path with no record returns false silently (nothing to remove, nothing to ledger).
 */
import type State from "../Interface/State.js";
export default _default;
declare function _default(StateRef: State, Path: string): Promise<boolean>;
