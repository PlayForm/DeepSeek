// Bound - the trace service's ring bound: the last N envelopes a smoke can
// read back. A FIXED implementation bound, not a config knob - the trace adds
// no config schema anywhere (the completion spec's "no new config schema
// beyond what a task strictly needs").
export default 256;
