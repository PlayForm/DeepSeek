import type Batch from "../Interface/Batch.js";
import type Preview from "../Interface/Preview.js";
import type State from "../Interface/State.js";
export default _default;
/**
 * @module Preview
 *
 * The no-write evaluation of a batch: the atomic gates plus the digest of
 * the intended contents.
 *
 * @remarks
 *
 * Nothing is written, ever; a caller previews, then commits the same
 * operations, and the applied bytes are verified against the intended
 * content per file (Function/CommitOne).
 */
declare function _default(State: State, Request: Batch): Promise<Preview>;
