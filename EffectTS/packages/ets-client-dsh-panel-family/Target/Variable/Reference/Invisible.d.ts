/**
 * @module Invisible
 *
 * The adapter for hook-dsh-normalize-invisible, the fourth of the five
 * remaining normalize flavors (order 14).
 *
 * @remarks
 *
 * Same reference pattern: the child slot, the settings namespace, the static
 * activation posture, and the D5 trace names. The invisible schema carries
 * the volatile `replacement` knob (the empty string by default: removal, not
 * rewrite).
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
