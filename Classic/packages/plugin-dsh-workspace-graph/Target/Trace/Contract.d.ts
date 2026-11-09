/**
 * @module Contract
 *
 * The graph's side of the trace contract: the ONE event it consumes, `observe/stamp`, extracted
 * as the library's Stamp payload.
 *
 * @remarks
 * A foreign envelope or a malformed payload yields `undefined` (the consumer ledgers the
 * existing malformed line and does nothing else - never a guessed re-index).
 */
import { type Envelope, type Stamp } from "@playform/lib-dsh-trace";
export default _default;
declare function _default(Envelope: Envelope): Stamp | undefined;
