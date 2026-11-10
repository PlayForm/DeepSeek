import { type Envelope } from "@playform/lib-dsh-trace";
export default _default;
/**
 * @module Contract
 *
 * The context's side of the trace contract: the ONE event it consumes,
 * `graph/invalidated`, extracted as the payload's path.
 *
 * @remarks
 *
 * A foreign envelope or a malformed payload yields `undefined` (the
 * invalidation is ignored - never a guessed cache clear).
 */
declare function _default(Envelope: Envelope): string | undefined;
