import { type Envelope } from "@playform/ets-lib-dsh-trace";
export default _default;
/**
 * @module Contract
 *
 * The context's side of the trace contract: the one consumed event's path.
 *
 * @remarks
 *
 * The ONE event it consumes, `graph/invalidated`, extracted as the
 * payload's path. A foreign envelope or a malformed payload yields
 * `undefined` (the invalidation is ignored - never a guessed cache clear).
 */
declare function _default(Envelope: Envelope): string | undefined;
