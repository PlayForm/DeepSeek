/**
 * @module IsRecord
 *
 * The stored-record shape guard (the brief's section 4.4).
 *
 * @remarks
 * A stored value counts as a record only when `version` and `fingerprint` are strings and
 * `nodes` and `edges` are arrays. A record that fails validation is skipped and counted,
 * never guessed.
 */
import type Record from "../Interface/Record.js";
export default _default;
declare function _default(Value: unknown): Value is Record;
