import type Draft from "../Interface/Draft.js";
import type Envelope from "../Interface/Envelope.js";
export default _default;
/**
 * @module Complete
 *
 * The envelope completion: fill the bus-assigned fields.
 *
 * @remarks
 * The trace id is the bus's monotonic sequence (`trace-<n>`) unless the emitter
 * supplied one (a correlated chain); `at` is the emitter's stamp when supplied,
 * else the epoch-millisecond clock. No timer is ever created here - the hot
 * path only reads the clock, it never schedules.
 */
declare function _default(Draft: Draft, Sequence: number): Envelope;
