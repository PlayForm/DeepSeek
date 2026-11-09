/**
 * @module Bound
 *
 * The trace service's ring bound: the last N envelopes a smoke can read back.
 *
 * @remarks
 * The bound is a FIXED implementation constant, not a config knob - the trace
 * adds no config schema anywhere (the completion spec's "no new config schema
 * beyond what a task strictly needs").
 */
/** The ring bound: the last 256 envelopes stay readable. */
declare const _default = 256;
export default _default;
