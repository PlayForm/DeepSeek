/**
 * @module Spaces
 *
 * The adapter for hook-dsh-normalize-spaces, the third of the five remaining
 * normalize flavors (order 13).
 *
 * @remarks
 *
 * Same reference pattern: the child slot, the settings namespace, the static
 * activation posture, and the D5 trace names. The spaces schema carries the
 * volatile `replacement` knob (the plain ASCII space by default).
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
