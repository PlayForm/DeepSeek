/**
 * @module Ellipsis
 *
 * The adapter for hook-dsh-normalize-ellipsis, the second of the five
 * remaining normalize flavors (order 12).
 *
 * @remarks
 *
 * Same reference pattern: the child slot, the settings namespace, the static
 * activation posture, and the D5 trace names. The ellipsis schema adds the
 * volatile `replacement` knob (the transform's only tunable) on top of the
 * family's shared shape.
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
