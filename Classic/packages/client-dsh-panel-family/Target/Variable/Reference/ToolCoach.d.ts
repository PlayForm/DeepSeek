/**
 * @module ToolCoach
 *
 * The reference adapter for `hook-dsh-tool-coach`, the first real contribution of the v4.1 plan
 * (section 7: the ladder section at order 30, the first config form).
 *
 * @remarks
 *
 * Every knob in the coach's schema is volatile, so its form writes all ride the revision-fenced
 * settings mutate; the ladder section's live tail is the D5 trace when the host exposes it.
 */
declare const _default: {
    id: string;
    bundle: string;
    namespace: string;
    title: string;
    order: number;
    slot: "playform.panel.section";
    activation: "enabled";
    traceKinds: readonly ["observe/stamp", "graph/indexed", "graph/invalidated"];
};
export default _default;
