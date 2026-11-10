/**
 * @module Sequence
 *
 * The fixed replay corpus of the P4 BENCHMARK (the plan's section 10.5):
 * fifty search-class calls, five lanes of ten, each lane one intent and one
 * agent (the per-agent ring keeps the lanes independent without a user
 * message).
 *
 * @remarks
 * The calls are the plan's release / test / doc / config / symbol lanes
 * reduced to their literals: the first call of a lane carries the strong
 * signal, the rest repeat the same intent through the variants the evidence
 * recorded (the loop the suggester exists to cut).
 *
 * The `expected` block is the HAND-LABELLED eventual target set per lane -
 * the plan's section 3.6 canonical sets plus the long-tail files the lane
 * really touched and the pack does NOT name (setup.astro, FRAMEWORK.md,
 * EffectTS/smokes/README.md, Source/Test/Config-And-Activation, Target) -
 * so the recall is honest and a rule change that loses a target shows up as
 * a recall drop (the regression gate).
 *
 * Deterministic data: no timestamps, no absolute paths, no session ids.
 */
export interface Call {
    /**
     * The lane's agent id (one ring per lane).
     */
    agent: string;
    /**
     * The tool name.
     */
    name: string;
    /**
     * The tool arguments (the classifier reads pattern / file_path / command).
     */
    arguments: Record<string, unknown>;
    /**
     * The lane's user message (the R12 context word), driven before the call.
     */
    context?: string;
}
declare const _default: {
    calls: Call[];
    expected: Record<string, string[]>;
};
export default _default;
